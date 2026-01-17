"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Map, MapPin, Calendar, Clock, Users, Star, Filter, List, Navigation } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'

interface EventLocation {
  id: string
  title: string
  start_date: string
  start_time: string
  poster_url?: string
  venue: {
    id: string
    name: string
    location: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  artists: Array<{
    id: string
    name: string
  }>
  genres?: string[]
  price_range?: string
  rating?: number
}

export default function EventsMapPage() {
  const [events, setEvents] = useState<EventLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  // Mock coordinates for demonstration - in a real app these would come from the database
  const mockCoordinates: Record<string, {lat: number, lng: number}> = {
    'Berlin, Germany': { lat: 52.5200, lng: 13.4050 },
    'London, UK': { lat: 51.5074, lng: -0.1278 },
    'Amsterdam, Netherlands': { lat: 52.3676, lng: 4.9041 },
    'Barcelona, Spain': { lat: 41.3851, lng: 2.1734 },
    'Prague, Czech Republic': { lat: 50.0755, lng: 14.4378 },
    'Vienna, Austria': { lat: 48.2082, lng: 16.3738 }
  }

  useEffect(() => {
    const fetchEventsWithLocation = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch('/api/events?limit=50&upcoming=true')
        const result = await response.json()
        
        if (result.success) {
          const eventsData = result.data.events || []
          
          // Add mock coordinates to events
          const eventsWithCoords = eventsData.map((event: any) => ({
            ...event,
            venue: {
              ...event.venue,
              coordinates: mockCoordinates[event.venue?.location] || { lat: 0, lng: 0 }
            }
          }))
          
          setEvents(eventsWithCoords)
        } else {
          setError('Failed to load events')
        }
      } catch (error) {
        console.error('Error fetching events:', error)
        setError('Network error loading events')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventsWithLocation()
  }, [])

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied:', error)
        }
      )
    }
  }, [])

  // Filter events
  const filteredEvents = events.filter(event => {
    if (selectedCity !== 'all' && !event.venue.location.includes(selectedCity)) {
      return false
    }
    if (selectedGenre !== 'all' && !event.genres?.includes(selectedGenre)) {
      return false
    }
    return true
  })

  // Get unique cities and genres for filters
  const cities = Array.from(new Set(events.map(event => 
    event.venue.location.split(',')[0].trim()
  ))).sort()
  
  const genres = Array.from(new Set(
    events.flatMap(event => event.genres || [])
  )).sort()

  if (isLoading) {
    return <div className="min-h-screen bg-neutral-950" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-white/5 border border-red-500/30 p-8 max-w-md w-full">
          <div className="text-center space-y-4">
            <p className="text-red-400 font-bold tracking-wider uppercase">
              ERROR: {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200"
            >
              RETRY
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Map className="w-8 h-8 text-cyan-500" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-wider uppercase">
              EVENTS MAP
            </h1>
          </div>
          <p className="text-white/70 text-lg font-medium max-w-2xl">
            BROWSE UPCOMING EVENTS VISUALLY BY LOCATION
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div 
          className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* View Mode Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded font-bold tracking-wider uppercase text-sm transition-all duration-300 ${
                viewMode === 'map' 
                  ? 'bg-white text-black' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              MAP VIEW
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded font-bold tracking-wider uppercase text-sm transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-white text-black' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              LIST VIEW
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/60" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2 text-sm font-bold tracking-wider uppercase text-white focus:outline-none focus:border-white/40"
              >
                <option value="all">ALL CITIES</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city.toUpperCase()}</option>
                ))}
              </select>
            </div>
            
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-3 py-2 text-sm font-bold tracking-wider uppercase text-white focus:outline-none focus:border-white/40"
            >
              <option value="all">ALL GENRES</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {viewMode === 'map' ? (
          /* Map View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/5 border border-white/10 p-8 mb-8">
              <div className="text-center">
                <Map className="w-16 h-16 text-white/20 mx-auto mb-6" />
                <h3 className="text-2xl font-bold tracking-wider uppercase text-white/60 mb-4">
                  INTERACTIVE MAP COMING SOON
                </h3>
                <p className="text-white/40 max-w-md mx-auto mb-6">
                  We're working on integrating an interactive map to visualize events by location. 
                  For now, browse events in list view below.
                </p>
                <button 
                  onClick={() => setViewMode('list')}
                  className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200"
                >
                  VIEW EVENT LIST
                </button>
              </div>
            </Card>
            
            {/* Location Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {cities.slice(0, 4).map(city => {
                const cityEvents = filteredEvents.filter(event => 
                  event.venue.location.includes(city)
                )
                return (
                  <Card key={city} className="bg-white/5 border border-white/10 p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {cityEvents.length}
                      </div>
                      <div className="text-white/60 text-sm font-bold tracking-wider uppercase">
                        {city}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </motion.div>
        ) : (
          /* List View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                  >
                    <Link href={`/event/${event.id}`}>
                      <Card className="bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group h-full">
                        {/* Event Poster */}
                        {event.poster_url && (
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={event.poster_url}
                              alt={event.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                            
                            {/* Distance Badge (if user location available) */}
                            {userLocation && event.venue.coordinates && (
                              <div className="absolute top-4 left-4 bg-cyan-500/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-white">
                                <Navigation className="w-3 h-3 inline mr-1" />
                                {Math.round(calculateDistance(
                                  userLocation.lat, 
                                  userLocation.lng,
                                  event.venue.coordinates.lat,
                                  event.venue.coordinates.lng
                                ))} KM
                              </div>
                            )}

                            {/* Rating Badge */}
                            {event.rating && (
                              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-white text-xs font-bold">
                                  {event.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Event Details */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold tracking-wider uppercase text-white group-hover:text-white/90 transition-colors mb-3 line-clamp-2">
                            {event.title}
                          </h3>
                          
                          {/* Date */}
                          <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-bold tracking-wider uppercase">
                              {new Date(event.start_date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          
                          {/* Time */}
                          <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-3">
                            <Clock className="w-4 h-4" />
                            <span className="font-bold tracking-wider uppercase">
                              {event.start_time}
                            </span>
                          </div>
                          
                          {/* Location */}
                          <div className="flex items-center gap-2 text-white/70 text-sm font-medium mb-4">
                            <MapPin className="w-4 h-4" />
                            <div>
                              <div className="font-bold tracking-wider uppercase">
                                {event.venue.name}
                              </div>
                              <div className="text-white/50 text-xs">
                                {event.venue.location}
                              </div>
                            </div>
                          </div>
                          
                          {/* Artists */}
                          {event.artists.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-white/60" />
                                <span className="text-white/60 text-xs font-bold tracking-wider uppercase">
                                  LINEUP
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {event.artists.slice(0, 3).map((artist) => (
                                  <span 
                                    key={artist.id}
                                    className="bg-white/10 px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-white/80"
                                  >
                                    {artist.name}
                                  </span>
                                ))}
                                {event.artists.length > 3 && (
                                  <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-white/60">
                                    +{event.artists.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Price */}
                          {event.price_range && (
                            <div className="mt-auto pt-4 border-t border-white/10">
                              <div className="text-white font-bold tracking-wider uppercase text-sm">
                                {event.price_range}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 text-white/20 mx-auto mb-6" />
                <h2 className="text-2xl font-bold tracking-wider uppercase text-white/60 mb-4">
                  NO EVENTS FOUND
                </h2>
                <p className="text-white/40 max-w-md mx-auto mb-8">
                  Try adjusting your filters or check back for new events in your area
                </p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => { setSelectedCity('all'); setSelectedGenre('all') }}
                    className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200"
                  >
                    CLEAR FILTERS
                  </button>
                  <Link href="/events">
                    <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                      ALL EVENTS
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Stats Footer */}
        {filteredEvents.length > 0 && (
          <motion.div 
            className="mt-16 pt-8 border-t border-white/10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold text-white mb-2">
                  {filteredEvents.length}
                </div>
                <div className="text-white/60 text-sm font-bold tracking-wider uppercase">
                  UPCOMING EVENTS
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">
                  {cities.length}
                </div>
                <div className="text-white/60 text-sm font-bold tracking-wider uppercase">
                  CITIES
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">
                  {Array.from(new Set(filteredEvents.map(e => e.venue.id))).length}
                </div>
                <div className="text-white/60 text-sm font-bold tracking-wider uppercase">
                  VENUES
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">
                  {Array.from(new Set(filteredEvents.flatMap(e => e.artists.map(a => a.id)))).length}
                </div>
                <div className="text-white/60 text-sm font-bold tracking-wider uppercase">
                  ARTISTS
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}