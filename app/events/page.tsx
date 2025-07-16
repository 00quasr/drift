'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, MapPin, Users, Clock, SlidersHorizontal } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getEvents } from '@/lib/services/events'
import { getListFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'
import Image from 'next/image'
import Link from 'next/link'

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
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mx-auto"></div>
            <p className="text-zinc-400 mt-4">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Events
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl">
            Discover electronic music events and festivals happening around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search events, venues, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 h-12 text-lg"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Upcoming/Past Toggle */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
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
              className="flex items-center gap-2 bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
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
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
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
          <h2 className="text-2xl font-semibold text-white">
            {showUpcoming ? 'Upcoming' : 'Past'} Events ({filteredEvents.length})
          </h2>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-400">No events found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event, index) => {
              const isUpcoming = new Date(event.start_date) > new Date()

              return (
                <Link key={event.id} href={`/event/${event.id}`}>
                  <Card className="group bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-all duration-300 overflow-hidden">
                    <div className="relative h-64 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={isValidImageUrl(event.flyer_url || event.images?.[0]) ? (event.flyer_url || event.images[0]) : getListFallbackImage('event', index)}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant={isUpcoming ? "default" : "secondary"} className="text-xs">
                        {isUpcoming ? "Upcoming" : "Past"}
                      </Badge>
                    </div>

                    {/* Event Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-center gap-2 text-xs text-white/80 mb-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.start_date).toLocaleDateString()}
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        {event.venue?.name || 'TBA'}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      
                      {/* Genre Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {event.genres?.slice(0, 2).map((genre: string) => (
                          <Badge 
                            key={genre} 
                            variant="secondary" 
                            className="text-xs bg-white/20 text-white border-none"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 