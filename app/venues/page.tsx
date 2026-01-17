'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Users, Star, SlidersHorizontal, Building, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityCard } from '@/components/ui/entity-card'
import { EntityViews } from '@/components/ui/entity-views'
import { ViewSwitcher, ViewMode } from '@/components/ui/view-switcher'
import { H1 } from '@/components/ui/typography'
import { getVenues } from '@/lib/services/venues'
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'
import ClassicLoader from '@/components/ui/loader'

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    async function loadVenues() {
      try {
        const data = await getVenues({ limit: 50 })
        setVenues(data || [])
      } catch (error) {
        console.error('Error loading venues:', error)
        setVenues([])
      } finally {
        setLoading(false)
      }
    }

    loadVenues()
  }, [])

  // Get unique countries and genres for filters
  const allCountries = Array.from(new Set(venues.map(venue => venue.country).filter(Boolean)))
  const allGenres = Array.from(new Set(venues.flatMap(venue => venue.genres || [])))

  // Filter venues based on search and filters
  const filteredVenues = venues.filter(venue => {
    const matchesSearch = !searchTerm || 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCountry = selectedCountry === 'all' || venue.country === selectedCountry
    const matchesGenre = selectedGenre === 'all' || venue.genres?.includes(selectedGenre)

    return matchesSearch && matchesCountry && matchesGenre
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <ClassicLoader />
          <p className="text-white/50 font-bold tracking-wider uppercase text-center">
            LOADING VENUES...
          </p>
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
                VENUES
              </H1>
              <p className="text-white/50 text-sm lg:text-base font-medium max-w-2xl tracking-wider uppercase">
                FROM UNDERGROUND WAREHOUSES TO ICONIC CLUBS, EXPLORE THE VENUES THAT DEFINE ELECTRONIC MUSIC
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

      {/* Search and Filters Section */}
      <section className="w-full pb-8 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="SEARCH VENUES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-6 pr-6 py-4 bg-black border border-white/20 text-white placeholder-white/40 focus:border-white/40 transition-colors duration-200 h-14 text-sm font-bold tracking-wider uppercase"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setFiltersOpen(!filtersOpen)}
              variant="outline"
              className="border border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-bold tracking-wider uppercase px-6 h-14"
            >
              FILTERS
            </Button>
          </div>

          {/* Expandable Filters */}
          {filtersOpen && (
            <div className="bg-white/5 border border-white/10 p-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Country Filter */}
                <div>
                  <label className="block text-white/50 font-bold tracking-widest uppercase text-xs mb-3">
                    COUNTRY
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-black border border-white/20 text-white font-bold tracking-wider uppercase text-sm px-4 py-3 focus:border-white/40 transition-colors"
                  >
                    <option value="all">ALL COUNTRIES</option>
                    {allCountries.map(country => (
                      <option key={country} value={country}>{country.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Genre Filter */}
                <div>
                  <label className="block text-white/50 font-bold tracking-widest uppercase text-xs mb-3">
                    GENRE
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-black border border-white/20 text-white font-bold tracking-wider uppercase text-sm px-4 py-3 focus:border-white/40 transition-colors"
                  >
                    <option value="all">ALL GENRES</option>
                    {allGenres.map(genre => (
                      <option key={genre} value={genre}>{genre.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-white/50 font-bold tracking-widest uppercase text-xs">
                  {filteredVenues.length} VENUES FOUND
                </p>
                <Button
                  onClick={() => {
                    setSelectedCountry('all')
                    setSelectedGenre('all')
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase text-xs px-6"
                >
                  CLEAR ALL
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Venues Grid Section */}
      <section className="w-full py-16 lg:py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-white/50 font-bold tracking-widest uppercase text-xs mb-4 block">DISCOVER</span>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                ALL VENUES
              </h2>
            </div>
            <ViewSwitcher
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* Venues Views */}
          <EntityViews
            entities={filteredVenues.map(venue => ({
              ...venue,
              name: venue.name
            }))}
            viewMode={viewMode}
            entityType="venue"
            emptyMessage="NO VENUES FOUND - TRY ADJUSTING YOUR SEARCH OR FILTERS"
          />
        </div>
      </section>
    </div>
  )
} 