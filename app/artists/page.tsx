'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityViews } from '@/components/ui/entity-views'
import { ViewSwitcher, ViewMode } from '@/components/ui/view-switcher'
import { H1, H2 } from '@/components/ui/typography'
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
    return null
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
                ARTISTS
              </H1>
              <p className="text-white/50 text-sm lg:text-base font-medium max-w-2xl tracking-wider uppercase">
                FROM RISING STARS TO LEGENDARY DJS, EXPLORE THE ARTISTS SHAPING ELECTRONIC MUSIC
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
                placeholder="SEARCH ARTISTS..."
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
                {/* Genre Filter */}
                <div>
                  <label className="block text-white/50 font-bold tracking-widest uppercase text-xs mb-3">
                    GENRE
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-black border border-white/20 text-white font-bold tracking-wider uppercase text-xs px-4 py-3 focus:border-white/40 transition-colors"
                  >
                    <option value="all">ALL GENRES</option>
                    {allGenres.map(genre => (
                      <option key={genre} value={genre}>{genre.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Country Filter */}
                <div>
                  <label className="block text-white/50 font-bold tracking-widest uppercase text-xs mb-3">
                    COUNTRY
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-black border border-white/20 text-white font-bold tracking-wider uppercase text-xs px-4 py-3 focus:border-white/40 transition-colors"
                  >
                    <option value="all">ALL COUNTRIES</option>
                    {allCountries.map(country => (
                      <option key={country} value={country}>{country.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-white/50 font-bold tracking-widest uppercase text-xs mb-3">
                    SORT BY
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-black border border-white/20 text-white font-bold tracking-wider uppercase text-xs px-4 py-3 focus:border-white/40 transition-colors"
                  >
                    <option value="name">NAME (A-Z)</option>
                    <option value="rating">HIGHEST RATED</option>
                    <option value="popularity">MOST POPULAR</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-white/40 font-bold tracking-widest uppercase text-xs">
                  {filteredArtists.length} ARTISTS FOUND
                </p>
                <Button
                  onClick={() => {
                    setSelectedGenre('all')
                    setSelectedCountry('all')
                    setSortBy('name')
                  }}
                  variant="outline"
                  className="border-white/20 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/40 font-bold tracking-wider uppercase text-xs px-6"
                >
                  CLEAR ALL
                </Button>
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
                DISCOVER
              </span>
              <H2 variant="display" className="text-white">
                ALL ARTISTS
              </H2>
            </div>
            <ViewSwitcher
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* Artists Views */}
          <EntityViews
            entities={filteredArtists.map(artist => ({
              ...artist,
              name: artist.name
            }))}
            viewMode={viewMode}
            entityType="artist"
            emptyMessage="NO ARTISTS FOUND - TRY ADJUSTING YOUR SEARCH OR FILTERS"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 lg:py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <H2 variant="display" className="mb-4 text-white">
              ARE YOU AN ARTIST?
            </H2>
            <p className="text-white/40 mb-8 max-w-md mx-auto text-sm tracking-wider uppercase">
              Join Drift and connect with venues, promoters, and fans in the electronic music scene
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/verification">
                <button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs">
                  JOIN AS ARTIST
                </button>
              </a>
              <a href="/events">
                <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs">
                  FIND EVENTS
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
