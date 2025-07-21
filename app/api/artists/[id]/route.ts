import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { moderateText } from '@/lib/services/storage'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const cms = searchParams.get('cms') === 'true'
    
    // Handle CMS requests with authentication
    if (cms) {
      return await handleCMSGet(request, params.id)
    }

    // Public API - get published artist
    const { getArtistById } = await import('@/lib/services/artists')
    const data = await getArtistById(params.id, 'published')
    
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Error in GET /api/artists/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch artist' 
    }, { status: 500 })
  }
}

async function handleCMSGet(request: NextRequest, artistId: string) {
  console.log('=== ARTIST CMS GET DEBUG ===')
  
  // Get the authorization header
  const authHeader = request.headers.get('Authorization')
  console.log('CMS GET: Auth header present:', !!authHeader)
  
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
  console.log('CMS GET: Auth check:', { hasUser: !!user, userId: user?.id, authError })
  
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

  console.log('CMS GET: Profile check:', { profile, profileError })

  if (!profile) {
    return NextResponse.json({ 
      success: false, 
      error: 'User profile not found' 
    }, { status: 404 })
  }

  // Get the artist with role-based access
  let query = supabase
    .from('artists')
    .select(`
      *,
      user:profiles!artists_user_id_fkey(full_name, role, display_name)
    `)
    .eq('id', artistId)

  // Role-based filtering
  if (profile.role === 'admin') {
    // Admins can see any artist
  } else if (profile.role === 'artist') {
    // Artists can only see their own profile
    query = query.eq('user_id', user.id)
  } else {
    // Other roles can't access artist CMS
    return NextResponse.json({ 
      success: false, 
      error: 'Insufficient permissions for artist CMS access' 
    }, { status: 403 })
  }

  const { data, error } = await query.single()
  
  console.log('CMS GET: Query result:', { data: !!data, error })

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist not found or access denied' 
      }, { status: 404 })
    }
    console.error('Error fetching CMS artist:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch artist' 
    }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    data 
  })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== ARTIST UPDATE API DEBUG ===')
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('API UPDATE: Auth header present:', !!authHeader)
    
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
    console.log('API UPDATE: Auth result:', { 
      hasUser: !!user, 
      userId: user?.id, 
      userEmail: user?.email,
      authError: authError ? authError.message : null 
    })
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: `Authentication required${authError ? ': ' + authError.message : ''}` 
      }, { status: 401 })
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_verified, full_name')
      .eq('id', user.id)
      .single()

    console.log('API UPDATE: Profile lookup result:', { 
      profile, 
      profileError: profileError ? profileError.message : null 
    })

    // Check if user can edit this artist
    const { data: existingArtist, error: fetchError } = await supabase
      .from('artists')
      .select('id, user_id, created_by')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingArtist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist not found' 
      }, { status: 404 })
    }

    // Role-based access control for updates
    const canEdit = profile.role === 'admin' || 
                   (profile.role === 'artist' && existingArtist.user_id === user.id)

    if (!canEdit) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to edit this artist profile' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate required fields
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
      status
    } = body

    if (!name || !bio) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, bio' 
      }, { status: 400 })
    }

    // Moderate text content if changed
    const textToModerate = `${name} ${bio}`
    const moderation = await moderateText(textToModerate)
    
    if (!moderation.approved) {
      return NextResponse.json({ 
        success: false, 
        error: `Content was rejected: ${moderation.reason || 'Inappropriate content detected'}` 
      }, { status: 400 })
    }

    // Update artist data
    const updateData = {
      name,
      bio,
      city,
      country,
      genres,
      social_links,
      images,
      booking_email,
      press_kit_url,
      status,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
      // Legacy compatibility
      is_active: status === 'published'
    }

    console.log('API UPDATE: Updating artist with data:', JSON.stringify(updateData, null, 2))
    
    const { data, error } = await supabase
      .from('artists')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('API UPDATE: Error updating artist:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update artist' 
      }, { status: 500 })
    }

    console.log('API UPDATE: Artist updated successfully:', data.id)

    // Log the content update
    try {
      await supabase
        .from('content_moderation_log')
        .insert({
          content_type: 'artist',
          content_id: data.id,
          action: 'updated',
          moderator_id: user.id,
          metadata: {
            moderation_result: moderation,
            user_role: profile.role,
            is_verified: profile.is_verified,
            changes: Object.keys(updateData)
          }
        })
    } catch (logError) {
      console.warn('Failed to log content update:', logError)
    }

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Error in PUT /api/artists/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update artist' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== ARTIST DELETE API DEBUG ===')
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('API DELETE: Auth header present:', !!authHeader)
    
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
    console.log('API DELETE: Auth result:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError ? authError.message : null 
    })
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: `Authentication required${authError ? ': ' + authError.message : ''}` 
      }, { status: 401 })
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ 
        success: false, 
        error: 'User profile not found' 
      }, { status: 404 })
    }

    // Check if user can delete this artist
    const { data: existingArtist, error: fetchError } = await supabase
      .from('artists')
      .select('id, user_id, created_by, name')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingArtist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist not found' 
      }, { status: 404 })
    }

    // Role-based access control for deletion
    const canDelete = profile.role === 'admin' || 
                     (profile.role === 'artist' && existingArtist.user_id === user.id)

    if (!canDelete) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to delete this artist profile' 
      }, { status: 403 })
    }

    console.log('API DELETE: Deleting artist:', existingArtist.name)
    
    // Delete the artist
    const { error: deleteError } = await supabase
      .from('artists')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('API DELETE: Error deleting artist:', deleteError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete artist' 
      }, { status: 500 })
    }

    console.log('API DELETE: Artist deleted successfully')

    // Log the deletion
    try {
      await supabase
        .from('content_moderation_log')
        .insert({
          content_type: 'artist',
          content_id: params.id,
          action: 'deleted',
          moderator_id: user.id,
          metadata: {
            user_role: profile.role,
            artist_name: existingArtist.name
          }
        })
    } catch (logError) {
      console.warn('Failed to log content deletion:', logError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Artist deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/artists/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete artist' 
    }, { status: 500 })
  }
}