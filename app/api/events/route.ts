import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getEvents, searchEvents, getUpcomingEvents, getTrendingEvents } from '@/lib/services/events'
import { moderateText } from '@/lib/services/storage'

export async function GET(request: NextRequest) {
  console.log('🚀 API/events GET called - URL:', request.url)
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const country = searchParams.get('country')
    const venue_id = searchParams.get('venue_id')
    const genres = searchParams.get('genres')?.split(',').filter(Boolean)
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    const query = searchParams.get('q')
    const type = searchParams.get('type') // upcoming, trending, or null for all
    const status = searchParams.get('status')
    const cms = searchParams.get('cms') === 'true' // Flag for CMS requests
    
    // Handle CMS requests differently
    if (cms) {
      return await handleCMSRequest(request, { status, limit, offset })
    }

    // Default to published for public API
    const publicStatus = status || 'published'

    let data
    if (query) {
      data = await searchEvents(query, { city: city || undefined, country: country || undefined, genres, limit, status: publicStatus })
    } else if (type === 'upcoming') {
      data = await getUpcomingEvents(limit || 10)
    } else if (type === 'trending') {
      data = await getTrendingEvents(limit || 10)
    } else {
      data = await getEvents({ 
        city: city || undefined, 
        country: country || undefined, 
        venue_id: venue_id || undefined,
        genres, 
        start_date: start_date || undefined,
        end_date: end_date || undefined,
        limit, 
        offset,
        status: publicStatus 
      })
    }

    const response = NextResponse.json({ 
      success: true, 
      data,
      count: data.length 
    })
    
    // Add caching headers for performance
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    response.headers.set('CDN-Cache-Control', 'public, max-age=300')
    
    return response
  } catch (error) {
    console.error('Error in GET /api/events:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch events' 
    }, { status: 500 })
  }
}

async function handleCMSRequest(request: NextRequest, filters: { status?: string | null, limit?: number, offset?: number }) {
  console.log('=== EVENTS CMS REQUEST DEBUG ===')
  
  // Get the authorization header
  const authHeader = request.headers.get('Authorization')
  console.log('CMS: Auth header present:', !!authHeader)
  
  // Create SSR Supabase client for authentication
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
      global: authHeader ? {
        headers: {
          Authorization: authHeader,
        },
      } : undefined,
    }
  )
  
  // Check authentication for CMS requests
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('CMS: Auth check:', { hasUser: !!user, userId: user?.id, authError })
  
  if (authError || !user) {
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication required for CMS' 
    }, { status: 401 })
  }

  // Get user role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  console.log('CMS: Profile check:', { profile, profileError })

  if (!profile) {
    return NextResponse.json({ 
      success: false, 
      error: 'User profile not found' 
    }, { status: 404 })
  }

  // Build query based on role
  let query = supabase
    .from('events')
    .select(`
      *,
      venue:venues(id, name, city, country),
      created_by_profile:profiles!events_created_by_fkey(full_name, role, display_name)
    `)
    .order('created_at', { ascending: false })

  // Role-based filtering
  console.log('CMS: User role:', profile.role, 'Filtering events...')
  if (profile.role === 'admin') {
    console.log('CMS: Admin user - showing all events')
    // Admins see all events
  } else if (['promoter', 'club_owner'].includes(profile.role)) {
    console.log('CMS: Promoter/Club Owner user - showing only their events')
    // Promoters and club owners see only their own events
    query = query.eq('created_by', user.id)
  } else {
    console.log('CMS: Insufficient role:', profile.role)
    // Other roles can't access event CMS
    return NextResponse.json({ 
      success: false, 
      error: 'Insufficient permissions for event CMS access' 
    }, { status: 403 })
  }

  // Apply status filter if provided
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  if (filters.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
  }

  const { data, error } = await query
  
  console.log('CMS: Query result:', { 
    dataCount: data?.length || 0, 
    error,
    events: data?.map(v => ({ id: v.id, title: v.title, status: v.status, created_by: v.created_by }))
  })

  if (error) {
    console.error('Error fetching CMS events:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch events' 
    }, { status: 500 })
  }

  // Map database column names to API format
  const mappedData = data?.map(event => ({
    ...event,
    start_time: event.start_date, // Map start_date to start_time for API consistency
    end_time: event.end_date, // Map end_date to end_time for API consistency
    price_min: event.ticket_price_min, // Map ticket_price_min to price_min
    price_max: event.ticket_price_max // Map ticket_price_max to price_max
  })) || []

  return NextResponse.json({ 
    success: true, 
    data: mappedData,
    count: mappedData.length 
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== EVENT CREATION API DEBUG ===')
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('API: Auth header present:', !!authHeader)
    
    // Create SSR Supabase client with cookies
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
        global: authHeader ? {
          headers: {
            Authorization: authHeader,
          },
        } : undefined,
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('API: Auth result:', { 
      hasUser: !!user, 
      userId: user?.id, 
      userEmail: user?.email,
      authError: authError ? authError.message : null 
    })
    
    if (authError || !user) {
      console.log('API: Authentication failed - no user found')
      return NextResponse.json({ 
        success: false, 
        error: `Authentication required${authError ? ': ' + authError.message : ''}` 
      }, { status: 401 })
    }

    // Check user role permissions
    console.log('API: Looking up user profile for ID:', user.id)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_verified, full_name')
      .eq('id', user.id)
      .single()

    console.log('API: Profile lookup result:', { 
      profile, 
      profileError: profileError ? profileError.message : null 
    })

    // Only promoters, club owners and admins can create events
    const allowedRoles = ['promoter', 'club_owner', 'admin']
    if (!profile || !allowedRoles.includes(profile.role)) {
      console.log('API: Permission denied - user role:', profile?.role, 'allowed:', allowedRoles)
      return NextResponse.json({ 
        success: false, 
        error: `You do not have permission to create events. Your role: ${profile?.role || 'unknown'}` 
      }, { status: 403 })
    }

    console.log('API: Permission granted for user:', profile.full_name, 'with role:', profile.role)

    const body = await request.json()
    
    // Validate required fields for CMS
    const { 
      title, 
      description, 
      venue_id,
      start_time,
      end_time,
      genres = [],
      images = [],
      ticket_url,
      price_min,
      price_max,
      status = 'draft'
    } = body

    if (!title || !description || !venue_id || !start_time) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: title, description, venue_id, start_time' 
      }, { status: 400 })
    }

    // Moderate text content
    const textToModerate = `${title} ${description}`
    const moderation = await moderateText(textToModerate)
    
    if (!moderation.approved) {
      return NextResponse.json({ 
        success: false, 
        error: `Content was rejected: ${moderation.reason || 'Inappropriate content detected'}` 
      }, { status: 400 })
    }

    // Generate slug from event title
    const generateSlug = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
    }

    const baseSlug = generateSlug(title)
    const timestamp = Date.now()
    const slug = `${baseSlug}-${timestamp}`

    // Enhanced event data for CMS - map to correct database column names
    const eventData = {
      title,
      slug,
      description,
      venue_id,
      start_date: start_time, // Database uses start_date not start_time
      end_date: end_time, // Database uses end_date not end_time
      genres,
      images,
      ticket_url,
      ticket_price_min: price_min, // Database uses ticket_price_min not price_min
      ticket_price_max: price_max, // Database uses ticket_price_max not price_max
      status,
      created_by: user.id,
      updated_by: user.id,
      // Legacy compatibility
      is_active: status === 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('API: Creating event with data:', JSON.stringify(eventData, null, 2))
    
    // Use the server-side authenticated supabase client directly
    let data
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()

      if (insertError) {
        console.error('API: Error inserting event:', insertError)
        throw insertError
      }

      data = insertData
      console.log('API: Event created successfully:', data.id)
    } catch (createError) {
      console.error('API: Error creating event:', createError)
      throw createError
    }

    // Log the content creation
    try {
      await supabase
        .from('content_moderation_log')
        .insert({
          content_type: 'event',
          content_id: data.id,
          action: 'created',
          moderator_id: user.id,
          metadata: {
            moderation_result: moderation,
            user_role: profile.role,
            is_verified: profile.is_verified
          }
        })
    } catch (logError) {
      console.warn('Failed to log content creation:', logError)
    }

    return NextResponse.json({ 
      success: true, 
      data 
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/events:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create event' 
    }, { status: 500 })
  }
}