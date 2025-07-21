import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getVenueById, updateVenue, deleteVenue } from '@/lib/services/venues'
import { moderateText } from '@/lib/services/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 Individual venue API called')
    
    // Resolve params for Next.js 14
    const resolvedParams = await params
    const venueId = resolvedParams.id
    
    console.log('Fetching venue ID:', venueId)

    // Get auth header
    const authHeader = request.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    // Create SSR Supabase client
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

    // Get venue with creator profile info for CMS
    const { data: venue, error } = await supabase
      .from('venues')
      .select(`
        *,
        created_by_profile:profiles!created_by(display_name, full_name)
      `)
      .eq('id', venueId)
      .single()

    console.log('Venue query result:', { venue: !!venue, error })

    if (error || !venue) {
      console.log('Venue not found:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Venue not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: venue 
    })
  } catch (error) {
    console.error('Error in GET /api/venues/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch venue' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 Updating venue API called')
    
    // Resolve params for Next.js 14
    const resolvedParams = await params
    const venueId = resolvedParams.id
    
    console.log('Updating venue ID:', venueId)

    // Get auth header
    const authHeader = request.headers.get('Authorization')
    console.log('PUT: Auth header present:', !!authHeader)
    
    // Create SSR Supabase client
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

    const body = await request.json()
    console.log('PUT: Update data:', Object.keys(body))
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_verified')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 })
    }

    // Get the current venue to check ownership
    const { data: currentVenue, error: venueError } = await supabase
      .from('venues')
      .select('created_by, owner_id, status')
      .eq('id', venueId)
      .single()

    if (venueError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Venue not found' 
      }, { status: 404 })
    }

    // Check permissions: created_by, owner_id (legacy), or admin
    const isOwner = currentVenue.created_by === user.id || currentVenue.owner_id === user.id
    const isAdmin = profile.role === 'admin'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to edit this venue' 
      }, { status: 403 })
    }

    // Validate required fields
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

    // Enhanced venue data for CMS
    const venueData = {
      name,
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
      updated_by: user.id,
      updated_at: new Date().toISOString(),
      // Legacy compatibility
      is_active: status === 'published'
    }

    // Use direct Supabase update instead of updateVenue function (like we did for creation)
    const { data, error: updateError } = await supabase
      .from('venues')
      .update(venueData)
      .eq('id', venueId)
      .select()
      .single()

    console.log('PUT: Update result:', { data: !!data, error: updateError })

    if (updateError) {
      console.error('PUT: Update failed:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update venue' 
      }, { status: 500 })
    }

    // Log the content update
    const previousStatus = currentVenue.status
    try {
      await supabase
        .from('content_moderation_log')
        .insert({
          content_type: 'venue',
          content_id: venueId,
          action: status !== previousStatus ? status : 'updated',
          moderator_id: user.id,
          metadata: {
            moderation_result: moderation,
            user_role: profile.role,
            is_verified: profile.is_verified,
            previous_status: previousStatus,
            new_status: status
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
    console.error('Error in PUT /api/venues/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update venue' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 })
    }

    // Get the current venue to check ownership
    const { data: currentVenue, error: venueError } = await supabase
      .from('venues')
      .select('created_by, owner_id, name')
      .eq('id', params.id)
      .single()

    if (venueError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Venue not found' 
      }, { status: 404 })
    }

    // Check permissions: created_by, owner_id (legacy), or admin
    const isOwner = currentVenue.created_by === user.id || currentVenue.owner_id === user.id
    const isAdmin = profile.role === 'admin'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to delete this venue' 
      }, { status: 403 })
    }

    await deleteVenue(params.id)

    // Log the content deletion
    try {
      await supabase
        .from('content_moderation_log')
        .insert({
          content_type: 'venue',
          content_id: params.id,
          action: 'archived',
          moderator_id: user.id,
          metadata: {
            user_role: profile.role,
            venue_name: currentVenue.name,
            deletion_type: 'permanent'
          }
        })
    } catch (logError) {
      console.warn('Failed to log content deletion:', logError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Venue deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/venues/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete venue' 
    }, { status: 500 })
  }
}