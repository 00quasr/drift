'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Users, Star, SlidersHorizontal } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getVenues } from '@/lib/services/venues'
import { getListFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'
import Image from 'next/image'
import Link from 'next/link'

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    async function loadVenues() {
      try {
        const data = await getVenues()
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

  // Get unique genres and cities for filters
  const allGenres = Array.from(new Set(venues.flatMap(venue => venue.genres || [])))
  const allCities = Array.from(new Set(venues.map(venue => venue.city).filter(Boolean)))

  // Filter venues based on search and filters
  const filteredVenues = venues.filter(venue => {
    const matchesSearch = !searchTerm || 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGenre = selectedGenre === 'all' || 
      venue.genres?.includes(selectedGenre)
    
    const matchesCity = selectedCity === 'all' || 
      venue.city === selectedCity

    return matchesSearch && matchesGenre && matchesCity
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mx-auto"></div>
            <p className="text-zinc-400 mt-4">Loading venues...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Venues
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl">
            Discover electronic music venues and clubs from around the globe
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search venues, cities, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 h-12 text-lg"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>

            {filtersOpen && (
              <div className="flex flex-wrap gap-4 w-full">
                {/* Genre Filter */}
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                >
                  <option value="all">All Genres</option>
                  {allGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>

                {/* City Filter */}
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                >
                  <option value="all">All Cities</option>
                  {allCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white">
            All Venues ({filteredVenues.length})
          </h2>
        </div>

        {/* Venues Grid */}
        {filteredVenues.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-400">No venues found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVenues.map((venue, index) => {
              return (
                <Link key={venue.id} href={`/venue/${venue.id}`}>
                  <Card className="group bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-all duration-300 overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-pink-900/20 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={isValidImageUrl(venue.images?.[0]) ? venue.images[0] : getListFallbackImage('venue', index)}
                        alt={venue.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    {/* Venue Info */}
                    <div className="p-4 text-white">
                      <div className="flex items-center gap-2 text-xs text-zinc-300 mb-2">
                        <MapPin className="w-3 h-3" />
                        {venue.city}, {venue.country}
                        {venue.capacity && (
                          <>
                            <span>•</span>
                            <Users className="w-3 h-3" />
                            {venue.capacity}
                          </>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-white">
                        {venue.name}
                      </h3>
                      
                      {/* Genre Tags */}
                      <div className="flex flex-wrap gap-1">
                        {venue.genres?.slice(0, 2).map((genre: string) => (
                          <Badge 
                            key={genre} 
                            variant="secondary" 
                            className="text-xs bg-white/20 text-white border-none"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 