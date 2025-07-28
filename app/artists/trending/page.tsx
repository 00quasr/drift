"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, MapPin, ArrowRight, Crown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import ClassicLoader from '@/components/ui/loader'

interface TrendingArtist {
  id: string
  name: string
  bio?: string
  avatar_url?: string
  origin?: string
  genres: string[]
  is_verified: boolean
  followers_count: number
  monthly_plays?: number
  booking_rate: number
  recent_bookings: number
  rating?: number
  trending_score: number
  growth_percentage: number
  social_links?: {
    soundcloud?: string
    spotify?: string
    instagram?: string
    bandcamp?: string
  }
  upcoming_events: Array<{
    id: string
    title: string
    start_date: string
    venue: {
      name: string
      location: string
    }
  }>
  recent_releases?: Array<{
    title: string
    release_date: string
    platform: string
  }>
}

export default function TrendingArtistsPage() {
  const [artists, setArtists] = useState<TrendingArtist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month')
  const [category, setCategory] = useState<'all' | 'bookings' | 'followers' | 'plays'>('all')

  useEffect(() => {
    const fetchTrendingArtists = async () => {
      try {
        setIsLoading(true)
        
        const params = new URLSearchParams({
          trending: 'true',
          timeframe,
          limit: '20'
        })
        
        if (category !== 'all') {
          params.set('sort_by', category)
        }
        
        const response = await fetch(`/api/artists?${params}`)
        const result = await response.json()
        
        if (result.success) {
          const artistsData = result.data.artists || []
          
          // Enrich with trending data (in real app this would come from analytics)
          const trendingArtists = artistsData.map((artist: any, index: number) => ({
            ...artist,
            followers_count: Math.floor(Math.random() * 10000) + 1000,
            monthly_plays: Math.floor(Math.random() * 50000) + 5000,
            booking_rate: Math.floor(Math.random() * 100) + 20,
            recent_bookings: Math.floor(Math.random() * 10) + 1,
            trending_score: 95 - (index * 3),
            growth_percentage: Math.floor(Math.random() * 200) + 50,
            rating: (Math.random() * 2 + 3).toFixed(1),
            upcoming_events: [], // Would be populated from actual events data
            recent_releases: [] // Would be populated from actual releases data
          }))
          
          // Sort by trending score
          trendingArtists.sort((a, b) => b.trending_score - a.trending_score)
          
          setArtists(trendingArtists)
        } else {
          setError('Failed to load trending artists')
        }
      } catch (error) {
        console.error('Error fetching trending artists:', error)
        setError('Network error loading trending artists')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingArtists()
  }, [timeframe, category])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500" />
      case 1: return <Crown className="w-5 h-5 text-gray-400" />
      case 2: return <Crown className="w-5 h-5 text-orange-600" />
      default: return <span className="text-white/60 font-bold text-lg">#{index + 1}</span>
    }
  }

  const getGrowthColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-400'
    if (percentage >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <ClassicLoader />
          <p className="text-white/80 font-bold tracking-wider uppercase text-center">
            LOADING TRENDING ARTISTS...
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
            <TrendingUp className="w-8 h-8 text-green-500" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-wider uppercase">
              TRENDING ARTISTS
            </h1>
          </div>
          <p className="text-white/70 text-lg font-medium max-w-2xl">
            MOST FOLLOWED, SEARCHED, AND BOOKED ARTISTS IN THE ELECTRONIC MUSIC SCENE
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Timeframe Tabs */}
          <div className="flex gap-4 border-b border-white/10 pb-4">
            {[
              { key: 'week', label: 'THIS WEEK' },
              { key: 'month', label: 'THIS MONTH' },
              { key: 'year', label: 'THIS YEAR' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTimeframe(tab.key as any)}
                className={`px-4 py-2 font-bold tracking-wider uppercase text-sm transition-all duration-300 ${
                  timeframe === tab.key 
                    ? 'text-white border-b-2 border-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded px-3 py-2 text-sm font-bold tracking-wider uppercase text-white focus:outline-none focus:border-white/40"
            >
              <option value="all">ALL TRENDING</option>
              <option value="bookings">MOST BOOKED</option>
              <option value="followers">MOST FOLLOWED</option>
              <option value="plays">MOST PLAYED</option>
            </select>
          </div>
        </motion.div>

        {/* Top 3 Artists - Featured Cards */}
        {artists.length > 0 && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
              TOP 3 TRENDING
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {artists.slice(0, 3).map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/artist/${artist.id}`}>
                    <Card className={`relative overflow-hidden group h-full transition-all duration-300 ${
                      index === 0 
                        ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/50 hover:border-yellow-400' 
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-500/50 hover:border-gray-400'
                        : 'bg-gradient-to-br from-orange-600/20 to-orange-700/10 border-orange-600/50 hover:border-orange-500'
                    }`}>
                      {/* Rank Badge */}
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                        {getRankIcon(index)}
                      </div>

                      {/* Growth Badge */}
                      <div className={`absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold tracking-wider uppercase ${getGrowthColor(artist.growth_percentage)}`}>
                        +{artist.growth_percentage}%
                      </div>

                      {/* Artist Avatar */}
                      <div className="relative h-64 overflow-hidden">
                        {artist.avatar_url ? (
                          <Image
                            src={artist.avatar_url}
                            alt={artist.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <Users className="w-16 h-16 text-white/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300" />
                      </div>

                      {/* Artist Details */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold tracking-wider uppercase text-white group-hover:text-white/90 transition-colors mb-2">
                          {artist.name}
                        </h3>
                        
                        {artist.origin && (
                          <div className="flex items-center gap-2 text-white/60 text-sm font-medium mb-4">
                            <MapPin className="w-4 h-4" />
                            <span className="font-bold tracking-wider uppercase">
                              {artist.origin}
                            </span>
                          </div>
                        )}

                        {/* Trending Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white/10 rounded p-3 text-center">
                            <div className="text-lg font-bold text-white">
                              {(artist.followers_count / 1000).toFixed(1)}K
                            </div>
                            <div className="text-xs text-white/60 font-bold tracking-wider uppercase">
                              FOLLOWERS
                            </div>
                          </div>
                          <div className="bg-white/10 rounded p-3 text-center">
                            <div className="text-lg font-bold text-white">
                              {artist.recent_bookings}
                            </div>
                            <div className="text-xs text-white/60 font-bold tracking-wider uppercase">
                              BOOKINGS
                            </div>
                          </div>
                        </div>

                        {/* Genres */}
                        {artist.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {artist.genres.slice(0, 2).map((genre) => (
                              <span 
                                key={genre}
                                className="bg-white/10 px-2 py-1 rounded text-xs font-bold tracking-wider uppercase text-white/80"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Full Trending List */}
        {artists.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold tracking-wider uppercase text-white mb-6">
              TRENDING CHARTS
            </h2>
            <div className="space-y-4">
              {artists.slice(3).map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                >
                  <Link href={`/artist/${artist.id}`}>
                    <Card className="bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group">
                      <div className="p-6">
                        <div className="flex items-center gap-6">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full">
                            <span className="text-white font-bold text-lg">
                              #{index + 4}
                            </span>
                          </div>

                          {/* Avatar */}
                          <div className="relative w-16 h-16 rounded-full overflow-hidden">
                            {artist.avatar_url ? (
                              <Image
                                src={artist.avatar_url}
                                alt={artist.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                <Users className="w-8 h-8 text-white/40" />
                              </div>
                            )}
                          </div>

                          {/* Artist Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold tracking-wider uppercase text-white group-hover:text-white/90 transition-colors mb-1 truncate">
                              {artist.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-white/60">
                              {artist.origin && (
                                <span className="font-bold tracking-wider uppercase">
                                  {artist.origin}
                                </span>
                              )}
                              {artist.genres.length > 0 && (
                                <span className="font-bold tracking-wider uppercase">
                                  {artist.genres[0]}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="hidden md:flex items-center gap-8 text-sm">
                            <div className="text-center">
                              <div className="text-white font-bold">
                                {(artist.followers_count / 1000).toFixed(1)}K
                              </div>
                              <div className="text-white/60 text-xs font-bold tracking-wider uppercase">
                                FOLLOWERS
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-bold">
                                {artist.recent_bookings}
                              </div>
                              <div className="text-white/60 text-xs font-bold tracking-wider uppercase">
                                BOOKINGS
                              </div>
                            </div>
                            <div className="text-center">
                              <div className={`font-bold ${getGrowthColor(artist.growth_percentage)}`}>
                                +{artist.growth_percentage}%
                              </div>
                              <div className="text-white/60 text-xs font-bold tracking-wider uppercase">
                                GROWTH
                              </div>
                            </div>
                          </div>

                          {/* Trending Score */}
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-white font-bold">
                              {artist.trending_score}
                            </span>
                          </div>

                          <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {artists.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TrendingUp className="w-16 h-16 text-white/20 mx-auto mb-6" />
            <h2 className="text-2xl font-bold tracking-wider uppercase text-white/60 mb-4">
              NO TRENDING DATA YET
            </h2>
            <p className="text-white/40 max-w-md mx-auto mb-8">
              Check back as our community grows and trending patterns emerge
            </p>
            <Link href="/artists">
              <button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                VIEW ALL ARTISTS
              </button>
            </Link>
          </motion.div>
        )}

        {/* Call to Action */}
        {artists.length > 0 && (
          <motion.div 
            className="text-center mt-16 pt-12 border-t border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold tracking-wider uppercase text-white mb-4">
              WANT TO BE TRENDING?
            </h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Build your fanbase, get more bookings, and climb the trending charts
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/verification">
                <button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                  JOIN AS ARTIST
                </button>
              </Link>
              <Link href="/events/create">
                <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                  CREATE EVENT
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}