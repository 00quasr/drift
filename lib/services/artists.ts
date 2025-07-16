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
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('artists')
    .select(`
      *,
      user:profiles(full_name, role)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

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

export async function getArtistById(id: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('artists')
    .select(`
      *,
      user:profiles(full_name, role),
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
    .eq('id', id)
    .eq('is_active', true)
    .single()

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
      user:profiles(full_name, role),
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
  
  // Get artists ordered by creation date (for now, since reviews need special handling)
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top rated artists:', error)
    throw error
  }

  // TODO: Add proper review aggregation when review system is fully implemented
  return data
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
}) {
  const supabase = createClient()
  
  let searchQuery = supabase
    .from('artists')
    .select(`
      *,
      user:profiles(full_name, role)
    `)
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,bio.ilike.%${query}%,city.ilike.%${query}%`)

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