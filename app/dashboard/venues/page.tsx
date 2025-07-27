'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ClassicLoader from '@/components/ui/loader'
import { 
  MapPin, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  ExternalLink
} from 'lucide-react'

interface Venue {
  id: string
  name: string
  description: string
  address: string
  city: string
  venue_type: string
  capacity?: number
  status: string
  images: string[]
  created_at: string
  published_at?: string
  created_by_profile: {
    display_name?: string
    email: string
  }
}

export default function VenuesPage() {
  const { user } = useAuth()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchVenues()
  }, [filter])

  const fetchVenues = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('cms', 'true') // Flag for CMS endpoint
      if (filter !== 'all') params.set('status', filter)
      params.set('limit', '50')

      // Get auth session for API call (same as venue creation)
      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/venues?${params}`, {
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setVenues(data.data || [])
      } else {
        console.error('Failed to fetch venues:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching venues:', error)
    } finally {
      setLoading(false)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredVenues = venues.filter(venue => 
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.venue_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const VenueCard = ({ venue }: { venue: Venue }) => (
    <motion.div
      className="bg-black/50 border border-white/20 backdrop-blur-sm overflow-hidden group hover:border-white/40 transition-all duration-200"
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="aspect-video relative overflow-hidden">
        {venue.images?.[0] ? (
          <img
            src={venue.images[0]}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-black/70 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-white/30" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold tracking-wider uppercase border ${getStatusColor(venue.status)} bg-black/80 backdrop-blur-sm`}>
          {venue.status}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold tracking-wider uppercase text-white line-clamp-1">
            {venue.name}
          </h3>
          <button className="p-1 hover:bg-white/10 rounded transition-colors">
            <MoreVertical className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <p className="text-white/60 text-sm mb-4 line-clamp-2">
          {venue.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-white/80 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-white/60" />
            {venue.address}, {venue.city}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-white/60">
              <Calendar className="w-4 h-4 mr-2" />
              {venue.venue_type.replace('_', ' ').toUpperCase()}
            </div>
            
            {venue.capacity && (
              <div className="flex items-center text-white/60">
                <Users className="w-4 h-4 mr-1" />
                {venue.capacity}
              </div>
            )}
          </div>

          <div className="flex items-center text-white/40 text-xs">
            <Clock className="w-3 h-3 mr-2" />
            Created {formatDate(venue.created_at)}
            {venue.published_at && ` • Published ${formatDate(venue.published_at)}`}
          </div>

          <div className="text-white/40 text-xs">
            By {venue.created_by_profile?.display_name || venue.created_by_profile?.email}
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/dashboard/venues/${venue.id}`}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold tracking-wider uppercase transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            EDIT
          </Link>
          
          <Link
            href={`/venues/${venue.id}`}
            className="flex items-center justify-center px-3 py-2 border border-white/30 hover:border-white/60 text-white text-sm font-bold tracking-wider uppercase transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/20 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-wider uppercase text-white mb-2">
            Venues
          </h1>
          <p className="text-white/60 font-bold tracking-wider uppercase">
            Manage your venue listings
          </p>
        </div>
        
        <Link href="/dashboard/venues/new">
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span>Add Venue</span>
          </motion.button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/30 text-white focus:border-white/60 outline-none transition-colors"
          />
        </div>

        <div className="flex space-x-2">
          {(['all', 'draft', 'published', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-3 font-bold tracking-wider uppercase text-sm transition-colors border ${
                filter === status
                  ? 'bg-white text-black border-white'
                  : 'bg-black/50 text-white/60 border-white/30 hover:border-white/60 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/50 border border-white/20 p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold text-white mb-1">
            {venues.length}
          </div>
          <div className="text-white/60 text-sm font-bold tracking-wider uppercase">
            Total Venues
          </div>
        </div>
        <div className="bg-black/50 border border-white/20 p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {venues.filter(v => v.status === 'published').length}
          </div>
          <div className="text-white/60 text-sm font-bold tracking-wider uppercase">
            Published
          </div>
        </div>
        <div className="bg-black/50 border border-white/20 p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {venues.filter(v => v.status === 'draft').length}
          </div>
          <div className="text-white/60 text-sm font-bold tracking-wider uppercase">
            Drafts
          </div>
        </div>
        <div className="bg-black/50 border border-white/20 p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold text-gray-400 mb-1">
            {venues.filter(v => v.status === 'archived').length}
          </div>
          <div className="text-white/60 text-sm font-bold tracking-wider uppercase">
            Archived
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <ClassicLoader />
        </div>
      ) : filteredVenues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto text-white/30 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No venues found</h3>
          <p className="text-white/60 mb-6">
            {searchQuery 
              ? `No venues match "${searchQuery}"`
              : filter === 'all' 
                ? "You haven't created any venues yet"
                : `No ${filter} venues found`
            }
          </p>
          {!searchQuery && venues.length === 0 && (
            <Link href="/dashboard/venues/new">
              <motion.button
                className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-bold tracking-wider uppercase"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create Your First Venue
              </motion.button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}