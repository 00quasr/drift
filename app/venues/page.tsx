'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Users, Star, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntityBento, EntityBentoGrid } from '@/components/ui/entity-bento'
import { getVenues } from '@/lib/services/venues'
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

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
      <div className="min-h-screen bg-slate-950 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading venues...</p>
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
            Electronic Music Venues
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Explore the world's best clubs and venues for electronic music
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
                placeholder="Search venues, cities, descriptions..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-white">
              Venues
            </h2>
            <p className="text-slate-400">
              {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Venues Grid */}
        {filteredVenues.length > 0 ? (
          <EntityBentoGrid>
            {filteredVenues.map((venue) => (
              <EntityBento
                key={venue.id}
                type="venue"
                id={venue.id}
                name={venue.name}
                description={venue.description || `Experience electronic music at ${venue.name}`}
                href={`/venue/${venue.id}`}
                imageUrl={venue.images && Array.isArray(venue.images) && venue.images.length > 0 ? venue.images[0] : getFallbackImage('venue', venue.id)}
                city={venue.city || 'Unknown'}
                country={venue.country || 'Unknown'}
                capacity={venue.capacity}
                genres={venue.genres || []}
              />
            ))}
          </EntityBentoGrid>
        ) : (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No venues found
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              {searchTerm || selectedCountry !== 'all' || selectedGenre !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'No venues available at the moment'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 