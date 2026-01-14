'use client'

import { useState, useEffect } from 'react'
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
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-32">
            <div className="mb-8 flex justify-center">
              <ClassicLoader />
            </div>
            <p className="text-white/80 font-bold tracking-widest uppercase text-sm">LOADING VENUES...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <H1 variant="display" className="text-5xl md:text-7xl mb-6 text-white">
            DISCOVER VENUES
          </H1>
          <p className="text-white/80 text-lg max-w-3xl mx-auto font-medium tracking-wider uppercase">
            FROM UNDERGROUND WAREHOUSES TO ICONIC CLUBS, EXPLORE THE VENUES THAT DEFINE ELECTRONIC MUSIC CULTURE WORLDWIDE
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white w-6 h-6" />
              <Input
                type="text"
                placeholder="SEARCH VENUES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                                  className="pl-16 pr-6 py-4 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-white transition-colors duration-200 h-14 text-lg font-bold tracking-wider uppercase"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setFiltersOpen(!filtersOpen)}
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/60 font-bold tracking-wider uppercase px-6 h-14"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              FILTERS
            </Button>
          </div>

          {/* Expandable Filters */}
          {filtersOpen && (
            <div className="bg-white/5 border border-white/20 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Country Filter */}
                <div>
                  <label className="block text-white font-bold tracking-widest uppercase text-sm mb-3">
                    COUNTRY
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-black border-2 border-white/30 text-white font-bold tracking-wider uppercase text-sm px-4 py-3 focus:border-white transition-colors"
                  >
                    <option value="all">ALL COUNTRIES</option>
                    {allCountries.map(country => (
                      <option key={country} value={country}>{country.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Genre Filter */}
                <div>
                  <label className="block text-white font-bold tracking-widest uppercase text-sm mb-3">
                    GENRE
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-black border-2 border-white/30 text-white font-bold tracking-wider uppercase text-sm px-4 py-3 focus:border-white transition-colors"
                  >
                    <option value="all">ALL GENRES</option>
                    {allGenres.map(genre => (
                      <option key={genre} value={genre}>{genre.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-white/60 font-bold tracking-widest uppercase text-sm">
                  {filteredVenues.length} VENUES FOUND
                </p>
                <Button
                  onClick={() => {
                    setSelectedCountry('all')
                    setSelectedGenre('all')
                  }}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-bold tracking-wider uppercase text-sm px-6"
                >
                  CLEAR ALL
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold tracking-widest uppercase text-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-white" />
              VENUES
            </h2>
            <ViewSwitcher 
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>

        {/* Venues Views */}
        <EntityViews
          entities={filteredVenues.map(venue => ({
            ...venue,
            name: venue.name
            // Let EntityViews handle image fallback logic
          }))}
          viewMode={viewMode}
          entityType="venue"
          emptyMessage="NO VENUES FOUND - TRY ADJUSTING YOUR SEARCH OR FILTERS"
        />
      </div>
    </div>
  )
} 