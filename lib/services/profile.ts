import { supabase } from '@/lib/auth'

export interface ProfileUpdateData {
  full_name?: string | null
  display_name?: string | null
  bio?: string | null
  location?: string | null
  avatar_url?: string | null
  favorite_genres?: string[]
  social_links?: Record<string, string>
}

export async function updateProfile(userId: string, data: ProfileUpdateData) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Profile update failed: ${error.message}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Profile update error:', error)
    throw new Error(error.message || 'Failed to update profile')
  }
}

export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(`Profile fetch failed: ${error.message}`)
    }

    return data
  } catch (error: any) {
    console.error('Profile fetch error:', error)
    throw new Error(error.message || 'Failed to fetch profile')
  }
}

export async function uploadProfileAvatar(userId: string, file: File) {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase storage
    const { data, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    // Update profile with new avatar URL
    await updateProfile(userId, { avatar_url: publicUrl })

    return publicUrl
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    throw new Error(error.message || 'Failed to upload avatar')
  }
}

export async function deleteProfileAvatar(userId: string, avatarUrl: string) {
  try {
    // Extract file path from URL
    const url = new URL(avatarUrl)
    const filePath = url.pathname.split('/').slice(-2).join('/') // Get last two parts of path

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('profiles')
      .remove([filePath])

    if (deleteError) {
      console.error('Storage delete error:', deleteError)
      // Don't throw error for storage deletion failure
    }

    // Remove avatar URL from profile
    await updateProfile(userId, { avatar_url: null })

    return { success: true }
  } catch (error: any) {
    console.error('Avatar delete error:', error)
    throw new Error(error.message || 'Failed to delete avatar')
  }
}

export function validateProfileData(data: ProfileUpdateData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate full_name
  if (data.full_name !== undefined && data.full_name !== null) {
    if (data.full_name.length > 100) {
      errors.push('Full name must be less than 100 characters')
    }
  }

  // Validate display_name
  if (data.display_name !== undefined && data.display_name !== null) {
    if (data.display_name.length > 50) {
      errors.push('Display name must be less than 50 characters')
    }
    if (data.display_name.length > 0 && !/^[a-zA-Z0-9_\s-]+$/.test(data.display_name)) {
      errors.push('Display name can only contain letters, numbers, spaces, hyphens, and underscores')
    }
  }

  // Validate bio
  if (data.bio !== undefined && data.bio !== null) {
    if (data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters')
    }
  }

  // Validate location
  if (data.location !== undefined && data.location !== null) {
    if (data.location.length > 100) {
      errors.push('Location must be less than 100 characters')
    }
  }

  // Validate favorite_genres
  if (data.favorite_genres !== undefined) {
    if (data.favorite_genres.length > 10) {
      errors.push('Maximum 10 favorite genres allowed')
    }
  }

  // Validate social_links
  if (data.social_links !== undefined) {
    const allowedPlatforms = ['instagram', 'twitter', 'soundcloud', 'spotify', 'facebook', 'youtube']
    
    for (const [platform, url] of Object.entries(data.social_links)) {
      if (!allowedPlatforms.includes(platform)) {
        errors.push(`Unsupported social platform: ${platform}`)
      }
      
      if (url && !isValidUrl(url)) {
        errors.push(`Invalid URL for ${platform}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export async function searchProfiles(query: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, display_name, avatar_url, role, location, favorite_genres')
      .or(`full_name.ilike.%${query}%,display_name.ilike.%${query}%,location.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      throw new Error(`Profile search failed: ${error.message}`)
    }

    return data
  } catch (error: any) {
    console.error('Profile search error:', error)
    throw new Error(error.message || 'Failed to search profiles')
  }
}