"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { H1, H2, H3 } from '@/components/ui/typography'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'

interface NewcomerArtist {
  id: string
  name: string
  bio?: string
  avatar_url?: string
  origin?: string
  genres: string[]
  created_at: string
  is_verified: boolean
  followers_count?: number
  upcoming_events_count?: number
  social_links?: {
    soundcloud?: string
    spotify?: string
    instagram?: string
    bandcamp?: string
  }
  recent_events?: Array<{
    id: string
    title: string
    start_date: string
    venue: {
      name: string
      location: string
    }
  }>
  debut_date?: string
}

export default function NewcomersPage() {
  const [artists, setArtists] = useState<NewcomerArtist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'this-month' | 'verified'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'events' | 'followers'>('newest')

  useEffect(() => {
    const fetchNewcomers = async () => {
      try {
        setIsLoading(true)
        
        // Calculate date filter for newcomers (artists created in last 3 months)
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        
        const params = new URLSearchParams({
          created_after: threeMonthsAgo.toISOString().split('T')[0],
          limit: '24'
        })
        
        if (filter === 'this-month') {
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          params.set('created_after', oneMonthAgo.toISOString().split('T')[0])
        }
        
        if (filter === 'verified') {
          params.set('verified_only', 'true')
        }
        
        const response = await fetch(`/api/artists?${params}`)
        const result = await response.json()
        
        if (result.success) {
          const artistsData = result.data.artists || []
          
          // Add mock data for demonstration
          const enrichedArtists = artistsData.map((artist: any) => ({
            ...artist,
            followers_count: Math.floor(Math.random() * 1000) + 50,
            upcoming_events_count: Math.floor(Math.random() * 5),
            debut_date: artist.created_at,
            recent_events: [] // Would be populated from actual events data
          }))
          
          setArtists(enrichedArtists)
        } else {
          setError('Failed to load newcomer artists')
        }
      } catch (error) {
        console.error('Error fetching newcomers:', error)
        setError('Network error loading newcomer artists')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNewcomers()
  }, [filter])

  const sortedArtists = [...artists].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'events':
        return (b.upcoming_events_count || 0) - (a.upcoming_events_count || 0)
      case 'followers':
        return (b.followers_count || 0) - (a.followers_count || 0)
      default:
        return 0
    }
  })

  const getTimeSinceJoined = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  if (isLoading) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
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
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero Section */}
      <section className="w-full pt-24 pb-16 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <H1 variant="display" className="text-5xl md:text-7xl mb-6 text-white">
                NEWCOMERS
              </H1>
              <p className="text-white/50 text-sm lg:text-base font-medium max-w-2xl tracking-wider uppercase">
                DISCOVER FRESH TALENT JOINING THE UNDERGROUND ELECTRONIC MUSIC SCENE
              </p>
            </motion.div>

            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-px h-24 bg-gradient-to-b from-white/40 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="w-full py-8 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Filter Tabs */}
            <div className="flex gap-4">
              {[
                { key: 'all', label: 'ALL NEWCOMERS' },
                { key: 'this-month', label: 'THIS MONTH' },
                { key: 'verified', label: 'VERIFIED ONLY' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-4 py-2 font-bold tracking-wider uppercase text-xs transition-all duration-300 ${
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
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-950 border border-white/20 px-4 py-2 text-xs font-bold tracking-wider uppercase text-white focus:outline-none focus:border-white/40"
            >
              <option value="newest">NEWEST FIRST</option>
              <option value="events">MOST EVENTS</option>
              <option value="followers">MOST FOLLOWERS</option>
            </select>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <section className="w-full py-16 lg:py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">

        {/* Newcomers Grid */}
        {sortedArtists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <Link href={`/artist/${artist.id}`}>
                  <Card className="bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group h-full">
                    {/* Artist Avatar */}
                    <div className="relative aspect-square overflow-hidden">
                      {artist.avatar_url ? (
                        <Image
                          src={artist.avatar_url}
                          alt={artist.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white/40">{artist.name?.[0] || 'A'}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                      
                      {/* New Artist Badge */}
                      <div className="absolute top-4 left-4 bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-black">
                        NEW
                      </div>

                      {/* Verification Badge */}
                      {artist.is_verified && (
                        <div className="absolute top-4 right-4 bg-blue-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-white">
                          VERIFIED
                        </div>
                      )}

                      {/* Joined Badge */}
                      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-white">
                        JOINED {getTimeSinceJoined(artist.created_at)}
                      </div>
                    </div>
                    
                    {/* Artist Details */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold tracking-wider uppercase text-white group-hover:text-white/90 transition-colors mb-2">
                        {artist.name}
                      </h3>
                      
                      {/* Origin */}
                      {artist.origin && (
                        <div className="text-white/50 text-sm font-bold tracking-wider uppercase mb-3">
                          {artist.origin}
                        </div>
                      )}
                      
                      {/* Genres */}
                      {artist.genres && artist.genres.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {artist.genres.slice(0, 2).map((genre) => (
                              <span 
                                key={genre}
                                className="bg-white/10 px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-white/80"
                              >
                                {genre}
                              </span>
                            ))}
                            {artist.genres.length > 2 && (
                              <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-white/60">
                                +{artist.genres.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Bio Preview */}
                      {artist.bio && (
                        <p className="text-white/60 text-sm font-medium mb-4 line-clamp-3 leading-relaxed">
                          {artist.bio}
                        </p>
                      )}
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-white/5 rounded p-2 text-center border border-white/10">
                          <div className="text-lg font-bold text-white">
                            {artist.followers_count || 0}
                          </div>
                          <div className="text-xs text-white/60 font-bold tracking-wider uppercase">
                            FOLLOWERS
                          </div>
                        </div>
                        <div className="bg-white/5 rounded p-2 text-center border border-white/10">
                          <div className="text-lg font-bold text-white">
                            {artist.upcoming_events_count || 0}
                          </div>
                          <div className="text-xs text-white/60 font-bold tracking-wider uppercase">
                            UPCOMING
                          </div>
                        </div>
                      </div>
                      
                      {/* Recent Events */}
                      {artist.recent_events && artist.recent_events.length > 0 && (
                        <div className="mb-4">
                          <span className="text-white/50 text-xs font-bold tracking-widest uppercase block mb-2">
                            RECENT SHOWS
                          </span>
                          <div className="space-y-1">
                            {artist.recent_events.slice(0, 2).map((event) => (
                              <div key={event.id} className="text-xs text-white/60 font-medium">
                                {event.venue.name} • {new Date(event.start_date).toLocaleDateString()}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Social Links */}
                      {artist.social_links && (
                        <div className="mt-auto pt-4 border-t border-white/10">
                          <div className="flex gap-3 justify-center">
                            {Object.entries(artist.social_links).slice(0, 3).map(([platform, url]) => (
                              <a
                                key={platform}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-white/50 hover:text-white text-xs font-bold tracking-wider uppercase transition-all duration-200"
                              >
                                {platform}
                              </a>
                            ))}
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
            <H2 variant="display" className="mb-4 text-white/60">
              NO NEW ARTISTS YET
            </H2>
            <p className="text-white/40 max-w-md mx-auto mb-8 text-sm tracking-wider uppercase">
              {filter === 'this-month'
                ? 'No new artists joined this month. Check back soon for fresh talent!'
                : 'Check back as new artists join our platform and start their journey'
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setFilter('all')}
                className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs"
              >
                VIEW ALL NEWCOMERS
              </button>
              <Link href="/artists">
                <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs">
                  ALL ARTISTS
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 lg:py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <H2 variant="display" className="mb-4 text-white">
              ARE YOU A NEW ARTIST?
            </H2>
            <p className="text-white/40 mb-8 max-w-md mx-auto text-sm tracking-wider uppercase">
              Join our platform and connect with fans, venues, and other artists in the electronic music community
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/verification">
                <button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs">
                  JOIN AS ARTIST
                </button>
              </Link>
              <Link href="/artists">
                <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs">
                  ALL ARTISTS
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}