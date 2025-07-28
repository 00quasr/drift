"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Clock, Star, Music, ArrowRight, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import ClassicLoader from '@/components/ui/loader'

interface Festival {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
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
    avatar_url?: string
    genres?: string[]
  }>
  genres: string[]
  price_range?: string
  capacity?: number
  rating?: number
  is_outdoor: boolean
  duration_days: number
  stages_count?: number
  tickets_available: boolean
}

export default function FestivalsPage() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'this-month'>('upcoming')
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'rating'>('date')

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setIsLoading(true)
        
        // Calculate date filters
        const now = new Date()
        let startDate = now.toISOString().split('T')[0]
        let endDate = ''
        
        if (filter === 'this-month') {
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          endDate = endOfMonth.toISOString().split('T')[0]
        }
        
        // Fetch multi-day events (festivals)
        const params = new URLSearchParams({
          multi_day: 'true',
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
          limit: '20'
        })
        
        const response = await fetch(`/api/events?${params}`)
        const result = await response.json()
        
        if (result.success) {
          const eventsData = result.data.events || []
          
          // Transform events data to festival format
          const festivalsData = eventsData.map((event: any) => ({
            ...event,
            duration_days: event.end_date ? 
              Math.ceil((new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 1,
            is_outdoor: event.venue?.type === 'outdoor' || event.title.toLowerCase().includes('festival'),
            stages_count: event.stages_count || Math.floor(Math.random() * 3) + 1, // Mock data
            tickets_available: true // Mock data
          }))
          
          setFestivals(festivalsData)
        } else {
          setError('Failed to load festivals')
        }
      } catch (error) {
        console.error('Error fetching festivals:', error)
        setError('Network error loading festivals')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFestivals()
  }, [filter])

  const sortedFestivals = [...festivals].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      case 'duration':
        return b.duration_days - a.duration_days
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <ClassicLoader />
          <p className="text-white/80 font-bold tracking-wider uppercase text-center">
            LOADING FESTIVALS...
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
            <Music className="w-8 h-8 text-green-500" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-wider uppercase">
              FESTIVALS
            </h1>
          </div>
          <p className="text-white/70 text-lg font-medium max-w-2xl">
            MULTI-DAY ELECTRONIC MUSIC EXPERIENCES WITH LINEUPS AND OPEN-AIR VIBES
          </p>
        </motion.div>

        {/* Filters & Sort */}
        <motion.div 
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Filter Tabs */}
          <div className="flex gap-4 border-b border-white/10 pb-4">
            {[
              { key: 'upcoming', label: 'UPCOMING' },
              { key: 'this-month', label: 'THIS MONTH' },
              { key: 'all', label: 'ALL FESTIVALS' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 font-bold tracking-wider uppercase text-sm transition-all duration-300 ${
                  filter === tab.key 
                    ? 'text-white border-b-2 border-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/60" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded px-3 py-2 text-sm font-bold tracking-wider uppercase text-white focus:outline-none focus:border-white/40"
            >
              <option value="date">SORT BY DATE</option>
              <option value="duration">SORT BY DURATION</option>
              <option value="rating">SORT BY RATING</option>
            </select>
          </div>
        </motion.div>

        {/* Festivals Grid */}
        {sortedFestivals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sortedFestivals.map((festival, index) => (
              <motion.div
                key={festival.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/event/${festival.id}`}>
                  <Card className="bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group h-full">
                    {/* Festival Poster */}
                    {festival.poster_url && (
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={festival.poster_url}
                          alt={festival.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300" />
                        
                        {/* Duration Badge */}
                        <div className="absolute top-4 left-4 bg-green-500/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                          <div className="text-white font-bold text-sm tracking-wider uppercase">
                            {festival.duration_days} DAY{festival.duration_days > 1 ? 'S' : ''}
                          </div>
                        </div>

                        {/* Rating & Outdoor Badge */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          {festival.is_outdoor && (
                            <div className="bg-blue-500/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-white">
                              OUTDOOR
                            </div>
                          )}
                          {festival.rating && (
                            <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-white text-xs font-bold">
                                {festival.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Festival Details */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold tracking-wider uppercase text-white group-hover:text-white/90 transition-colors mb-4 line-clamp-2">
                        {festival.title}
                      </h3>
                      
                      {/* Date Range */}
                      <div className="flex items-center gap-2 text-white/70 text-sm font-bold tracking-wider uppercase mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(festival.start_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })} - {new Date(festival.end_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      {/* Venue & Location */}
                      <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-4">
                        <MapPin className="w-4 h-4" />
                        <span className="font-bold tracking-wider uppercase">
                          {festival.venue.name} • {festival.venue.location}
                        </span>
                      </div>

                      {/* Festival Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-white/5 rounded p-3 text-center border border-white/10">
                          <div className="text-lg font-bold text-white">
                            {festival.artists.length}
                          </div>
                          <div className="text-xs text-white/60 font-bold tracking-wider uppercase">
                            ARTISTS
                          </div>
                        </div>
                        <div className="bg-white/5 rounded p-3 text-center border border-white/10">
                          <div className="text-lg font-bold text-white">
                            {festival.stages_count || 'N/A'}
                          </div>
                          <div className="text-xs text-white/60 font-bold tracking-wider uppercase">
                            STAGES
                          </div>
                        </div>
                        <div className="bg-white/5 rounded p-3 text-center border border-white/10">
                          <div className="text-lg font-bold text-white">
                            {festival.capacity ? `${(festival.capacity / 1000).toFixed(0)}K` : 'N/A'}
                          </div>
                          <div className="text-xs text-white/60 font-bold tracking-wider uppercase">
                            CAPACITY
                          </div>
                        </div>
                      </div>
                      
                      {/* Headliner Artists */}
                      {festival.artists.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-white/60" />
                            <span className="text-white/60 text-xs font-bold tracking-wider uppercase">
                              HEADLINERS
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {festival.artists.slice(0, 4).map((artist) => (
                              <span 
                                key={artist.id}
                                className="bg-white/10 px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-white/80"
                              >
                                {artist.name}
                              </span>
                            ))}
                            {festival.artists.length > 4 && (
                              <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-white/60">
                                +{festival.artists.length - 4} MORE
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Genres */}
                      {festival.genres && festival.genres.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {festival.genres.slice(0, 3).map((genre) => (
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
                      
                      {/* Price & Tickets */}
                      <div className="mt-auto pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                          {festival.price_range && (
                            <div className="text-white font-bold tracking-wider uppercase text-sm">
                              {festival.price_range}
                            </div>
                          )}
                          <div className={`text-xs font-bold tracking-wider uppercase px-2 py-1 rounded ${
                            festival.tickets_available 
                              ? 'text-green-400 bg-green-400/10' 
                              : 'text-red-400 bg-red-400/10'
                          }`}>
                            {festival.tickets_available ? 'TICKETS AVAILABLE' : 'SOLD OUT'}
                          </div>
                        </div>
                      </div>
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
            <Music className="w-16 h-16 text-white/20 mx-auto mb-6" />
            <h2 className="text-2xl font-bold tracking-wider uppercase text-white/60 mb-4">
              NO FESTIVALS FOUND
            </h2>
            <p className="text-white/40 max-w-md mx-auto mb-8">
              {filter === 'upcoming' 
                ? 'No upcoming festivals scheduled. Check back soon for new announcements!'
                : 'Try adjusting your filter to find festivals that match your preferences'
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setFilter('all')}
                className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200"
              >
                VIEW ALL FESTIVALS
              </button>
              <Link href="/events">
                <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                  ALL EVENTS
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        {sortedFestivals.length > 0 && (
          <motion.div 
            className="text-center mt-16 pt-12 border-t border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold tracking-wider uppercase text-white mb-4">
              ORGANIZING A FESTIVAL?
            </h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Showcase your multi-day event to thousands of electronic music fans
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/events/create">
                <button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                  LIST YOUR FESTIVAL
                </button>
              </Link>
              <Link href="/venues">
                <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                  FIND VENUES
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}