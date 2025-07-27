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
  Phone, 
  Mail,
  X,
  AlertCircle,
  Save,
  Eye,
  Archive,
  Trash2,
  Calendar
} from 'lucide-react'
import { uploadVenueImage, moderateImage, validateImageFile } from '@/lib/services/storage'
import ClassicLoader from '@/components/ui/loader'

interface VenueFormData {
  name: string
  description: string
  address: string
  city: string
  postal_code: string
  phone?: string
  email?: string
  website?: string
  capacity?: number
  venue_type: string
  images: string[]
  status: string
}

interface VenueEditPageProps {
  params: Promise<{ id: string }>
}

export default function VenueEditPage({ params }: VenueEditPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [venue, setVenue] = useState<VenueFormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [venueId, setVenueId] = useState<string | null>(null)
  const [success, setSuccess] = useState('')

  const venueTypes = [
    { value: 'club', label: 'Club' },
    { value: 'bar', label: 'Bar' },
    { value: 'festival_ground', label: 'Festival Ground' },
    { value: 'concert_hall', label: 'Concert Hall' },
    { value: 'outdoor', label: 'Outdoor Venue' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    async function getVenueId() {
      const resolvedParams = await params
      setVenueId(resolvedParams.id)
    }
    getVenueId()
  }, [params])

  useEffect(() => {
    if (venueId) {
      fetchVenue()
    }
  }, [venueId])

  const fetchVenue = async () => {
    if (!venueId) return
    
    try {
      // Get auth session for API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/venues/${venueId}`, {
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setVenue(data.data)
      } else {
        console.error('Failed to fetch venue:', response.status, response.statusText)
        setError('Venue not found')
      }
    } catch (error) {
      console.error('Error fetching venue:', error)
      setError('Failed to load venue')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof VenueFormData, value: any) => {
    if (!venue) return
    setVenue(prev => ({ ...prev!, [field]: value }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length || !venue) return

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
        const imageUrl = await uploadVenueImage(file, params.id)
        return imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setVenue(prev => ({
        ...prev!,
        images: [...prev!.images, ...uploadedUrls]
      }))

    } catch (error: any) {
      console.error('Image upload error:', error)
      setError(error.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    if (!venue) return
    setVenue(prev => ({
      ...prev!,
      images: prev!.images.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async (newStatus?: string) => {
    if (!venue || !user) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Get auth session for API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/venues/${venueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          ...venue,
          status: newStatus || venue.status,
          updated_by: user.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update venue')
      }

      const updatedVenue = await response.json()
      setVenue(updatedVenue.data)
      setSuccess('Venue updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)

    } catch (error: any) {
      console.error('Venue update error:', error)
      setError(error.message || 'Failed to update venue')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this venue? This action cannot be undone.')) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/venues/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete venue')
      }

      router.push('/dashboard/venues')
    } catch (error: any) {
      console.error('Venue delete error:', error)
      setError(error.message || 'Failed to delete venue')
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400'
      case 'draft': return 'text-yellow-400'
      case 'archived': return 'text-gray-400'
      default: return 'text-white/60'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClassicLoader />
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Venue Not Found</h1>
        <p className="text-white/60 mb-6">The venue you're looking for doesn't exist or you don't have permission to edit it.</p>
        <button
          onClick={() => router.push('/dashboard/venues')}
          className="px-4 py-2 bg-white text-black font-bold tracking-wider uppercase hover:bg-white/90 transition-colors"
        >
          Back to Venues
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="border-b border-white/20 pb-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold tracking-wider uppercase text-white">
            Edit Venue
          </h1>
          <div className={`px-3 py-1 text-sm font-bold tracking-wider uppercase border ${getStatusColor(venue.status)} bg-black/50`}>
            {venue.status}
          </div>
        </div>
        <p className="text-white/60 font-bold tracking-wider uppercase">
          Manage venue information and settings
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

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/50 p-4 mb-6 flex items-center space-x-3"
        >
          <Calendar className="w-5 h-5 text-green-400" />
          <span className="text-green-200">{success}</span>
        </motion.div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                required
                value={venue.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
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
                {venueTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-black">
                    {type.label}
                  </option>
                ))}
              </select>
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
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Capacity
              </label>
              <input
                type="number"
                value={venue.capacity || ''}
                onChange={(e) => handleInputChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
            <MapPin className="w-6 h-6 mr-3" />
            Location
          </h2>
          
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
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={venue.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Phone
              </label>
              <input
                type="tel"
                value={venue.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                value={venue.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Website
              </label>
              <input
                type="url"
                value={venue.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {venue.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-black/50 border border-white/30 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`Venue image ${index + 1}`}
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/venues')}
              className="px-4 py-2 border border-white/30 text-white hover:border-white/60 transition-colors font-bold tracking-wider uppercase"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-bold tracking-wider uppercase disabled:opacity-50 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex space-x-4">
            {venue.status !== 'published' && (
              <motion.button
                type="button"
                onClick={() => handleSave('published')}
                disabled={saving || uploading}
                className="px-6 py-3 bg-green-600 text-white hover:bg-green-700 transition-colors font-bold tracking-wider uppercase disabled:opacity-50 flex items-center space-x-2"
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
              >
                <Eye className="w-4 h-4" />
                <span>Publish</span>
              </motion.button>
            )}

            {venue.status !== 'archived' && (
              <motion.button
                type="button"
                onClick={() => handleSave('archived')}
                disabled={saving || uploading}
                className="px-6 py-3 bg-gray-600 text-white hover:bg-gray-700 transition-colors font-bold tracking-wider uppercase disabled:opacity-50 flex items-center space-x-2"
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </motion.button>
            )}

            <motion.button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase disabled:opacity-50 flex items-center space-x-2"
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  )
}