import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/types/database'

type Tables = Database['public']['Tables']
type Event = Tables['events']['Row']
type Venue = Tables['venues']['Row']
type Artist = Tables['artists']['Row']

export interface EventWithDetails extends Event {
  venue: Venue | null
  artists: Artist[]
}

export async function getEvents(filters?: {
  city?: string
  country?: string
  venue_id?: string
  genres?: string[]
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}) {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        slug,
        description,
        start_date,
        end_date,
        flyer_url,
        genres,
        images,
        ticket_price_min,
        ticket_price_max,
        ticket_url,
        status,
        created_at,
        venue:venues(id, name, city, country, address),
        event_artists(
          artist:artists(id, name, slug, genres, user_id, profiles!user_id(avatar_url))
        )
      `)
      .eq('is_active', true)
    
    // Apply filters
    if (filters?.city) {
      query = query.eq('venue.city', filters.city)
    }
    
    if (filters?.country) {
      query = query.eq('venue.country', filters.country)
    }
    
    if (filters?.venue_id) {
      query = query.eq('venue_id', filters.venue_id)
    }
    
    if (filters?.genres && filters.genres.length > 0) {
      query = query.overlaps('genres', filters.genres)
    }
    
    if (filters?.start_date) {
      query = query.gte('start_date', filters.start_date)
    }
    
    if (filters?.end_date) {
      query = query.lte('start_date', filters.end_date)
    }
    
    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 10) - 1)
    }
    
    // Order by start date
    query = query.order('start_date', { ascending: true })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching events:', error)
      return []
    }
    
    // Transform the data to match our interface
    const events: EventWithDetails[] = (data || []).map(event => ({
      ...event,
      venue: event.venue,
      artists: event.event_artists?.map((ea: any) => ea.artist) || []
    }))
    
    return events
  } catch (error) {
    console.error('Error in getEvents:', error)
    return []
  }
}

export async function getEvent(idOrSlug: string, status?: string): Promise<EventWithDetails | null> {
  const supabase = createClient()
  
  try {
    // Try to find by ID first, then by slug
    let query = supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        event_artists(
          performance_order,
          performance_type,
          artist:artists(*)
        )
      `)
      .eq('is_active', true)
    
    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }
    
    // Check if it looks like a UUID (ID) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)
    
    if (isUUID) {
      query = query.eq('id', idOrSlug)
    } else {
      query = query.eq('slug', idOrSlug)
    }
    
    const { data, error } = await query.single()
    
    if (error) {
      console.error('Error fetching event:', error)
      return null
    }
    
    if (!data) return null
    
    return {
      ...data,
      venue: data.venue,
      artists: data.event_artists?.map((ea: any) => ({
        ...ea.artist,
        performance_order: ea.performance_order,
        performance_type: ea.performance_type
      })) || []
    }
  } catch (error) {
    console.error('Error in getEvent:', error)
    return null
  }
}

export async function getUpcomingEvents(limit = 10): Promise<EventWithDetails[]> {
  const supabase = createClient()
  
  try {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        event_artists(
          artist:artists(*)
        )
      `)
      .eq('is_active', true)
      .gte('start_date', now)
      .order('start_date', { ascending: true })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching upcoming events:', error)
      return []
    }
    
    // Transform the data
    const events: EventWithDetails[] = (data || []).map(event => ({
      ...event,
      venue: event.venue,
      artists: event.event_artists?.map((ea: any) => ea.artist) || []
    }))
    
    return events
  } catch (error) {
    console.error('Error in getUpcomingEvents:', error)
    return []
  }
}

export async function getTrendingEvents(limit = 10): Promise<EventWithDetails[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        event_artists(
          artist:artists(*)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching trending events:', error)
      return []
    }
    
    // Transform the data
    const events: EventWithDetails[] = (data || []).map(event => ({
      ...event,
      venue: event.venue,
      artists: event.event_artists?.map((ea: any) => ea.artist) || []
    }))
    
    return events
  } catch (error) {
    console.error('Error in getTrendingEvents:', error)
    return []
  }
}

export async function searchEvents(query: string, filters?: {
  city?: string
  country?: string
  genres?: string[]
  limit?: number
}) {
  const supabase = createClient()
  
  try {
    let supabaseQuery = supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        event_artists(
          artist:artists(*)
        )
      `)
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    
    // Apply filters
    if (filters?.city) {
      supabaseQuery = supabaseQuery.eq('venue.city', filters.city)
    }
    
    if (filters?.country) {
      supabaseQuery = supabaseQuery.eq('venue.country', filters.country)
    }
    
    if (filters?.genres && filters.genres.length > 0) {
      supabaseQuery = supabaseQuery.overlaps('genres', filters.genres)
    }
    
    // Apply pagination
    if (filters?.limit) {
      supabaseQuery = supabaseQuery.limit(filters.limit)
    }
    
    const { data, error } = await supabaseQuery
    
    if (error) {
      console.error('Error searching events:', error)
      return []
    }
    
    // Transform the data
    const events: EventWithDetails[] = (data || []).map(event => ({
      ...event,
      venue: event.venue,
      artists: event.event_artists?.map((ea: any) => ea.artist) || []
    }))
    
    return events
  } catch (error) {
    console.error('Error in searchEvents:', error)
    return []
  }
}

// Event creation and management functions for admin/creators
export async function createEvent(eventData: Partial<Event>) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating event:', error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error in createEvent:', error)
    throw error
  }
}

export async function updateEvent(id: string, eventData: Partial<Event>) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating event:', error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error in updateEvent:', error)
    throw error
  }
}

export async function deleteEvent(id: string) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('events')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting event:', error)
      throw error
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteEvent:', error)
    throw error
  }
} 