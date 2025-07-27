import { NextRequest, NextResponse } from 'next/server'
import { searchVenues } from '@/lib/services/venues'
import { searchEvents } from '@/lib/services/events'
import { searchArtists } from '@/lib/services/artists'
import { withSecurity, searchEndpointSecurity } from '@/lib/utils/apiSecurity'
import { searchQuerySchema, createApiResponse, createErrorResponse } from '@/lib/validations/api'
import { log } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  return withSecurity(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url)
      
      // Validate search parameters
      const validationResult = searchQuerySchema.safeParse({
        q: searchParams.get('q'),
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
      })

      if (!validationResult.success) {
        log.security('Invalid search query', { 
          errors: validationResult.error.errors,
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        })
        return NextResponse.json(
          createErrorResponse('Invalid search parameters', validationResult.error.errors),
          { status: 400 }
        )
      }

      const { q: query, limit } = validationResult.data
      const type = searchParams.get('type') // venues, events, artists, or null for all
      const city = searchParams.get('city')
      const country = searchParams.get('country')
      const genres = searchParams.get('genres')?.split(',').filter(Boolean)

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

      log.api('GET', '/api/search', 200, undefined, undefined)
      
      return NextResponse.json(createApiResponse({
        results,
        total: totalResults,
        query
      }))
    } catch (error) {
      log.error('Search API error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      return NextResponse.json(
        createErrorResponse('Search failed'),
        { status: 500 }
      )
    }
  }, searchEndpointSecurity)
}