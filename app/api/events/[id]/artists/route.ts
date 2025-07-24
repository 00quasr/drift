import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined }
        }
      }
    )

    const { data, error } = await supabase
      .from('event_artists')
      .select(`
        *,
        artist:artists(*)
      `)
      .eq('event_id', params.id)
      .order('performance_order', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error: any) {
    console.error('Error fetching event artists:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event artists' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined }
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    // Check authentication and permissions
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has permission (promoter who owns the event or admin)
    const { data: event } = await supabase
      .from('events')
      .select('created_by')
      .eq('id', params.id)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isOwner = event?.created_by === user.id
    const isPromoter = profile?.role === 'promoter'

    if (!isAdmin && !(isPromoter && isOwner)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { artist_id, performance_order, performance_type, set_time } = body

    if (!artist_id) {
      return NextResponse.json(
        { success: false, error: 'artist_id is required' },
        { status: 400 }
      )
    }

    // Check if artist already exists for this event
    const { data: existing } = await supabase
      .from('event_artists')
      .select('id')
      .eq('event_id', params.id)
      .eq('artist_id', artist_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Artist already added to this event' },
        { status: 409 }
      )
    }

    // Add artist to event
    const { data, error } = await supabase
      .from('event_artists')
      .insert({
        event_id: params.id,
        artist_id,
        performance_order: performance_order || null,
        performance_type: performance_type || null,
        set_time: set_time || null
      })
      .select(`
        *,
        artist:artists(*)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error adding artist to event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add artist to event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined }
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    // Check authentication and permissions
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has permission (promoter who owns the event or admin)
    const { data: event } = await supabase
      .from('events')
      .select('created_by')
      .eq('id', params.id)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isOwner = event?.created_by === user.id
    const isPromoter = profile?.role === 'promoter'

    if (!isAdmin && !(isPromoter && isOwner)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const artist_id = searchParams.get('artist_id')

    if (!artist_id) {
      return NextResponse.json(
        { success: false, error: 'artist_id is required' },
        { status: 400 }
      )
    }

    // Remove artist from event
    const { error } = await supabase
      .from('event_artists')
      .delete()
      .eq('event_id', params.id)
      .eq('artist_id', artist_id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Artist removed from event'
    })

  } catch (error: any) {
    console.error('Error removing artist from event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove artist from event' },
      { status: 500 }
    )
  }
}