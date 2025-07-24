'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  MapPin,
  Clock,
  Euro,
  X,
  AlertCircle,
  Save,
  Eye,
  Archive,
  Trash2,
  Music,
  ExternalLink,
  Users,
  Plus,
  Search
} from 'lucide-react'
import { uploadEventImage, moderateImage, validateImageFile } from '@/lib/services/storage'

interface EventFormData {
  title: string
  description: string
  venue_id: string
  start_time: string
  end_time: string
  genres: string[]
  images: string[]
  ticket_url: string
  price_min?: number
  price_max?: number
  status: string
  artists: { id: string; name: string; performance_order?: number; performance_type?: string }[]
}

interface Venue {
  id: string
  name: string
  city: string
  country: string
}

interface Artist {
  id: string
  name: string
  genres?: string[]
  city?: string
  country?: string
}

interface EventEditPageProps {
  params: Promise<{ id: string }>
}

const MUSIC_GENRES = [
  'Techno', 'House', 'Trance', 'Progressive House', 'Deep House', 'Tech House',
  'Minimal Techno', 'Industrial Techno', 'Acid Techno', 'Drum & Bass',
  'Dubstep', 'Breakbeat', 'UK Garage', 'Ambient', 'Downtempo', 'Electronica',
  'Electro', 'Synthwave', 'IDM', 'Experimental'
]

export default function EventEditPage({ params }: EventEditPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [event, setEvent] = useState<EventFormData | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [eventId, setEventId] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [loadingVenues, setLoadingVenues] = useState(true)
  
  // Artist management state
  const [artistSearch, setArtistSearch] = useState('')
  const [artistResults, setArtistResults] = useState<Artist[]>([])
  const [loadingArtists, setLoadingArtists] = useState(false)

  useEffect(() => {
    async function getEventId() {
      const resolvedParams = await params
      setEventId(resolvedParams.id)
    }
    getEventId()
  }, [params])

  useEffect(() => {
    fetchVenues()
  }, [])

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchArtists(artistSearch)
    }, 300)

    return () => clearTimeout(timeout)
  }, [artistSearch])

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues')
      if (response.ok) {
        const data = await response.json()
        setVenues(data.data || [])
      } else {
        console.error('Failed to fetch venues:', response.status)
      }
    } catch (error) {
      console.error('Error fetching venues:', error)
    } finally {
      setLoadingVenues(false)
    }
  }

  const fetchEvent = async () => {
    if (!eventId) return
    
    try {
      // Get auth session for CMS API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/events/${eventId}?cms=true`, {
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Format dates for datetime-local input
        const eventData = {
          ...data.data,
          start_time: formatDateTimeLocal(new Date(data.data.start_time)),
          end_time: data.data.end_time ? formatDateTimeLocal(new Date(data.data.end_time)) : '',
          ticket_url: data.data.ticket_url || '',
          genres: data.data.genres || [],
          artists: data.data.artists || []
        }
        setEvent(eventData)
      } else {
        console.error('Failed to fetch event:', response.status, response.statusText)
        setError('Event not found or access denied')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      setError('Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    if (!event) return
    setEvent(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleGenreToggle = (genre: string) => {
    if (!event) return
    setEvent(prev => prev ? {
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    } : null)
  }

  const handleImageUpload = async (eventInput: React.ChangeEvent<HTMLInputElement>) => {
    const files = eventInput.target.files
    if (!files?.length || !eventId) return

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
        const imageUrl = await uploadEventImage(file, eventId)
        return imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      if (event) {
        setEvent(prev => prev ? ({
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
    if (!event) return
    setEvent(prev => prev ? ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }) : null)
  }

  // Artist management functions
  const searchArtists = async (query: string) => {
    if (!query.trim()) {
      setArtistResults([])
      return
    }

    setLoadingArtists(true)
    try {
      const response = await fetch(`/api/artists/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setArtistResults(data.data || [])
      }
    } catch (error) {
      console.error('Error searching artists:', error)
    } finally {
      setLoadingArtists(false)
    }
  }

  const addArtist = async (artist: Artist) => {
    if (!event || !eventId) return
    
    // Check if artist is already added
    if (event.artists.some(a => a.id === artist.id)) {
      setError('Artist is already in the lineup')
      return
    }

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/events/${eventId}/artists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          artist_id: artist.id,
          performance_order: event.artists.length + 1,
          performance_type: 'live'
        })
      })

      if (response.ok) {
        // Add to local state
        setEvent(prev => prev ? ({
          ...prev,
          artists: [...prev.artists, {
            id: artist.id,
            name: artist.name,
            performance_order: prev.artists.length + 1,
            performance_type: 'live'
          }]
        }) : null)
        
        setArtistSearch('')
        setArtistResults([])
        setSuccess('Artist added to lineup')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add artist')
      }
    } catch (error: any) {
      console.error('Error adding artist:', error)
      setError(error.message || 'Failed to add artist')
    }
  }

  const removeArtist = async (artistId: string) => {
    if (!event || !eventId) return

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/events/${eventId}/artists`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({ artist_id: artistId })
      })

      if (response.ok) {
        // Remove from local state
        setEvent(prev => prev ? ({
          ...prev,
          artists: prev.artists.filter(a => a.id !== artistId)
        }) : null)
        
        setSuccess('Artist removed from lineup')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove artist')
      }
    } catch (error: any) {
      console.error('Error removing artist:', error)
      setError(error.message || 'Failed to remove artist')
    }
  }

  const updateArtistDetails = (artistId: string, field: 'performance_order' | 'performance_type', value: any) => {
    if (!event) return
    setEvent(prev => prev ? ({
      ...prev,
      artists: prev.artists.map(artist => 
        artist.id === artistId 
          ? { ...artist, [field]: value }
          : artist
      )
    }) : null)
  }

  const handleSave = async () => {
    if (!event || !eventId) return
    
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Get auth session for API call
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify(event)
      })

      if (response.ok) {
        setSuccess('Event updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update event')
      }

    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!event || !eventId) return
    
    setSaving(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        },
        body: JSON.stringify({
          ...event,
          status: newStatus
        })
      })

      if (response.ok) {
        setEvent(prev => prev ? { ...prev, status: newStatus } : null)
        setSuccess(`Event ${newStatus === 'published' ? 'published' : newStatus} successfully!`)
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
    if (!eventId || !confirm('Are you sure you want to delete this event? This action cannot be undone.')) return
    
    setSaving(true)
    setError('')

    try {
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })

      if (response.ok) {
        router.push('/dashboard/events')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete event')
      }

    } catch (error: any) {
      console.error('Delete error:', error)
      setError(error.message || 'Failed to delete event')
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

  const isEventUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-white/30 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Event not found</h3>
        <p className="text-white/60 mb-6">The event you're looking for doesn't exist or you don't have permission to edit it.</p>
        <button
          onClick={() => router.push('/dashboard/events')}
          className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase"
        >
          Back to Events
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
              Edit Event
            </h1>
            <p className="text-white/60 font-bold tracking-wider uppercase">
              {event.title}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-2 text-sm font-bold tracking-wider uppercase border ${getStatusColor(event.status)} bg-black/50`}>
              {event.status}
            </div>
            {isEventUpcoming(event.start_time) && event.status === 'published' && (
              <div className="px-3 py-2 text-sm font-bold tracking-wider uppercase border border-blue-400 text-blue-400 bg-black/50">
                UPCOMING
              </div>
            )}
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

        {event.status === 'draft' && (
          <button
            onClick={() => handleStatusChange('published')}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400/10 transition-colors font-bold tracking-wider uppercase disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Publish</span>
          </button>
        )}

        {event.status === 'published' && (
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
            <div className="md:col-span-2">
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={event.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="Enter event title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Description *
              </label>
              <textarea
                required
                value={event.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors resize-none"
                placeholder="Describe the event, lineup, atmosphere, and what attendees can expect..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Venue *
              </label>
              {loadingVenues ? (
                <div className="w-full bg-black/50 border border-white/30 text-white/60 p-3">
                  Loading venues...
                </div>
              ) : (
                <select
                  required
                  value={event.venue_id}
                  onChange={(e) => handleInputChange('venue_id', e.target.value)}
                  className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                >
                  <option value="" className="bg-black">Select a venue</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id} className="bg-black">
                      {venue.name} - {venue.city}, {venue.country}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-3" />
            Date & Time
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                required
                value={event.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
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

        {/* Pricing & Tickets */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
            <Euro className="w-6 h-6 mr-3" />
            Pricing & Tickets
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Min Price (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={event.price_min || ''}
                onChange={(e) => handleInputChange('price_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="10.00"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Max Price (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={event.price_max || ''}
                onChange={(e) => handleInputChange('price_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="25.00"
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ticket URL
              </label>
              <input
                type="url"
                value={event.ticket_url}
                onChange={(e) => handleInputChange('ticket_url', e.target.value)}
                className="w-full bg-black/50 border border-white/30 text-white p-3 focus:border-white/60 outline-none transition-colors"
                placeholder="https://tickets.example.com"
              />
            </div>
          </div>
        </div>

        {/* Artist Lineup Management */}
        <div className="bg-black/50 border border-white/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6 flex items-center">
            <Users className="w-6 h-6 mr-3" />
            Artist Lineup
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-white/80 font-bold tracking-wider uppercase text-sm mb-2">
                Add Artists
              </label>
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={artistSearch}
                      onChange={(e) => setArtistSearch(e.target.value)}
                      placeholder="Search for artists..."
                      className="w-full bg-black/50 border border-white/30 text-white pl-10 pr-4 py-3 focus:border-white/60 outline-none transition-colors"
                    />
                  </div>
                </div>
                
                {artistSearch && artistResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-black border border-white/30 max-h-48 overflow-y-auto">
                    {artistResults.map(artist => (
                      <button
                        key={artist.id}
                        onClick={() => addArtist(artist)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-white/10 border-b border-white/10 last:border-b-0 transition-colors"
                      >
                        <div className="font-bold">{artist.name}</div>
                        {artist.city && artist.country && (
                          <div className="text-sm text-white/60">{artist.city}, {artist.country}</div>
                        )}
                        {artist.genres && artist.genres.length > 0 && (
                          <div className="text-xs text-white/40 mt-1">
                            {artist.genres.slice(0, 3).join(', ')}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {loadingArtists && (
                  <div className="absolute z-10 w-full mt-1 bg-black border border-white/30 p-4 text-center text-white/60">
                    Searching...
                  </div>
                )}
              </div>
            </div>

            {event.artists.length > 0 && (
              <div>
                <h3 className="text-lg font-bold tracking-wider uppercase text-white mb-4">
                  Current Lineup ({event.artists.length} artists)
                </h3>
                <div className="space-y-3">
                  {event.artists
                    .sort((a, b) => (a.performance_order || 999) - (b.performance_order || 999))
                    .map((artist, index) => (
                    <div key={artist.id} className="bg-black/30 border border-white/20 p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-white">{artist.name}</div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <label className="text-white/60 text-sm">Order:</label>
                          <input
                            type="number"
                            min="1"
                            value={artist.performance_order || index + 1}
                            onChange={(e) => updateArtistDetails(artist.id, 'performance_order', parseInt(e.target.value))}
                            className="w-16 bg-black/50 border border-white/30 text-white px-2 py-1 text-sm focus:border-white/60 outline-none"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-white/60 text-sm">Type:</label>
                          <select
                            value={artist.performance_type || 'live'}
                            onChange={(e) => updateArtistDetails(artist.id, 'performance_type', e.target.value)}
                            className="bg-black/50 border border-white/30 text-white px-2 py-1 text-sm focus:border-white/60 outline-none"
                          >
                            <option value="live">Live</option>
                            <option value="dj">DJ Set</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                        
                        <button
                          onClick={() => removeArtist(artist.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                          title="Remove artist"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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