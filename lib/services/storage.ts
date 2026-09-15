import { supabase } from '@/lib/auth'

export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  try {
    // Generate unique filename - must match policy structure: avatars/USER_ID/filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `avatars/${userId}/${fileName}`

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error: any) {
    console.error('Upload error:', error)
    throw new Error(error.message || 'Failed to upload image')
  }
}

export async function uploadEventImage(file: File, eventId: string): Promise<string> {
  try {
    console.log('Starting upload for:', file.name, 'to event:', eventId)
    
    // Enhanced file path structure: events/EVENT_ID/filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `events/${eventId}/${fileName}`
    
    console.log('Upload path:', filePath)

    const { data, error } = await supabase.storage
      .from('public')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    console.log('Upload result:', { data, error })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath)

    console.log('Generated public URL:', publicUrl)
    return publicUrl
  } catch (error: any) {
    console.error('Upload error:', error)
    throw new Error(error.message || 'Failed to upload image')
  }
}

export async function uploadVenueImage(file: File, venueId: string): Promise<string> {
  try {
    // Enhanced file path structure: venues/VENUE_ID/filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `venues/${venueId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('public')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error: any) {
    console.error('Upload error:', error)
    throw new Error(error.message || 'Failed to upload image')
  }
}

export async function uploadArtistImage(file: File, artistId: string): Promise<string> {
  try {
    // Enhanced file path structure: artists/ARTIST_ID/filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `artists/${artistId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('public')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error: any) {
    console.error('Upload error:', error)
    throw new Error(error.message || 'Failed to upload image')
  }
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error: any) {
    console.error('Delete error:', error)
    throw new Error(error.message || 'Failed to delete file')
  }
}

// Utility functions for image validation
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' }
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 5MB' }
  }

  // Check allowed formats
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, GIF, and WebP images are allowed' }
  }

  return { valid: true }
}

export function resizeImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.9): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(resizedFile)
        } else {
          resolve(file) // Fallback to original
        }
      }, file.type, quality)
    }

    img.src = URL.createObjectURL(file)
  })
}