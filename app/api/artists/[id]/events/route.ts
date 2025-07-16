import { NextRequest, NextResponse } from 'next/server'
import { getArtistUpcomingEvents, getArtistPastEvents } from '@/lib/services/artists'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // upcoming, past, or null for all
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    let data
    if (type === 'upcoming') {
      data = await getArtistUpcomingEvents(params.id, limit)
    } else if (type === 'past') {
      data = await getArtistPastEvents(params.id, limit)
    } else {
      // Get both upcoming and past events
      const [upcoming, past] = await Promise.all([
        getArtistUpcomingEvents(params.id, Math.ceil(limit / 2)),
        getArtistPastEvents(params.id, Math.floor(limit / 2))
      ])
      data = [...upcoming, ...past]
    }

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length 
    })
  } catch (error) {
    console.error('Error in GET /api/artists/[id]/events:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch artist events' 
    }, { status: 500 })
  }
}