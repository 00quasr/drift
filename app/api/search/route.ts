import { NextRequest, NextResponse } from 'next/server'
import { searchVenues } from '@/lib/services/venues'
import { searchEvents } from '@/lib/services/events'
import { searchArtists } from '@/lib/services/artists'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') // venues, events, artists, or null for all
    const city = searchParams.get('city')
    const country = searchParams.get('country')
    const genres = searchParams.get('genres')?.split(',').filter(Boolean)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    if (!query) {
      return NextResponse.json({ 
        success: false, 
        error: 'Search query is required' 
      }, { status: 400 })
    }

    const searchFilters = {
      city: city || undefined,
      country: country || undefined,
      genres,
      limit
    }

    let results = {
      venues: [],
      events: [],
      artists: []
    }

    if (!type || type === 'venues') {
      results.venues = await searchVenues(query, searchFilters)
    }

    if (!type || type === 'events') {
      results.events = await searchEvents(query, searchFilters)
    }

    if (!type || type === 'artists') {
      results.artists = await searchArtists(query, searchFilters)
    }

    // If searching all types, limit each to maintain reasonable response size
    if (!type) {
      const limitPerType = Math.ceil(limit / 3)
      results.venues = results.venues.slice(0, limitPerType)
      results.events = results.events.slice(0, limitPerType)
      results.artists = results.artists.slice(0, limitPerType)
    }

    const totalResults = results.venues.length + results.events.length + results.artists.length

    return NextResponse.json({ 
      success: true, 
      data: results,
      total: totalResults,
      query
    })
  } catch (error) {
    console.error('Error in GET /api/search:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Search failed' 
    }, { status: 500 })
  }
}