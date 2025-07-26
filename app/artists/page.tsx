'use client'

import { useState, useEffect } from 'react'
import { Search, Music, Star, SlidersHorizontal, Mic, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityCard } from '@/components/ui/entity-card'
import { EntityViews } from '@/components/ui/entity-views'
import { ViewSwitcher, ViewMode } from '@/components/ui/view-switcher'
import { getArtists } from '@/lib/services/artists'
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'

export default function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    async function loadArtists() {
      try {
        const data = await getArtists({ limit: 50 })
        setArtists(data || [])
      } catch (error) {
        console.error('Error loading artists:', error)
        setArtists([])
      } finally {
        setLoading(false)
      }
    }

    loadArtists()
  }, [])

  // Get unique genres and countries for filters
  const allGenres = Array.from(new Set(artists.flatMap(artist => artist.genres || [])))
  const allCountries = Array.from(new Set(artists.map(artist => artist.country).filter(Boolean)))

  // Filter and sort artists
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = !searchTerm || 
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGenre = selectedGenre === 'all' || artist.genres?.includes(selectedGenre)
    const matchesCountry = selectedCountry === 'all' || artist.country === selectedCountry

    return matchesSearch && matchesGenre && matchesCountry
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        return (b.average_rating || 0) - (a.average_rating || 0)
      case 'popularity':
        return (b.review_count || 0) - (a.review_count || 0)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-white border-2 border-white mx-auto mb-8 relative">
              <div className="absolute inset-2 bg-black" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-white animate-pulse" />
              </div>
            </div>
            <p className="text-white/80 font-bold tracking-widest uppercase text-sm">LOADING ARTISTS...</p>
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
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-widest uppercase mb-6">
            DISCOVER ARTISTS
          </h1>
          <p className="text-white/80 text-lg max-w-3xl mx-auto font-medium tracking-wider uppercase">
            FROM RISING STARS TO LEGENDARY DJS, EXPLORE THE ARTISTS SHAPING ELECTRONIC MUSIC CULTURE ACROSS THE GLOBE
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
                placeholder="SEARCH ARTISTS..."
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* Sort Filter */}
                <div>
                  <label className="block text-white font-bold tracking-widest uppercase text-sm mb-3">
                    SORT BY
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-black border-2 border-white/30 text-white font-bold tracking-wider uppercase text-sm px-4 py-3 focus:border-white transition-colors"
                  >
                    <option value="name">NAME (A-Z)</option>
                    <option value="rating">HIGHEST RATED</option>
                    <option value="popularity">MOST POPULAR</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-white/60 font-bold tracking-widest uppercase text-sm">
                  {filteredArtists.length} ARTISTS FOUND
                </p>
                <Button
                  onClick={() => {
                    setSelectedGenre('all')
                    setSelectedCountry('all')
                    setSortBy('name')
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
              ARTISTS
            </h2>
            <ViewSwitcher 
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>

        {/* Artists Views */}
        <EntityViews
          entities={filteredArtists.map(artist => ({
            ...artist,
            name: artist.name
            // Let EntityViews handle image fallback logic
          }))}
          viewMode={viewMode}
          entityType="artist"
          emptyMessage="NO ARTISTS FOUND - TRY ADJUSTING YOUR SEARCH OR FILTERS"
        />
      </div>
    </div>
  )
} 