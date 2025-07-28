import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/types/database'

type Venue = Database['public']['Tables']['venues']['Row']
type VenueInsert = Database['public']['Tables']['venues']['Insert']
type VenueUpdate = Database['public']['Tables']['venues']['Update']

// Helper function to safely create client
function safeCreateClient() {
  try {
    return createClient()
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return null
  }
}

// Client-side functions
export async function getVenues(filters?: {
  city?: string
  country?: string
  genres?: string[]
  limit?: number
  offset?: number
  status?: string
}) {
  const supabase = safeCreateClient()
  if (!supabase) {
    console.error('Supabase not configured. Returning empty venues list.')
    return []
  }
  
  try {
    let query = supabase
      .from('venues')
      .select(`
        *,
        owner:profiles!venues_owner_id_fkey(full_name, role)
      `)
      .order('created_at', { ascending: false })

    // Handle status filter - default to published for public API, allow override
    if (filters?.status) {
      query = query.eq('status', filters.status)
    } else {
      query = query.eq('status', 'published')
    }

    // Keep legacy support for is_active
    query = query.eq('is_active', true)

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
      console.error('Error fetching venues:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getVenues:', error)
    throw error
  }
}

export async function getVenueById(idOrSlug: string) {
  const supabase = safeCreateClient()
  if (!supabase) {
    console.error('Supabase not configured. Cannot fetch venue.')
    return null
  }
  
  try {
    // Check if it looks like a UUID (ID) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)
    
    let query = supabase
      .from('venues')
      .select(`
        *,
        owner:profiles!venues_owner_id_fkey(full_name, role),
        events(
          id,
          title,
          slug,
          start_date,
          end_date,
          images,
          genres,
          event_artists(
            artist:artists(id, name, slug)
          )
        )
      `)
    
    if (isUUID) {
      query = query.eq('id', idOrSlug)
    } else {
      query = query.eq('slug', idOrSlug)
    }
    
    const { data, error } = await query
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching venue:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getVenueById:', error)
    throw error
  }
}

export async function getVenueBySlug(slug: string) {
  const supabase = safeCreateClient()
  if (!supabase) {
    console.error('Supabase not configured. Cannot fetch venue by slug.')
    return null
  }
  
  try {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        owner:profiles!venues_owner_id_fkey(full_name, role),
        events(
          id,
          title,
          slug,
          start_date,
          end_date,
          images,
          genres,
          event_artists(
            artist:artists(id, name, slug)
          )
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching venue by slug:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getVenueBySlug:', error)
    throw error
  }
}

export async function searchVenues(query: string, filters?: {
  city?: string
  genres?: string[]
  limit?: number
  status?: string
}) {
  const supabase = safeCreateClient()
  if (!supabase) {
    console.error('Supabase not configured. Cannot search venues.')
    return []
  }
  
  try {
    let searchQuery = supabase
      .from('venues')
      .select(`
        *,
        owner:profiles!venues_owner_id_fkey(full_name, role)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`)

    // Handle status filter - default to published for public search, allow override
    if (filters?.status) {
      searchQuery = searchQuery.eq('status', filters.status)
    } else {
      searchQuery = searchQuery.eq('status', 'published')
    }

    // Keep legacy support for is_active
    searchQuery = searchQuery.eq('is_active', true)

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
      console.error('Error searching venues:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in searchVenues:', error)
    throw error
  }
}

// Server-side functions
export async function createVenue(venueData: VenueInsert) {
  const supabase = await safeCreateClient()
  if (!supabase) {
    console.error('Supabase server not configured. Cannot create venue.')
    return null
  }
  
  try {
    const { data, error } = await supabase
      .from('venues')
      .insert(venueData)
      .select()
      .single()

    if (error) {
      console.error('Error creating venue:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createVenue:', error)
    throw error
  }
}

export async function updateVenue(id: string, venueData: VenueUpdate) {
  const supabase = await safeCreateClient()
  if (!supabase) {
    console.error('Supabase server not configured. Cannot update venue.')
    return null
  }
  
  try {
    const { data, error } = await supabase
      .from('venues')
      .update(venueData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating venue:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateVenue:', error)
    throw error
  }
}

export async function deleteVenue(id: string) {
  const supabase = await safeCreateClient()
  if (!supabase) {
    console.error('Supabase server not configured. Cannot delete venue.')
    return
  }
  
  try {
    const { error } = await supabase
      .from('venues')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting venue:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deleteVenue:', error)
    throw error
  }
}

export async function getTrendingVenues(limit = 10) {
  const supabase = safeCreateClient()
  if (!supabase) {
    console.error('Supabase not configured. Cannot get trending venues.')
    return []
  }
  
  try {
    // Get venues with their average ratings, ordered by rating desc
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        owner:profiles!venues_owner_id_fkey(full_name, role)
      `)
      .eq('is_active', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit * 3) // Get more to randomize from

    if (error) {
      console.error('Error fetching trending venues:', error)
      throw error
    }

    // Get review data for these venues
    const venueIds = data?.map(v => v.id) || []
    if (venueIds.length === 0) return []

    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .select('target_id, rating_overall, created_at')
      .eq('target_type', 'venue')
      .eq('status', 'visible')
      .in('target_id', venueIds)

    if (reviewError) {
      console.error('Error fetching venue reviews:', reviewError)
      // Return venues without ratings if review fetch fails
      return data?.slice(0, limit) || []
    }

    // Calculate trending score (recent ratings + average rating)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const venuesWithTrending = data?.map(venue => {
      const venueReviews = reviewData?.filter(r => r.target_id === venue.id) || []
      const recentReviews = venueReviews.filter(r => new Date(r.created_at) > thirtyDaysAgo)
      
      const avgRating = venueReviews.length > 0 
        ? venueReviews.reduce((sum, r) => sum + (r.rating_overall || 0), 0) / venueReviews.length
        : 0
      
      // Trending score: recent activity weight + average rating
      const trendingScore = (recentReviews.length * 0.3) + (avgRating * 0.7)
      
      return {
        ...venue,
        average_rating: avgRating,
        review_count: venueReviews.length,
        recent_review_count: recentReviews.length,
        trending_score: trendingScore
      }
    }) || []

    // Sort by trending score desc, then shuffle venues with same score
    const sorted = venuesWithTrending
      .sort((a, b) => {
        if (Math.abs(b.trending_score - a.trending_score) > 0.1) {
          return b.trending_score - a.trending_score
        }
        // For similar scores, random order
        return Math.random() - 0.5
      })
      .slice(0, limit)

    return sorted
  } catch (error) {
    console.error('Error in getTrendingVenues:', error)
    throw error
  }
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