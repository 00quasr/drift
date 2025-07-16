'use client'

import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X, Calendar, MapPin, Star, Zap, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { getEvents } from '@/lib/services/events'
import { getVenues } from '@/lib/services/venues'  
import { getArtists } from '@/lib/services/artists'
import { EntityCard } from '@/components/ui/entity-card'
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'
import Image from 'next/image'

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
          getEvents({ limit: 50 }),
          getVenues({ limit: 30 }),
          getArtists({ limit: 30 })
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 mt-4">Discovering amazing content...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Search Header */}
        <div className="mb-12">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-medium text-white mb-4">
              Explore
            </h1>
            <p className="text-slate-400 text-lg">
              Discover the best electronic music experiences around the world
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, venues, or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-slate-600 transition-colors text-lg"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            {[
              { id: 'all', label: 'Everything' },
              { id: 'events', label: 'Events' },
              { id: 'venues', label: 'Venues' },
              { id: 'artists', label: 'Artists' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedType(id as any)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedType === id
                    ? 'bg-white text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex flex-wrap gap-2">
            {genreTags.slice(0, 6).map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedGenre === genre
                    ? 'bg-white text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {cities.slice(0, 5).map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedCity === city
                    ? 'bg-white text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-slate-400">
            Showing {filteredEvents.length + filteredVenues.length + filteredArtists.length} results
          </p>
        </div>

        {/* Featured Content - Hero Grid */}
        {selectedType === 'all' && searchQuery === '' && selectedGenre === 'All' && selectedCity === 'All Cities' && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-medium text-white">Featured</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Large featured event */}
              {filteredEvents[0] && (
                <div className="md:col-span-2 md:row-span-2">
                  <Link href={`/event/${filteredEvents[0].id}`}>
                    <div className="group relative h-96 bg-slate-900 rounded-xl overflow-hidden">
                      <div className="absolute inset-0">
                        <Image
                          src={isValidImageUrl(filteredEvents[0].flyer_url || filteredEvents[0].images?.[0]) 
                            ? (filteredEvents[0].flyer_url || filteredEvents[0].images[0]) 
                            : getFallbackImage('event', filteredEvents[0].id)}
                          alt={filteredEvents[0].title}
                          fill
                          className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-mono">
                          EVENT
                        </span>
                      </div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-2xl font-medium text-white mb-2">{filteredEvents[0].title}</h3>
                        <div className="flex items-center gap-4 text-slate-300 text-sm">
                          <span>{new Date(filteredEvents[0].start_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{filteredEvents[0].venue?.name || 'TBA'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Two medium cards */}
              {filteredVenues[0] && (
                <div className="md:col-span-2">
                  <Link href={`/venue/${filteredVenues[0].id}`}>
                    <div className="group relative h-44 bg-slate-900 rounded-xl overflow-hidden">
                      <div className="absolute inset-0">
                        <Image
                          src={isValidImageUrl(filteredVenues[0].images?.[0]) 
                            ? filteredVenues[0].images[0] 
                            : getFallbackImage('venue', filteredVenues[0].id)}
                          alt={filteredVenues[0].name}
                          fill
                          className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-mono">
                          VENUE
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-medium text-white mb-1">{filteredVenues[0].name}</h3>
                        <p className="text-slate-300 text-sm">{filteredVenues[0].city}, {filteredVenues[0].country}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Artist spotlight */}
              {filteredArtists[0] && (
                <div className="md:col-span-2">
                  <Link href={`/artist/${filteredArtists[0].id}`}>
                    <div className="group relative h-44 bg-slate-900 rounded-xl overflow-hidden">
                      <div className="absolute inset-0">
                        <Image
                          src={isValidImageUrl(filteredArtists[0].photo_url || filteredArtists[0].images?.[0]) 
                            ? (filteredArtists[0].photo_url || filteredArtists[0].images[0]) 
                            : getFallbackImage('artist', filteredArtists[0].id)}
                          alt={filteredArtists[0].name}
                          fill
                          className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-l from-slate-950/80 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-mono">
                          ARTIST
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-medium text-white mb-1">{filteredArtists[0].name}</h3>
                        <p className="text-slate-300 text-sm">{filteredArtists[0].genres?.[0] || 'Electronic'}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Content Grid */}
        <div className="space-y-16">
          {/* Events Section */}
          {(selectedType === 'all' || selectedType === 'events') && filteredEvents.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-medium text-white">
                  {selectedType === 'events' ? 'Events' : 'Upcoming Events'}
                </h2>
                <div className="text-slate-400">({filteredEvents.length})</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvents.slice(selectedType === 'all' ? 1 : 0, selectedType === 'events' ? undefined : 9).map((event: any, index: number) => {
                  const eventDate = new Date(event.start_date);
                  const isUpcoming = eventDate > new Date();
                  
                  return (
                    <EntityCard
                      key={event.id}
                      type="event"
                      id={event.id}
                      title={event.title}
                      artist={event.artists?.[0]?.name || 'Various Artists'}
                      imageUrl={isValidImageUrl(event.flyer_url || event.images?.[0]) ? (event.flyer_url || event.images[0]) : getFallbackImage('event', event.id)}
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
                  );
                })}
              </div>
            </section>
          )}

          {/* Venues Section */}
          {(selectedType === 'all' || selectedType === 'venues') && filteredVenues.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <MapPin className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-medium text-white">
                  {selectedType === 'venues' ? 'Venues' : 'Featured Venues'}
                </h2>
                <div className="text-slate-400">({filteredVenues.length})</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.slice(selectedType === 'all' ? 1 : 0, selectedType === 'venues' ? undefined : 6).map((venue: any, index: number) => (
                  <EntityCard
                    key={venue.id}
                    type="venue"
                    id={venue.id}
                    title={venue.name}
                    imageUrl={isValidImageUrl(venue.images?.[0]) ? venue.images[0] : getFallbackImage('venue', venue.id)}
                    category={venue.genres?.[0] || 'CLUB'}
                    href={`/venue/${venue.id}`}
                    city={venue.city}
                    country={venue.country}
                    capacity={venue.capacity}
                    genres={venue.genres}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Artists Section */}
          {(selectedType === 'all' || selectedType === 'artists') && filteredArtists.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Star className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-medium text-white">
                  {selectedType === 'artists' ? 'Artists' : 'Rising Artists'}
                </h2>
                <div className="text-slate-400">({filteredArtists.length})</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredArtists.slice(selectedType === 'all' ? 1 : 0, selectedType === 'artists' ? undefined : 8).map((artist: any, index: number) => (
                  <EntityCard
                    key={artist.id}
                    type="artist"
                    id={artist.id}
                    title={artist.name}
                    imageUrl={isValidImageUrl(artist.photo_url || artist.images?.[0]) ? (artist.photo_url || artist.images[0]) : getFallbackImage('artist', artist.id)}
                    category={artist.genres?.[0] || 'ELECTRONIC'}
                    href={`/artist/${artist.id}`}
                    bio={artist.bio}
                    city={artist.city}
                    country={artist.country}
                    genres={artist.genres}
                    rating={artist.average_rating}
                    reviewCount={artist.review_count}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Load More CTA */}
        <div className="text-center mt-16">
          <div className="text-slate-400 mb-6">
            Want to see more? Check out our dedicated pages
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors">
              Browse All Events
            </Link>
            <Link href="/venues" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors">
              Explore Venues
            </Link>
            <Link href="/artists" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors">
              Discover Artists
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 