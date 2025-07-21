'use client'

import { useState } from 'react'
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
  AlertCircle
} from 'lucide-react'
import { uploadVenueImage, moderateImage, validateImageFile } from '@/lib/services/storage'

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
}

export default function CreateVenuePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    description: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    website: '',
    capacity: undefined,
    venue_type: 'club',
    images: []
  })

  const venueTypes = [
    { value: 'club', label: 'Club' },
    { value: 'bar', label: 'Bar' },
    { value: 'festival_ground', label: 'Festival Ground' },
    { value: 'concert_hall', label: 'Concert Hall' },
    { value: 'outdoor', label: 'Outdoor Venue' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'other', label: 'Other' }
  ]

  const handleInputChange = (field: keyof VenueFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
        const tempVenueId = crypto.randomUUID()
        
        // Upload to storage
        const imageUrl = await uploadVenueImage(file, tempVenueId)
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
      
      // Create venue in database
      console.log('Sending venue creation request...', {
        hasSession: !!session,
        hasToken: !!session?.access_token,
        userId: user.id
      })

      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          ...formData,
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
        throw new Error(errorData.error || 'Failed to create venue')
      }

      const venue = await response.json()
      router.push(`/dashboard/venues/${venue.id}`)

    } catch (error: any) {
      console.error('Venue creation error:', error)
      setError(error.message || 'Failed to create venue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="border-b border-white/20 pb-6 mb-8">
        <h1 className="text-4xl font-bold tracking-wider uppercase text-white mb-2">
          Create New Venue
        </h1>
        <p className="text-white/60 font-bold tracking-wider uppercase">
          Add a new venue to the platform
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
                Venue Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Enter venue name"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Venue Type *
              </label>
              <select
                required
                value={formData.venue_type}
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
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors resize-none"
                placeholder="Describe the venue, its atmosphere, music style, etc."
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity || ''}
                onChange={(e) => handleInputChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Maximum capacity"
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
                value={formData.address}
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
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Postal code"
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
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Contact email"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Website
              </label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="https://example.com"
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
                Upload Images
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
            {loading ? 'Creating...' : 'Create Venue'}
          </motion.button>
        </div>
      </form>
    </div>
  )
}