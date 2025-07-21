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

    // Public API - get published event
    const { getEvent } = await import('@/lib/services/events')
    const data = await getEvent(params.id, 'published')
    
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Error in GET /api/events/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch event' 
    }, { status: 500 })
  }
}

async function handleCMSGet(request: NextRequest, eventId: string) {
  console.log('=== EVENT CMS GET DEBUG ===')
  
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

  // Get the event with role-based access
  let query = supabase
    .from('events')
    .select(`
      *,
      venue:venues(id, name, city, country),
      created_by_profile:profiles!events_created_by_fkey(full_name, role, display_name)
    `)
    .eq('id', eventId)

  // Role-based filtering
  if (profile.role === 'admin') {
    // Admins can see any event
  } else if (['promoter', 'club_owner'].includes(profile.role)) {
    // Promoters and club owners can only see their own events
    query = query.eq('created_by', user.id)
  } else {
    // Other roles can't access event CMS
    return NextResponse.json({ 
      success: false, 
      error: 'Insufficient permissions for event CMS access' 
    }, { status: 403 })
  }

  const { data, error } = await query.single()
  
  console.log('CMS GET: Query result:', { data: !!data, error })

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found or access denied' 
      }, { status: 404 })
    }
    console.error('Error fetching CMS event:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch event' 
    }, { status: 500 })
  }

  // Map database column names to API format
  const mappedData = {
    ...data,
    start_time: data.start_date, // Map start_date to start_time for API consistency
    end_time: data.end_date, // Map end_date to end_time for API consistency
    price_min: data.ticket_price_min, // Map ticket_price_min to price_min
    price_max: data.ticket_price_max // Map ticket_price_max to price_max
  }

  return NextResponse.json({ 
    success: true, 
    data: mappedData 
  })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== EVENT UPDATE API DEBUG ===')
    
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

    // Check if user can edit this event
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('id, created_by, title')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingEvent) {
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 })
    }

    // Role-based access control for updates
    const canEdit = profile.role === 'admin' || 
                   (['promoter', 'club_owner'].includes(profile.role) && existingEvent.created_by === user.id)

    if (!canEdit) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to edit this event' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate required fields
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
      status
    } = body

    if (!title || !description || !venue_id || !start_time) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: title, description, venue_id, start_time' 
      }, { status: 400 })
    }

    // Moderate text content if changed
    const textToModerate = `${title} ${description}`
    const moderation = await moderateText(textToModerate)
    
    if (!moderation.approved) {
      return NextResponse.json({ 
        success: false, 
        error: `Content was rejected: ${moderation.reason || 'Inappropriate content detected'}` 
      }, { status: 400 })
    }

    // Update event data - map to correct database column names
    const updateData = {
      title,
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
      updated_by: user.id,
      updated_at: new Date().toISOString(),
      // Legacy compatibility
      is_active: status === 'published'
    }

    console.log('API UPDATE: Updating event with data:', JSON.stringify(updateData, null, 2))
    
    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('API UPDATE: Error updating event:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update event' 
      }, { status: 500 })
    }

    console.log('API UPDATE: Event updated successfully:', data.id)

    // Log the content update
    try {
      await supabase
        .from('content_moderation_log')
        .insert({
          content_type: 'event',
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
    console.error('Error in PUT /api/events/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update event' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== EVENT DELETE API DEBUG ===')
    
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

    // Check if user can delete this event
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('id, created_by, title')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingEvent) {
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 })
    }

    // Role-based access control for deletion
    const canDelete = profile.role === 'admin' || 
                     (['promoter', 'club_owner'].includes(profile.role) && existingEvent.created_by === user.id)

    if (!canDelete) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to delete this event' 
      }, { status: 403 })
    }

    console.log('API DELETE: Deleting event:', existingEvent.title)
    
    // Delete the event
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('API DELETE: Error deleting event:', deleteError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete event' 
      }, { status: 500 })
    }

    console.log('API DELETE: Event deleted successfully')

    // Log the deletion
    try {
      await supabase
        .from('content_moderation_log')
        .insert({
          content_type: 'event',
          content_id: params.id,
          action: 'deleted',
          moderator_id: user.id,
          metadata: {
            user_role: profile.role,
            event_title: existingEvent.title
          }
        })
    } catch (logError) {
      console.warn('Failed to log content deletion:', logError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Event deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/events/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete event' 
    }, { status: 500 })
  }
}