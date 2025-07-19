import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client for authentication
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type UserRole = 'fan' | 'artist' | 'promoter' | 'club_owner' | 'admin'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  is_verified: boolean
}

export interface SignUpData {
  email: string
  password: string
  role: UserRole
  full_name?: string
}

export interface VerificationRequestData {
  documents: File[]
  social_links: {
    instagram?: string
    twitter?: string
    website?: string
  }
}

export const authService = {
  async signUp(data: SignUpData) {
    try {
      // Use the API route for registration to handle RLS properly
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          role: data.role,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const result = await response.json()
      
      // Now sign in the user to get a session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        throw signInError
      }

      return { user: signInData.user, session: signInData.session }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Verify the session is active
      const { data: sessionData } = await supabase.auth.getSession()

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return null
      }

      // Get profile data with better error handling
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, is_verified, full_name')
        .eq('id', user.id)
        .maybeSingle() // Use maybeSingle instead of single to handle missing profiles gracefully

      if (error) {
        console.error('Profile fetch error:', error)
        // Still return user data even if profile fetch fails
        return {
          id: user.id,
          email: user.email!,
          role: 'fan' as UserRole, // Default to fan if profile not found
          is_verified: false,
        }
      }

      if (!profile) {
        console.warn('No profile found for user, creating basic user object')
        return {
          id: user.id,
          email: user.email!,
          role: 'fan' as UserRole,
          is_verified: false,
        }
      }

      const authUser = {
        id: user.id,
        email: user.email!,
        role: profile.role as UserRole,
        is_verified: profile.is_verified,
      }
      
      return authUser
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  },

  async submitVerificationRequest(data: VerificationRequestData) {
    try {
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User must be logged in')
      }

      // Upload documents to Supabase Storage
      const documentUrls: string[] = []
      
      for (const file of data.documents) {
        const fileName = `${user.id}/${Date.now()}_${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('verification-documents')
          .upload(fileName, file)

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('verification-documents')
          .getPublicUrl(uploadData.path)

        documentUrls.push(publicUrl)
      }

      // Create verification request with requested_role field
      const { error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          requested_role: user.role, // Use the current user's role as requested role
          documents: documentUrls,
          social_links: data.social_links,
          status: 'pending',
        })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Verification request error:', error)
      throw error
    }
  },

  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  },

  async signUpWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Google sign up error:', error)
      throw error
    }
  },

  // Auth state change listener
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  },
}

export { supabase } 