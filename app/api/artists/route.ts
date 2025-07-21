import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getArtists, searchArtists, getTopRatedArtists } from '@/lib/services/artists'
import { moderateText } from '@/lib/services/storage'

export async function GET(request: NextRequest) {
  console.log('🚀 API/artists GET called - URL:', request.url)
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const country = searchParams.get('country')
    const genres = searchParams.get('genres')?.split(',').filter(Boolean)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    const query = searchParams.get('q')
    const type = searchParams.get('type') // top-rated or null for all
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
      data = await searchArtists(query, { city: city || undefined, genres, limit, status: publicStatus })
    } else if (type === 'top-rated') {
      data = await getTopRatedArtists(limit || 10)
    } else {
      data = await getArtists({ 
        city: city || undefined, 
        country: country || undefined, 
        genres, 
        limit, 
        offset,
        status: publicStatus 
      })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length 
    })
  } catch (error) {
    console.error('Error in GET /api/artists:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch artists' 
    }, { status: 500 })
  }
}

async function handleCMSRequest(request: NextRequest, filters: { status?: string | null, limit?: number, offset?: number }) {
  console.log('=== ARTISTS CMS REQUEST DEBUG ===')
  
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
    .from('artists')
    .select(`
      *,
      user:profiles!artists_user_id_fkey(full_name, role, display_name)
    `)
    .order('created_at', { ascending: false })

  // Role-based filtering
  console.log('CMS: User role:', profile.role, 'Filtering artists...')
  if (profile.role === 'admin') {
    console.log('CMS: Admin user - showing all artists')
    // Admins see all artists
  } else if (profile.role === 'artist') {
    console.log('CMS: Artist user - showing only their own profile')
    // Artists see only their own profile
    query = query.eq('user_id', user.id)
  } else {
    console.log('CMS: Insufficient role:', profile.role)
    // Other roles can't access artist CMS
    return NextResponse.json({ 
      success: false, 
      error: 'Insufficient permissions for artist CMS access' 
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
    artists: data?.map(v => ({ id: v.id, name: v.name, status: v.status, user_id: v.user_id }))
  })

  if (error) {
    console.error('Error fetching CMS artists:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch artists' 
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
    console.log('=== ARTIST CREATION API DEBUG ===')
    
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

    // Only artists and admins can create artist profiles
    const allowedRoles = ['artist', 'admin']
    if (!profile || !allowedRoles.includes(profile.role)) {
      console.log('API: Permission denied - user role:', profile?.role, 'allowed:', allowedRoles)
      return NextResponse.json({ 
        success: false, 
        error: `You do not have permission to create artist profiles. Your role: ${profile?.role || 'unknown'}` 
      }, { status: 403 })
    }

    // Artists can only have one profile - check if they already have one
    if (profile.role === 'artist') {
      const { data: existingArtist } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingArtist) {
        return NextResponse.json({ 
          success: false, 
          error: 'You already have an artist profile. Artists can only have one profile.' 
        }, { status: 400 })
      }
    }

    console.log('API: Permission granted for user:', profile.full_name, 'with role:', profile.role)

    const body = await request.json()
    
    // Validate required fields for CMS
    const { 
      name, 
      bio, 
      city,
      country,
      genres = [],
      social_links = {},
      images = [],
      booking_email,
      press_kit_url,
      status = 'draft'
    } = body

    if (!name || !bio) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, bio' 
      }, { status: 400 })
    }

    // Moderate text content
    const textToModerate = `${name} ${bio}`
    const moderation = await moderateText(textToModerate)
    
    if (!moderation.approved) {
      return NextResponse.json({ 
        success: false, 
        error: `Content was rejected: ${moderation.reason || 'Inappropriate content detected'}` 
      }, { status: 400 })
    }

    // Generate slug from artist name
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

    // Enhanced artist data for CMS
    const artistData = {
      name,
      slug,
      bio,
      city,
      country,
      genres,
      social_links,
      images,
      booking_email,
      press_kit_url,
      status,
      user_id: user.id, // Artists linked to their user profile
      created_by: user.id,
      updated_by: user.id,
      // Legacy compatibility
      is_active: status === 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('API: Creating artist with data:', JSON.stringify(artistData, null, 2))
    
    // Use the server-side authenticated supabase client directly
    let data
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('artists')
        .insert(artistData)
        .select()
        .single()

      if (insertError) {
        console.error('API: Error inserting artist:', insertError)
        throw insertError
      }

      data = insertData
      console.log('API: Artist created successfully:', data.id)
    } catch (createError) {
      console.error('API: Error creating artist:', createError)
      throw createError
    }

    // Log the content creation
    try {
      await supabase
        .from('content_moderation_log')
        .insert({
          content_type: 'artist',
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
    console.error('Error in POST /api/artists:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create artist' 
    }, { status: 500 })
  }
}