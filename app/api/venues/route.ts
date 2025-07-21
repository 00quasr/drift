import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getVenues, searchVenues } from '@/lib/services/venues'
import { moderateText } from '@/lib/services/storage'

export async function GET(request: NextRequest) {
  console.log('🚀 API/venues GET called - URL:', request.url)
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const country = searchParams.get('country')
    const genres = searchParams.get('genres')?.split(',').filter(Boolean)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    const query = searchParams.get('q')
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
      data = await searchVenues(query, { city: city || undefined, genres, limit, status: publicStatus })
    } else {
      data = await getVenues({ city: city || undefined, country: country || undefined, genres, limit, offset, status: publicStatus })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length 
    })
  } catch (error) {
    console.error('Error in GET /api/venues:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch venues' 
    }, { status: 500 })
  }
}

async function handleCMSRequest(request: NextRequest, filters: { status?: string | null, limit?: number, offset?: number }) {
  console.log('=== CMS REQUEST DEBUG ===')
  
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
    .from('venues')
    .select(`
      *,
      owner:profiles!venues_owner_id_fkey(full_name, role, display_name)
    `)
    .order('created_at', { ascending: false })

  // Role-based filtering
  console.log('CMS: User role:', profile.role, 'Filtering venues...')
  if (profile.role === 'admin') {
    console.log('CMS: Admin user - showing all venues')
    // Admins see all venues
  } else if (profile.role === 'club_owner') {
    console.log('CMS: Club owner - showing only owned venues')
    // Club owners see only their venues
    query = query.eq('created_by', user.id)
  } else {
    console.log('CMS: Insufficient role:', profile.role)
    // Other roles can't access CMS
    return NextResponse.json({ 
      success: false, 
      error: 'Insufficient permissions for CMS access' 
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
    venues: data?.map(v => ({ id: v.id, name: v.name, status: v.status, created_by: v.created_by }))
  })

  if (error) {
    console.error('Error fetching CMS venues:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch venues' 
    }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    data: data || [],
    count: data?.length || 0 
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== VENUE CREATION API DEBUG ===')
    
    // Get the authorization header as fallback
    const authHeader = request.headers.get('Authorization')
    console.log('API: Auth header present:', !!authHeader)
    if (authHeader) {
      console.log('API: Auth header value:', authHeader.substring(0, 20) + '...')
    }
    
    // Get cookies for debugging
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    const supabaseCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('sb-') || cookie.name.includes('supabase')
    )
    console.log('API: Supabase cookies found:', supabaseCookies.length)
    supabaseCookies.forEach(cookie => {
      console.log(`API: Cookie ${cookie.name}:`, cookie.value ? 'present' : 'empty')
    })
    
    // Create SSR Supabase client with cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value
            console.log(`API: Getting cookie ${name}:`, value ? 'found' : 'not found')
            return value
          },
        },
        global: authHeader ? {
          headers: {
            Authorization: authHeader,
          },
        } : undefined,
      }
    )
    
    // Check session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('API: Session check:', { 
      hasSession: !!session, 
      sessionUserId: session?.user?.id,
      sessionError 
    })
    
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

    // Only club owners and admins can create venues
    const allowedRoles = ['club_owner', 'admin']
    if (!profile || !allowedRoles.includes(profile.role)) {
      console.log('API: Permission denied - user role:', profile?.role, 'allowed:', allowedRoles)
      return NextResponse.json({ 
        success: false, 
        error: `You do not have permission to create venues. Your role: ${profile?.role || 'unknown'}` 
      }, { status: 403 })
    }

    console.log('API: Permission granted for user:', profile.full_name, 'with role:', profile.role)

    const body = await request.json()
    
    // Validate required fields for CMS
    const { 
      name, 
      description, 
      address, 
      city, 
      postal_code, 
      venue_type,
      phone,
      email,
      website,
      capacity,
      images = [],
      status = 'draft'
    } = body

    if (!name || !description || !address || !city || !postal_code || !venue_type) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, description, address, city, postal_code, venue_type' 
      }, { status: 400 })
    }

    // Moderate text content
    const textToModerate = `${name} ${description}`
    const moderation = await moderateText(textToModerate)
    
    if (!moderation.approved) {
      return NextResponse.json({ 
        success: false, 
        error: `Content was rejected: ${moderation.reason || 'Inappropriate content detected'}` 
      }, { status: 400 })
    }

    // Generate slug from venue name
    const generateSlug = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
    }

    const baseSlug = generateSlug(name)
    const timestamp = Date.now()
    const slug = `${baseSlug}-${timestamp}`

    // Enhanced venue data for CMS
    const venueData = {
      name,
      slug,
      description,
      address,
      city,
      postal_code,
      phone,
      email,
      website,
      capacity,
      venue_type,
      images,
      status,
      created_by: user.id,
      updated_by: user.id,
      // Legacy fields for compatibility
      owner_id: user.id,
      is_active: status === 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('API: Creating venue with data:', JSON.stringify(venueData, null, 2))
    
    // Use the server-side authenticated supabase client directly instead of the createVenue function
    let data
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('venues')
        .insert(venueData)
        .select()
        .single()

      if (insertError) {
        console.error('API: Error inserting venue:', insertError)
        throw insertError
      }

      data = insertData
      console.log('API: Venue created successfully:', data.id)
    } catch (createError) {
      console.error('API: Error creating venue:', createError)
      throw createError
    }

    // Log the content creation
    try {
      await supabase
        .from('content_moderation_log')
        .insert({
          content_type: 'venue',
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
    console.error('Error in POST /api/venues:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create venue' 
    }, { status: 500 })
  }
}