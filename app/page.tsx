import Link from "next/link"
import { ArrowRight, Play, Headphones, MapPin, Users, Star, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EntityBento, EntityBentoGrid } from "@/components/ui/entity-bento"
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
          </div>
        </section>

        {/* Upcoming Events Section */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <section className="py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-medium text-white mb-2">
                    Upcoming Events
                  </h2>
                  <p className="text-slate-400">
                    Don't miss these electronic music experiences
                  </p>
                </div>
                <Link href="/events">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-900">
                    View All Events
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <EntityBentoGrid>
                {upcomingEvents.map((event) => (
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
            </div>
          </section>
        )}

        {/* Trending Venues Section */}
        {venues && venues.length > 0 && (
          <section className="py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-medium text-white mb-2">
                    Trending Venues
                  </h2>
                  <p className="text-slate-400">
                    Discover the hottest venues in the scene
                  </p>
                </div>
                <Link href="/venues">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-900">
                    Explore Venues
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <EntityBentoGrid>
                {venues.map((venue) => (
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
            </div>
          </section>
        )}

        {/* Top Rated Artists Section */}
        {topArtists && topArtists.length > 0 && (
          <section className="py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-medium text-white mb-2">
                    Top Rated Artists
                  </h2>
                  <p className="text-slate-400">
                    Connect with the community's favorite artists
                  </p>
                </div>
                <Link href="/artists">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-900">
                    View All Artists
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <EntityBentoGrid>
                {topArtists.map((artist) => (
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
            </div>
          </section>
        )}

        {/* Call to Action Section */}
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
