import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users, ExternalLink, Star, Heart, Share2, Phone, Mail, Clock, Globe } from "lucide-react"
import Link from "next/link"
import { getVenueById } from "@/lib/services/venues"
import { getEvents } from "@/lib/services/events"
import { getReviews, getReviewStats } from "@/lib/services/reviews"
import { getFallbackImage, isValidImageUrl } from '@/lib/utils/imageUtils'
import { notFound } from "next/navigation"
import Image from "next/image"

interface VenuePageProps {
  params: { id: string }
}

export default async function VenuePage({ params }: VenuePageProps) {
  const venue = await getVenueById(params.id)
  
  if (!venue) {
    notFound()
  }

  // Get upcoming events at this venue
  const upcomingEvents = venue.events?.filter((event: any) => 
    new Date(event.start_date) > new Date()
  ).slice(0, 6) || []

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Venue Tile */}
        <div className="relative overflow-hidden bg-black border-2 border-white/20 mb-12">
          {/* Angular Corner Design */}
          <div className="absolute top-4 right-4 w-8 h-8">
            <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
          </div>
          
          {/* Category Tag */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-black border border-white/60 px-3 py-1">
              <span className="text-white text-xs font-bold tracking-widest uppercase font-mono">
                VENUE
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {venue.genres?.map((genre: string) => (
                <div key={genre} className="bg-white/10 border border-white/30 px-2 py-1">
                  <span className="text-white text-xs font-bold tracking-widest uppercase">
                    {genre}
                  </span>
                </div>
              ))}
            </div>

            {/* Venue Title */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-widest uppercase mb-6 text-white">
              {venue.name}
            </h1>

            {/* Venue Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Location */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">LOCATION</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {venue.city}, {venue.country}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  {venue.address || 'ADDRESS TBA'}
                </div>
              </div>

              {/* Capacity */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">CAPACITY</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {venue.capacity ? venue.capacity.toLocaleString() : 'TBA'}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  PEOPLE
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">WEBSITE</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {venue.website ? 'AVAILABLE' : 'TBA'}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  VISIT WEBSITE
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="p-3 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/60 text-white transition-all duration-200">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/60 text-white transition-all duration-200">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="px-6 py-3 bg-white text-black hover:bg-white/90 border-2 border-white font-bold tracking-wider uppercase transition-all duration-200">
                RATE VENUE
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {venue.description && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <h2 className="text-2xl font-bold tracking-widest uppercase mb-4 text-white">
                  ABOUT {venue.name}
                </h2>
                <p className="text-white/80 leading-relaxed font-medium tracking-wide">
                  {venue.description}
                </p>
              </div>
            )}

            {/* Upcoming Events Section */}
            {upcomingEvents && upcomingEvents.length > 0 && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold tracking-widest uppercase text-white">
                    UPCOMING EVENTS
                  </h2>
                  <Link href={`/events?venue=${venue.id}`} className="text-white/80 hover:text-white transition-colors font-bold tracking-wider uppercase text-sm">
                    VIEW ALL →
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingEvents.map((event: any) => (
                    <Link key={event.id} href={`/event/${event.id}`}>
                      <div className="bg-white/5 border border-white/20 p-4 hover:bg-white/10 transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/80 font-bold tracking-wider uppercase">
                            {new Date(event.start_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-sm text-white/80 font-bold tracking-wider uppercase">
                            {new Date(event.start_date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <h3 className="font-bold text-white mb-1 tracking-wider uppercase">
                          {event.title}
                        </h3>
                        {event.artists && event.artists.length > 0 && (
                          <p className="text-sm text-white/60 font-bold tracking-widest uppercase">
                            {event.artists[0].name}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="relative bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-widest uppercase text-white">
                  REVIEWS & RATINGS
                </h2>
                <button className="px-4 py-2 bg-white text-black hover:bg-white/90 border-2 border-white font-bold tracking-wider uppercase transition-all duration-200 text-sm">
                  WRITE REVIEW
                </button>
              </div>
              
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-white border-2 border-white mx-auto mb-4 relative">
                  <div className="absolute inset-1 bg-black" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-white font-bold tracking-widest uppercase mb-2">
                  NO REVIEWS YET
                </h3>
                <p className="text-white/60 font-medium tracking-wider uppercase text-sm">
                  BE THE FIRST TO REVIEW
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Venue Information */}
            <div className="relative bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <h3 className="text-xl font-bold tracking-widest uppercase mb-6 text-white">
                VENUE INFORMATION
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-white" />
                    <span className="text-white/80 font-bold tracking-widest uppercase text-xs">ADDRESS</span>
                  </div>
                  <div className="text-white font-bold tracking-wider uppercase text-sm">
                    {venue.address || `${venue.city}, ${venue.country}`}
                  </div>
                  <div className="text-white/80 font-bold tracking-wider uppercase text-xs">
                    {venue.city}, {venue.country}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-white/80 font-bold tracking-widest uppercase text-xs">CAPACITY</span>
                  </div>
                  <div className="text-white font-bold tracking-wider uppercase text-sm">
                    {venue.capacity ? `${venue.capacity.toLocaleString()} PEOPLE` : 'TBA'}
                  </div>
                </div>

                {venue.website && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-white" />
                      <span className="text-white/80 font-bold tracking-widest uppercase text-xs">WEBSITE</span>
                    </div>
                    <a 
                      href={venue.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-white text-sm transition-colors font-bold tracking-wider uppercase"
                    >
                      VISIT WEBSITE →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Map Section */}
            <div className="relative bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <h3 className="text-xl font-bold tracking-widest uppercase mb-4 text-white">
                LOCATION
              </h3>
              <div className="bg-white/5 border border-white/20 p-8 text-center">
                <MapPin className="w-12 h-12 text-white/60 mx-auto mb-4" />
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  MAP COMING SOON
                </div>
              </div>
            </div>

            {/* Follow Section */}
            <div className="relative bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <h3 className="text-xl font-bold tracking-widest uppercase mb-4 text-white">
                FOLLOW {venue.name}
              </h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-200 text-white font-bold tracking-wider uppercase text-sm">
                  GET NOTIFICATIONS
                </button>
                <button className="w-full p-3 bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-200 text-white font-bold tracking-wider uppercase text-sm">
                  SAVE VENUE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 