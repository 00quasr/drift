"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Music, Users, Calendar, ExternalLink, Star, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import ClassicLoader from '@/components/ui/loader'

interface Label {
  id: string
  name: string
  description?: string
  logo_url?: string
  website?: string
  genres: string[]
  location?: string
  founded_year?: number
  artists_count: number
  events_count: number
  social_links?: {
    soundcloud?: string
    spotify?: string
    bandcamp?: string
    instagram?: string
  }
  recent_artists: Array<{
    id: string
    name: string
    avatar_url?: string
  }>
  upcoming_events: Array<{
    id: string
    title: string
    start_date: string
    venue: {
      name: string
      location: string
    }
  }>
}

export default function LabelsPage() {
  const [labels, setLabels] = useState<Label[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'local' | 'international'>('all')

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setIsLoading(true)
        // For now, we'll create mock data since labels aren't in the current schema
        // In a real implementation, this would fetch from /api/labels
        const mockLabels: Label[] = [
          {
            id: '1',
            name: 'UNDERGROUND COLLECTIVE',
            description: 'Pushing boundaries in minimal techno since 2018',
            genres: ['MINIMAL TECHNO', 'PROGRESSIVE'],
            location: 'BERLIN, DE',
            founded_year: 2018,
            artists_count: 12,
            events_count: 24,
            recent_artists: [
              { id: '1', name: 'DARK PULSE' },
              { id: '2', name: 'ECHO CHAMBER' },
              { id: '3', name: 'VOID DREAMS' }
            ],
            upcoming_events: [
              {
                id: '1',
                title: 'UNDERGROUND SHOWCASE',
                start_date: '2025-08-15',
                venue: { name: 'BASEMENT CLUB', location: 'BERLIN' }
              }
            ]
          },
          {
            id: '2',
            name: 'NEON NIGHTS',
            description: 'Electronic music for the new generation',
            genres: ['HOUSE', 'ELECTRO', 'SYNTHWAVE'],
            location: 'LONDON, UK',
            founded_year: 2020,
            artists_count: 8,
            events_count: 16,
            recent_artists: [
              { id: '4', name: 'CYBER GHOST' },
              { id: '5', name: 'ELECTRIC SOUL' }
            ],
            upcoming_events: []
          },
          {
            id: '3',
            name: 'DEEP FREQUENCY',
            description: 'Deep house and ambient electronic sounds',
            genres: ['DEEP HOUSE', 'AMBIENT', 'DOWNTEMPO'],
            location: 'AMSTERDAM, NL',
            founded_year: 2016,
            artists_count: 15,
            events_count: 32,
            recent_artists: [
              { id: '6', name: 'OCEAN MIND' },
              { id: '7', name: 'FOREST ECHO' },
              { id: '8', name: 'LUNAR PHASE' }
            ],
            upcoming_events: [
              {
                id: '2',
                title: 'DEEP SESSION',
                start_date: '2025-08-20',
                venue: { name: 'WAREHOUSE 23', location: 'AMSTERDAM' }
              }
            ]
          }
        ]
        
        setLabels(mockLabels)
      } catch (error) {
        console.error('Error fetching labels:', error)
        setError('Network error loading labels')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLabels()
  }, [])

  const filteredLabels = labels.filter(label => {
    if (filter === 'local') return label.location?.includes('US') || label.location?.includes('CA')
    if (filter === 'international') return !label.location?.includes('US') && !label.location?.includes('CA')
    return true
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <ClassicLoader />
          <p className="text-white/80 font-bold tracking-wider uppercase text-center">
            LOADING LABELS & COLLECTIVES...
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
            <Music className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-wider uppercase">
              LABELS & COLLECTIVES
            </h1>
          </div>
          <p className="text-white/70 text-lg font-medium max-w-2xl">
            DISCOVER ELECTRONIC MUSIC LABELS PUSHING THE BOUNDARIES OF SOUND
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex gap-4 border-b border-white/10 pb-4">
            {[
              { key: 'all', label: 'ALL LABELS' },
              { key: 'local', label: 'LOCAL' },
              { key: 'international', label: 'INTERNATIONAL' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-6 py-3 font-bold tracking-wider uppercase text-sm transition-all duration-300 ${
                  filter === tab.key 
                    ? 'text-white border-b-2 border-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Labels Grid */}
        {filteredLabels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredLabels.map((label, index) => (
              <motion.div
                key={label.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group">
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold tracking-wider uppercase text-white group-hover:text-white/90 transition-colors mb-2">
                          {label.name}
                        </h3>
                        {label.location && (
                          <p className="text-white/60 text-sm font-bold tracking-wider uppercase">
                            {label.location} • EST. {label.founded_year}
                          </p>
                        )}
                      </div>
                      {label.logo_url && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/10">
                          <Image
                            src={label.logo_url}
                            alt={`${label.name} logo`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {label.description && (
                      <p className="text-white/70 text-sm font-medium mb-6 leading-relaxed">
                        {label.description}
                      </p>
                    )}

                    {/* Genres */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {label.genres.map((genre) => (
                          <span 
                            key={genre}
                            className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-white/80 border border-white/20"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-white/60" />
                          <span className="text-white/60 text-xs font-bold tracking-wider uppercase">
                            ARTISTS
                          </span>
                        </div>
                        <div className="text-xl font-bold text-white">
                          {label.artists_count}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-white/60" />
                          <span className="text-white/60 text-xs font-bold tracking-wider uppercase">
                            EVENTS
                          </span>
                        </div>
                        <div className="text-xl font-bold text-white">
                          {label.events_count}
                        </div>
                      </div>
                    </div>

                    {/* Recent Artists */}
                    {label.recent_artists.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-3">
                          RECENT ARTISTS
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {label.recent_artists.map((artist) => (
                            <Link 
                              key={artist.id} 
                              href={`/artist/${artist.id}`}
                              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-sm font-bold tracking-wider uppercase text-white/80 hover:text-white transition-all duration-200"
                            >
                              {artist.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming Events */}
                    {label.upcoming_events.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-3">
                          UPCOMING EVENTS
                        </h4>
                        <div className="space-y-2">
                          {label.upcoming_events.map((event) => (
                            <Link 
                              key={event.id}
                              href={`/event/${event.id}`}
                              className="block bg-white/5 hover:bg-white/10 p-3 rounded border border-white/10 hover:border-white/20 transition-all duration-200"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-sm font-bold tracking-wider uppercase text-white">
                                    {event.title}
                                  </div>
                                  <div className="text-xs text-white/60 font-bold tracking-wider uppercase">
                                    {event.venue.name} • {new Date(event.start_date).toLocaleDateString()}
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/40" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    {label.social_links && (
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex gap-3">
                          {Object.entries(label.social_links).map(([platform, url]) => (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-bold tracking-wider uppercase transition-colors duration-200"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {platform}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
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
              NO LABELS FOUND
            </h2>
            <p className="text-white/40 max-w-md mx-auto mb-8">
              Try adjusting your filter or check back as we add more labels to our platform
            </p>
            <button 
              onClick={() => setFilter('all')}
              className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200"
            >
              VIEW ALL LABELS
            </button>
          </motion.div>
        )}

        {/* Call to Action */}
        {filteredLabels.length > 0 && (
          <motion.div 
            className="text-center mt-16 pt-12 border-t border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold tracking-wider uppercase text-white mb-4">
              ARE YOU A LABEL?
            </h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Join our platform and showcase your artists and events to the underground community
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/verification">
                <button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                  REGISTER LABEL
                </button>
              </Link>
              <Link href="/artists">
                <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200">
                  VIEW ARTISTS
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}