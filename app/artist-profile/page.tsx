'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { H1, H2, H3 } from '@/components/ui/typography'
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
  Instagram,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'
import { uploadArtistImage, moderateImage, validateImageFile } from '@/lib/services/storage'
import ImageGallery from '@/components/ui/ImageGallery'

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

const MUSIC_GENRES = [
  'Techno', 'House', 'Trance', 'Progressive House', 'Deep House', 'Tech House',
  'Minimal Techno', 'Industrial Techno', 'Acid Techno', 'Drum & Bass',
  'Dubstep', 'Breakbeat', 'UK Garage', 'Ambient', 'Downtempo', 'Electronica',
  'Electro', 'Synthwave', 'IDM', 'Experimental'
]

export default function ArtistProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [artist, setArtist] = useState<ArtistFormData | null>(null)
  const [existingArtist, setExistingArtist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Redirect if not an artist
  useEffect(() => {
    if (!loading && user && user.role !== 'artist') {
      router.push('/')
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'artist') {
      fetchExistingArtist()
    }
  }, [user])

  const fetchExistingArtist = async () => {
    try {
      // Get auth session for API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/artists?cms=true', {
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })

      if (response.ok) {
        const data = await response.json()
        const userArtist = data.data?.find((a: any) => a.user_id === user?.id)
        
        if (userArtist) {
          setExistingArtist(userArtist)
          setIsEditing(true)
          setArtist({
            name: userArtist.name || '',
            bio: userArtist.bio || '',
            city: userArtist.city || '',
            country: userArtist.country || '',
            genres: userArtist.genres || [],
            social_links: userArtist.social_links || {},
            booking_email: userArtist.booking_email || user?.email || '',
            press_kit_url: userArtist.press_kit_url || '',
            images: userArtist.images || [],
            status: userArtist.status || 'draft'
          })
        } else {
          // Initialize new artist form
          setArtist({
            name: user?.display_name || '',
            bio: '',
            city: '',
            country: '',
            genres: [],
            social_links: {},
            booking_email: user?.email || '',
            press_kit_url: '',
            images: [],
            status: 'draft'
          })
        }
      }
    } catch (error) {
      console.error('Error fetching artist profile:', error)
      setError('Failed to load artist profile')
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
        const tempArtistId = existingArtist?.id || crypto.randomUUID()
        
        // Upload to storage
        const imageUrl = await uploadArtistImage(file, tempArtistId)
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
    if (!artist) return
    
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

      const url = isEditing ? `/api/artists/${existingArtist.id}` : '/api/artists'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
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
        const data = await response.json()
        setSuccess(isEditing ? 'Artist profile updated successfully!' : 'Artist profile created successfully!')
        
        if (!isEditing) {
          setExistingArtist(data.data)
          setIsEditing(true)
        }
        
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save artist profile')
      }

    } catch (error: any) {
      console.error('Save error:', error)
      setError(error.message || 'Failed to save artist profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!artist || !isEditing) return
    
    setSaving(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/artists/${existingArtist.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          ...artist,
          status: 'published'
        })
      })

      if (response.ok) {
        setArtist(prev => prev ? { ...prev, status: 'published' } : null)
        setSuccess('Artist profile published successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to publish profile')
      }

    } catch (error: any) {
      console.error('Publish error:', error)
      setError(error.message || 'Failed to publish profile')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!artist || !isEditing) return
    
    if (!confirm('Are you sure you want to take down your artist profile? This will hide it from the public but keep your data safe. You can republish it later.')) {
      return
    }
    
    setSaving(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/artists/${existingArtist.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          ...artist,
          status: 'archived'
        })
      })

      if (response.ok) {
        setArtist(prev => prev ? { ...prev, status: 'archived' } : null)
        setSuccess('Artist profile taken down successfully! You can republish it anytime.')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to archive profile')
      }

    } catch (error: any) {
      console.error('Archive error:', error)
      setError(error.message || 'Failed to archive profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-neutral-950" />
  }

  if (!user || user.role !== 'artist') {
    return (
      <div className="text-center py-12">
        <Music className="w-16 h-16 mx-auto text-white/30 mb-4" />
        <H3 className="mb-2">Access Denied</H3>
        <p className="text-white/60 mb-6">Only artist accounts can access this page.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase"
        >
          Go Home
        </button>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto text-white/30 mb-4" />
        <H3 className="mb-2">Error</H3>
        <p className="text-white/60 mb-6">Failed to load artist profile.</p>
        <button
          onClick={() => fetchExistingArtist()}
          className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/20 pb-6 mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.push('/profile/edit')}
            className="p-2 border border-white/30 text-white hover:border-white/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <H1 variant="display" className="mb-2">
              {isEditing ? 'Edit Artist Profile' : 'Create Artist Profile'}
            </H1>
            <p className="text-white/60 font-bold tracking-wider uppercase">
              {isEditing ? 'Update your artist information' : 'Set up your artist profile on Drift'}
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-2 text-sm font-bold tracking-wider uppercase border bg-black/50 ${
              artist.status === 'published' 
                ? 'text-green-400 border-green-400' 
                : artist.status === 'archived'
                ? 'text-red-400 border-red-400'
                : 'text-yellow-400 border-yellow-400'
            }`}>
              {artist.status}
            </div>
          </div>
        )}
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
          <span>{saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Profile')}</span>
        </motion.button>

        {isEditing && artist.status === 'draft' && (
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400/10 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Publish Profile</span>
          </button>
        )}

        {isEditing && artist.status === 'archived' && (
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400/10 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Republish Profile</span>
          </button>
        )}

        {isEditing && artist.status === 'published' && (
          <button
            onClick={handleArchive}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-red-400 text-red-400 hover:bg-red-400/10 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            <span>Take Down Profile</span>
          </button>
        )}

        {isEditing && existingArtist && artist.status === 'published' && (
          <button
            onClick={() => router.push(`/artist/${existingArtist.id}`)}
            className="flex items-center space-x-2 px-4 py-2 border border-white/30 text-white hover:border-white/60 transition-colors font-bold tracking-wider uppercase"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Profile</span>
          </button>
        )}
      </div>

      {/* Artist Form */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <H2 variant="display" className="mb-6">
            Basic Information
          </H2>
          
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
          <H2 variant="display" className="mb-6 flex items-center">
            <Music className="w-6 h-6 mr-3" />
            Music Genres
          </H2>
          
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
          <H2 variant="display" className="mb-6">
            Social Links
          </H2>
          
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
          <H2 variant="display" className="mb-6 flex items-center">
            <ImageIcon className="w-6 h-6 mr-3" />
            Artist Photos
          </H2>

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
              <div className="space-y-4">
                {/* Image Gallery with Modal Viewer */}
                <ImageGallery
                  images={artist.images}
                  title="Artist Photos"
                  className="mb-4"
                  maxDisplay={6}
                  aspectRatio="square"
                />
                
                {/* Edit Mode: Show remove buttons */}
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
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <p className="text-white/60 text-sm">
                  Click on images above to view them in full size. Use the remove button (×) to delete images.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}