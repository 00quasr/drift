'use client'

import { useState, useEffect } from 'react'
import { Search, Star, Users, SlidersHorizontal, Music } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getArtists } from '@/lib/services/artists'
import { getListFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'
import Image from 'next/image'
import Link from 'next/link'

export default function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [showTopRated, setShowTopRated] = useState(false)
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

  // Get unique genres for filters
  const allGenres = Array.from(new Set(artists.flatMap(artist => artist.genres || [])))

  // Filter artists based on search and filters
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = !searchTerm || 
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.city?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGenre = selectedGenre === 'all' || 
      artist.genres?.includes(selectedGenre)

    return matchesSearch && matchesGenre
  })

  // Sort by top rated if enabled
  const sortedArtists = showTopRated 
    ? [...filteredArtists].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
    : filteredArtists

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mx-auto"></div>
            <p className="text-zinc-400 mt-4">Loading artists...</p>
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
            Artists
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl">
            Discover electronic music artists and DJs from around the globe
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search artists, genres, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 h-12 text-lg"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Top Rated Toggle */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              <Button
                variant={!showTopRated ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowTopRated(false)}
                className="text-sm"
              >
                All Artists
              </Button>
              <Button
                variant={showTopRated ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowTopRated(true)}
                className="text-sm"
              >
                Top Rated
              </Button>
            </div>

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
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white">
            {showTopRated ? 'Top Rated' : 'All'} Artists ({sortedArtists.length})
          </h2>
        </div>

        {/* Artists Grid */}
        {sortedArtists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-400">No artists found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedArtists.map((artist, index) => {
              return (
                <Link key={artist.id} href={`/artist/${artist.id}`}>
                  <Card className="group bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-all duration-300 overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300 mb-4">
                      <Image
                        src={isValidImageUrl(artist.photo_url || artist.images?.[0]) ? (artist.photo_url || artist.images[0]) : getListFallbackImage('artist', index)}
                        alt={artist.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-full" />
                    </div>

                    {/* Artist Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-center gap-2 text-xs text-white/80 mb-2">
                        {artist.city && artist.country && (
                          <>
                            <span>{artist.city}, {artist.country}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                        {artist.name}
                      </h3>
                      
                      {/* Genre Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {artist.genres?.slice(0, 2).map((genre: string) => (
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