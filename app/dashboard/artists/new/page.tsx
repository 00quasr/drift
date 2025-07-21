'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Music, 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  Mail,
  X,
  AlertCircle,
  Instagram,
  ExternalLink
} from 'lucide-react'
import { uploadArtistImage, moderateImage, validateImageFile } from '@/lib/services/storage'

interface ArtistFormData {
  name: string
  bio: string
  city: string
  country: string
  genres: string[]
  social_links: {
    website?: string
    instagram?: string
    soundcloud?: string
    spotify?: string
  }
  booking_email: string
  press_kit_url?: string
  images: string[]
}

const MUSIC_GENRES = [
  'Techno', 'House', 'Trance', 'Progressive House', 'Deep House', 'Tech House',
  'Minimal Techno', 'Industrial Techno', 'Acid Techno', 'Drum & Bass',
  'Dubstep', 'Breakbeat', 'UK Garage', 'Ambient', 'Downtempo', 'Electronica',
  'Electro', 'Synthwave', 'IDM', 'Experimental'
]

export default function CreateArtistPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<ArtistFormData>({
    name: '',
    bio: '',
    city: '',
    country: '',
    genres: [],
    social_links: {
      website: '',
      instagram: '',
      soundcloud: '',
      spotify: ''
    },
    booking_email: '',
    press_kit_url: '',
    images: []
  })

  const handleInputChange = (field: keyof ArtistFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialLinksChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    setUploading(true)
    setError('')

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate image
        const validation = validateImageFile(file)
        if (!validation.valid) {
          throw new Error(validation.error)
        }

        // Moderate content
        const approved = await moderateImage(file)
        if (!approved) {
          throw new Error(`Image ${file.name} was rejected by content moderation`)
        }

        // Generate temporary artist ID for storage path
        const tempArtistId = crypto.randomUUID()
        
        // Upload to storage
        const imageUrl = await uploadArtistImage(file, tempArtistId)
        return imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))

    } catch (error: any) {
      console.error('Image upload error:', error)
      setError(error.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    setLoading(true)
    setError('')

    try {
      // Get auth session for API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()
      
      // Create artist in database
      console.log('Sending artist creation request...', {
        hasSession: !!session,
        hasToken: !!session?.access_token,
        userId: user.id
      })

      // Clean up social links (remove empty values)
      const cleanSocialLinks = Object.fromEntries(
        Object.entries(formData.social_links).filter(([_, value]) => value && value.trim())
      )

      const response = await fetch('/api/artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          ...formData,
          social_links: cleanSocialLinks,
          created_by: user.id,
          status: 'draft'
        })
      })

      console.log('API Response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log('API Error details:', errorData)
        throw new Error(errorData.error || 'Failed to create artist profile')
      }

      const artist = await response.json()
      router.push(`/dashboard/artists/${artist.data.id}`)

    } catch (error: any) {
      console.error('Artist creation error:', error)
      setError(error.message || 'Failed to create artist profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="border-b border-white/20 pb-6 mb-8">
        <h1 className="text-4xl font-bold tracking-wider uppercase text-white mb-2">
          Create Artist Profile
        </h1>
        <p className="text-white/60 font-bold tracking-wider uppercase">
          Add your artist profile to the platform
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 p-4 mb-6 flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-200">{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Artist Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Your artist name or stage name"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Booking Email *
              </label>
              <input
                type="email"
                required
                value={formData.booking_email}
                onChange={(e) => handleInputChange('booking_email', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="booking@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Biography *
              </label>
              <textarea
                required
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors resize-none"
                placeholder="Tell your story, musical journey, influences, and what makes your sound unique..."
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Your city"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Your country"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Press Kit URL
              </label>
              <input
                type="url"
                value={formData.press_kit_url || ''}
                onChange={(e) => handleInputChange('press_kit_url', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="https://example.com/presskit.pdf"
              />
            </div>
          </div>
        </div>

        {/* Music Genres */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
            <Music className="w-6 h-6 mr-3" />
            Music Genres
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MUSIC_GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreToggle(genre)}
                className={`px-3 py-2 text-sm font-bold tracking-wider uppercase transition-colors border ${
                  formData.genres.includes(genre)
                    ? 'bg-white text-black border-white'
                    : 'bg-black/50 text-white/60 border-white/30 hover:border-white/60 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          
          {formData.genres.length > 0 && (
            <div className="mt-4">
              <p className="text-white/80 text-sm">
                Selected: {formData.genres.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
            Social Links
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Website
              </label>
              <input
                type="url"
                value={formData.social_links.website || ''}
                onChange={(e) => handleSocialLinksChange('website', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </label>
              <input
                type="url"
                value={formData.social_links.instagram || ''}
                onChange={(e) => handleSocialLinksChange('instagram', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="https://instagram.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                SoundCloud
              </label>
              <input
                type="url"
                value={formData.social_links.soundcloud || ''}
                onChange={(e) => handleSocialLinksChange('soundcloud', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="https://soundcloud.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Spotify
              </label>
              <input
                type="url"
                value={formData.social_links.spotify || ''}
                onChange={(e) => handleSocialLinksChange('spotify', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="https://open.spotify.com/artist/..."
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
            <ImageIcon className="w-6 h-6 mr-3" />
            Images
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Upload Artist Photos
              </label>
              <div className="border-2 border-dashed border-white/30 p-6 text-center hover:border-white/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-white/60" />
                  <p className="text-white/80 font-bold tracking-wider uppercase">
                    {uploading ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-white/40 text-sm mt-2">
                    JPG, PNG, GIF, WebP up to 5MB each
                  </p>
                </label>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-black/50 border border-white/30 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`Artist photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-white/30 text-white hover:border-white/60 transition-colors font-bold tracking-wider uppercase"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Creating...' : 'Create Artist Profile'}
          </motion.button>
        </div>
      </form>
    </div>
  )
}