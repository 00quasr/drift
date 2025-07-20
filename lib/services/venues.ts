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
        owner:profiles(full_name, role)
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
        owner:profiles(full_name, role),
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
        owner:profiles(full_name, role),
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
        owner:profiles(full_name, role)
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`)

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

// Utility functions
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
} 