import Link from "next/link"
import { ArrowRight, Play, Headphones, MapPin, Users, Star, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUpcomingEvents } from "@/lib/services/events"
import { getVenues } from "@/lib/services/venues"
import { getTopRatedArtists } from "@/lib/services/artists"
import Image from "next/image"

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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-white">Welcome to Drift</h1>
            <p className="text-gray-400 max-w-md">
              Your platform is set up! Add some venues, events, and artists to see them displayed here.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/explore">
                <Button>Explore Platform</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen">
        {/* Hero Section - Clean and minimal */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950" />
          <div 
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            {/* Announcement badge */}
            <div className="flex justify-center mb-8">
              <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                <Headphones className="w-3 h-3 mr-2" />
                Electronic Music Platform
              </Badge>
            </div>

            <div className="text-center max-w-4xl mx-auto space-y-8">
              {/* Main heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                Discover Electronic Music{' '}
                <span className="text-zinc-600 dark:text-zinc-400">
                  Communities
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light">
                Connect with venues, events, and artists in the global underground scene. 
                Rate experiences and discover your next favorite destination.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <Link href="/explore">
                  <Button 
                    size="lg" 
                    className="bg-zinc-900 hover:bg-zinc-800 text-white border-0 rounded-full px-8 h-12 text-base font-medium dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Exploring
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-full px-8 h-12 text-base font-medium"
                  >
                    Join Community
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-16 border-t border-zinc-200 dark:border-zinc-800">
              {[
                { number: '500+', label: 'Venues' },
                { number: '2K+', label: 'Events' },
                { number: '1K+', label: 'Artists' }
              ].map(({ number, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white">{number}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Events - Minimal design */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white mb-4">
                Upcoming Events
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Don't miss these carefully curated electronic music experiences
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents && upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 4).map((event: any) => (
                  <Link key={event.id} href={`/event/${event.id}`}>
                    <Card className="group cursor-pointer bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 overflow-hidden">
                      <div className="aspect-[4/3] relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {event.images && event.images[0] ? (
                          <Image
                            src={event.images[0]} 
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Headphones className="w-12 h-12 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            {new Date(event.start_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          {event.venue && (
                            <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.venue.city}
                            </div>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 line-clamp-2 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                          {event.title}
                        </h3>
                        
                        {event.venue && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {event.venue.name}
                          </p>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Headphones className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500 dark:text-zinc-400">No upcoming events available</p>
                </div>
              )}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/events">
                <Button variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                  View All Events
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Venues */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white mb-4">
                Notable Venues
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Explore legendary clubs and venues that define electronic music culture
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {venues.slice(0, 6).map((venue: any) => (
                <Link key={venue.id} href={`/venue/${venue.id}`}>
                  <Card className="group cursor-pointer bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 overflow-hidden">
                    <div className="aspect-[3/2] relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      {venue.images && venue.images[0] ? (
                        <Image
                          src={venue.images[0]}
                          alt={venue.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-zinc-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                            {venue.name}
                          </h3>
                          <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            {venue.city}, {venue.country}
                          </div>
                        </div>
                        
                        {venue.average_rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                              {venue.average_rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {venue.capacity && (
                        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
                          <Users className="w-3 h-3 mr-1" />
                          Capacity: {venue.capacity.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/venues">
                <Button variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                  Explore All Venues
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Top Artists */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white mb-4">
                Featured Artists
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Discover the artists shaping electronic music culture
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {topArtists.slice(0, 6).map((artist: any) => (
                <Link key={artist.id} href={`/artist/${artist.id}`}>
                  <div className="group cursor-pointer text-center">
                    <div className="aspect-square relative overflow-hidden rounded-2xl mb-4 bg-zinc-100 dark:bg-zinc-800">
                      {artist.images && artist.images[0] ? (
                        <Image
                          src={artist.images[0]}
                          alt={artist.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Headphones className="w-8 h-8 text-zinc-400" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-medium text-zinc-900 dark:text-white mb-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors line-clamp-1">
                      {artist.name}
                    </h3>
                    {artist.genre_tags && artist.genre_tags[0] && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {artist.genre_tags[0]}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/artists">
                <Button variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                  Discover All Artists
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA - Clean and minimal */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold text-zinc-900 dark:text-white mb-6">
              Ready to explore?
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
              Join thousands of electronic music enthusiasts discovering their next favorite event, venue, or artist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button 
                  size="lg" 
                  className="bg-zinc-900 hover:bg-zinc-800 text-white border-0 rounded-full px-8 h-12 text-base font-medium dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/explore">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full px-8 h-12 text-base font-medium"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Something went wrong</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Please try again later</p>
        </div>
      </div>
    )
  }
}
