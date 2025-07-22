'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  Music,
  Upload,
  X,
  AlertCircle,
  Save,
  Eye,
  Euro,
  ArrowLeft,
  Search
} from 'lucide-react'
import { uploadEventImage, moderateImage, validateImageFile } from '@/lib/services/storage'

interface EventFormData {
  title: string
  description: string
  venue_id: string
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  genres: string[]
  ticket_info: {
    price_regular?: number
    price_vip?: number
    ticket_url?: string
    free_event: boolean
  }
  age_restriction: number
  images: string[]
  status: string
}

interface Venue {
  id: string
  name: string
  city: string
  country: string
  address: string
}

const MUSIC_GENRES = [
  'Techno', 'House', 'Trance', 'Progressive House', 'Deep House', 'Tech House',
  'Minimal Techno', 'Industrial Techno', 'Acid Techno', 'Drum & Bass',
  'Dubstep', 'Breakbeat', 'UK Garage', 'Ambient', 'Downtempo', 'Electronica'
]

const AGE_RESTRICTIONS = [16, 18, 21]

export default function EditEventPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [event, setEvent] = useState<EventFormData>({
    title: '',
    description: '',
    venue_id: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    genres: [],
    ticket_info: {
      free_event: false
    },
    age_restriction: 18,
    images: [],
    status: 'draft'
  })
  
  const [venues, setVenues] = useState<Venue[]>([])
  const [venueSearch, setVenueSearch] = useState('')
  const [showVenueDropdown, setShowVenueDropdown] = useState(false)
  const venueDropdownRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading_event, setLoadingEvent] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Redirect if not a promoter
  useEffect(() => {
    if (!loading && user && user.role !== 'promoter') {
      router.push('/')
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'promoter') {
      fetchVenues()
      fetchEvent()
    }
  }, [user, params.id])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (venueDropdownRef.current && !venueDropdownRef.current.contains(event.target as Node)) {
        setShowVenueDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchEvent = async () => {
    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/events/${params.id}?cms=true`, {
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })

      if (response.ok) {
        const data = await response.json()
        const eventData = data.data
        
        // Convert the API data to form format
        const startDateTime = new Date(eventData.start_date || eventData.start_time)
        const endDateTime = eventData.end_date ? new Date(eventData.end_date || eventData.end_time) : null
        
        setEvent({
          title: eventData.title || '',
          description: eventData.description || '',
          venue_id: eventData.venue_id || '',
          start_date: startDateTime.toISOString().split('T')[0],
          start_time: startDateTime.toTimeString().slice(0, 5),
          end_date: endDateTime ? endDateTime.toISOString().split('T')[0] : '',
          end_time: endDateTime ? endDateTime.toTimeString().slice(0, 5) : '',
          genres: eventData.genres || [],
          ticket_info: {
            price_regular: eventData.ticket_price_min || eventData.price_min,
            price_vip: eventData.ticket_price_max || eventData.price_max,
            ticket_url: eventData.ticket_url || '',
            free_event: !eventData.ticket_price_min && !eventData.price_min
          },
          age_restriction: eventData.age_restriction || 18,
          images: eventData.images || [],
          status: eventData.status || 'draft'
        })
        
        // Set venue search if venue exists
        if (eventData.venue) {
          setVenueSearch(eventData.venue.name)
        }
      } else {
        setError('Failed to load event')
        router.push('/events/manage')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      setError('Failed to load event')
      router.push('/events/manage')
    } finally {
      setLoadingEvent(false)
    }
  }

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues?status=published&limit=100')
      if (response.ok) {
        const data = await response.json()
        setVenues(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching venues:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('ticket_info.')) {
      const ticketField = field.replace('ticket_info.', '')
      setEvent(prev => ({
        ...prev,
        ticket_info: {
          ...prev.ticket_info,
          [ticketField]: value
        }
      }))
    } else {
      setEvent(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleGenreToggle = (genre: string) => {
    setEvent(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const handleVenueSelect = (venue: Venue) => {
    setEvent(prev => ({ ...prev, venue_id: venue.id }))
    setVenueSearch(venue.name)
    setShowVenueDropdown(false)
  }

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
    venue.city.toLowerCase().includes(venueSearch.toLowerCase())
  )

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

        // Generate temporary event ID for storage path
        const tempEventId = crypto.randomUUID()
        
        // Upload to storage
        const imageUrl = await uploadEventImage(file, tempEventId)
        return imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      
      setEvent(prev => ({
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
    setEvent(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async (publishImmediately = false) => {
    if (!event.title || !event.description || !event.venue_id || !event.start_date || !event.start_time) {
      const missing = []
      if (!event.title) missing.push('title')
      if (!event.description) missing.push('description')
      if (!event.venue_id) missing.push('venue_id')
      if (!event.start_date) missing.push('start_date')
      if (!event.start_time) missing.push('start_time')
      
      setError(`Missing required fields: ${missing.join(', ')}`)
      return
    }
    
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      // Combine date and time for start and end
      const startDateTime = new Date(`${event.start_date}T${event.start_time}`)
      const endDateTime = event.end_date && event.end_time 
        ? new Date(`${event.end_date}T${event.end_time}`)
        : new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000) // Default 4 hours later

      const response = await fetch(`/api/events/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          title: event.title,
          description: event.description,
          venue_id: event.venue_id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          genres: event.genres,
          ticket_info: event.ticket_info,
          age_restriction: event.age_restriction,
          images: event.images,
          status: publishImmediately ? 'published' : event.status
        })
      })

      if (response.ok) {
        setSuccess(publishImmediately ? 'Event updated and published successfully!' : 'Event updated successfully!')
        
        setTimeout(() => {
          router.push('/events/manage')
        }, 1500)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update event')
      }

    } catch (error: any) {
      console.error('Save error:', error)
      setError(error.message || 'Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  if (loading || loading_event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  if (!user || user.role !== 'promoter') {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-white/30 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
        <p className="text-white/60 mb-6">Only promoter accounts can edit events.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase"
        >
          Go Home
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
            onClick={() => router.push('/events/manage')}
            className="p-2 border border-white/30 text-white hover:border-white/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-4xl font-bold tracking-wider uppercase text-white mb-2">
              Edit Event
            </h1>
            <p className="text-white/60 font-bold tracking-wider uppercase">
              Update your electronic music event
            </p>
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
          onClick={() => handleSave(false)}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Updating...' : 'Update Event'}</span>
        </motion.button>

        {event.status !== 'published' && (
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400/10 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Update & Publish</span>
          </button>
        )}
      </div>

      {/* Event Form - Same as create form */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm relative z-20">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
            Event Information
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={event.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Your event title"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Description *
              </label>
              <textarea
                required
                value={event.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors resize-none"
                placeholder="Describe your event, lineup, atmosphere, and what makes it special..."
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Venue *
              </label>
              <div className="relative" ref={venueDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={venueSearch}
                    onChange={(e) => {
                      setVenueSearch(e.target.value)
                      setShowVenueDropdown(true)
                    }}
                    onFocus={() => setShowVenueDropdown(true)}
                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/30 text-white focus:border-white/60 outline-none transition-colors"
                    placeholder="Search for a venue..."
                  />
                </div>
                
                {showVenueDropdown && filteredVenues.length > 0 && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 bg-black border border-white/20 max-h-60 overflow-y-auto shadow-2xl backdrop-blur-sm"
                    style={{ zIndex: 999999 }}
                  >
                    {filteredVenues.slice(0, 10).map((venue) => (
                      <button
                        key={venue.id}
                        type="button"
                        onClick={() => handleVenueSelect(venue)}
                        className="w-full text-left p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                      >
                        <div className="font-bold text-white">{venue.name}</div>
                        <div className="text-white/60 text-sm">{venue.address}, {venue.city}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-3" />
            Date & Time
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={event.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={event.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                End Date
              </label>
              <input
                type="date"
                value={event.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                End Time
              </label>
              <input
                type="time"
                value={event.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
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
                  event.genres.includes(genre)
                    ? 'bg-white text-black border-white'
                    : 'bg-black/50 text-white/60 border-white/30 hover:border-white/60 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          
          {event.genres.length > 0 && (
            <div className="mt-4">
              <p className="text-white/80 text-sm">
                Selected: {event.genres.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Ticketing */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
            <Euro className="w-6 h-6 mr-3" />
            Ticketing
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="free_event"
                checked={event.ticket_info.free_event}
                onChange={(e) => handleInputChange('ticket_info.free_event', e.target.checked)}
                className="w-4 h-4 accent-white"
              />
              <label htmlFor="free_event" className="text-white/80 font-bold tracking-wider uppercase text-sm">
                Free Event
              </label>
            </div>

            {!event.ticket_info.free_event && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                    Regular Price (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={event.ticket_info.price_regular || ''}
                    onChange={(e) => handleInputChange('ticket_info.price_regular', parseFloat(e.target.value) || undefined)}
                    className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                    VIP Price (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={event.ticket_info.price_vip || ''}
                    onChange={(e) => handleInputChange('ticket_info.price_vip', parseFloat(e.target.value) || undefined)}
                    className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Ticket URL
              </label>
              <input
                type="url"
                value={event.ticket_info.ticket_url || ''}
                onChange={(e) => handleInputChange('ticket_info.ticket_url', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="https://tickets.example.com"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Age Restriction
              </label>
              <select
                value={event.age_restriction}
                onChange={(e) => handleInputChange('age_restriction', parseInt(e.target.value))}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
              >
                {AGE_RESTRICTIONS.map(age => (
                  <option key={age} value={age} className="bg-black">
                    {age}+
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
            Event Images
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Upload Event Images
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

            {event.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {event.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-black/50 border border-white/30 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`Event image ${index + 1}`}
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