'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, MapPin, Users, Clock, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityBento, EntityBentoGrid } from '@/components/ui/entity-bento'
import { getEvents } from '@/lib/services/events'
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'

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
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium text-white mb-4">
            Electronic Music Events
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Discover the hottest electronic music events happening around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search events, artists, venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-slate-900/50 border-slate-800 text-white placeholder-slate-400 focus:border-slate-600 h-12"
              />
            </div>

            {/* Toggle Filters */}
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 h-12 px-6"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {filtersOpen && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Time Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Event Time
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={showUpcoming ? "default" : "outline"}
                      onClick={() => setShowUpcoming(true)}
                      className="flex-1 h-10"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Upcoming
                    </Button>
                    <Button
                      variant={!showUpcoming ? "default" : "outline"}
                      onClick={() => setShowUpcoming(false)}
                      className="flex-1 h-10"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Past Events
                    </Button>
                  </div>
                </div>

                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Genre
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-slate-600 focus:outline-none"
                  >
                    <option value="all">All Genres</option>
                    {allGenres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-white">
              {showUpcoming ? 'Upcoming Events' : 'Past Events'}
            </h2>
            <p className="text-slate-400">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <EntityBentoGrid>
            {filteredEvents.map((event) => (
              <EntityBento
                key={event.id}
                type="event"
                id={event.id}
                name={event.title}
                description={event.description || `Experience ${event.title} with amazing electronic music`}
                href={`/event/${event.id}`}
                imageUrl={isValidImageUrl(event.flyer_url) ? event.flyer_url! : getFallbackImage('event', event.id)}
                artist={event.artists?.[0]?.name || 'Various Artists'}
                date={new Date(event.start_date).toLocaleDateString()}
                time={new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                venue={event.venue?.name || 'TBA'}
                location={event.venue?.city ? `${event.venue.city}, ${event.venue.country}` : 'Location TBA'}
                price={event.ticket_price_min && event.ticket_price_max ? `€${event.ticket_price_min}-€${event.ticket_price_max}` : 'Free'}
                isUpcoming={new Date(event.start_date) > new Date()}
              />
            ))}
          </EntityBentoGrid>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No events found
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              {searchTerm || selectedGenre !== 'all' 
                ? 'Try adjusting your search criteria or filters'
                : showUpcoming 
                  ? 'No upcoming events scheduled yet'
                  : 'No past events to display'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 