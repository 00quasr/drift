'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { H1, H2 } from '@/components/ui/typography'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface TrendingData {
  venues: any[]
  events: any[]
  artists: any[]
}

const allVenueColumns = [
  'Venue',
  'Location',
  'Capacity',
  'Genres', 
  'Rating',
  'Reviews',
] as const

const allEventColumns = [
  'Event',
  'Date',
  'Venue',
  'Artists',
  'Price',
  'Reviews',
] as const

const allArtistColumns = [
  'Artist',
  'Origin',
  'Genres',
  'Overall Rating',
  'Reviews',
] as const

export default function TrendingPage() {
  const [data, setData] = useState<TrendingData>({ venues: [], events: [], artists: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Venue filters
  const [visibleVenueColumns, setVisibleVenueColumns] = useState<string[]>([...allVenueColumns])
  const [venueLocationFilter, setVenueLocationFilter] = useState('')
  
  // Event filters
  const [visibleEventColumns, setVisibleEventColumns] = useState<string[]>([...allEventColumns])
  const [eventVenueFilter, setEventVenueFilter] = useState('')
  
  // Artist filters
  const [visibleArtistColumns, setVisibleArtistColumns] = useState<string[]>([...allArtistColumns])
  const [artistGenreFilter, setArtistGenreFilter] = useState('')

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/explore')
        const result = await response.json()
        
        if (result.success) {
          setData({
            venues: result.data.trending_venues || [],
            events: result.data.upcoming_events || [],
            artists: result.data.top_artists || []
          })
        } else {
          setError('Failed to load trending content')
        }
      } catch (error) {
        console.error('Error fetching trending data:', error)
        setError('Network error loading trending content')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingData()
  }, [])

  const toggleVenueColumn = (col: string) => {
    setVisibleVenueColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  const toggleEventColumn = (col: string) => {
    setVisibleEventColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  const toggleArtistColumn = (col: string) => {
    setVisibleArtistColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  if (isLoading) {
    return <div className="min-h-screen bg-neutral-950" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center pt-24">
        <div className="bg-white/5 border border-red-500/30 p-8 max-w-md w-full rounded-xl">
          <div className="text-center space-y-4">
            <p className="text-red-400 font-bold tracking-wider uppercase">
              ERROR: {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 rounded-lg"
            >
              RETRY
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filteredVenues = data.venues.filter((venue) => 
    !venueLocationFilter || venue.city?.toLowerCase().includes(venueLocationFilter.toLowerCase()) ||
    venue.country?.toLowerCase().includes(venueLocationFilter.toLowerCase())
  )

  const filteredEvents = data.events.filter((event) => 
    !eventVenueFilter || event.venue?.name?.toLowerCase().includes(eventVenueFilter.toLowerCase())
  )

  const filteredArtists = data.artists.filter((artist) => 
    !artistGenreFilter || artist.genres?.some((genre: string) => 
      genre.toLowerCase().includes(artistGenreFilter.toLowerCase())
    )
  )

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
                TRENDING
              </H1>
              <p className="text-white/50 text-sm lg:text-base font-medium max-w-2xl tracking-wider uppercase">
                DISCOVER WHAT'S HOT IN THE UNDERGROUND ELECTRONIC MUSIC SCENE
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

      {/* Trending Venues Section */}
      {data.venues.length > 0 && (
        <section className="w-full py-16 lg:py-24 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <span className="text-white/50 font-bold tracking-widest uppercase text-xs mb-4 block">TRENDING</span>
                  <H2 variant="display">VENUES</H2>
                </div>
                <Link
                  href="/venues"
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold tracking-wider uppercase text-xs border border-white/20 hover:border-white/40 px-4 py-2"
                >
                  VIEW ALL →
                </Link>
              </div>

            <div className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/[0.02] shadow-sm overflow-x-auto">
              <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                <div className="flex gap-2 flex-wrap">
                  <Input
                    placeholder="Filter by location..."
                    value={venueLocationFilter}
                    onChange={(e) => setVenueLocationFilter(e.target.value)}
                    className="w-48 bg-white/5 border-white/20 text-white placeholder-white/60"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-black/90 border-white/20">
                    {allVenueColumns.map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col}
                        checked={visibleVenueColumns.includes(col)}
                        onCheckedChange={() => toggleVenueColumn(col)}
                        className="text-white"
                      >
                        {col}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/[0.02]">
                    {visibleVenueColumns.includes('Venue') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">VENUE</TableHead>}
                    {visibleVenueColumns.includes('Location') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">LOCATION</TableHead>}
                    {visibleVenueColumns.includes('Capacity') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">CAPACITY</TableHead>}
                    {visibleVenueColumns.includes('Genres') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">GENRES</TableHead>}
                    {visibleVenueColumns.includes('Rating') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">RATING</TableHead>}
                    {visibleVenueColumns.includes('Overall Score') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">OVERALL SCORE</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVenues.length ? (
                    filteredVenues.slice(0, 10).map((venue) => (
                      <TableRow key={venue.id} className="border-white/5 hover:bg-white/[0.02]">
                        {visibleVenueColumns.includes('Venue') && (
                          <TableCell className="font-medium text-white">
                            <Link href={`/venue/${venue.id}`} className="hover:text-white/80 transition-colors">
                              {venue.name}
                            </Link>
                          </TableCell>
                        )}
                        {visibleVenueColumns.includes('Location') && (
                          <TableCell className="text-white/70">
                            {venue.city}, {venue.country}
                          </TableCell>
                        )}
                        {visibleVenueColumns.includes('Capacity') && (
                          <TableCell className="text-white/70">
                            {venue.capacity ? `${venue.capacity} people` : 'N/A'}
                          </TableCell>
                        )}
                        {visibleVenueColumns.includes('Genres') && (
                          <TableCell className="text-white/70">
                            <div className="flex flex-wrap gap-1">
                              {venue.genres?.slice(0, 2).map((genre: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-white/10 text-white/80">
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        )}
                        {visibleVenueColumns.includes('Rating') && (
                          <TableCell className="text-white/70">
                            {venue.average_rating ? (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                <span className="font-bold">{venue.average_rating.toFixed(1)}</span>
                              </div>
                            ) : (
                              'No rating'
                            )}
                          </TableCell>
                        )}
                        {visibleVenueColumns.includes('Overall Score') && (
                          <TableCell className="text-white/70">
                            {venue.trending_score ? (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                <span className="font-bold">{venue.trending_score.toFixed(1)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span>0.0</span>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={visibleVenueColumns.length} className="text-center py-6 text-white/60">
                        No venues found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </section>
      )}

      {/* Trending Events Section */}
      {data.events.length > 0 && (
        <section className="w-full py-16 lg:py-24 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <span className="text-white/50 font-bold tracking-widest uppercase text-xs mb-4 block">UPCOMING</span>
                  <H2 variant="display">EVENTS</H2>
                </div>
                <Link
                  href="/events"
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold tracking-wider uppercase text-xs border border-white/20 hover:border-white/40 px-4 py-2"
                >
                  VIEW ALL →
                </Link>
              </div>

            <div className="space-y-4 p-4 border border-white/10 bg-white/[0.02] shadow-sm overflow-x-auto">
              <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                <div className="flex gap-2 flex-wrap">
                  <Input
                    placeholder="Filter by venue..."
                    value={eventVenueFilter}
                    onChange={(e) => setEventVenueFilter(e.target.value)}
                    className="w-48 bg-white/5 border-white/20 text-white placeholder-white/60"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-black/90 border-white/20">
                    {allEventColumns.map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col}
                        checked={visibleEventColumns.includes(col)}
                        onCheckedChange={() => toggleEventColumn(col)}
                        className="text-white"
                      >
                        {col}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/[0.02]">
                    {visibleEventColumns.includes('Event') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">EVENT</TableHead>}
                    {visibleEventColumns.includes('Date') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">DATE</TableHead>}
                    {visibleEventColumns.includes('Venue') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">VENUE</TableHead>}
                    {visibleEventColumns.includes('Artists') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">ARTISTS</TableHead>}
                    {visibleEventColumns.includes('Price') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">PRICE</TableHead>}
                    {visibleEventColumns.includes('Rating') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">RATING</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length ? (
                    filteredEvents.slice(0, 10).map((event) => (
                      <TableRow key={event.id} className="border-white/5 hover:bg-white/[0.02]">
                        {visibleEventColumns.includes('Event') && (
                          <TableCell className="font-medium text-white">
                            <Link href={`/event/${event.id}`} className="hover:text-white/80 transition-colors">
                              {event.title}
                            </Link>
                          </TableCell>
                        )}
                        {visibleEventColumns.includes('Date') && (
                          <TableCell className="text-white/70">
                            {new Date(event.start_date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                        )}
                        {visibleEventColumns.includes('Venue') && (
                          <TableCell className="text-white/70">
                            {event.venue?.name || 'TBA'}
                          </TableCell>
                        )}
                        {visibleEventColumns.includes('Artists') && (
                          <TableCell className="text-white/70">
                            <div className="flex -space-x-2 max-w-[120px]">
                              <TooltipProvider>
                                {event.artists?.slice(0, 3).map((artist: any, idx: number) => (
                                  <Tooltip key={idx}>
                                    <TooltipTrigger asChild>
                                      <Avatar className="h-6 w-6 ring-2 ring-black hover:z-10">
                                        <AvatarImage 
                                          src={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.png`} 
                                          alt={artist.name} 
                                        />
                                        <AvatarFallback className="bg-white/10 text-white text-xs">
                                          {artist.name?.[0] || 'A'}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black/90 border-white/20">
                                      <p className="font-semibold text-white">{artist.name}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </TooltipProvider>
                              {event.artists?.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                                  +{event.artists.length - 3}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {visibleEventColumns.includes('Price') && (
                          <TableCell className="text-white/70">
                            {event.ticket_price_min && event.ticket_price_max 
                              ? `€${event.ticket_price_min}-${event.ticket_price_max}`
                              : 'TBA'
                            }
                          </TableCell>
                        )}
                        {visibleEventColumns.includes('Rating') && (
                          <TableCell className="text-white/70">
                            {event.average_rating ? (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                <span className="font-bold">{event.average_rating.toFixed(1)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span>No rating</span>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={visibleEventColumns.length} className="text-center py-6 text-white/60">
                        No events found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </section>
      )}

      {/* Top Rated Artists Section */}
      {data.artists.length > 0 && (
        <section className="w-full py-16 lg:py-24 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <span className="text-white/50 font-bold tracking-widest uppercase text-xs mb-4 block">TOP RATED</span>
                  <H2 variant="display">ARTISTS</H2>
                </div>
                <Link
                  href="/artists"
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold tracking-wider uppercase text-xs border border-white/20 hover:border-white/40 px-4 py-2"
                >
                  VIEW ALL →
                </Link>
              </div>

            <div className="space-y-4 p-4 border border-white/10 bg-white/[0.02] shadow-sm overflow-x-auto">
              <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                <div className="flex gap-2 flex-wrap">
                  <Input
                    placeholder="Filter by genre..."
                    value={artistGenreFilter}
                    onChange={(e) => setArtistGenreFilter(e.target.value)}
                    className="w-48 bg-white/5 border-white/20 text-white placeholder-white/60"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-black/90 border-white/20">
                    {allArtistColumns.map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col}
                        checked={visibleArtistColumns.includes(col)}
                        onCheckedChange={() => toggleArtistColumn(col)}
                        className="text-white"
                      >
                        {col}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/[0.02]">
                    {visibleArtistColumns.includes('Artist') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">ARTIST</TableHead>}
                    {visibleArtistColumns.includes('Origin') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">ORIGIN</TableHead>}
                    {visibleArtistColumns.includes('Genres') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">GENRES</TableHead>}
                    {visibleArtistColumns.includes('Overall Rating') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">OVERALL RATING</TableHead>}
                    {visibleArtistColumns.includes('Reviews') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">REVIEWS</TableHead>}
                    {visibleArtistColumns.includes('Overall Score') && <TableHead className="text-white/80 font-bold tracking-wider uppercase">OVERALL SCORE</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArtists.length ? (
                    filteredArtists.slice(0, 10).map((artist) => (
                      <TableRow key={artist.id} className="border-white/5 hover:bg-white/[0.02]">
                        {visibleArtistColumns.includes('Artist') && (
                          <TableCell className="font-medium text-white">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage 
                                  src={artist.images?.[0] || `https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.png`} 
                                  alt={artist.name} 
                                />
                                <AvatarFallback className="bg-white/10 text-white text-xs">
                                  {artist.name?.[0] || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <Link href={`/artist/${artist.id}`} className="hover:text-white/80 transition-colors">
                                {artist.name}
                              </Link>
                            </div>
                          </TableCell>
                        )}
                        {visibleArtistColumns.includes('Origin') && (
                          <TableCell className="text-white/70">
                            {artist.city && artist.country ? `${artist.city}, ${artist.country}` : 'Unknown'}
                          </TableCell>
                        )}
                        {visibleArtistColumns.includes('Genres') && (
                          <TableCell className="text-white/70">
                            <div className="flex flex-wrap gap-1">
                              {artist.genres?.slice(0, 2).map((genre: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-white/10 text-white/80">
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        )}
                        {visibleArtistColumns.includes('Overall Rating') && (
                          <TableCell className="text-white/70">
                            {artist.average_rating ? (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                <span className="font-bold">{artist.average_rating.toFixed(1)}</span>
                                <span className="text-xs text-white/50">/ 5.0</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span>No score</span>
                              </div>
                            )}
                          </TableCell>
                        )}
                        {visibleArtistColumns.includes('Reviews') && (
                          <TableCell className="text-white/70">
                            {artist.review_count || 0} reviews
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={visibleArtistColumns.length} className="text-center py-6 text-white/60">
                        No artists found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </section>
      )}

      {/* Empty State */}
      {data.venues.length === 0 && data.events.length === 0 && data.artists.length === 0 && (
        <section className="w-full py-16 lg:py-24 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <H2 variant="display" className="mb-4 text-white/60">
                NO TRENDING CONTENT YET
              </H2>
              <p className="text-white/40 max-w-md mx-auto text-sm tracking-wider uppercase">
                Check back soon as the community grows and trending content emerges
              </p>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}