'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, MapPin, Users, Clock, SlidersHorizontal, Zap, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityCard } from '@/components/ui/entity-card'
import { EntityViews } from '@/components/ui/entity-views'
import { ViewSwitcher, ViewMode } from '@/components/ui/view-switcher'
import { getEvents } from '@/lib/services/events'
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [showUpcoming, setShowUpcoming] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

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
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-white border-2 border-white mx-auto mb-8 relative">
              <div className="absolute inset-2 bg-black" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-white animate-pulse" />
              </div>
            </div>
            <p className="text-white/80 font-bold tracking-widest uppercase text-sm">LOADING EVENTS...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-widest uppercase mb-6">
            ELECTRONIC MUSIC EVENTS
          </h1>
          <p className="text-white/80 text-lg max-w-3xl mx-auto font-medium tracking-wider uppercase">
            DISCOVER THE HOTTEST ELECTRONIC MUSIC EVENTS HAPPENING AROUND THE WORLD
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white w-6 h-6" />
              <Input
                type="text"
                placeholder="SEARCH EVENTS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                                  className="pl-16 pr-6 py-4 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-white transition-colors duration-200 h-14 text-lg font-bold tracking-wider uppercase"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setFiltersOpen(!filtersOpen)}
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/60 font-bold tracking-wider uppercase px-6 h-14"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              FILTERS
            </Button>
          </div>

          {/* Expandable Filters */}
          {filtersOpen && (
            <div className="bg-white/5 border border-white/20 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Time Filter */}
                <div>
                  <label className="block text-white font-bold tracking-widest uppercase text-sm mb-3">
                    TIME
                  </label>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowUpcoming(true)}
                      variant={showUpcoming ? 'default' : 'outline'}
                      className={`flex-1 font-bold tracking-wider uppercase text-sm ${
                        showUpcoming 
                          ? 'bg-white text-black hover:bg-white/90' 
                          : 'border-white/30 text-white hover:bg-white/10'
                      }`}
                    >
                      UPCOMING
                    </Button>
                    <Button
                      onClick={() => setShowUpcoming(false)}
                      variant={!showUpcoming ? 'default' : 'outline'}
                      className={`flex-1 font-bold tracking-wider uppercase text-sm ${
                        !showUpcoming 
                          ? 'bg-white text-black hover:bg-white/90' 
                          : 'border-white/30 text-white hover:bg-white/10'
                      }`}
                    >
                      PAST
                    </Button>
                  </div>
                </div>

                {/* Genre Filter */}
                <div>
                  <label className="block text-white font-bold tracking-widest uppercase text-sm mb-3">
                    GENRE
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-4 py-3 bg-black border-2 border-white/30 text-white focus:border-white transition-colors duration-200 font-bold tracking-wider uppercase text-sm"
                  >
                    <option value="all">ALL GENRES</option>
                    {allGenres.map((genre) => (
                      <option key={genre} value={genre}>{genre.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedGenre('all')
                      setShowUpcoming(true)
                    }}
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 hover:border-white/60 font-bold tracking-wider uppercase"
                  >
                    CLEAR ALL
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-white animate-pulse" />
                <span className="text-white font-bold tracking-widest uppercase text-sm">
                  {showUpcoming ? 'LIVE NOW' : 'ARCHIVE'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-widest uppercase">
                {showUpcoming ? 'UPCOMING EVENTS' : 'PAST EVENTS'}
              </h2>
            </div>
            <ViewSwitcher 
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              itemCount={filteredEvents.length}
            />
          </div>
        </div>

        {/* Events Views */}
        {filteredEvents.length > 0 ? (
          <EntityViews
            entities={filteredEvents.map(event => ({
              ...event,
              name: event.title,
              title: event.title,
              imageUrl: (() => {
                // First check flyer_url
                if (isValidImageUrl(event.flyer_url)) {
                  return event.flyer_url!
                }
                // Then check images array from event creation
                if (event.images && Array.isArray(event.images) && event.images.length > 0) {
                  const firstImage = event.images[0]
                  if (isValidImageUrl(firstImage)) {
                    return firstImage
                  }
                }
                // Fall back to generated image
                return getFallbackImage('event', event.id)
              })(),
              start_date: event.start_date,
              artist: event.artists?.[0]?.name || 'Various Artists',
              venue: event.venue?.name || 'TBA',
              city: event.venue?.city,
              country: event.venue?.country
            }))}
            viewMode={viewMode}
            entityType="event"
          />
        ) : (
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-white border-2 border-white mx-auto mb-8 relative">
              <div className="absolute inset-2 bg-black" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-widest uppercase mb-4">
              NO EVENTS FOUND
            </h3>
            <p className="text-white/80 max-w-md mx-auto font-medium tracking-wider uppercase text-sm">
              {searchTerm || selectedGenre !== 'all'
                ? 'TRY ADJUSTING YOUR SEARCH CRITERIA OR FILTERS'
                : 'NO EVENTS AVAILABLE AT THE MOMENT'
              }
            </p>
            {(searchTerm || selectedGenre !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedGenre('all')
                }}
                className="mt-6 bg-white text-black hover:bg-white/90 border-2 border-white hover:border-white/60 font-bold tracking-wider uppercase px-8"
              >
                CLEAR FILTERS
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 