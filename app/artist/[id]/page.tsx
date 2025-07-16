import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, ExternalLink, Star, Heart, Share2, Instagram, Facebook, Twitter, Globe, Music2 } from "lucide-react"
import Link from "next/link"
import { getArtistById } from "@/lib/services/artists"
import { getReviews, getReviewStats } from "@/lib/services/reviews"
import { notFound } from "next/navigation"
import Image from "next/image"

interface ArtistPageProps {
  params: { id: string }
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const artist = await getArtistById(params.id)
  
  if (!artist) {
    notFound()
  }

  // Get upcoming and past events for this artist
  const upcomingEvents = artist.events?.filter((event: any) => 
    new Date(event.start_date) > new Date()
  ).slice(0, 6) || []

  const pastEvents = artist.events?.filter((event: any) => 
    new Date(event.start_date) < new Date()
  ).slice(0, 6) || []

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Artist Tile */}
        <div className="relative overflow-hidden bg-black border-2 border-white/20 mb-12">
          {/* Angular Corner Design */}
          <div className="absolute top-4 right-4 w-8 h-8">
            <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
          </div>
          
          {/* Category Tag */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-black border border-white/60 px-3 py-1">
              <span className="text-white text-xs font-bold tracking-widest uppercase font-mono">
                ARTIST
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {artist.genres?.map((genre: string) => (
                <div key={genre} className="bg-white/10 border border-white/30 px-2 py-1">
                  <span className="text-white text-xs font-bold tracking-widest uppercase">
                    {genre}
                  </span>
                </div>
              ))}
            </div>

            {/* Artist Title */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-widest uppercase mb-6 text-white">
              {artist.name}
            </h1>

            {/* Artist Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Location */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">LOCATION</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {artist.city && artist.country ? `${artist.city}, ${artist.country}` : 'GLOBAL'}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  BASE LOCATION
                </div>
              </div>

              {/* Events */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">EVENTS</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {(upcomingEvents?.length || 0) + (pastEvents?.length || 0)}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  TOTAL PERFORMANCES
                </div>
              </div>

              {/* Rating */}
              <div className="bg-white/5 border border-white/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-white" />
                  <span className="text-white/80 font-bold tracking-widest uppercase text-xs">RATING</span>
                </div>
                <div className="text-white font-bold tracking-wider uppercase">
                  {artist.average_rating ? artist.average_rating.toFixed(1) : 'N/A'}
                </div>
                <div className="text-white/80 font-bold tracking-wider uppercase text-sm">
                  COMMUNITY SCORE
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
                RATE ARTIST
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biography Section */}
            {artist.bio && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <h2 className="text-2xl font-bold tracking-widest uppercase mb-4 text-white">
                  BIOGRAPHY
                </h2>
                <p className="text-white/80 leading-relaxed font-medium tracking-wide">
                  {artist.bio}
                </p>
              </div>
            )}

            {/* Upcoming Performances Section */}
            {upcomingEvents && upcomingEvents.length > 0 && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold tracking-widest uppercase text-white">
                    UPCOMING PERFORMANCES
                  </h2>
                  <Link href={`/events?artist=${artist.id}`} className="text-white/80 hover:text-white transition-colors font-bold tracking-wider uppercase text-sm">
                    VIEW ALL →
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {upcomingEvents.map((event: any) => (
                    <Link key={event.id} href={`/event/${event.id}`}>
                      <div className="bg-white/5 border border-white/20 p-4 hover:bg-white/10 transition-all duration-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center">
                            <Music2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white mb-1 tracking-wider uppercase">
                              {event.title}
                            </h3>
                            <div className="text-sm text-white/80 font-bold tracking-wider uppercase">
                              {new Date(event.start_date).toLocaleDateString()} • {event.venue?.name}
                            </div>
                            <div className="text-xs text-white/60 font-bold tracking-widest uppercase">
                              {event.venue?.city}, {event.venue?.country}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Past Performances Section */}
            {pastEvents && pastEvents.length > 0 && (
              <div className="relative bg-black border-2 border-white/20 p-6">
                <div className="absolute top-4 right-4 w-6 h-6">
                  <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
                </div>
                <h2 className="text-2xl font-bold tracking-widest uppercase mb-6 text-white">
                  PAST PERFORMANCES
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastEvents.slice(0, 4).map((event: any) => (
                    <Link key={event.id} href={`/event/${event.id}`}>
                      <div className="bg-white/5 border border-white/20 p-4 hover:bg-white/10 transition-all duration-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center">
                            <Music2 className="w-6 h-6 text-white/60" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-1 tracking-wider uppercase line-clamp-1">
                              {event.title}
                            </h4>
                            <div className="text-sm text-white/60 font-bold tracking-wider uppercase">
                              {new Date(event.start_date).toLocaleDateString()} • {event.venue?.name}
                            </div>
                          </div>
                        </div>
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
            {/* Artist Information */}
            <div className="relative bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <h3 className="text-xl font-bold tracking-widest uppercase mb-6 text-white">
                ARTIST INFORMATION
              </h3>
              
              <div className="space-y-4">
                {artist.city && artist.country && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-white" />
                      <span className="text-white/80 font-bold tracking-widest uppercase text-xs">LOCATION</span>
                    </div>
                    <div className="text-white font-bold tracking-wider uppercase text-sm">
                      {artist.city}, {artist.country}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-white" />
                    <span className="text-white/80 font-bold tracking-widest uppercase text-xs">EVENTS</span>
                  </div>
                  <div className="text-white font-bold tracking-wider uppercase text-sm">
                    {(upcomingEvents?.length || 0) + (pastEvents?.length || 0)} TOTAL
                  </div>
                </div>

                {artist.average_rating && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-white" />
                      <span className="text-white/80 font-bold tracking-widest uppercase text-xs">RATING</span>
                    </div>
                    <div className="text-white font-bold tracking-wider uppercase text-sm">
                      {artist.average_rating.toFixed(1)}/5.0
                    </div>
                    {artist.review_count && (
                      <div className="text-white/60 text-xs font-bold tracking-widest uppercase">
                        {artist.review_count} REVIEWS
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="relative bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <h3 className="text-xl font-bold tracking-widest uppercase mb-4 text-white">
                PERFORMANCE STATS
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 font-bold tracking-wider uppercase text-sm">UPCOMING</span>
                  <span className="text-white font-bold tracking-wider uppercase">
                    {upcomingEvents?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80 font-bold tracking-wider uppercase text-sm">PAST</span>
                  <span className="text-white font-bold tracking-wider uppercase">
                    {pastEvents?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/20 pt-3">
                  <span className="text-white/80 font-bold tracking-wider uppercase text-sm">TOTAL</span>
                  <span className="text-white font-bold tracking-wider uppercase">
                    {(upcomingEvents?.length || 0) + (pastEvents?.length || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Follow Section */}
            <div className="relative bg-black border-2 border-white/20 p-6">
              <div className="absolute top-4 right-4 w-6 h-6">
                <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
              </div>
              <h3 className="text-xl font-bold tracking-widest uppercase mb-4 text-white">
                FOLLOW {artist.name}
              </h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-200 text-white font-bold tracking-wider uppercase text-sm">
                  GET NOTIFICATIONS
                </button>
                <button className="w-full p-3 bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-200 text-white font-bold tracking-wider uppercase text-sm">
                  SAVE ARTIST
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 