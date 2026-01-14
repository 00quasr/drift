'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  MapPin,
  Upload,
  Image as ImageIcon,
  Globe,
  Mail,
  X,
  AlertCircle,
  Save,
  Eye,
  Archive,
  ExternalLink,
  Clock,
  Users,
  Music,
  Camera,
  ArrowLeft
} from 'lucide-react'
import { uploadVenueImage, moderateImage, validateImageFile } from '@/lib/services/storage'
import ImageGallery from '@/components/ui/ImageGallery'
import ClassicLoader from '@/components/ui/loader'
import { H1, H2, H3 } from "@/components/ui/typography"

interface VenueFormData {
  name: string
  description: string
  address: string
  city: string
  country: string
  postal_code: string
  phone: string
  email: string
  website?: string
  social_links: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  venue_type: string
  capacity: number
  sound_system: string
  preferred_genres: string[]
  booking_info: string
  images: string[]
  status: string
}

const VENUE_TYPES = [
  { value: 'club', label: 'Club' },
  { value: 'bar', label: 'Bar' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'outdoor', label: 'Outdoor Venue' },
  { value: 'festival_ground', label: 'Festival Ground' },
  { value: 'concert_hall', label: 'Concert Hall' },
  { value: 'other', label: 'Other' }
]

const SOUND_SYSTEMS = [
  'Funktion-One', 'd&b audiotechnik', 'L-Acoustics', 'Meyer Sound', 'JBL Professional',
  'Martin Audio', 'Nexo', 'KV2 Audio', 'Pioneer Pro Audio', 'Custom System', 'Other'
]

const MUSIC_GENRES = [
  'Techno', 'House', 'Trance', 'Progressive House', 'Deep House', 'Tech House',
  'Minimal Techno', 'Industrial Techno', 'Acid Techno', 'Drum & Bass',
  'Dubstep', 'Breakbeat', 'UK Garage', 'Ambient', 'Downtempo', 'Electronica'
]

export default function MyVenuePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [venue, setVenue] = useState<VenueFormData | null>(null)
  const [existingVenue, setExistingVenue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Redirect if not a club owner
  useEffect(() => {
    if (!loading && user && user.role !== 'club_owner') {
      router.push('/')
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'club_owner') {
      fetchExistingVenue()
    }
  }, [user])

  const fetchExistingVenue = async () => {
    try {
      // Get auth session for API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/venues?cms=true', {
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Venue fetch response:', { 
          count: data.data?.length, 
          venues: data.data?.map((v: any) => ({ id: v.id, name: v.name, created_by: v.created_by })) 
        })
        const userVenue = data.data?.[0] // API already filters by created_by for club owners
        
        if (userVenue) {
          setExistingVenue(userVenue)
          setIsEditing(true)
          setVenue({
            name: userVenue.name || '',
            description: userVenue.description || '',
            address: userVenue.address || '',
            city: userVenue.city || '',
            country: userVenue.country || 'Germany',
            postal_code: userVenue.postal_code || '',
            phone: userVenue.phone || '',
            email: userVenue.email || user?.email || '',
            website: userVenue.website || '',
            social_links: userVenue.social_links || {},
            venue_type: userVenue.venue_type || 'club',
            capacity: userVenue.capacity || 100,
            sound_system: userVenue.sound_system || '',
            preferred_genres: userVenue.preferred_genres || [],
            booking_info: userVenue.booking_info || '',
            images: userVenue.images || [],
            status: userVenue.status || 'draft'
          })
        } else {
          // Initialize new venue form
          setVenue({
            name: '',
            description: '',
            address: '',
            city: '',
            country: 'Germany',
            postal_code: '',
            phone: '',
            email: user?.email || '',
            website: '',
            social_links: {},
            venue_type: 'club',
            capacity: 100,
            sound_system: '',
            preferred_genres: [],
            booking_info: '',
            images: [],
            status: 'draft'
          })
        }
      }
    } catch (error) {
      console.error('Error fetching venue:', error)
      setError('Failed to load venue information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof VenueFormData, value: any) => {
    if (!venue) return
    setVenue(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleSocialLinksChange = (platform: string, value: string) => {
    if (!venue) return
    setVenue(prev => prev ? {
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    } : null)
  }

  const handleGenreToggle = (genre: string) => {
    if (!venue) return
    setVenue(prev => prev ? {
      ...prev,
      preferred_genres: prev.preferred_genres.includes(genre)
        ? prev.preferred_genres.filter(g => g !== genre)
        : [...prev.preferred_genres, genre]
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

        // Generate temporary venue ID for storage path
        const tempVenueId = existingVenue?.id || crypto.randomUUID()
        
        // Upload to storage
        const imageUrl = await uploadVenueImage(file, tempVenueId)
        return imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      if (venue) {
        setVenue(prev => prev ? ({
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
    if (!venue) return
    setVenue(prev => prev ? ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }) : null)
  }

  const handleSave = async () => {
    if (!venue) return
    
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Get auth session for API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      // Clean up social links (remove empty values)
      const cleanSocialLinks = Object.fromEntries(
        Object.entries(venue.social_links).filter(([_, value]) => value && value.trim())
      )

      const url = isEditing ? `/api/venues/${existingVenue.id}` : '/api/venues'
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
          ...venue,
          social_links: cleanSocialLinks
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(isEditing ? 'Venue updated successfully!' : 'Venue created successfully!')
        
        if (!isEditing) {
          setExistingVenue(data.data)
          setIsEditing(true)
        }
        
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save venue')
      }

    } catch (error: any) {
      console.error('Save error:', error)
      setError(error.message || 'Failed to save venue')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!venue || !isEditing) return
    
    setSaving(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/venues/${existingVenue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          ...venue,
          status: 'published'
        })
      })

      if (response.ok) {
        setVenue(prev => prev ? { ...prev, status: 'published' } : null)
        setSuccess('Venue published successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to publish venue')
      }

    } catch (error: any) {
      console.error('Publish error:', error)
      setError(error.message || 'Failed to publish venue')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!venue || !isEditing) return
    
    if (!confirm('Are you sure you want to take down your venue? This will hide it from the public but keep your data safe. You can republish it later.')) {
      return
    }
    
    setSaving(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/venues/${existingVenue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          ...venue,
          status: 'archived'
        })
      })

      if (response.ok) {
        setVenue(prev => prev ? { ...prev, status: 'archived' } : null)
        setSuccess('Venue taken down successfully! You can republish it anytime.')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to archive venue')
      }

    } catch (error: any) {
      console.error('Archive error:', error)
      setError(error.message || 'Failed to archive venue')
    } finally {
      setSaving(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClassicLoader />
      </div>
    )
  }

  if (!user || user.role !== 'club_owner') {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 mx-auto text-white/30 mb-4" />
        <H3 className="mb-2">Access Denied</H3>
        <p className="text-white/60 mb-6">Only club owner accounts can access this page.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase"
        >
          Go Home
        </button>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto text-white/30 mb-4" />
        <H3 className="mb-2">Error</H3>
        <p className="text-white/60 mb-6">Failed to load venue information.</p>
        <button
          onClick={() => fetchExistingVenue()}
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
              {isEditing ? 'Edit My Venue' : 'Create My Venue'}
            </H1>
            <p className="text-white/60 font-bold tracking-wider uppercase">
              {isEditing ? 'Update your venue information' : 'Set up your venue profile on Drift'}
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-2 text-sm font-bold tracking-wider uppercase border bg-black/50 ${
              venue.status === 'published' 
                ? 'text-green-400 border-green-400' 
                : venue.status === 'archived'
                ? 'text-red-400 border-red-400'
                : 'text-yellow-400 border-yellow-400'
            }`}>
              {venue.status}
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
          <span>{saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Venue')}</span>
        </motion.button>

        {isEditing && venue.status === 'draft' && (
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400/10 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Publish Venue</span>
          </button>
        )}

        {isEditing && venue.status === 'archived' && (
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400/10 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Republish Venue</span>
          </button>
        )}

        {isEditing && venue.status === 'published' && (
          <button
            onClick={handleArchive}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-red-400 text-red-400 hover:bg-red-400/10 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            <span>Take Down Venue</span>
          </button>
        )}

        {isEditing && existingVenue && venue.status === 'published' && (
          <button
            onClick={() => router.push(`/venue/${existingVenue.id}`)}
            className="flex items-center space-x-2 px-4 py-2 border border-white/30 text-white hover:border-white/60 transition-colors font-bold tracking-wider uppercase"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Page</span>
          </button>
        )}
      </div>

      {/* Venue Form */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <H2 variant="display" className="mb-6">
            Basic Information
          </H2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                required
                value={venue.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Your venue name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Description *
              </label>
              <textarea
                required
                value={venue.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors resize-none"
                placeholder="Describe your venue's atmosphere, style, and what makes it unique..."
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Venue Type *
              </label>
              <select
                required
                value={venue.venue_type}
                onChange={(e) => handleInputChange('venue_type', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
              >
                {VENUE_TYPES.map(type => (
                  <option key={type.value} value={type.value} className="bg-black">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Capacity *
              </label>
              <input
                type="number"
                required
                min="1"
                value={venue.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Maximum capacity"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <H2 variant="display" className="mb-6 flex items-center">
            <MapPin className="w-6 h-6 mr-3" />
            Location
          </H2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={venue.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={venue.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={venue.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Postal code"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Country *
              </label>
              <input
                type="text"
                required
                value={venue.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Country"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <H2 variant="display" className="mb-6">
            Contact Information
          </H2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={venue.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="contact@venue.com"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={venue.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="+49 123 456 7890"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Website
              </label>
              <input
                type="url"
                value={venue.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="https://venue.com"
              />
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <H2 variant="display" className="mb-6 flex items-center">
            <Music className="w-6 h-6 mr-3" />
            Technical Specifications
          </H2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Sound System
              </label>
              <select
                value={venue.sound_system}
                onChange={(e) => handleInputChange('sound_system', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
              >
                <option value="" className="bg-black">Select sound system</option>
                {SOUND_SYSTEMS.map(system => (
                  <option key={system} value={system} className="bg-black">
                    {system}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Preferred Music Genres
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {MUSIC_GENRES.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    className={`px-3 py-2 text-sm font-bold tracking-wider uppercase transition-colors border ${
                      venue.preferred_genres.includes(genre)
                        ? 'bg-white text-black border-white'
                        : 'bg-black/50 text-white/60 border-white/30 hover:border-white/60 hover:text-white'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              
              {venue.preferred_genres.length > 0 && (
                <div className="mt-4">
                  <p className="text-white/80 text-sm">
                    Selected: {venue.preferred_genres.join(', ')}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Booking Information
              </label>
              <textarea
                value={venue.booking_info}
                onChange={(e) => handleInputChange('booking_info', e.target.value)}
                rows={3}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors resize-none"
                placeholder="Booking requirements, rates, contact info for artists and promoters..."
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <H2 variant="display" className="mb-6">
            Social Media
          </H2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Instagram
              </label>
              <input
                type="url"
                value={venue.social_links.instagram || ''}
                onChange={(e) => handleSocialLinksChange('instagram', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="https://instagram.com/venue"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Facebook
              </label>
              <input
                type="url"
                value={venue.social_links.facebook || ''}
                onChange={(e) => handleSocialLinksChange('facebook', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="https://facebook.com/venue"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <H2 variant="display" className="mb-6 flex items-center">
            <Camera className="w-6 h-6 mr-3" />
            Venue Photos
          </H2>

          <div className="space-y-4">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Upload Venue Photos
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

            {venue.images.length > 0 && (
              <div className="space-y-4">
                {/* Image Gallery with Modal Viewer */}
                <ImageGallery
                  images={venue.images}
                  title="Venue Photos"
                  className="mb-4"
                  maxDisplay={6}
                  aspectRatio="square"
                />
                
                {/* Edit Mode: Show remove buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {venue.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-black/50 border border-white/30 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Venue photo ${index + 1}`}
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