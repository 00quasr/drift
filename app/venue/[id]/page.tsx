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
  try {
    // Fetch venue data, related events, and reviews in parallel
    const [venue, upcomingEvents, pastEvents, reviews, reviewStats] = await Promise.all([
      getVenueById(params.id),
      getEvents({ venue_id: params.id, start_date: new Date().toISOString(), limit: 6 }),
      getEvents({ venue_id: params.id, end_date: new Date().toISOString(), limit: 4 }),
      getReviews('venue', params.id, { limit: 10 }),
      getReviewStats('venue', params.id)
    ])

    if (!venue) {
      notFound()
    }

    const primaryImage = isValidImageUrl(venue.images?.[0]) ? venue.images[0] : getFallbackImage('venue', venue.id)

    const overallRating = reviewStats?.averageRating || 0
    const totalReviews = reviewStats?.totalReviews || 0

    return (
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="relative h-[80vh] w-full overflow-hidden">
          <Image
            src={primaryImage}
            alt={venue.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="flex-1">
                  {/* Genre Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {venue.genres?.map((genre: string) => (
                      <Badge key={genre} variant="outline" className="bg-white/10 text-white border-white/20">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Venue Name & Location */}
                  <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">{venue.name}</h1>
                  
                  <div className="flex items-center gap-6 text-gray-300 text-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{venue.city}, {venue.country}</span>
                    </div>
                    
                    {venue.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span>{venue.capacity.toLocaleString()} capacity</span>
                      </div>
                    )}
                    
                    {totalReviews > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span>{overallRating.toFixed(1)} ({totalReviews} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                    Rate Venue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Description */}
              {venue.description && (
                <section>
                  <h2 className="text-3xl font-bold mb-6">About {venue.name}</h2>
                  <div className="prose prose-gray prose-invert max-w-none">
                    <p className="text-gray-300 text-lg leading-relaxed">{venue.description}</p>
                  </div>
                </section>
              )}

              {/* Upcoming Events */}
              {upcomingEvents && upcomingEvents.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold">Upcoming Events</h2>
                    <Link href={`/events?venue=${venue.id}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                      View All →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingEvents.map((event) => (
                      <Link key={event.id} href={`/event/${event.id}`}>
                        <Card className="group bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-all duration-300 overflow-hidden">
                          <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 relative">
                            {event.flyer_url && (
                              <Image
                                src={event.flyer_url}
                                alt={event.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="font-semibold text-white mb-2 line-clamp-2">{event.title}</h3>
                              <div className="flex items-center text-sm text-gray-300">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(event.start_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">Reviews & Ratings</h2>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Write Review
                  </Button>
                </div>

                {/* Rating Overview */}
                {totalReviews > 0 && (
                  <Card className="bg-zinc-900 border-zinc-800 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Overall Rating */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-400 mb-2">
                          {overallRating.toFixed(1)}
                        </div>
                        <div className="flex justify-center mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-400">{totalReviews} reviews</div>
                      </div>

                      {/* Sub-ratings */}
                      {reviewStats && (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-semibold mb-1">
                              {reviewStats.soundRating?.toFixed(1) || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-400">Sound</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-semibold mb-1">
                              {reviewStats.vibeRating?.toFixed(1) || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-400">Vibe</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-semibold mb-1">
                              {reviewStats.crowdRating?.toFixed(1) || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-400">Crowd</div>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                )}

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                      <Card key={review.id} className="bg-zinc-900 border-zinc-800 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {review.user?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold">{review.user?.full_name || 'Anonymous'}</div>
                              <div className="text-sm text-gray-400">
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating_overall ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                        )}
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
                      <div className="text-gray-400 mb-4">No reviews yet</div>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Be the first to review
                      </Button>
                    </Card>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Venue Info Card */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-xl font-semibold mb-4">Venue Information</h3>
                <div className="space-y-4">
                  
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-gray-400 text-sm">
                        {venue.address}<br />
                        {venue.city}, {venue.country}
                      </div>
                    </div>
                  </div>

                  {/* Capacity */}
                  {venue.capacity && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Capacity</div>
                        <div className="text-gray-400 text-sm">{venue.capacity.toLocaleString()} people</div>
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  {venue.contact_info && (
                    <>
                      {venue.contact_info.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium">Phone</div>
                            <div className="text-gray-400 text-sm">{venue.contact_info.phone}</div>
                          </div>
                        </div>
                      )}
                      
                      {venue.contact_info.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium">Email</div>
                            <div className="text-gray-400 text-sm">{venue.contact_info.email}</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Website */}
                  {venue.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Website</div>
                        <a 
                          href={venue.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                        >
                          Visit Website ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Social Links */}
              {venue.social_links && Object.keys(venue.social_links).length > 0 && (
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h3 className="text-xl font-semibold mb-4">Follow {venue.name}</h3>
                  <div className="space-y-3">
                    {Object.entries(venue.social_links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="capitalize">{platform}</span>
                      </a>
                    ))}
                  </div>
                </Card>
              )}

              {/* Map Placeholder */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-xl font-semibold mb-4">Location</h3>
                <div className="aspect-square bg-zinc-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm">Interactive map</div>
                    <div className="text-xs">Coming soon</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading venue:', error)
    notFound()
  }
} 