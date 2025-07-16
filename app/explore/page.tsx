'use client'

import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X, Calendar, MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import { getEvents } from '@/lib/services/events'
import { getVenues } from '@/lib/services/venues'  
import { getArtists } from '@/lib/services/artists'

const genreTags = ['All', 'Techno', 'House', 'Trance', 'Drum & Bass', 'Dubstep', 'Ambient', 'Minimal', 'Progressive']
const cities = ['All Cities', 'Berlin', 'London', 'Amsterdam', 'Barcelona', 'Paris', 'New York', 'Los Angeles', 'Tokyo']

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [selectedType, setSelectedType] = useState<'all' | 'events' | 'venues' | 'artists'>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Real data state
  const [events, setEvents] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [artists, setArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [eventsData, venuesData, artistsData] = await Promise.all([
          getEvents({ limit: 20 }),
          getVenues({ limit: 20 }),
          getArtists({ limit: 20 })
        ])
        setEvents(eventsData || [])
        setVenues(venuesData || [])
        setArtists(artistsData || [])
      } catch (error) {
        console.error('Error loading explore data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter data based on search and filters
  const filteredEvents = events.filter((event: any) => {
    const matchesSearch = searchQuery === '' || 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'All' || 
      event.genres?.some((genre: string) => genre.toLowerCase().includes(selectedGenre.toLowerCase()))
    const matchesCity = selectedCity === 'All Cities' || 
      event.venue?.city?.toLowerCase().includes(selectedCity.toLowerCase())
    return matchesSearch && matchesGenre && matchesCity
  })

  const filteredVenues = venues.filter((venue: any) => {
    const matchesSearch = searchQuery === '' || 
      venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCity = selectedCity === 'All Cities' || 
      venue.city?.toLowerCase().includes(selectedCity.toLowerCase())
    return matchesSearch && matchesCity
  })

  const filteredArtists = artists.filter((artist: any) => {
    const matchesSearch = searchQuery === '' || 
      artist.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'All' || 
      artist.genres?.some((genre: string) => genre.toLowerCase().includes(selectedGenre.toLowerCase()))
    return matchesSearch && matchesGenre
  })

  const getDisplayData = () => {
    switch (selectedType) {
      case 'events': return filteredEvents
      case 'venues': return filteredVenues  
      case 'artists': return filteredArtists
      default: return [...filteredEvents, ...filteredVenues, ...filteredArtists]
    }
  }

  const displayData = getDisplayData()

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="border-b border-drift-border">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-drift-muted" />
              <input
                type="text"
                placeholder="Search events, venues, or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-transparent border border-drift-border text-lg placeholder-drift-muted focus:outline-none focus:border-drift-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border-b border-drift-border sticky top-16 bg-black z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6">
              {/* Type Filter */}
              <div className="flex gap-4">
                {(['all', 'events', 'venues', 'artists'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`text-sm capitalize pb-1 border-b-2 transition-colors ${
                      selectedType === type
                        ? 'text-drift-primary border-drift-primary'
                        : 'text-drift-text-secondary border-transparent hover:text-white'
                    }`}
                  >
                    {type === 'all' ? 'Everything' : type}
                  </button>
                ))}
              </div>

              {/* Quick Filters */}
              <div className="hidden md:flex items-center gap-4 pl-6 border-l border-drift-border">
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-transparent text-sm text-drift-text-secondary focus:text-white focus:outline-none cursor-pointer"
                >
                  {genreTags.map((genre) => (
                    <option key={genre} value={genre} className="bg-black">
                      {genre}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-sm text-drift-text-secondary focus:text-white focus:outline-none cursor-pointer"
                >
                  {cities.map((city) => (
                    <option key={city} value={city} className="bg-black">
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-drift-text-secondary hover:text-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="border-b border-drift-border bg-drift-surface">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-drift-border rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date Range */}
              <div>
                <label className="text-sm text-drift-text-secondary mb-2 block">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-black border border-drift-border text-sm focus:outline-none focus:border-drift-primary transition-colors"
                  />
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-black border border-drift-border text-sm focus:outline-none focus:border-drift-primary transition-colors"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm text-drift-text-secondary mb-2 block">Price Range</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-black border border-drift-border text-sm focus:outline-none focus:border-drift-primary transition-colors"
                  />
                  <span className="text-drift-muted">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-black border border-drift-border text-sm focus:outline-none focus:border-drift-primary transition-colors"
                  />
                </div>
              </div>

              {/* Additional Options */}
              <div>
                <label className="text-sm text-drift-text-secondary mb-2 block">Options</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Free Events Only</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>This Weekend</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-drift-text-secondary">
            {loading ? 'Loading...' : `Showing ${displayData.length} results`} {selectedGenre !== 'All' && `for ${selectedGenre}`} {selectedCity !== 'All Cities' && `in ${selectedCity}`}
          </p>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-zinc-800 mb-3 rounded-lg"></div>
                <div className="h-4 bg-zinc-800 rounded mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No results found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Events */}
            {(selectedType === 'all' || selectedType === 'events') && filteredEvents.map((event: any) => (
              <Link key={`event-${event.id}`} href={`/event/${event.id}`} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg mb-3">
                  <div className="aspect-[4/3] bg-gradient-to-br from-zinc-800 to-zinc-900">
                    {event.images && event.images[0] ? (
                      <img 
                        src={event.images[0]} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <span className="text-xs uppercase tracking-wider text-purple-400 bg-black/50 px-2 py-1 rounded">
                        Event
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.start_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        {event.venue && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            {event.venue.name}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-1">
                  {event.venue?.city}, {event.venue?.country}
                </p>
              </Link>
            ))}
            
            {/* Venues */}
            {(selectedType === 'all' || selectedType === 'venues') && filteredVenues.map((venue: any) => (
              <Link key={`venue-${venue.id}`} href={`/venue/${venue.id}`} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg mb-3">
                  <div className="aspect-[4/3] bg-gradient-to-br from-zinc-800 to-zinc-900">
                    {venue.images && venue.images[0] ? (
                      <img 
                        src={venue.images[0]} 
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <span className="text-xs uppercase tracking-wider text-blue-400 bg-black/50 px-2 py-1 rounded">
                        Venue
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
                        <MapPin className="w-3 h-3" />
                        {venue.city}, {venue.country}
                        {venue.capacity && (
                          <>
                            <span>•</span>
                            <Star className="w-3 h-3" />
                            {venue.capacity} cap
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
                  {venue.name}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-1">
                  {venue.genres?.join(', ') || 'Electronic Music Venue'}
                </p>
              </Link>
            ))}
            
            {/* Artists */}
            {(selectedType === 'all' || selectedType === 'artists') && filteredArtists.map((artist: any) => (
              <Link key={`artist-${artist.id}`} href={`/artist/${artist.id}`} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg mb-3">
                  <div className="aspect-[4/3] bg-gradient-to-br from-zinc-800 to-zinc-900">
                    {artist.images && artist.images[0] ? (
                      <img 
                        src={artist.images[0]} 
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-600 to-orange-600 flex items-center justify-center">
                        <Star className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <span className="text-xs uppercase tracking-wider text-pink-400 bg-black/50 px-2 py-1 rounded">
                        Artist
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
                        {artist.city && (
                          <>
                            <MapPin className="w-3 h-3" />
                            {artist.city}, {artist.country}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
                  {artist.name}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-1">
                  {artist.genres?.join(', ') || 'Electronic Artist'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 