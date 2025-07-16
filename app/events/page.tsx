'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, MapPin, Users, Clock, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityCard } from '@/components/ui/entity-card'
import { getEvents } from '@/lib/services/events'
import { getListFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [showUpcoming, setShowUpcoming] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents({ limit: 50 })
        setEvents(data || [])
      } catch (error) {
        console.error('Error loading events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  // Get unique genres for filters
  const allGenres = Array.from(new Set(events.flatMap(event => event.genres || [])))

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGenre = selectedGenre === 'all' || 
      event.genres?.includes(selectedGenre)
    
    const isUpcoming = new Date(event.start_date) > new Date()
    const matchesTimeFilter = showUpcoming ? isUpcoming : !isUpcoming

    return matchesSearch && matchesGenre && matchesTimeFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-medium text-white mb-4">
            Events
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Discover electronic music events and festivals happening around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search events, venues, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-slate-900 border-slate-800 text-white placeholder-slate-500 h-12 text-lg"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Upcoming/Past Toggle */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
              <Button
                variant={showUpcoming ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowUpcoming(true)}
                className="text-sm"
              >
                Upcoming
              </Button>
              <Button
                variant={!showUpcoming ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowUpcoming(false)}
                className="text-sm"
              >
                Past
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 bg-slate-900 border-slate-800 text-white hover:bg-slate-800"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>

            {filtersOpen && (
              <div className="flex flex-wrap gap-4 w-full">
                {/* Genre Filter */}
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                >
                  <option value="all">All Genres</option>
                  {allGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-white">
            {showUpcoming ? 'Upcoming' : 'Past'} Events ({filteredEvents.length})
          </h2>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No events found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => {
              const isUpcoming = new Date(event.start_date) > new Date()
              const eventDate = new Date(event.start_date)
              
              return (
                <EntityCard
                  key={event.id}
                  type="event"
                  id={event.id}
                  title={event.title}
                  artist={event.artists?.[0]?.name || 'Various Artists'}
                  imageUrl={isValidImageUrl(event.flyer_url || event.images?.[0]) ? (event.flyer_url || event.images[0]) : getListFallbackImage('event', index)}
                  category={event.genres?.[0] || 'ELECTRONIC'}
                  href={`/event/${event.id}`}
                  date={eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                  time={eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  venue={event.venue?.name || 'TBA'}
                  location={event.venue?.city ? `${event.venue.city}, ${event.venue.country}` : 'Location TBA'}
                  price={event.ticket_price_min && event.ticket_price_max ? `$${event.ticket_price_min}-${event.ticket_price_max}` : undefined}
                  attendees={event.attendees}
                  rating={event.rating}
                  isUpcoming={isUpcoming}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 