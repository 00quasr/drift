import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/types/database'

type Artist = Database['public']['Tables']['artists']['Row']
type ArtistInsert = Database['public']['Tables']['artists']['Insert']
type ArtistUpdate = Database['public']['Tables']['artists']['Update']

// Client-side functions
export async function getArtists(filters?: {
  city?: string
  country?: string
  genres?: string[]
  limit?: number
  offset?: number
  status?: string
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('artists')
    .select(`
      *,
      user:profiles!artists_user_id_fkey(full_name, role)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Handle status filter - default to published for public API, allow override
  if (filters?.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.eq('status', 'published')
  }

  if (filters?.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  if (filters?.country) {
    query = query.ilike('country', `%${filters.country}%`)
  }

  if (filters?.genres?.length) {
    query = query.overlaps('genres', filters.genres)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching artists:', error)
    throw error
  }

  return data
}

export async function getArtistById(idOrSlug: string) {
  const supabase = createClient()
  
  // Check if it looks like a UUID (ID) or a slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)
  
  let query = supabase
    .from('artists')
    .select(`
      *,
      user:profiles!artists_user_id_fkey(full_name, role),
      event_artists(
        performance_order,
        performance_type,
        set_time,
        event:events(
          id,
          title,
          slug,
          start_date,
          end_date,
          images,
          venue:venues(id, name, slug, city, country)
        )
      )
    `)
    .eq('is_active', true)
  
  if (isUUID) {
    query = query.eq('id', idOrSlug)
  } else {
    query = query.eq('slug', idOrSlug)
  }
  
  const { data, error } = await query.single()

  if (error) {
    console.error('Error fetching artist:', error)
    throw error
  }

  return data
}

export async function getArtistBySlug(slug: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('artists')
    .select(`
      *,
      user:profiles!artists_user_id_fkey(full_name, role),
      event_artists(
        performance_order,
        performance_type,
        set_time,
        event:events(
          id,
          title,
          slug,
          start_date,
          end_date,
          images,
          venue:venues(id, name, slug, city, country)
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching artist by slug:', error)
    throw error
  }

  return data
}

export async function getTopRatedArtists(limit = 10) {
  const supabase = createClient()
  
  try {
    // Get artists with their average ratings, ordered by rating desc, then randomly
    const { data, error } = await supabase
      .from('artists')
      .select(`
        *,
        user:profiles!artists_user_id_fkey(full_name, role)
      `)
      .eq('is_active', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit * 3) // Get more to randomize from

    if (error) {
      console.error('Error fetching top rated artists:', error)
      throw error
    }

    // Get review data for these artists
    const artistIds = data?.map(a => a.id) || []
    if (artistIds.length === 0) return []

    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .select('target_id, rating_overall')
      .eq('target_type', 'artist')
      .eq('status', 'visible')
      .in('target_id', artistIds)

    if (reviewError) {
      console.error('Error fetching artist reviews:', reviewError)
      // Return artists without ratings if review fetch fails
      return data?.slice(0, limit) || []
    }

    // Calculate average ratings and add to artists
    const artistsWithRatings = data?.map(artist => {
      const artistReviews = reviewData?.filter(r => r.target_id === artist.id) || []
      const avgRating = artistReviews.length > 0 
        ? artistReviews.reduce((sum, r) => sum + (r.rating_overall || 0), 0) / artistReviews.length
        : 0
      
      return {
        ...artist,
        average_rating: avgRating,
        review_count: artistReviews.length
      }
    }) || []

    // Sort by rating desc, then shuffle artists with same rating
    const sorted = artistsWithRatings
      .sort((a, b) => {
        if (b.average_rating !== a.average_rating) {
          return b.average_rating - a.average_rating
        }
        // For same ratings, random order
        return Math.random() - 0.5
      })
      .slice(0, limit)

    return sorted
  } catch (error) {
    console.error('Error in getTopRatedArtists:', error)
    throw error
  }
}

export async function getArtistUpcomingEvents(artistId: string, limit = 10) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_artists')
    .select(`
      *,
      event:events(
        id,
        title,
        slug,
        start_date,
        end_date,
        images,
        venue:venues(id, name, slug, city, country)
      )
    `)
    .eq('artist_id', artistId)
    .eq('events.is_active', true)
    .gte('events.start_date', new Date().toISOString())
    .order('events.start_date', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching artist upcoming events:', error)
    throw error
  }

  return data
}

export async function getArtistPastEvents(artistId: string, limit = 10) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_artists')
    .select(`
      *,
      event:events(
        id,
        title,
        slug,
        start_date,
        end_date,
        images,
        venue:venues(id, name, slug, city, country)
      )
    `)
    .eq('artist_id', artistId)
    .eq('events.is_active', true)
    .lt('events.start_date', new Date().toISOString())
    .order('events.start_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching artist past events:', error)
    throw error
  }

  return data
}

export async function searchArtists(query: string, filters?: {
  city?: string
  genres?: string[]
  limit?: number
  status?: string
}) {
  const supabase = createClient()
  
  let searchQuery = supabase
    .from('artists')
    .select(`
      *,
      user:profiles!artists_user_id_fkey(full_name, role)
    `)
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,bio.ilike.%${query}%,city.ilike.%${query}%`)

  // Handle status filter - default to published for public search, allow override
  if (filters?.status) {
    searchQuery = searchQuery.eq('status', filters.status)
  } else {
    searchQuery = searchQuery.eq('status', 'published')
  }

  if (filters?.city) {
    searchQuery = searchQuery.ilike('city', `%${filters.city}%`)
  }

  if (filters?.genres?.length) {
    searchQuery = searchQuery.overlaps('genres', filters.genres)
  }

  if (filters?.limit) {
    searchQuery = searchQuery.limit(filters.limit)
  }

  const { data, error } = await searchQuery.order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching artists:', error)
    throw error
  }

  return data
}

// Server-side functions
export async function createArtist(artistData: ArtistInsert) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('artists')
    .insert(artistData)
    .select()
    .single()

  if (error) {
    console.error('Error creating artist:', error)
    throw error
  }

  return data
}

export async function updateArtist(id: string, artistData: ArtistUpdate) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('artists')
    .update(artistData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating artist:', error)
    throw error
  }

  return data
}

export async function deleteArtist(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('artists')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    console.error('Error deleting artist:', error)
    throw error
  }
}

export async function getArtistsByUser(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching artists by user:', error)
    throw error
  }

  return data
}

// Utility functions
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function calculateArtistRating(reviews: { rating_overall: number | null }[]) {
  const validRatings = reviews
    .map(r => r.rating_overall)
    .filter((rating): rating is number => rating !== null)
  
  if (validRatings.length === 0) return 0
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0)
  return Number((sum / validRatings.length).toFixed(1))
}

export function getArtistGenreString(genres: string[]) {
  if (genres.length === 0) return 'Electronic'
  if (genres.length === 1) return genres[0]
  if (genres.length === 2) return genres.join(' & ')
  
  return `${genres.slice(0, 2).join(', ')} & more`
} 