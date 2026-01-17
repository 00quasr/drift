'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityCard } from '@/components/ui/entity-card'
import { EntityViews } from '@/components/ui/entity-views'
import { ViewSwitcher, ViewMode } from '@/components/ui/view-switcher'
import { H1, H2, H3 } from '@/components/ui/typography'
import { getEvents } from '@/lib/services/events'
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'
import ClassicLoader from '@/components/ui/loader'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [showUpcoming, setShowUpcoming] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents({ limit: 50 })
        setEvents(data || [])
      } catch (error) {
        console.error('Error loading events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  // Get unique genres for filters
  const allGenres = Array.from(new Set(events.flatMap(event => event.genres || [])))

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGenre = selectedGenre === 'all' ||
      event.genres?.includes(selectedGenre)

    const isUpcoming = new Date(event.start_date) > new Date()
    const matchesTimeFilter = showUpcoming ? isUpcoming : !isUpcoming

    return matchesSearch && matchesGenre && matchesTimeFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-32">
            <div className="mb-8 flex justify-center">
              <ClassicLoader />
            </div>
            <p className="text-white/50 font-bold tracking-widest uppercase text-sm">LOADING EVENTS...</p>
          </div>
        </div>
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
                EVENTS
              </H1>
              <p className="text-white/50 text-sm lg:text-base font-medium max-w-2xl tracking-wider uppercase">
                DISCOVER THE HOTTEST ELECTRONIC MUSIC EVENTS HAPPENING AROUND THE WORLD
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
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="SEARCH EVENTS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 bg-neutral-950 border border-white/20 text-white placeholder-white/40 focus:border-white/40 transition-colors duration-200 h-12 text-sm font-bold tracking-wider uppercase"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setFiltersOpen(!filtersOpen)}
              variant="outline"
              className="border border-white/20 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/40 font-bold tracking-wider uppercase px-6 h-12 text-xs"
            >
              FILTERS
            </Button>
          </div>

          {/* Expandable Filters */}
          {filtersOpen && (
            <div className="bg-black/50 border border-white/10 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Time Filter */}
                <div>
                  <label className="block text-white/50 font-bold tracking-widest uppercase text-xs mb-3">
                    TIME
                  </label>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowUpcoming(true)}
                      variant={showUpcoming ? 'default' : 'outline'}
                      className={`flex-1 font-bold tracking-wider uppercase text-xs ${
                        showUpcoming
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'border-white/20 text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      UPCOMING
                    </Button>
                    <Button
                      onClick={() => setShowUpcoming(false)}
                      variant={!showUpcoming ? 'default' : 'outline'}
                      className={`flex-1 font-bold tracking-wider uppercase text-xs ${
                        !showUpcoming
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'border-white/20 text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      PAST
                    </Button>
                  </div>
                </div>

                {/* Genre Filter */}
                <div>
                  <label className="block text-white/50 font-bold tracking-widest uppercase text-xs mb-3">
                    GENRE
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-white/40 transition-colors duration-200 font-bold tracking-wider uppercase text-xs"
                  >
                    <option value="all">ALL GENRES</option>
                    {allGenres.map((genre) => (
                      <option key={genre} value={genre}>{genre.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedGenre('all')
                      setShowUpcoming(true)
                    }}
                    variant="outline"
                    className="w-full border-white/20 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/40 font-bold tracking-wider uppercase text-xs"
                  >
                    CLEAR ALL
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="w-full py-16 lg:py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-white/50 font-bold tracking-widest uppercase text-xs mb-4 block">
                {showUpcoming ? 'UPCOMING' : 'ARCHIVE'}
              </span>
              <H2 variant="display" className="text-white">
                {showUpcoming ? 'EVENTS' : 'PAST EVENTS'}
              </H2>
            </div>
            <ViewSwitcher
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* Events Views */}
          {filteredEvents.length > 0 ? (
            <EntityViews
              entities={filteredEvents.map(event => ({
                ...event,
                name: event.title,
                title: event.title,
                start_date: event.start_date,
                artist: event.artists?.[0]?.name || 'Various Artists',
                venue: event.venue?.name || 'TBA',
                city: event.venue?.city,
                country: event.venue?.country
              }))}
              viewMode={viewMode}
              entityType="event"
            />
          ) : (
            <div className="text-center py-32">
              <H3 variant="display" className="mb-4 text-white/60">
                NO EVENTS FOUND
              </H3>
              <p className="text-white/40 max-w-md mx-auto font-medium tracking-wider uppercase text-sm">
                {searchTerm || selectedGenre !== 'all'
                  ? 'TRY ADJUSTING YOUR SEARCH CRITERIA OR FILTERS'
                  : 'NO EVENTS AVAILABLE AT THE MOMENT'
                }
              </p>
              {(searchTerm || selectedGenre !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedGenre('all')
                  }}
                  className="mt-6 bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase px-8 text-xs"
                >
                  CLEAR FILTERS
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 lg:py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <H2 variant="display" className="mb-4 text-white">
              HOSTING AN EVENT?
            </H2>
            <p className="text-white/40 mb-8 max-w-md mx-auto text-sm tracking-wider uppercase">
              List your event on Drift and reach thousands of electronic music fans
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/events/create">
                <button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs">
                  CREATE EVENT
                </button>
              </a>
              <a href="/venues">
                <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs">
                  FIND VENUES
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 