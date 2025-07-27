import { supabase } from '@/lib/auth'
import { UserRole } from '@/lib/auth'

export interface VerificationRequest {
  id: string
  user_id: string
  requested_role: UserRole
  documents: {
    identity_document?: string
    business_license?: string
    artist_portfolio?: string
    venue_photos?: string[]
    social_media_proof?: string
    [key: string]: any
  }
  social_links: {
    website?: string
    instagram?: string
    soundcloud?: string
    spotify?: string
    facebook?: string
    [key: string]: any
  }
  business_info: {
    company_name?: string
    business_address?: string
    tax_id?: string
    venue_name?: string
    venue_address?: string
    capacity?: number
    artist_name?: string
    genres?: string[]
    [key: string]: any
  }
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  // Joined user data
  user?: {
    id: string
    email: string
    display_name: string
    avatar_url?: string
    role: UserRole
  }
}

export interface CreateVerificationRequest {
  requested_role: UserRole
  documents: Record<string, any>
  social_links: Record<string, any>
  business_info: Record<string, any>
}

export interface UpdateVerificationRequest {
  status: 'approved' | 'rejected'
  admin_notes?: string
}

class VerificationService {
  // Submit a new verification request
  async submitVerificationRequest(requestData: CreateVerificationRequest): Promise<VerificationRequest> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Check if user already has a pending request
    const { data: existingRequest } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      throw new Error('You already have a pending verification request')
    }

    const { data, error } = await supabase
      .from('verification_requests')
      .insert([{
        user_id: user.id,
        ...requestData,
        status: 'pending',
        submitted_at: new Date().toISOString()
      }])
      .select('*')
      .single()

    if (error) throw error
    return data
  }

  // Get user's verification requests
  async getUserVerificationRequests(): Promise<VerificationRequest[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Admin: Get all verification requests
  async getAllVerificationRequests(): Promise<VerificationRequest[]> {
    // First get all verification requests
    const { data: requests, error } = await supabase
      .from('verification_requests')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) throw error
    if (!requests || requests.length === 0) return []

    // Get unique user IDs
    const userIds = [...new Set(requests.map(r => r.user_id).filter(Boolean))]
    
    // Fetch user profiles (without email since it's not in profiles table)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, avatar_url, role')
      .in('id', userIds)

    if (profilesError) throw profilesError

    // Create a map of user profiles with fallback name logic
    const profileMap = new Map((profiles || []).map(p => [p.id, {
      ...p,
      display_name: p.display_name || p.full_name || 'Unknown User'
    }]))

    // Combine requests with user data
    return requests.map(request => ({
      ...request,
      user: profileMap.get(request.user_id) || null
    }))
  }

  // Admin: Get verification requests by status
  async getVerificationRequestsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<VerificationRequest[]> {
    // First get verification requests by status
    const { data: requests, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('status', status)
      .order('submitted_at', { ascending: false })

    if (error) throw error
    if (!requests || requests.length === 0) return []

    // Get unique user IDs
    const userIds = [...new Set(requests.map(r => r.user_id).filter(Boolean))]
    
    // Fetch user profiles (without email since it's not in profiles table)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, avatar_url, role')
      .in('id', userIds)

    if (profilesError) throw profilesError

    // Create a map of user profiles with fallback name logic
    const profileMap = new Map((profiles || []).map(p => [p.id, {
      ...p,
      display_name: p.display_name || p.full_name || 'Unknown User'
    }]))

    // Combine requests with user data
    return requests.map(request => ({
      ...request,
      user: profileMap.get(request.user_id) || null
    }))
  }

  // Admin: Update verification request status
  async updateVerificationRequest(id: string, updates: UpdateVerificationRequest): Promise<VerificationRequest> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminProfile || adminProfile.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required')
    }

    const { data: updatedRequest, error } = await supabase
      .from('verification_requests')
      .update({
        ...updates,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    // Fetch user profile separately (without email since it's not in profiles table)
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, avatar_url, role')
      .eq('id', updatedRequest.user_id)
      .single()

    if (profileError) throw profileError

    const data = {
      ...updatedRequest,
      user: {
        ...userProfile,
        display_name: userProfile.display_name || userProfile.full_name || 'Unknown User'
      }
    }

    // If approved, update user's role
    if (updates.status === 'approved') {
      const verificationRequest = data
      await supabase
        .from('profiles')
        .update({ 
          role: verificationRequest.requested_role,
          is_verified: true
        })
        .eq('id', verificationRequest.user_id)
    }

    return data
  }

  // Get verification statistics
  async getVerificationStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    by_role: Record<UserRole, number>
  }> {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('status, requested_role')

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      by_role: {
        fan: 0,
        artist: 0,
        promoter: 0,
        club_owner: 0,
        admin: 0
      } as Record<UserRole, number>
    }

    data?.forEach(request => {
      stats[request.status as keyof typeof stats]++
      stats.by_role[request.requested_role as UserRole]++
    })

    return stats
  }
}

export const verificationService = new VerificationService()