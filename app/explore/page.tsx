'use client'

import { Suspense } from 'react'
import { Search, Zap, Radar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EntityCard } from '@/components/ui/entity-card'
import { getEvents } from '@/lib/services/events'
import { getVenues } from '@/lib/services/venues'
import { getArtists } from '@/lib/services/artists'
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'

const genreTags = ['ALL', 'TECHNO', 'HOUSE', 'TRANCE', 'DRUM & BASS', 'DUBSTEP', 'AMBIENT', 'MINIMAL', 'PROGRESSIVE']

async function ExplorePage() {
  const [events, venues, artists] = await Promise.all([
    getEvents({ limit: 12 }),
    getVenues({ limit: 12 }),
    getArtists({ limit: 12 })
  ])

  // Filter out empty results
  const hasEvents = events && events.length > 0
  const hasVenues = venues && venues.length > 0  
  const hasArtists = artists && artists.length > 0

  // If no data, show loading state
  if (!hasEvents && !hasVenues && !hasArtists) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-white border-2 border-white mx-auto mb-8 relative">
              <div className="absolute inset-2 bg-black" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-cyan-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-widest uppercase mb-4">
              EXPLORE
            </h1>
            <p className="text-white/80 text-lg mb-8 font-medium tracking-wider uppercase">
              DISCOVER THE BEST ELECTRONIC MUSIC EXPERIENCES AROUND THE WORLD
            </p>
            <p className="text-white/60 mt-4 font-bold tracking-widest uppercase text-sm">DISCOVERING AMAZING CONTENT...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Search Header */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-widest uppercase mb-6">
              EXPLORE
            </h1>
            <p className="text-white/80 text-lg font-medium tracking-wider uppercase">
              DISCOVER THE BEST ELECTRONIC MUSIC EXPERIENCES AROUND THE WORLD
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white w-6 h-6" />
            <Input
              type="text"
              placeholder="SEARCH EVENTS, VENUES, ARTISTS..."
                              className="pl-16 pr-6 py-4 bg-black border-2 border-white/30 text-white placeholder-white/60 focus:border-white transition-colors duration-200 h-16 text-lg font-bold tracking-wider uppercase"
            />
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
              <div className="w-3 h-3 bg-white animate-pulse" />
            </div>
          </div>

          {/* Genre Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {genreTags.map((genre) => (
              <Badge
                key={genre}
                variant={genre === 'ALL' ? 'default' : 'secondary'}
                className={`cursor-pointer transition-all duration-200 px-4 py-2 font-bold tracking-wider uppercase ${
                  genre === 'ALL'
                    ? 'bg-white text-black hover:bg-cyan-400 border-2 border-white hover:border-cyan-400'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/30 hover:border-white/60'
                }`}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Featured Content Hero Section */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 bg-white animate-pulse" />
            <span className="text-white/80 font-bold tracking-widest uppercase text-sm">FEATURED</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            {/* Large Featured Event */}
            {hasEvents && (
              <div className="lg:col-span-2 lg:row-span-2">
                <EntityCard
                  type="event"
                  id={events[0].id}
                  title={events[0].title}
                  imageUrl={isValidImageUrl(events[0].flyer_url) ? events[0].flyer_url! : getFallbackImage('event', events[0].id)}
                  category="FEATURED EVENT"
                  href={`/event/${events[0].id}`}
                  artist={events[0].artists?.[0]?.name || 'Various Artists'}
                  date={new Date(events[0].start_date).toLocaleDateString()}
                  time={new Date(events[0].start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  venue={events[0].venue?.name || 'TBA'}
                  location={events[0].venue?.city ? `${events[0].venue.city}, ${events[0].venue.country}` : 'Location TBA'}
                  price={events[0].ticket_price_min && events[0].ticket_price_max ? `€${events[0].ticket_price_min}-${events[0].ticket_price_max}` : undefined}
                  isUpcoming={new Date(events[0].start_date) > new Date()}
                />
              </div>
            )}

            {/* Medium Featured Venue */}
            {hasVenues && (
              <div className="lg:col-span-1">
                <EntityCard
                  type="venue"
                  id={venues[0].id}
                  title={venues[0].name}
                  imageUrl={venues[0].images && Array.isArray(venues[0].images) && venues[0].images.length > 0 ? venues[0].images[0] : getFallbackImage('venue', venues[0].id)}
                  category="HOT VENUE"
                  href={`/venue/${venues[0].id}`}
                  city={venues[0].city || 'Unknown'}
                  country={venues[0].country || 'Unknown'}
                  capacity={venues[0].capacity}
                  genres={venues[0].genres || []}
                />
              </div>
            )}

            {/* Medium Featured Artist */}
            {hasArtists && (
              <div className="lg:col-span-1">
                <EntityCard
                  type="artist"
                  id={artists[0].id}
                  title={artists[0].name}
                  imageUrl={artists[0].images && Array.isArray(artists[0].images) && artists[0].images.length > 0 ? artists[0].images[0] : getFallbackImage('artist', artists[0].id)}
                  category="TOP ARTIST"
                  href={`/artist/${artists[0].id}`}
                  bio={artists[0].bio}
                  city={artists[0].city}
                  country={artists[0].country}
                  genres={artists[0].genres || []}
                  rating={artists[0].average_rating}
                  reviewCount={artists[0].review_count}
                />
              </div>
            )}
          </div>
        </div>

        {/* Events Section */}
        {hasEvents && (
          <section className="mb-24">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-yellow-400 animate-pulse" />
                  <span className="text-yellow-400 font-bold tracking-widest uppercase text-sm">LIVE</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-widest uppercase">
                  UPCOMING EVENTS
                </h2>
              </div>
              <a 
                href="/events" 
                className="text-white/80 hover:text-cyan-400 transition-colors font-bold tracking-wider uppercase text-sm border border-white/30 hover:border-cyan-400/50 px-4 py-2"
              >
                VIEW ALL →
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.slice(1, 9).map((event) => (
                <EntityCard
                  key={event.id}
                  type="event"
                  id={event.id}
                  title={event.title}
                  imageUrl={isValidImageUrl(event.flyer_url) ? event.flyer_url! : getFallbackImage('event', event.id)}
                  category="EVENT"
                  href={`/event/${event.id}`}
                  artist={event.artists?.[0]?.name || 'Various Artists'}
                  date={new Date(event.start_date).toLocaleDateString()}
                  time={new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  venue={event.venue?.name || 'TBA'}
                  location={event.venue?.city ? `${event.venue.city}, ${event.venue.country}` : 'Location TBA'}
                  price={event.ticket_price_min && event.ticket_price_max ? `€${event.ticket_price_min}-${event.ticket_price_max}` : undefined}
                  isUpcoming={new Date(event.start_date) > new Date()}
                />
              ))}
            </div>
          </section>
        )}

        {/* Venues Section */}
        {hasVenues && (
          <section className="mb-24">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-white animate-pulse" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-sm">TRENDING</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-widest uppercase">
                  HOT VENUES
                </h2>
              </div>
              <a 
                href="/venues" 
                className="text-white/80 hover:text-white transition-colors font-bold tracking-wider uppercase text-sm border border-white/30 hover:border-white/50 px-4 py-2"
              >
                VIEW ALL →
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.slice(1, 7).map((venue) => (
                <EntityCard
                  key={venue.id}
                  type="venue"
                  id={venue.id}
                  title={venue.name}
                  imageUrl={venue.images && Array.isArray(venue.images) && venue.images.length > 0 ? venue.images[0] : getFallbackImage('venue', venue.id)}
                  category="VENUE"
                  href={`/venue/${venue.id}`}
                  city={venue.city || 'Unknown'}
                  country={venue.country || 'Unknown'}
                  capacity={venue.capacity}
                  genres={venue.genres || []}
                />
              ))}
            </div>
          </section>
        )}

        {/* Artists Section */}
        {hasArtists && (
          <section>
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-white animate-pulse" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-sm">TOP RATED</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-widest uppercase">
                  FEATURED ARTISTS
                </h2>
              </div>
              <a 
                href="/artists" 
                className="text-white/80 hover:text-white transition-colors font-bold tracking-wider uppercase text-sm border border-white/30 hover:border-white/50 px-4 py-2"
              >
                VIEW ALL →
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {artists.slice(1, 9).map((artist) => (
                <EntityCard
                  key={artist.id}
                  type="artist"
                  id={artist.id}
                  title={artist.name}
                  imageUrl={artist.images && Array.isArray(artist.images) && artist.images.length > 0 ? artist.images[0] : getFallbackImage('artist', artist.id)}
                  category="ARTIST"
                  href={`/artist/${artist.id}`}
                  bio={artist.bio}
                  city={artist.city}
                  country={artist.country}
                  genres={artist.genres || []}
                  rating={artist.average_rating}
                  reviewCount={artist.review_count}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default function ExplorePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-white border-2 border-white mx-auto mb-8 relative">
              <div className="absolute inset-2 bg-black" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-white animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-widest uppercase mb-4">
              EXPLORE
            </h1>
            <p className="text-white/80 text-lg mb-8 font-medium tracking-wider uppercase">
              DISCOVER THE BEST ELECTRONIC MUSIC EXPERIENCES AROUND THE WORLD
            </p>
            <p className="text-white/60 mt-4 font-bold tracking-widest uppercase text-sm">LOADING AMAZING CONTENT...</p>
          </div>
        </div>
      </div>
    }>
      <ExplorePage />
    </Suspense>
  )
} 