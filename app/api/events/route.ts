import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getEvents, createEvent, searchEvents, getUpcomingEvents, getTrendingEvents } from '@/lib/services/events'

export async function GET(request: NextRequest) {
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

    let data
    if (query) {
      data = await searchEvents(query, { city: city || undefined, country: country || undefined, genres, limit })
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
        offset 
      })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length 
    })
  } catch (error) {
    console.error('Error in GET /api/events:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch events' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    // Check user role permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const allowedRoles = ['club_owner', 'promoter', 'admin']
    if (!profile || !allowedRoles.includes(profile.role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Add created_by to event data
    const eventData = {
      ...body,
      created_by: user.id,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const data = await createEvent(eventData)

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