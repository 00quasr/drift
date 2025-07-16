import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Client-side auth functions
export async function signUp(email: string, password: string, userData: {
  fullName: string
  role: 'fan' | 'artist' | 'promoter' | 'club_owner'
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userData.fullName,
        role: userData.role
      }
    }
  })

  if (error) {
    console.error('Error signing up:', error)
    throw error
  }

  // Create profile after successful signup
  if (data.user) {
    await createProfile({
      id: data.user.id,
      full_name: userData.fullName,
      role: userData.role
    })
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Error signing in:', error)
    throw error
  }

  return data
}

export async function signInWithGoogle() {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }

  return data
}

export async function signInWithFacebook() {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    console.error('Error signing in with Facebook:', error)
    throw error
  }

  return data
}

export async function signOut() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })

  if (error) {
    console.error('Error resetting password:', error)
    throw error
  }

  return data
}

export async function updatePassword(password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.updateUser({
    password
  })

  if (error) {
    console.error('Error updating password:', error)
    throw error
  }

  return data
}

export async function getCurrentUser() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting current user:', error)
    throw error
  }

  return user
}

export async function getCurrentSession() {
  const supabase = createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting current session:', error)
    throw error
  }

  return session
}

// Profile management functions
export async function getCurrentProfile() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error getting current profile:', error)
    throw error
  }

  return data
}

export async function createProfile(profileData: ProfileInsert) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    throw error
  }

  return data
}

export async function updateProfile(profileData: ProfileUpdate) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw error
  }

  return data
}

export async function getProfileById(id: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error getting profile by ID:', error)
    throw error
  }

  return data
}

// Server-side auth functions
export async function getServerUser() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting server user:', error)
    return null
  }

  return user
}

export async function getServerProfile() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error getting server profile:', error)
    return null
  }

  return data
}

export async function requireAuth() {
  const user = await getServerUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

export async function requireRole(requiredRole: string | string[]) {
  const profile = await getServerProfile()
  
  if (!profile) {
    throw new Error('Authentication required')
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  if (!roles.includes(profile.role)) {
    throw new Error('Insufficient permissions')
  }

  return profile
}

export async function requireVerified() {
  const profile = await getServerProfile()
  
  if (!profile) {
    throw new Error('Authentication required')
  }

  if (!profile.is_verified && profile.role !== 'fan') {
    throw new Error('Account verification required')
  }

  return profile
}

// Utility functions
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

export function getPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password should be at least 8 characters long')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include lowercase letters')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include uppercase letters')
  }

  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Include numbers')
  }

  if (/[^a-zA-Z\d]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include special characters')
  }

  return { score, feedback }
}

export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    fan: 'Fan',
    artist: 'Artist',
    promoter: 'Promoter',
    club_owner: 'Venue Owner',
    admin: 'Administrator'
  }
  
  return roleNames[role] || role
}

export function canCreateContent(role: string, isVerified: boolean): boolean {
  if (role === 'fan') return false
  if (role === 'admin') return true
  
  return isVerified
} 