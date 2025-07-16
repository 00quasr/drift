import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Clock, Users, ExternalLink, Star, Heart, Share2, Ticket, Music } from "lucide-react"
import Link from "next/link"
import { getEvent } from "@/lib/services/events"
import { getReviews, getReviewStats } from "@/lib/services/reviews"
import { notFound } from "next/navigation"
import Image from "next/image"
import { isValidImageUrl, getFallbackImage } from "@/lib/utils/imageUtils"

interface EventPageProps {
  params: { id: string }
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEvent(params.id)
  
  if (!event) {
    notFound()
  }

  // Get fallback image
  const eventFlyer = isValidImageUrl(event.flyer_url) ? event.flyer_url! : getFallbackImage('event', event.id)

  // Format dates
  const startDate = new Date(event.start_date)
  const endDate = event.end_date ? new Date(event.end_date) : null
  const isUpcoming = startDate > new Date()
  const isPast = startDate < new Date()

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Event Tile */}
        <div className="relative overflow-hidden bg-black border-2 border-white/20 mb-12">
          {/* Angular Corner Design */}
          <div className="absolute top-4 right-4 w-8 h-8">
            <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
          </div>
          
          {/* Category Tag */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-black border border-white/60 px-3 py-1">
              <span className="text-white text-xs font-bold tracking-widest uppercase font-mono">
                {isPast ? 'PAST EVENT' : 'UPCOMING EVENT'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {event.genres?.map((genre: string) => (
                <div key={genre} className="bg-white/10 border border-white/30 px-2 py-1">
                  <span className="text-white text-xs font-bold tracking-widest uppercase">
                    {genre}
                  </span>
                </div>
              ))}
            </div>

            {/* Event Title */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-widest uppercase mb-6 text-white">
              {event.title}
            </h1>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Date & Time */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">DATE & TIME</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {startDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  {startDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {endDate ? endDate.toLocaleTimeString('en-US', {
                    hour: '2-digit', 
                    minute: '2-digit'
                  }) : '01:00'}
                </div>
              </div>

              {/* Venue */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">VENUE</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {event.venue?.name || 'TBA'}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  {event.venue?.city}, {event.venue?.country}
                </div>
              </div>

              {/* Price */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">PRICING</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {event.ticket_price_min && event.ticket_price_max 
                    ? `€${event.ticket_price_min}-€${event.ticket_price_max}`
                    : 'TBA'
                  }
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  ENTRY FEE
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
                RATE EVENT
              </button>
              {event.ticket_url && isUpcoming && (
                <button className="px-6 py-3 bg-white text-black hover:bg-white/90 border-2 border-white font-bold tracking-wider uppercase transition-all duration-200">
                  <Ticket className="w-4 h-4 mr-2 inline" />
                  BUY TICKETS
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {event.description && (
              <div className="bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <h2 className="text-2xl font-bold tracking-widest uppercase mb-4 text-white">
                  ABOUT THIS EVENT
                </h2>
                <p className="text-white/80 leading-relaxed font-medium tracking-wide">
                  {event.description}
                </p>
              </div>
            )}

            {/* Lineup Section */}
            {event.artists && event.artists.length > 0 && (
              <div className="bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <h2 className="text-2xl font-bold tracking-widest uppercase mb-6 text-white">
                  LINEUP
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.artists.map((artist) => (
                    <div key={artist.id} className="bg-white/5 border border-white/20 p-4 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <Music className="w-6 h-6 text-white" />
                        <div>
                          <div className="text-white font-bold tracking-wider uppercase">
                            {artist.name}
                          </div>
                          {artist.genres && artist.genres.length > 0 && (
                            <div className="text-white/60 text-sm font-bold tracking-widest uppercase">
                              {artist.genres.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-black border-2 border-white/20 p-6">
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
            {/* Event Details */}
            <div className="bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <h3 className="text-xl font-bold tracking-widest uppercase mb-6 text-white">
                EVENT DETAILS
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-white" />
                    <span className="text-white/80 font-bold tracking-widest uppercase text-xs">DATE & TIME</span>
                  </div>
                  <div className="text-white font-bold tracking-wider uppercase text-sm">
                    {startDate.toLocaleDateString()}
                  </div>
                  <div className="text-white/80 font-bold tracking-wider uppercase text-xs">
                    {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '01:00'}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-white" />
                    <span className="text-white/80 font-bold tracking-widest uppercase text-xs">VENUE</span>
                  </div>
                  <div className="text-white font-bold tracking-wider uppercase text-sm">
                    {event.venue?.name || 'TBA'}
                  </div>
                  <div className="text-white/80 font-bold tracking-wider uppercase text-xs">
                    {event.venue?.address || `${event.venue?.city}, ${event.venue?.country}`}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-4 h-4 text-white" />
                    <span className="text-white/80 font-bold tracking-widest uppercase text-xs">PRICING</span>
                  </div>
                  <div className="text-white font-bold tracking-wider uppercase text-sm">
                    {event.ticket_price_min && event.ticket_price_max 
                      ? `€${event.ticket_price_min} - €${event.ticket_price_max}`
                      : 'FREE ENTRY'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Artists */}
            {event.artists && event.artists.length > 0 && (
              <div className="bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <h3 className="text-xl font-bold tracking-widest uppercase mb-4 text-white">
                  ARTISTS
                </h3>
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-white" />
                  <div>
                    <div className="font-bold text-white tracking-wider uppercase">
                      {event.artists.length} PERFORMING
                    </div>
                    <div className="text-white/60 text-sm font-bold tracking-widest uppercase">
                      {event.artists.slice(0, 3).map(a => a.name).join(', ')}
                      {event.artists.length > 3 && ` +${event.artists.length - 3} MORE`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* More at Venue */}
            {event.venue && (
              <div className="bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <h3 className="text-xl font-bold tracking-widest uppercase mb-4 text-white">
                  MORE AT {event.venue.name}
                </h3>
                <Link 
                  href={`/venue/${event.venue.id}`}
                  className="text-white/80 hover:text-white text-sm transition-colors font-bold tracking-wider uppercase"
                >
                  VIEW ALL EVENTS AT THIS VENUE →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 