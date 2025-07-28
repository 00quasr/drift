import { NextRequest, NextResponse } from 'next/server'
import { getVenues, getTrendingVenues } from '@/lib/services/venues'
import { getUpcomingEvents, getTrendingEvents } from '@/lib/services/events'
import { getTopRatedArtists } from '@/lib/services/artists'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section') // trending-venues, upcoming-events, top-artists, or null for all
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12

    let data = {}

    if (!section || section === 'trending-venues') {
      const venues = await getTrendingVenues(limit)
      data = { ...data, trending_venues: venues }
    }

    if (!section || section === 'upcoming-events') {
      const events = await getUpcomingEvents(limit)
      data = { ...data, upcoming_events: events }
    }

    if (!section || section === 'trending-events') {
      const events = await getTrendingEvents(limit)
      data = { ...data, trending_events: events }
    }

    if (!section || section === 'top-artists') {
      const artists = await getTopRatedArtists(limit)
      data = { ...data, top_artists: artists }
    }

    return NextResponse.json({ 
      success: true, 
      data
    })
  } catch (error) {
    console.error('Error in GET /api/explore:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch explore data' 
    }, { status: 500 })
  }
}