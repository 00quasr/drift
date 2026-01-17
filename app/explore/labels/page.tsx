"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { H1, H2, H3, H4 } from '@/components/ui/typography'
import Link from 'next/link'
import Image from 'next/image'

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
    return <div className="min-h-screen bg-neutral-950" />
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
                LABELS & COLLECTIVES
              </H1>
              <p className="text-white/50 text-sm lg:text-base font-medium max-w-2xl tracking-wider uppercase">
                DISCOVER ELECTRONIC MUSIC LABELS PUSHING THE BOUNDARIES OF SOUND
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex gap-4">
              {[
                { key: 'all', label: 'ALL LABELS' },
                { key: 'local', label: 'LOCAL' },
                { key: 'international', label: 'INTERNATIONAL' }
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
          </motion.div>
        </div>
      </section>

      {/* Labels Grid Section */}
      <section className="w-full py-16 lg:py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">

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
                        <H3 variant="display" className="mb-2 text-white group-hover:text-white/90 transition-colors">
                          {label.name}
                        </H3>
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
                      <div className="bg-white/5 p-4 border border-white/10">
                        <span className="text-white/50 text-xs font-bold tracking-widest uppercase block mb-2">
                          ARTISTS
                        </span>
                        <div className="text-xl font-bold text-white">
                          {label.artists_count}
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 border border-white/10">
                        <span className="text-white/50 text-xs font-bold tracking-widest uppercase block mb-2">
                          EVENTS
                        </span>
                        <div className="text-xl font-bold text-white">
                          {label.events_count}
                        </div>
                      </div>
                    </div>

                    {/* Recent Artists */}
                    {label.recent_artists.length > 0 && (
                      <div className="mb-6">
                        <H4 variant="display" className="text-white/60 text-xs mb-3">
                          RECENT ARTISTS
                        </H4>
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
                        <span className="text-white/50 text-xs font-bold tracking-widest uppercase block mb-3">
                          UPCOMING EVENTS
                        </span>
                        <div className="space-y-2">
                          {label.upcoming_events.map((event) => (
                            <Link
                              key={event.id}
                              href={`/event/${event.id}`}
                              className="block bg-white/5 hover:bg-white/10 p-3 border border-white/10 hover:border-white/20 transition-all duration-200"
                            >
                              <div className="text-sm font-bold tracking-wider uppercase text-white">
                                {event.title}
                              </div>
                              <div className="text-xs text-white/50 font-bold tracking-wider uppercase">
                                {event.venue.name} • {new Date(event.start_date).toLocaleDateString()}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    {label.social_links && (
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex gap-4">
                          {Object.entries(label.social_links).map(([platform, url]) => (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/50 hover:text-white text-xs font-bold tracking-wider uppercase transition-colors duration-200"
                            >
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
            <H2 variant="display" className="mb-4 text-white/60">
              NO LABELS FOUND
            </H2>
            <p className="text-white/40 max-w-md mx-auto mb-8 text-sm tracking-wider uppercase">
              Try adjusting your filter or check back as we add more labels to our platform
            </p>
            <button
              onClick={() => setFilter('all')}
              className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs"
            >
              VIEW ALL LABELS
            </button>
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
              ARE YOU A LABEL?
            </H2>
            <p className="text-white/40 mb-8 max-w-md mx-auto text-sm tracking-wider uppercase">
              Join our platform and showcase your artists and events to the underground community
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/verification">
                <button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs">
                  REGISTER LABEL
                </button>
              </Link>
              <Link href="/artists">
                <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs">
                  VIEW ARTISTS
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}