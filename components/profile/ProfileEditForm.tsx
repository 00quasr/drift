"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  User, 
  Save, 
  AlertCircle, 
  Camera,
  X,
  Check
} from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/auth'
import { uploadProfileImage } from '@/lib/services/storage'
import { useAuth } from '@/contexts/AuthContext'

interface ProfileEditFormProps {
  profile: any
  onSuccess: () => void
}

const GENRE_OPTIONS = [
  'Techno', 'House', 'Drum & Bass', 'Trance', 'Dubstep', 
  'Progressive', 'Minimal', 'Deep House', 'Tech House', 'Hardstyle',
  'Ambient', 'IDM', 'Breakbeat', 'Garage', 'Electro'
]

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profile,
  onSuccess
}) => {
  const { refreshUser } = useAuth()
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    favorite_genres: profile.favorite_genres || [],
    social_links: profile.social_links || {}
  })
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      favorite_genres: prev.favorite_genres.includes(genre)
        ? prev.favorite_genres.filter((g: string) => g !== genre)
        : [...prev.favorite_genres, genre]
    }))
  }

  const handleSocialLinkChange = (platform: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: url
      }
    }))
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset states
    setUploadError('')
    setError('')

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB')
      return
    }

    setAvatarFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      let avatarUrl = profile.avatar_url

      // Upload new avatar if one was selected
      if (avatarFile) {
        setUploading(true)
        try {
          avatarUrl = await uploadProfileImage(avatarFile, profile.id)
          // Clear the avatar file after successful upload
          setAvatarFile(null)
        } catch (uploadError) {
          console.error('Upload error:', uploadError)
          setUploadError(`Failed to upload image: ${(uploadError as Error).message}`)
          // Continue with save even if upload fails
        }
        setUploading(false)
      }

      // Update profile
      const updateData = {
        ...formData,
        avatar_url: avatarUrl
      }

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile')
      }
      
      // Refresh the auth context to update the header
      await refreshUser()
      
      onSuccess()
      
    } catch (error: any) {
      console.error('Profile update error:', error)
      setError(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar Upload Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-wider uppercase text-white">
          PROFILE PICTURE
        </h3>
        
        <div className="flex items-start gap-6">
          {/* Avatar Preview */}
          <div className="relative">
            <div className="w-32 h-32 bg-white/5 border border-white/20 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-white/60" />
              )}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold tracking-wider uppercase"
            >
              <Camera className="w-4 h-4 mr-2" />
              CHOOSE IMAGE
            </Button>
            
            <div className="text-white/60 text-sm font-medium">
              <p>• Max size: 5MB</p>
              <p>• Formats: JPG, PNG, GIF</p>
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                {uploadError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-wider uppercase text-white">
          BASIC INFORMATION
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
              FULL NAME
            </label>
            <Input
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="bg-black border-white/30 text-white placeholder-white/50"
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
              DISPLAY NAME
            </label>
            <Input
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              className="bg-black border-white/30 text-white placeholder-white/50"
              placeholder="How others see you"
            />
          </div>
        </div>

        <div>
          <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
            LOCATION
          </label>
          <Input
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="bg-black border-white/30 text-white placeholder-white/50"
            placeholder="City, Country"
          />
        </div>

        <div>
          <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
            BIO
          </label>
          <Textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="bg-black border-white/30 text-white placeholder-white/50 min-h-[100px]"
            placeholder="Tell others about yourself..."
            maxLength={500}
          />
          <div className="text-white/40 text-sm mt-1">
            {formData.bio.length}/500 characters
          </div>
        </div>
      </div>

      {/* Favorite Genres */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-wider uppercase text-white">
          FAVORITE GENRES
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {GENRE_OPTIONS.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => handleGenreToggle(genre)}
              className={`p-2 border font-bold tracking-wider uppercase text-sm transition-all duration-200 ${
                formData.favorite_genres.includes(genre)
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white border-white/20 hover:bg-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-wider uppercase text-white">
          SOCIAL LINKS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['instagram', 'twitter', 'soundcloud', 'spotify'].map((platform) => (
            <div key={platform}>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                {platform}
              </label>
              <Input
                value={formData.social_links[platform] || ''}
                onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                className="bg-black border-white/30 text-white placeholder-white/50"
                placeholder={`Your ${platform} URL`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4 pt-6 border-t border-white/20">
        <Button
          type="submit"
          disabled={saving || uploading}
          className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase flex-1"
        >
          {saving || uploading ? (
            <>
              {uploading ? 'UPLOADING...' : 'SAVING...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              SAVE CHANGES
              {avatarFile && (
                <span className="ml-2 text-xs">(+IMAGE)</span>
              )}
            </>
          )}
        </Button>
      </div>

    </form>
  )
}