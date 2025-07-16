export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'fan' | 'artist' | 'promoter' | 'club_owner' | 'admin'
          is_verified: boolean
          bio: string | null
          location: string | null
          social_links: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'fan' | 'artist' | 'promoter' | 'club_owner' | 'admin'
          is_verified?: boolean
          bio?: string | null
          location?: string | null
          social_links?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'fan' | 'artist' | 'promoter' | 'club_owner' | 'admin'
          is_verified?: boolean
          bio?: string | null
          location?: string | null
          social_links?: Json
          created_at?: string
          updated_at?: string
        }
      }
      verification_requests: {
        Row: {
          id: string
          user_id: string
          requested_role: 'fan' | 'artist' | 'promoter' | 'club_owner' | 'admin'
          documents: Json
          social_links: Json
          business_info: Json
          status: 'pending' | 'approved' | 'rejected'
          admin_notes: string | null
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          requested_role: 'fan' | 'artist' | 'promoter' | 'club_owner' | 'admin'
          documents?: Json
          social_links?: Json
          business_info?: Json
          status?: 'pending' | 'approved' | 'rejected'
          admin_notes?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          requested_role?: 'fan' | 'artist' | 'promoter' | 'club_owner' | 'admin'
          documents?: Json
          social_links?: Json
          business_info?: Json
          status?: 'pending' | 'approved' | 'rejected'
          admin_notes?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
      }
      venues: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          slug: string
          description: string | null
          address: string | null
          city: string | null
          country: string | null
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          capacity: number | null
          website: string | null
          phone: string | null
          email: string | null
          social_links: Json
          images: Json
          genres: string[]
          amenities: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          slug: string
          description?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          capacity?: number | null
          website?: string | null
          phone?: string | null
          email?: string | null
          social_links?: Json
          images?: Json
          genres?: string[]
          amenities?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          capacity?: number | null
          website?: string | null
          phone?: string | null
          email?: string | null
          social_links?: Json
          images?: Json
          genres?: string[]
          amenities?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          user_id: string | null
          name: string
          slug: string
          bio: string | null
          country: string | null
          city: string | null
          genres: string[]
          social_links: Json
          images: Json
          press_kit_url: string | null
          booking_email: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          slug: string
          bio?: string | null
          country?: string | null
          city?: string | null
          genres?: string[]
          social_links?: Json
          images?: Json
          press_kit_url?: string | null
          booking_email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          slug?: string
          bio?: string | null
          country?: string | null
          city?: string | null
          genres?: string[]
          social_links?: Json
          images?: Json
          press_kit_url?: string | null
          booking_email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          venue_id: string | null
          created_by: string | null
          title: string
          slug: string
          description: string | null
          start_date: string
          end_date: string | null
          genres: string[]
          ticket_url: string | null
          ticket_price_min: number | null
          ticket_price_max: number | null
          currency: string | null
          images: Json
          flyer_url: string | null
          age_restriction: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          venue_id?: string | null
          created_by?: string | null
          title: string
          slug: string
          description?: string | null
          start_date: string
          end_date?: string | null
          genres?: string[]
          ticket_url?: string | null
          ticket_price_min?: number | null
          ticket_price_max?: number | null
          currency?: string | null
          images?: Json
          flyer_url?: string | null
          age_restriction?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          venue_id?: string | null
          created_by?: string | null
          title?: string
          slug?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          genres?: string[]
          ticket_url?: string | null
          ticket_price_min?: number | null
          ticket_price_max?: number | null
          currency?: string | null
          images?: Json
          flyer_url?: string | null
          age_restriction?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      event_artists: {
        Row: {
          id: string
          event_id: string
          artist_id: string
          performance_order: number | null
          performance_type: string | null
          set_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          artist_id: string
          performance_order?: number | null
          performance_type?: string | null
          set_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          artist_id?: string
          performance_order?: number | null
          performance_type?: string | null
          set_time?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          target_type: 'venue' | 'event' | 'artist'
          target_id: string
          rating_overall: number | null
          rating_sound: number | null
          rating_vibe: number | null
          rating_crowd: number | null
          comment: string | null
          ai_flagged: boolean
          user_flagged: boolean
          status: 'visible' | 'pending_review' | 'hidden'
          moderation_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_type: 'venue' | 'event' | 'artist'
          target_id: string
          rating_overall?: number | null
          rating_sound?: number | null
          rating_vibe?: number | null
          rating_crowd?: number | null
          comment?: string | null
          ai_flagged?: boolean
          user_flagged?: boolean
          status?: 'visible' | 'pending_review' | 'hidden'
          moderation_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_type?: 'venue' | 'event' | 'artist'
          target_id?: string
          rating_overall?: number | null
          rating_sound?: number | null
          rating_vibe?: number | null
          rating_crowd?: number | null
          comment?: string | null
          ai_flagged?: boolean
          user_flagged?: boolean
          status?: 'visible' | 'pending_review' | 'hidden'
          moderation_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      review_flags: {
        Row: {
          id: string
          review_id: string
          flagged_by: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          flagged_by: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          flagged_by?: string
          reason?: string | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          target_type: 'venue' | 'event' | 'artist'
          target_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_type: 'venue' | 'event' | 'artist'
          target_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_type?: 'venue' | 'event' | 'artist'
          target_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          data: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          data?: Json
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          data?: Json
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'fan' | 'artist' | 'promoter' | 'club_owner' | 'admin'
      verification_status: 'pending' | 'approved' | 'rejected'
      review_status: 'visible' | 'pending_review' | 'hidden'
    }
  }
} 