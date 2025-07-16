'use client'

import { Suspense } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EntityBento, EntityBentoGrid } from '@/components/ui/entity-bento'
import { getEvents } from '@/lib/services/events'
import { getVenues } from '@/lib/services/venues'
import { getArtists } from '@/lib/services/artists'
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'

const genreTags = ['All', 'Techno', 'House', 'Trance', 'Drum & Bass', 'Dubstep', 'Ambient', 'Minimal', 'Progressive']

async function ExplorePage() {
  const [events, venues, artists] = await Promise.all([
    getEvents({ limit: 6 }),
    getVenues({ limit: 6 }),
    getArtists({ limit: 6 })
  ])

  // Filter out empty results
  const hasEvents = events && events.length > 0
  const hasVenues = venues && venues.length > 0  
  const hasArtists = artists && artists.length > 0

  // If no data, show loading state
  if (!hasEvents && !hasVenues && !hasArtists) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-32">
            <h1 className="text-4xl font-medium text-white mb-4">
              Explore
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Discover the best electronic music experiences around the world
            </p>
            <p className="text-slate-500 mt-4">Discovering amazing content...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Search Header */}
        <div className="mb-12">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-medium text-white mb-4">
              Explore
            </h1>
            <p className="text-slate-400 text-lg">
              Discover the best electronic music experiences around the world
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search events, venues, artists..."
              className="pl-12 pr-4 py-3 bg-slate-900/50 border-slate-800 text-white placeholder-slate-400 focus:border-slate-600 transition-colors duration-200 h-12 text-base"
            />
          </div>

          {/* Genre Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {genreTags.map((genre) => (
              <Badge
                key={genre}
                variant={genre === 'All' ? 'default' : 'secondary'}
                className={`cursor-pointer transition-colors duration-200 ${
                  genre === 'All'
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Featured Content Hero Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px]">
            {/* Large Featured Event */}
            {hasEvents && (
              <div className="lg:col-span-2 lg:row-span-2">
                <EntityBento
                  type="event"
                  id={events[0].id}
                  name={events[0].title}
                  description={events[0].description || `Experience ${events[0].title} with amazing electronic music`}
                  href={`/event/${events[0].id}`}
                  imageUrl={isValidImageUrl(events[0].flyer_url) ? events[0].flyer_url! : getFallbackImage('event', events[0].id)}
                  artist={events[0].artists?.[0]?.name || 'Various Artists'}
                  date={new Date(events[0].start_date).toLocaleDateString()}
                  time={new Date(events[0].start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  venue={events[0].venue?.name || 'TBA'}
                  location={events[0].venue?.city ? `${events[0].venue.city}, ${events[0].venue.country}` : 'Location TBA'}
                  price={events[0].ticket_price_min && events[0].ticket_price_max ? `$${events[0].ticket_price_min}-${events[0].ticket_price_max}` : undefined}
                  isUpcoming={new Date(events[0].start_date) > new Date()}
                  className="h-full"
                />
              </div>
            )}

            {/* Medium Featured Venue */}
            {hasVenues && (
              <div className="lg:col-span-1">
                <EntityBento
                  type="venue"
                  id={venues[0].id}
                  name={venues[0].name}
                  description={venues[0].description || `Experience electronic music at ${venues[0].name}`}
                  href={`/venue/${venues[0].id}`}
                  imageUrl={venues[0].images && Array.isArray(venues[0].images) && venues[0].images.length > 0 ? venues[0].images[0] : getFallbackImage('venue', venues[0].id)}
                  city={venues[0].city || 'Unknown'}
                  country={venues[0].country || 'Unknown'}
                  capacity={venues[0].capacity}
                  genres={venues[0].genres || []}
                  className="h-[240px]"
                />
              </div>
            )}

            {/* Medium Featured Artist */}
            {hasArtists && (
              <div className="lg:col-span-1">
                <EntityBento
                  type="artist"
                  id={artists[0].id}
                  name={artists[0].name}
                  description={artists[0].bio || `Discover the music of ${artists[0].name}`}
                  href={`/artist/${artists[0].id}`}
                  imageUrl={artists[0].images && Array.isArray(artists[0].images) && artists[0].images.length > 0 ? artists[0].images[0] : getFallbackImage('artist', artists[0].id)}
                  bio={artists[0].bio}
                  city={artists[0].city}
                  country={artists[0].country}
                  genres={artists[0].genres || []}
                  rating={artists[0].average_rating}
                  reviewCount={artists[0].review_count}
                  className="h-[240px]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Events Section */}
        {hasEvents && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium text-white">
                Upcoming Events
              </h2>
              <a 
                href="/events" 
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                View all →
              </a>
            </div>

            <EntityBentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {events.slice(1, 5).map((event) => (
                <EntityBento
                  key={event.id}
                  type="event"
                  id={event.id}
                  name={event.title}
                  description={event.description || `Experience ${event.title} with amazing electronic music`}
                  href={`/event/${event.id}`}
                  imageUrl={isValidImageUrl(event.flyer_url) ? event.flyer_url! : getFallbackImage('event', event.id)}
                  artist={event.artists?.[0]?.name || 'Various Artists'}
                  date={new Date(event.start_date).toLocaleDateString()}
                  time={new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  venue={event.venue?.name || 'TBA'}
                  location={event.venue?.city ? `${event.venue.city}, ${event.venue.country}` : 'Location TBA'}
                  price={event.ticket_price_min && event.ticket_price_max ? `$${event.ticket_price_min}-${event.ticket_price_max}` : undefined}
                  isUpcoming={new Date(event.start_date) > new Date()}
                />
              ))}
            </EntityBentoGrid>
          </section>
        )}

        {/* Venues Section */}
        {hasVenues && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium text-white">
                Trending Venues
              </h2>
              <a 
                href="/venues" 
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                View all →
              </a>
            </div>

            <EntityBentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {venues.slice(1, 4).map((venue) => (
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
          </section>
        )}

        {/* Artists Section */}
        {hasArtists && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium text-white">
                Featured Artists
              </h2>
              <a 
                href="/artists" 
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                View all →
              </a>
            </div>

            <EntityBentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {artists.slice(1, 5).map((artist) => (
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
          </section>
        )}
      </div>
    </div>
  )
}

export default function ExplorePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-32">
            <h1 className="text-4xl font-medium text-white mb-4">
              Explore
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Discover the best electronic music experiences around the world
            </p>
            <p className="text-slate-500 mt-4">Loading amazing content...</p>
          </div>
        </div>
      </div>
    }>
      <ExplorePage />
    </Suspense>
  )
} 