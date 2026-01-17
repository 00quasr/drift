'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EntityCard } from '@/components/ui/entity-card'
import { H1, H2 } from '@/components/ui/typography'
import { getUpcomingEvents, getTrendingEvents } from '@/lib/services/events'
import { getTrendingVenues } from '@/lib/services/venues'
import { getTopRatedArtists } from '@/lib/services/artists'
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'

const genreTags = ['ALL', 'TECHNO', 'HOUSE', 'TRANCE', 'DRUM & BASS', 'DUBSTEP', 'AMBIENT', 'MINIMAL', 'PROGRESSIVE']

async function ExplorePage() {
  const [events, trendingEvents, venues, artists] = await Promise.all([
    getUpcomingEvents(12),
    getTrendingEvents(8),
    getTrendingVenues(12),
    getTopRatedArtists(12)
  ])

  // Filter out empty results
  const hasEvents = events && events.length > 0
  const hasTrendingEvents = trendingEvents && trendingEvents.length > 0
  const hasVenues = venues && venues.length > 0
  const hasArtists = artists && artists.length > 0

  // If no data, show empty state
  if (!hasEvents && !hasVenues && !hasArtists) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-32">
            <H1 variant="display" className="mb-4 text-white">
              EXPLORE
            </H1>
            <p className="text-white/80 text-lg mb-8 font-medium tracking-wider uppercase">
              DISCOVER THE BEST ELECTRONIC MUSIC EXPERIENCES AROUND THE WORLD
            </p>
            <p className="text-white/60 mt-4 font-bold tracking-widest uppercase text-sm">NO CONTENT AVAILABLE YET</p>
          </div>
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
                EXPLORE
              </H1>
              <p className="text-white/50 text-sm lg:text-base font-medium max-w-2xl tracking-wider uppercase">
                DISCOVER THE BEST ELECTRONIC MUSIC EXPERIENCES AROUND THE WORLD
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

      {/* Search & Filters Section */}
      <section className="w-full pb-8 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative max-w-3xl">
            <Input
              type="text"
              placeholder="SEARCH EVENTS, VENUES, ARTISTS..."
              className="pl-6 pr-6 py-4 bg-black border border-white/20 text-white placeholder-white/40 focus:border-white/40 transition-colors duration-200 h-14 text-sm font-bold tracking-wider uppercase"
            />
          </div>

          {/* Genre Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {genreTags.map((genre) => (
              <Badge
                key={genre}
                variant={genre === 'ALL' ? 'default' : 'secondary'}
                className={`cursor-pointer transition-all duration-200 px-4 py-2 text-xs font-bold tracking-wider uppercase ${
                  genre === 'ALL'
                    ? 'bg-white text-black hover:bg-white/90 border border-white'
                    : 'bg-transparent text-white/60 hover:text-white border border-white/20 hover:border-white/40'
                }`}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="w-full py-16 lg:py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-white/50 font-bold tracking-widest uppercase text-xs">FEATURED</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 h-auto lg:h-[600px]">
            {/* Large Featured Event */}
            {hasEvents && (
              <div className="lg:col-span-2 lg:row-span-2">
                <EntityCard
                  type="event"
                  id={events[0].id}
                  title={events[0].title}
                  imageUrl={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.png`}
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
                  imageUrl={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.png`}
                  category="TRENDING VENUE"
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
                  imageUrl={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.png`}
                  category="TOP RATED ARTIST"
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
      </section>

      {/* Trending Events Section */}
      {hasTrendingEvents && (
        <section className="w-full py-16 lg:py-24 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-white/50 font-bold tracking-widest uppercase text-xs mb-4 block">TRENDING</span>
                <H2 variant="display" className="text-3xl text-white">
                  EVENTS
                </H2>
              </div>
              <a
                href="/events"
                className="text-white/60 hover:text-white transition-colors font-bold tracking-wider uppercase text-xs border border-white/20 hover:border-white/40 px-4 py-2"
              >
                VIEW ALL →
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {trendingEvents.slice(0, 8).map((event) => (
                <EntityCard
                  key={`trending-${event.id}`}
                  type="event"
                  id={event.id}
                  title={event.title}
                  imageUrl={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.png`}
                  category="TRENDING EVENT"
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
          </div>
        </section>
      )}

      {/* Events Section */}
      {hasEvents && events.length > 0 && (
        <section className="w-full py-16 lg:py-24 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-white/50 font-bold tracking-widest uppercase text-xs mb-4 block">UPCOMING</span>
                <H2 variant="display" className="text-3xl text-white">
                  EVENTS
                </H2>
              </div>
              <a
                href="/events"
                className="text-white/60 hover:text-white transition-colors font-bold tracking-wider uppercase text-xs border border-white/20 hover:border-white/40 px-4 py-2"
              >
                VIEW ALL →
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {events.length === 1
                ? events.map((event) => (
                <EntityCard
                  key={`upcoming-${event.id}`}
                  type="event"
                  id={event.id}
                  title={event.title}
                  imageUrl={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.png`}
                  category="UPCOMING EVENT"
                  href={`/event/${event.id}`}
                  artist={event.artists?.[0]?.name || 'Various Artists'}
                  date={new Date(event.start_date).toLocaleDateString()}
                  time={new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  venue={event.venue?.name || 'TBA'}
                  location={event.venue?.city ? `${event.venue.city}, ${event.venue.country}` : 'Location TBA'}
                  price={event.ticket_price_min && event.ticket_price_max ? `€${event.ticket_price_min}-${event.ticket_price_max}` : undefined}
                  isUpcoming={true}
                />
              ))
                : events.slice(1, 9).map((event) => (
                <EntityCard
                  key={event.id}
                  type="event"
                  id={event.id}
                  title={event.title}
                  imageUrl={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.png`}
                  category="UPCOMING EVENT"
                  href={`/event/${event.id}`}
                  artist={event.artists?.[0]?.name || 'Various Artists'}
                  date={new Date(event.start_date).toLocaleDateString()}
                  time={new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  venue={event.venue?.name || 'TBA'}
                  location={event.venue?.city ? `${event.venue.city}, ${event.venue.country}` : 'Location TBA'}
                  price={event.ticket_price_min && event.ticket_price_max ? `€${event.ticket_price_min}-${event.ticket_price_max}` : undefined}
                  isUpcoming={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Venues Section */}
      {hasVenues && (
        <section className="w-full py-16 lg:py-24 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-white/50 font-bold tracking-widest uppercase text-xs mb-4 block">TRENDING</span>
                <H2 variant="display" className="text-3xl text-white">
                  VENUES
                </H2>
              </div>
              <a
                href="/venues"
                className="text-white/60 hover:text-white transition-colors font-bold tracking-wider uppercase text-xs border border-white/20 hover:border-white/40 px-4 py-2"
              >
                VIEW ALL →
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {venues.slice(1, 7).map((venue) => (
                <EntityCard
                  key={venue.id}
                  type="venue"
                  id={venue.id}
                  title={venue.name}
                  imageUrl={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.png`}
                  category="VENUE"
                  href={`/venue/${venue.id}`}
                  city={venue.city || 'Unknown'}
                  country={venue.country || 'Unknown'}
                  capacity={venue.capacity}
                  genres={venue.genres || []}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Artists Section */}
      {hasArtists && (
        <section className="w-full py-16 lg:py-24 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-white/50 font-bold tracking-widest uppercase text-xs mb-4 block">TOP RATED</span>
                <H2 variant="display" className="text-3xl text-white">
                  ARTISTS
                </H2>
              </div>
              <a
                href="/artists"
                className="text-white/60 hover:text-white transition-colors font-bold tracking-wider uppercase text-xs border border-white/20 hover:border-white/40 px-4 py-2"
              >
                VIEW ALL →
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {artists.slice(1, 9).map((artist) => (
                <EntityCard
                  key={artist.id}
                  type="artist"
                  id={artist.id}
                  title={artist.name}
                  imageUrl={`https://jwxlskzmmdrwrlljtfdi.supabase.co/storage/v1/object/public/assets/${String(Math.floor(Math.random() * 9) + 1).padStart(3, '0')}.png`}
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
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="w-full py-16 lg:py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <H2 variant="display" className="mb-4 text-white">
              JOIN THE COMMUNITY
            </H2>
            <p className="text-white/40 mb-8 max-w-md mx-auto text-sm tracking-wider uppercase">
              Connect with artists, discover venues, and never miss an event in the electronic music scene
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/auth/signin?mode=register">
                <button className="bg-white text-black hover:bg-white/90 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs">
                  GET STARTED
                </button>
              </a>
              <a href="/events">
                <button className="border border-white/20 text-white hover:bg-white/10 font-bold tracking-wider uppercase py-3 px-6 transition-all duration-200 text-xs">
                  BROWSE EVENTS
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ExplorePageWrapper() {
  return (
    <Suspense fallback={null}>
      <ExplorePage />
    </Suspense>
  )
} 