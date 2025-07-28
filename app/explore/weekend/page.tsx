"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, ArrowRight, Star, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import ClassicLoader from '@/components/ui/loader'

interface WeekendEvent {
  id: string
  title: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  poster_url?: string
  venue: {
    id: string
    name: string
    location: string
  }
  artists: Array<{
    id: string
    name: string
    avatar_url?: string
  }>
  price_range?: string
  genres?: string[]
  rating?: number
}

export default function WeekendPage() {
  const [events, setEvents] = useState<WeekendEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWeekendEvents = async () => {
      try {
        setIsLoading(true)
        
        // Get current weekend dates
        const now = new Date()
        const currentDay = now.getDay()
        const daysUntilFriday = (5 - currentDay + 7) % 7
        const friday = new Date(now)
        friday.setDate(now.getDate() + daysUntilFriday)
        
        const sunday = new Date(friday)
        sunday.setDate(friday.getDate() + 2)
        
        const response = await fetch(`/api/events?start_date=${friday.toISOString().split('T')[0]}&end_date=${sunday.toISOString().split('T')[0]}&limit=20`)
        const result = await response.json()
        
        if (result.success) {
          setEvents(result.data.events || [])
        } else {
          setError('Failed to load weekend events')
        }
      } catch (error) {
        console.error('Error fetching weekend events:', error)
        setError('Network error loading weekend events')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeekendEvents()
  }, [])

  const getWeekendDates = () => {
    const now = new Date()
    const currentDay = now.getDay()
    const daysUntilFriday = (5 - currentDay + 7) % 7
    const friday = new Date(now)
    friday.setDate(now.getDate() + daysUntilFriday)
    
    const sunday = new Date(friday)
    sunday.setDate(friday.getDate() + 2)
    
    return {
      friday: friday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sunday: sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const { friday, sunday } = getWeekendDates()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <ClassicLoader />
          <p className="text-white/80 font-bold tracking-wider uppercase text-center">
            LOADING WEEKEND EVENTS...
          </p>
        </div>
      </div>
    )
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
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-wider uppercase">
              THIS WEEKEND
            </h1>
          </div>
          <p className="text-white/70 text-lg font-medium max-w-2xl">
            CURATED ELECTRONIC MUSIC EVENTS • {friday} - {sunday}
          </p>
        </motion.div>

        {/* Weekend Events Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/event/${event.id}`}>
                  <Card className="bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group h-full">
                    {/* Event Poster */}
                    {event.poster_url && (
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={event.poster_url}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                        
                        {/* Date Badge */}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                          <div className="text-white font-bold text-sm tracking-wider uppercase">
                            {new Date(event.start_date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>

                        {/* Rating Badge */}
                        {event.rating && (
                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
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
                      <h3 className="text-xl font-bold tracking-wider uppercase text-white group-hover:text-white/90 transition-colors mb-3 line-clamp-2">
                        {event.title}
                      </h3>
                      
                      {/* Venue & Location */}
                      <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="font-bold tracking-wider uppercase">
                          {event.venue.name}
                        </span>
                      </div>
                      
                      {/* Time */}
                      <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-4">
                        <Clock className="w-4 h-4" />
                        <span className="font-bold tracking-wider uppercase">
                          {event.start_time} - {event.end_time || 'LATE'}
                        </span>
                      </div>
                      
                      {/* Artists */}
                      {event.artists && event.artists.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-white/60" />
                            <span className="text-white/60 text-xs font-bold tracking-wider uppercase">
                              LINEUP
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
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
                                +{event.artists.length - 3} MORE
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Genres */}
                      {event.genres && event.genres.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {event.genres.slice(0, 3).map((genre) => (
                              <span 
                                key={genre}
                                className="text-white/50 text-xs font-bold tracking-wider uppercase"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Price */}
                      {event.price_range && (
                        <div className="mt-auto">
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
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar className="w-16 h-16 text-white/20 mx-auto mb-6" />
            <h2 className="text-2xl font-bold tracking-wider uppercase text-white/60 mb-4">
              NO WEEKEND EVENTS SCHEDULED
            </h2>
            <p className="text-white/40 max-w-md mx-auto mb-8">
              Check back later for upcoming weekend events or explore all events
            </p>
            <Link href="/events">
              <button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                VIEW ALL EVENTS
              </button>
            </Link>
          </motion.div>
        )}

        {/* Call to Action */}
        {events.length > 0 && (
          <motion.div 
            className="text-center mt-16 pt-12 border-t border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold tracking-wider uppercase text-white mb-4">
              PLANNING AHEAD?
            </h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Browse all upcoming events and discover new venues and artists
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/events">
                <button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                  ALL EVENTS
                </button>
              </Link>
              <Link href="/venues">
                <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                  VENUES
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}