import Link from "next/link"
import { ArrowRight, Play, Headphones, MapPin, Users, Star, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EntityCard } from "@/components/ui/entity-card"
import { getUpcomingEvents } from "@/lib/services/events"
import { getVenues } from "@/lib/services/venues"
import { getTopRatedArtists } from "@/lib/services/artists"
import { getFallbackImage, isValidImageUrl } from "@/lib/utils/imageUtils"

export default async function HomePage() {
  try {
    const [upcomingEvents, venues, topArtists] = await Promise.all([
      getUpcomingEvents(4),
      getVenues({ limit: 6 }),
      getTopRatedArtists(6)
    ])

    // If all data is empty, show setup instructions
    if ((!upcomingEvents || upcomingEvents.length === 0) && 
        (!venues || venues.length === 0) && 
        (!topArtists || topArtists.length === 0)) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-medium text-white">Welcome to Drift</h1>
            <p className="text-slate-400 max-w-md">
              Your platform is set up! Add some venues, events, and artists to see them displayed here.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/explore">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white border-slate-800">Explore Platform</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-900">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-slate-950">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-slate-950" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              {/* Main heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white">
                Discover Electronic Music{' '}
                <span className="text-slate-400">
                  Communities
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
                Connect with venues, events, and artists in the global underground scene. 
                Rate experiences and discover your next favorite destination.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <Link href="/explore">
                  <Button 
                    size="lg" 
                    className="bg-slate-900 hover:bg-slate-800 text-white border-0 rounded-lg px-8 h-12 text-base font-medium"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Exploring
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-slate-700 text-slate-300 hover:bg-slate-900 rounded-lg px-8 h-12 text-base font-medium"
                  >
                    Join Community
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-16 border-t border-slate-800">
              {[
                { number: '500+', label: 'Venues' },
                { number: '2K+', label: 'Events' },
                { number: '1K+', label: 'Artists' }
              ].map(({ number, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl md:text-3xl font-medium text-white">{number}</div>
                  <div className="text-sm text-slate-400 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Events */}
        <section className="py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">
                Featured Events
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Don't miss these upcoming electronic music experiences
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {upcomingEvents.slice(0, 4).map((event: any) => {
                const eventDate = new Date(event.start_date);
                const isUpcoming = eventDate > new Date();
                
                return (
                  <EntityCard
                    key={event.id}
                    type="event"
                    id={event.id}
                    title={event.title}
                    artist={event.artists?.[0]?.name || 'Various Artists'}
                    imageUrl={isValidImageUrl(event.flyer_url || event.images?.[0]) ? (event.flyer_url || event.images[0]) : getFallbackImage('event', event.id)}
                    category={event.genres?.[0] || 'ELECTRONIC'}
                    href={`/event/${event.id}`}
                    date={eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                    time={eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    venue={event.venue?.name || 'TBA'}
                    location={event.venue?.city ? `${event.venue.city}, ${event.venue.country}` : 'Location TBA'}
                    price={event.ticket_price_min && event.ticket_price_max ? `$${event.ticket_price_min}-${event.ticket_price_max}` : undefined}
                    attendees={event.attendees}
                    rating={event.rating}
                    isUpcoming={isUpcoming}
                  />
                );
              })}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/events">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-900 rounded-lg">
                  View All Events
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Venues */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">
                Trending Venues
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Discover the hottest clubs and venues worldwide
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.slice(0, 6).map((venue: any) => (
                <EntityCard
                  key={venue.id}
                  type="venue"
                  id={venue.id}
                  title={venue.name}
                  imageUrl={isValidImageUrl(venue.images?.[0]) ? venue.images[0] : getFallbackImage('venue', venue.id)}
                  category={venue.genres?.[0] || 'CLUB'}
                  href={`/venue/${venue.id}`}
                  city={venue.city}
                  country={venue.country}
                  capacity={venue.capacity}
                  genres={venue.genres}
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/venues">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-900 rounded-lg">
                  Explore All Venues
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Top Artists */}
        <section className="py-24 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">
                Featured Artists
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Discover the artists shaping electronic music culture
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {topArtists.slice(0, 6).map((artist: any) => (
                <EntityCard
                  key={artist.id}
                  type="artist"
                  id={artist.id}
                  title={artist.name}
                  imageUrl={isValidImageUrl(artist.photo_url || artist.images?.[0]) ? (artist.photo_url || artist.images[0]) : getFallbackImage('artist', artist.id)}
                  category={artist.genres?.[0] || 'ELECTRONIC'}
                  href={`/artist/${artist.id}`}
                  bio={artist.bio}
                  city={artist.city}
                  country={artist.country}
                  genres={artist.genres}
                  rating={artist.average_rating}
                  reviewCount={artist.review_count}
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/artists">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-900 rounded-lg">
                  Discover All Artists
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-medium text-white mb-6">
              Ready to explore?
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of electronic music enthusiasts discovering their next favorite event, venue, or artist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button 
                  size="lg" 
                  className="bg-slate-900 hover:bg-slate-800 text-white border-0 rounded-lg px-8 h-12 text-base font-medium"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/explore">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-slate-700 text-slate-300 hover:bg-slate-900 rounded-lg px-8 h-12 text-base font-medium"
                >
                  Browse Platform
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error loading homepage data:', error)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-medium text-white">Something went wrong</h1>
          <p className="text-slate-400">Please try again later</p>
        </div>
      </div>
    )
  }
}
