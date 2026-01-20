export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      artists: {
        Row: {
          bio: string | null
          booking_email: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          genres: string[] | null
          id: string
          images: Json | null
          is_active: boolean | null
          name: string
          press_kit_url: string | null
          published_at: string | null
          slug: string
          social_links: Json | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          booking_email?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          genres?: string[] | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          name: string
          press_kit_url?: string | null
          published_at?: string | null
          slug: string
          social_links?: Json | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          booking_email?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          genres?: string[] | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          name?: string
          press_kit_url?: string | null
          published_at?: string | null
          slug?: string
          social_links?: Json | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artists_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collective_events: {
        Row: {
          collective_id: string
          created_at: string | null
          event_id: string
          id: string
          role: string | null
        }
        Insert: {
          collective_id: string
          created_at?: string | null
          event_id: string
          id?: string
          role?: string | null
        }
        Update: {
          collective_id?: string
          created_at?: string | null
          event_id?: string
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collective_events_collective_id_fkey"
            columns: ["collective_id"]
            isOneToOne: false
            referencedRelation: "collectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collective_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      collective_members: {
        Row: {
          artist_id: string
          collective_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          joined_date: string | null
          role: string | null
        }
        Insert: {
          artist_id: string
          collective_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_date?: string | null
          role?: string | null
        }
        Update: {
          artist_id?: string
          collective_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_date?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collective_members_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collective_members_collective_id_fkey"
            columns: ["collective_id"]
            isOneToOne: false
            referencedRelation: "collectives"
            referencedColumns: ["id"]
          },
        ]
      }
      collectives: {
        Row: {
          city: string | null
          collective_type: string | null
          contact_email: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          facebook_url: string | null
          formed_year: number | null
          genres: string[] | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          member_count: number | null
          name: string
          slug: string
          soundcloud_url: string | null
          spotify_url: string | null
          status: string | null
          twitter_url: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          city?: string | null
          collective_type?: string | null
          contact_email?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          facebook_url?: string | null
          formed_year?: number | null
          genres?: string[] | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          member_count?: number | null
          name: string
          slug: string
          soundcloud_url?: string | null
          spotify_url?: string | null
          status?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          city?: string | null
          collective_type?: string | null
          contact_email?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          facebook_url?: string | null
          formed_year?: number | null
          genres?: string[] | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          member_count?: number | null
          name?: string
          slug?: string
          soundcloud_url?: string | null
          spotify_url?: string | null
          status?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collectives_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_analytics: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          metric: string
          referrer: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          metric: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          metric?: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_moderation_log: {
        Row: {
          action: string
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          moderator_id: string | null
          reason: string | null
        }
        Insert: {
          action: string
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          moderator_id?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          moderator_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_log_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_schedule: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          created_by: string
          executed: boolean | null
          executed_at: string | null
          id: string
          scheduled_action: string
          scheduled_for: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          created_by: string
          executed?: boolean | null
          executed_at?: string | null
          id?: string
          scheduled_action: string
          scheduled_for: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          created_by?: string
          executed?: boolean | null
          executed_at?: string | null
          id?: string
          scheduled_action?: string
          scheduled_for?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_schedule_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_muted: boolean | null
          joined_at: string | null
          last_read_at: string | null
          left_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_group: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_artists: {
        Row: {
          artist_id: string | null
          created_at: string | null
          event_id: string | null
          id: string
          performance_order: number | null
          performance_type: string | null
          set_time: string | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          performance_order?: number | null
          performance_type?: string | null
          set_time?: string | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          performance_order?: number | null
          performance_type?: string | null
          set_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_restriction: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          flyer_url: string | null
          genres: string[] | null
          id: string
          images: Json | null
          is_active: boolean | null
          published_at: string | null
          slug: string
          start_date: string
          status: string | null
          ticket_price_max: number | null
          ticket_price_min: number | null
          ticket_url: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
          venue_id: string | null
        }
        Insert: {
          age_restriction?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          flyer_url?: string | null
          genres?: string[] | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          published_at?: string | null
          slug: string
          start_date: string
          status?: string | null
          ticket_price_max?: number | null
          ticket_price_min?: number | null
          ticket_url?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          venue_id?: string | null
        }
        Update: {
          age_restriction?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          flyer_url?: string | null
          genres?: string[] | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          published_at?: string | null
          slug?: string
          start_date?: string
          status?: string | null
          ticket_price_max?: number | null
          ticket_price_min?: number | null
          ticket_url?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          target_id: string
          target_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_id: string
          target_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      label_artists: {
        Row: {
          artist_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          label_id: string
          role: string | null
          signed_date: string | null
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label_id: string
          role?: string | null
          signed_date?: string | null
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label_id?: string
          role?: string | null
          signed_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "label_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "label_artists_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
        ]
      }
      label_events: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          label_id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          label_id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          label_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "label_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "label_events_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
        ]
      }
      labels: {
        Row: {
          city: string | null
          contact_email: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          facebook_url: string | null
          founded_year: number | null
          genres: string[] | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          name: string
          slug: string
          soundcloud_url: string | null
          spotify_url: string | null
          status: string | null
          twitter_url: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          city?: string | null
          contact_email?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          facebook_url?: string | null
          founded_year?: number | null
          genres?: string[] | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          name: string
          slug: string
          soundcloud_url?: string | null
          spotify_url?: string | null
          status?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          city?: string | null
          contact_email?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          facebook_url?: string | null
          founded_year?: number | null
          genres?: string[] | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          name?: string
          slug?: string
          soundcloud_url?: string | null
          spotify_url?: string | null
          status?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          user_agent: string | null
          viewer_id: string | null
          viewer_ip: unknown | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          user_agent?: string | null
          viewer_id?: string | null
          viewer_ip?: unknown | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          user_agent?: string | null
          viewer_id?: string | null
          viewer_ip?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          favorite_genres: string[] | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          language_preference: string | null
          location: string | null
          privacy_settings: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          social_links: Json | null
          theme_preference: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          favorite_genres?: string[] | null
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          language_preference?: string | null
          location?: string | null
          privacy_settings?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          favorite_genres?: string[] | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          language_preference?: string | null
          location?: string | null
          privacy_settings?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      review_flags: {
        Row: {
          created_at: string | null
          flagged_by: string | null
          id: string
          reason: string | null
          review_id: string | null
        }
        Insert: {
          created_at?: string | null
          flagged_by?: string | null
          id?: string
          reason?: string | null
          review_id?: string | null
        }
        Update: {
          created_at?: string | null
          flagged_by?: string | null
          id?: string
          reason?: string | null
          review_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_flags_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_flags_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          updated_at: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          updated_at?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          updated_at?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          ai_flagged: boolean | null
          comment: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          moderation_notes: string | null
          rating_crowd: number | null
          rating_overall: number | null
          rating_sound: number | null
          rating_vibe: number | null
          status: Database["public"]["Enums"]["review_status"] | null
          target_id: string
          target_type: string
          unhelpful_count: number | null
          updated_at: string | null
          user_flagged: boolean | null
          user_id: string | null
        }
        Insert: {
          ai_flagged?: boolean | null
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          moderation_notes?: string | null
          rating_crowd?: number | null
          rating_overall?: number | null
          rating_sound?: number | null
          rating_vibe?: number | null
          status?: Database["public"]["Enums"]["review_status"] | null
          target_id: string
          target_type: string
          unhelpful_count?: number | null
          updated_at?: string | null
          user_flagged?: boolean | null
          user_id?: string | null
        }
        Update: {
          ai_flagged?: boolean | null
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          moderation_notes?: string | null
          rating_crowd?: number | null
          rating_overall?: number | null
          rating_sound?: number | null
          rating_vibe?: number | null
          status?: Database["public"]["Enums"]["review_status"] | null
          target_id?: string
          target_type?: string
          unhelpful_count?: number | null
          updated_at?: string | null
          user_flagged?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_connections_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          allow_friend_requests: boolean | null
          allow_messages: boolean | null
          content_filter: Json | null
          created_at: string | null
          currency_preference: string | null
          date_format: string | null
          default_location: string | null
          email_notifications: Json | null
          id: string
          profile_visibility: string | null
          push_notifications: Json | null
          search_radius: number | null
          show_activity: boolean | null
          show_favorites: boolean | null
          show_location: boolean | null
          show_online_status: boolean | null
          show_reviews: boolean | null
          time_format: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          allow_friend_requests?: boolean | null
          allow_messages?: boolean | null
          content_filter?: Json | null
          created_at?: string | null
          currency_preference?: string | null
          date_format?: string | null
          default_location?: string | null
          email_notifications?: Json | null
          id?: string
          profile_visibility?: string | null
          push_notifications?: Json | null
          search_radius?: number | null
          show_activity?: boolean | null
          show_favorites?: boolean | null
          show_location?: boolean | null
          show_online_status?: boolean | null
          show_reviews?: boolean | null
          time_format?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          allow_friend_requests?: boolean | null
          allow_messages?: boolean | null
          content_filter?: Json | null
          created_at?: string | null
          currency_preference?: string | null
          date_format?: string | null
          default_location?: string | null
          email_notifications?: Json | null
          id?: string
          profile_visibility?: string | null
          push_notifications?: Json | null
          search_radius?: number | null
          show_activity?: boolean | null
          show_favorites?: boolean | null
          show_location?: boolean | null
          show_online_status?: boolean | null
          show_reviews?: boolean | null
          time_format?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          amenities: string[] | null
          capacity: number | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          email: string | null
          genres: string[] | null
          id: string
          images: Json | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          phone: string | null
          postal_code: string | null
          published_at: string | null
          slug: string
          social_links: Json | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          genres?: string[] | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          published_at?: string | null
          slug: string
          social_links?: Json | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          genres?: string[] | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          published_at?: string | null
          slug?: string
          social_links?: Json | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          business_info: Json | null
          documents: Json | null
          id: string
          requested_role: Database["public"]["Enums"]["user_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          social_links: Json | null
          status: Database["public"]["Enums"]["verification_status"] | null
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          business_info?: Json | null
          documents?: Json | null
          id?: string
          requested_role: Database["public"]["Enums"]["user_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          business_info?: Json | null
          documents?: Json | null
          id?: string
          requested_role?: Database["public"]["Enums"]["user_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_profile: {
        Args: { viewer_id?: string; profile_id: string }
        Returns: boolean
      }
      can_view_profile_data: {
        Args: { profile_id: string; viewer_id?: string; data_type: string }
        Returns: boolean
      }
    }
    Enums: {
      review_status: "visible" | "pending_review" | "hidden"
      user_role: "fan" | "artist" | "promoter" | "club_owner" | "admin"
      verification_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      review_status: ["visible", "pending_review", "hidden"],
      user_role: ["fan", "artist", "promoter", "club_owner", "admin"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
