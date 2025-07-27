'use client'

import { useState, useEffect } from 'react'
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
  Save,
  Eye,
  Archive,
  Trash2,
  Calendar,
  Instagram,
  ExternalLink
} from 'lucide-react'
import { uploadArtistImage, moderateImage, validateImageFile } from '@/lib/services/storage'
import ClassicLoader from '@/components/ui/loader'

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
  status: string
}

interface ArtistEditPageProps {
  params: Promise<{ id: string }>
}

const MUSIC_GENRES = [
  'Techno', 'House', 'Trance', 'Progressive House', 'Deep House', 'Tech House',
  'Minimal Techno', 'Industrial Techno', 'Acid Techno', 'Drum & Bass',
  'Dubstep', 'Breakbeat', 'UK Garage', 'Ambient', 'Downtempo', 'Electronica',
  'Electro', 'Synthwave', 'IDM', 'Experimental'
]

export default function ArtistEditPage({ params }: ArtistEditPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [artist, setArtist] = useState<ArtistFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [artistId, setArtistId] = useState<string | null>(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function getArtistId() {
      const resolvedParams = await params
      setArtistId(resolvedParams.id)
    }
    getArtistId()
  }, [params])

  useEffect(() => {
    if (artistId) {
      fetchArtist()
    }
  }, [artistId])

  const fetchArtist = async () => {
    if (!artistId) return
    
    try {
      // Get auth session for CMS API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/artists/${artistId}?cms=true`, {
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setArtist({
          ...data.data,
          social_links: data.data.social_links || {}
        })
      } else {
        console.error('Failed to fetch artist:', response.status, response.statusText)
        setError('Artist not found or access denied')
      }
    } catch (error) {
      console.error('Error fetching artist:', error)
      setError('Failed to load artist')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ArtistFormData, value: any) => {
    if (!artist) return
    setArtist(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleSocialLinksChange = (platform: string, value: string) => {
    if (!artist) return
    setArtist(prev => prev ? {
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    } : null)
  }

  const handleGenreToggle = (genre: string) => {
    if (!artist) return
    setArtist(prev => prev ? {
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    } : null)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length || !artistId) return

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

        // Upload to storage
        const imageUrl = await uploadArtistImage(file, artistId)
        return imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      if (artist) {
        setArtist(prev => prev ? ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }) : null)
      }

    } catch (error: any) {
      console.error('Image upload error:', error)
      setError(error.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    if (!artist) return
    setArtist(prev => prev ? ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }) : null)
  }

  const handleSave = async () => {
    if (!artist || !artistId) return
    
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Get auth session for API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      // Clean up social links (remove empty values)
      const cleanSocialLinks = Object.fromEntries(
        Object.entries(artist.social_links).filter(([_, value]) => value && value.trim())
      )

      const response = await fetch(`/api/artists/${artistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          ...artist,
          social_links: cleanSocialLinks
        })
      })

      if (response.ok) {
        setSuccess('Artist profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update artist')
      }

    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update artist')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!artist || !artistId) return
    
    setSaving(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/artists/${artistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          ...artist,
          status: newStatus
        })
      })

      if (response.ok) {
        setArtist(prev => prev ? { ...prev, status: newStatus } : null)
        setSuccess(`Artist ${newStatus === 'published' ? 'published' : newStatus} successfully!`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update status')
      }

    } catch (error: any) {
      console.error('Status update error:', error)
      setError(error.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!artistId || !confirm('Are you sure you want to delete this artist profile? This action cannot be undone.')) return
    
    setSaving(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/artists/${artistId}`, {
        method: 'DELETE',
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })

      if (response.ok) {
        router.push('/dashboard/artists')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete artist')
      }

    } catch (error: any) {
      console.error('Delete error:', error)
      setError(error.message || 'Failed to delete artist')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400 border-green-400'
      case 'draft': return 'text-yellow-400 border-yellow-400' 
      case 'archived': return 'text-gray-400 border-gray-400'
      default: return 'text-white/60 border-white/60'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClassicLoader />
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <Music className="w-16 h-16 mx-auto text-white/30 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Artist not found</h3>
        <p className="text-white/60 mb-6">The artist profile you're looking for doesn't exist or you don't have permission to edit it.</p>
        <button
          onClick={() => router.push('/dashboard/artists')}
          className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase"
        >
          Back to Artists
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/20 pb-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-wider uppercase text-white mb-2">
              Edit Artist Profile
            </h1>
            <p className="text-white/60 font-bold tracking-wider uppercase">
              {artist.name}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-2 text-sm font-bold tracking-wider uppercase border ${getStatusColor(artist.status)} bg-black/50`}>
              {artist.status}
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
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

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/50 p-4 mb-6 flex items-center space-x-3"
        >
          <Save className="w-5 h-5 text-green-400" />
          <span className="text-green-200">{success}</span>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <motion.button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </motion.button>

        {artist.status === 'draft' && (
          <button
            onClick={() => handleStatusChange('published')}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400/10 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Publish</span>
          </button>
        )}

        {artist.status === 'published' && (
          <button
            onClick={() => handleStatusChange('archived')}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-400 text-gray-400 hover:bg-gray-400/10 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            <span>Archive</span>
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 border border-red-400 text-red-400 hover:bg-red-400/10 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>

      {/* Edit Form */}
      <div className="space-y-8">
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
                value={artist.name}
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
                value={artist.booking_email}
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
                value={artist.bio}
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
                value={artist.city}
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
                value={artist.country}
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
                value={artist.press_kit_url || ''}
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
                  artist.genres.includes(genre)
                    ? 'bg-white text-black border-white'
                    : 'bg-black/50 text-white/60 border-white/30 hover:border-white/60 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          
          {artist.genres.length > 0 && (
            <div className="mt-4">
              <p className="text-white/80 text-sm">
                Selected: {artist.genres.join(', ')}
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
                value={artist.social_links.website || ''}
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
                value={artist.social_links.instagram || ''}
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
                value={artist.social_links.soundcloud || ''}
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
                value={artist.social_links.spotify || ''}
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

            {artist.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {artist.images.map((imageUrl, index) => (
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
      </div>
    </div>
  )
}