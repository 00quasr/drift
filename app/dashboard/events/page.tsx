'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import ClassicLoader from '@/components/ui/loader'
import { H1, H2 } from "@/components/ui/typography"
import {
  Calendar,
  Plus,
  Search,
  Edit,
  MapPin,
  Clock,
  MoreVertical,
  ExternalLink,
  Euro
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  start_time: string
  end_time?: string
  genres: string[]
  status: string
  images: string[]
  ticket_url?: string
  price_min?: number
  price_max?: number
  created_at: string
  published_at?: string
  venue: {
    id: string
    name: string
    city: string
    country: string
  }
  created_by_profile: {
    display_name?: string
    full_name: string
  }
}

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [filter])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('cms', 'true')
      if (filter !== 'all') params.set('status', filter)
      params.set('limit', '50')

      const { supabase } = await import('@/lib/auth')
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`/api/events?${params}`, {
        headers: {
          ...(session?.access_token && {
            'Authorization': `Bearer ${session.access_token}`
          })
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data.data || [])
      } else {
        console.error('Failed to fetch events:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10'
      case 'draft': return 'text-amber-400 border-amber-400/50 bg-amber-400/10'
      case 'archived': return 'text-white/40 border-white/20 bg-white/5'
      default: return 'text-white/50 border-white/20 bg-white/5'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isEventUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date()
  }

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return 'Free'
    if (min === max) return `€${min}`
    if (min && max) return `€${min}-${max}`
    if (min) return `From €${min}`
    return `Up to €${max}`
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const EventCard = ({ event }: { event: Event }) => (
    <div className="bg-neutral-900/50 border border-white/10 overflow-hidden group hover:border-white/20 transition-colors">
      <div className="aspect-video relative overflow-hidden">
        {event.images?.[0] ? (
          <img
            src={event.images[0]}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-white/20" />
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium tracking-wider uppercase border ${getStatusColor(event.status)}`}>
          {event.status}
        </div>

        {/* Upcoming Badge */}
        {isEventUpcoming(event.start_time) && event.status === 'published' && (
          <div className="absolute top-3 left-3 px-2 py-1 text-xs font-medium tracking-wider uppercase border border-blue-400/50 text-blue-400 bg-blue-400/10">
            UPCOMING
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold tracking-wider uppercase text-white line-clamp-1">
            {event.title}
          </h3>
          <button className="p-1 hover:bg-white/10 transition-colors">
            <MoreVertical className="w-4 h-4 text-white/40" />
          </button>
        </div>

        <p className="text-white/50 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-white/60 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-white/40" />
            {event.venue.name}, {event.venue.city}
          </div>

          <div className="flex items-center text-white/60 text-sm">
            <Clock className="w-4 h-4 mr-2 text-white/40" />
            {formatDateTime(event.start_time)}
          </div>

          {event.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {event.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-0.5 bg-white/5 text-white/60 text-xs font-medium tracking-wider uppercase"
                >
                  {genre}
                </span>
              ))}
              {event.genres.length > 3 && (
                <span className="px-2 py-0.5 bg-white/5 text-white/40 text-xs">
                  +{event.genres.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm pt-2">
            <div className="flex items-center text-white/50">
              <Euro className="w-4 h-4 mr-1" />
              {formatPrice(event.price_min, event.price_max)}
            </div>

            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs uppercase font-medium tracking-wider"
              >
                Tickets
              </a>
            )}
          </div>

          <div className="flex items-center text-white/30 text-xs pt-1">
            <Calendar className="w-3 h-3 mr-2" />
            Created {formatDate(event.created_at)}
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/dashboard/events/${event.id}`}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium tracking-wider uppercase transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            EDIT
          </Link>

          <Link
            href={`/events/${event.id}`}
            className="flex items-center justify-center px-3 py-2 border border-white/10 hover:border-white/20 text-white/60 text-sm font-medium tracking-wider uppercase transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <H1 variant="display" className="mb-2">
            Events
          </H1>
          <p className="text-white/50 font-medium tracking-wider uppercase text-sm">
            Manage your event listings
          </p>
        </div>

        <Link href="/dashboard/events/new">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium tracking-wider uppercase text-sm">
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-neutral-900/50 border border-white/10 text-white placeholder-white/40 focus:border-white/20 outline-none transition-colors text-sm"
          />
        </div>

        <div className="flex space-x-2">
          {(['all', 'draft', 'published', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-3 font-medium tracking-wider uppercase text-xs transition-colors border ${
                filter === status
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900/50 text-white/50 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white mb-1">
            {events.length}
          </div>
          <div className="text-white/50 text-xs font-medium tracking-wider uppercase">
            Total Events
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="text-2xl font-bold text-emerald-400 mb-1">
            {events.filter(v => v.status === 'published').length}
          </div>
          <div className="text-white/50 text-xs font-medium tracking-wider uppercase">
            Published
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="text-2xl font-bold text-amber-400 mb-1">
            {events.filter(v => v.status === 'draft').length}
          </div>
          <div className="text-white/50 text-xs font-medium tracking-wider uppercase">
            Drafts
          </div>
        </div>
        <div className="bg-neutral-900/50 border border-white/10 p-4">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {events.filter(v => isEventUpcoming(v.start_time) && v.status === 'published').length}
          </div>
          <div className="text-white/50 text-xs font-medium tracking-wider uppercase">
            Upcoming
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <ClassicLoader />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 mx-auto text-white/20 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2 tracking-wider uppercase">No events found</h3>
          <p className="text-white/50 mb-6 text-sm">
            {searchQuery
              ? `No events match "${searchQuery}"`
              : filter === 'all'
                ? "You haven't created any events yet"
                : `No ${filter} events found`
            }
          </p>
          {!searchQuery && events.length === 0 && (
            <Link href="/dashboard/events/new">
              <button className="px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors font-medium tracking-wider uppercase text-sm">
                Create Your First Event
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
