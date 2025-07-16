import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getEvent, updateEvent, deleteEvent } from '@/lib/services/events'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getEvent(params.id)
    
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

export async function PUT(
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

    // Get event to check ownership
    const event = await getEvent(params.id)
    if (!event) {
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 })
    }

    // Check permissions - user must be creator, venue owner, or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isCreator = event.created_by === user.id
    const isVenueOwner = event.venue?.owner_id === user.id
    const isAdmin = profile?.role === 'admin'
    
    if (!isCreator && !isVenueOwner && !isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    const eventData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const data = await updateEvent(params.id, eventData)

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

    // Get event to check ownership
    const event = await getEvent(params.id)
    if (!event) {
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 })
    }

    // Check permissions - user must be creator, venue owner, or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isCreator = event.created_by === user.id
    const isVenueOwner = event.venue?.owner_id === user.id
    const isAdmin = profile?.role === 'admin'
    
    if (!isCreator && !isVenueOwner && !isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    await deleteEvent(params.id)

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