"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Users, Calendar, MapPin, ArrowRight, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import ClassicLoader from '@/components/ui/loader'

interface TrendingData {
  venues: any[]
  events: any[]
  artists: any[]
}

export default function TrendingPage() {
  const [data, setData] = useState<TrendingData>({ venues: [], events: [], artists: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/explore')
        const result = await response.json()
        
        if (result.success) {
          setData({
            venues: result.data.trending_venues || [],
            events: result.data.upcoming_events || [],
            artists: result.data.top_artists || []
          })
        } else {
          setError('Failed to load trending content')
        }
      } catch (error) {
        console.error('Error fetching trending data:', error)
        setError('Network error loading trending content')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <ClassicLoader />
          <p className="text-white/80 font-bold tracking-wider uppercase text-center">
            LOADING TRENDING CONTENT...
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
            <Flame className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-wider uppercase">
              TRENDING NOW
            </h1>
          </div>
          <p className="text-white/70 text-lg font-medium max-w-2xl">
            DISCOVER WHAT'S HOT IN THE UNDERGROUND ELECTRONIC MUSIC SCENE
          </p>
        </motion.div>

        {/* Trending Venues */}
        {data.venues.length > 0 && (
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-white/80" />
                <h2 className="text-2xl font-bold tracking-wider uppercase">TRENDING VENUES</h2>
              </div>
              <Link 
                href="/venues" 
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <span className="font-bold tracking-wider uppercase text-sm">VIEW ALL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.venues.slice(0, 6).map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/venue/${venue.id}`}>
                    <Card className="bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.jpg`}
                          alt={venue.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold tracking-wider uppercase text-white group-hover:text-white/90 transition-colors">
                            {venue.name}
                          </h3>
                          {venue.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-bold text-white/80">
                                {venue.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-white/60 text-sm font-medium mb-3">
                          {venue.location} • {venue.type}
                        </p>
                        <div className="flex items-center gap-2 text-white/50 text-xs">
                          <Users className="w-4 h-4" />
                          <span className="font-bold tracking-wider uppercase">
                            {venue.capacity || 'CAPACITY N/A'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Trending Events */}
        {data.events.length > 0 && (
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-white/80" />
                <h2 className="text-2xl font-bold tracking-wider uppercase">TRENDING EVENTS</h2>
              </div>
              <Link 
                href="/events" 
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <span className="font-bold tracking-wider uppercase text-sm">VIEW ALL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.events.slice(0, 6).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/event/${event.id}`}>
                    <Card className="bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.jpg`}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold tracking-wider uppercase text-white group-hover:text-white/90 transition-colors mb-3">
                          {event.title}
                        </h3>
                        <p className="text-white/60 text-sm font-medium mb-2">
                          {new Date(event.start_date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-white/60 text-sm font-medium">
                          {event.venue?.name}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Trending Artists */}
        {data.artists.length > 0 && (
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-white/80" />
                <h2 className="text-2xl font-bold tracking-wider uppercase">TRENDING ARTISTS</h2>
              </div>
              <Link 
                href="/artists" 
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <span className="font-bold tracking-wider uppercase text-sm">VIEW ALL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.artists.slice(0, 8).map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/artist/${artist.id}`}>
                    <Card className="bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.jpg`}
                          alt={artist.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold tracking-wider uppercase text-white group-hover:text-white/90 transition-colors mb-2">
                          {artist.name}
                        </h3>
                        {artist.genres && (
                          <p className="text-white/60 text-xs font-medium uppercase">
                            {artist.genres.slice(0, 2).join(' • ')}
                          </p>
                        )}
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {data.venues.length === 0 && data.events.length === 0 && data.artists.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Flame className="w-16 h-16 text-white/20 mx-auto mb-6" />
            <h2 className="text-2xl font-bold tracking-wider uppercase text-white/60 mb-4">
              NO TRENDING CONTENT YET
            </h2>
            <p className="text-white/40 max-w-md mx-auto">
              Check back soon as the community grows and trending content emerges
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}