'use client'

import { useState, useEffect } from 'react'
import { Search, Music, Star, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityBento, EntityBentoGrid } from '@/components/ui/entity-bento'
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
      case 'reviews':
        return (b.review_count || 0) - (a.review_count || 0)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading artists...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium text-white mb-4">
            Electronic Music Artists
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Discover talented DJs and producers shaping the electronic music scene
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search artists, genres, bios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-slate-900/50 border-slate-800 text-white placeholder-slate-400 focus:border-slate-600 h-12"
              />
            </div>

            {/* Toggle Filters */}
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 h-12 px-6"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {filtersOpen && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Genre
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-slate-600 focus:outline-none"
                  >
                    <option value="all">All Genres</option>
                    {allGenres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-slate-600 focus:outline-none"
                  >
                    <option value="all">All Countries</option>
                    {allCountries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-800 border border-slate-700 rounded-md text-white focus:border-slate-600 focus:outline-none"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most Reviewed</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-white">
              Artists
            </h2>
            <p className="text-slate-400">
              {filteredArtists.length} artist{filteredArtists.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Artists Grid */}
        {filteredArtists.length > 0 ? (
          <EntityBentoGrid>
            {filteredArtists.map((artist) => (
              <EntityBento
                key={artist.id}
                type="artist"
                id={artist.id}
                name={artist.name}
                description={artist.bio || `Discover the music of ${artist.name}`}
                href={`/artist/${artist.id}`}
                imageUrl={artist.images && Array.isArray(artist.images) && artist.images.length > 0 ? artist.images[0] : getFallbackImage('artist', artist.id)}
                bio={artist.bio}
                city={artist.city}
                country={artist.country}
                genres={artist.genres || []}
                rating={artist.average_rating}
                reviewCount={artist.review_count}
              />
            ))}
          </EntityBentoGrid>
        ) : (
          <div className="text-center py-16">
            <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No artists found
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              {searchTerm || selectedGenre !== 'all' || selectedCountry !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'No artists available at the moment'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 