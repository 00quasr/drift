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
      <div className="min-h-screen bg-slate-950 text-white">
        {/* Hero Section */}
        <div className="relative h-[80vh] w-full overflow-hidden">
          <Image
            src={primaryImage}
            alt={venue.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          
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
                  <h1 className="text-5xl md:text-7xl font-medium mb-4 leading-tight">{venue.name}</h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{venue.city}, {venue.country}</span>
                    </div>
                    {venue.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span className="text-lg">{venue.capacity.toLocaleString()} capacity</span>
                      </div>
                    )}
                    {overallRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-lg">{overallRating.toFixed(1)} ({totalReviews} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="bg-slate-950/80 border-slate-700 text-white hover:bg-slate-900">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="bg-slate-950/80 border-slate-700 text-white hover:bg-slate-900">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button className="bg-white text-slate-950 hover:bg-slate-100">
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
                  <h2 className="text-3xl font-medium mb-6">About {venue.name}</h2>
                  <div className="prose prose-gray prose-invert max-w-none">
                    <p className="text-slate-300 text-lg leading-relaxed">{venue.description}</p>
                  </div>
                </section>
              )}

              {/* Upcoming Events */}
              {upcomingEvents && upcomingEvents.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-medium">Upcoming Events</h2>
                    <Link href={`/events?venue=${venue.id}`} className="text-slate-400 hover:text-white transition-colors">
                      View All →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingEvents.map((event: any) => (
                      <Link key={event.id} href={`/event/${event.id}`}>
                        <Card className="bg-slate-900 border-slate-800 hover:bg-slate-800 transition-colors duration-200 overflow-hidden">
                          <div className="aspect-video relative">
                            {event.flyer_url || event.images?.[0] ? (
                              <Image
                                src={event.flyer_url || event.images[0]}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                <Calendar className="w-12 h-12 text-slate-600" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-400">
                                {new Date(event.start_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="text-sm text-slate-400">
                                {new Date(event.start_date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <h3 className="font-medium text-white mb-1">{event.title}</h3>
                            {event.artists && event.artists.length > 0 && (
                              <p className="text-sm text-slate-400">{event.artists[0].name}</p>
                            )}
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-medium">Reviews & Ratings</h2>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white border-slate-800">
                    Write Review
                  </Button>
                </div>

                {/* Review Summary */}
                {overallRating > 0 && (
                  <div className="bg-slate-900 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-medium text-white">{overallRating.toFixed(1)}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(overallRating) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} 
                            />
                          ))}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">{totalReviews} reviews</div>
                      </div>
                      
                      {reviewStats && (
                        <div className="flex-1 space-y-2">
                          {[
                            { label: 'Sound', value: reviewStats.soundRating },
                            { label: 'Vibe', value: reviewStats.vibeRating },
                            { label: 'Crowd', value: reviewStats.crowdRating }
                          ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between">
                              <span className="text-sm text-slate-400">{label}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-slate-800 rounded-full">
                                  <div 
                                    className="h-full bg-yellow-400 rounded-full" 
                                    style={{ width: `${(value / 5) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm text-white w-8">{value.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Individual Reviews */}
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="bg-slate-900 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white">Anonymous User</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="text-sm text-slate-400">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-slate-300 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-900 rounded-lg">
                    <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No reviews yet</h3>
                    <p className="text-slate-400 mb-6">Be the first to review {venue.name}</p>
                    <Button className="bg-slate-800 hover:bg-slate-700 text-white">
                      Be the first to review
                    </Button>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Venue Information */}
              <Card className="bg-slate-900 border-slate-800 p-6">
                <h3 className="text-xl font-medium text-white mb-6">Venue Information</h3>
                
                <div className="space-y-4">
                  {/* Address */}
                  <div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-white">Address</div>
                        <div className="text-slate-400 text-sm">
                          {venue.address || 'Address not available'}<br />
                          {venue.city}, {venue.country}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Capacity */}
                  {venue.capacity && (
                    <div>
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <div className="font-medium text-white">Capacity</div>
                          <div className="text-slate-400 text-sm">{venue.capacity.toLocaleString()} people</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Website */}
                  {venue.website && (
                    <div>
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <div className="font-medium text-white">Website</div>
                          <a 
                            href={venue.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white text-sm transition-colors"
                          >
                            Visit Website ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Social Media */}
              {venue.social_links && Object.keys(venue.social_links).length > 0 && (
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <h3 className="text-xl font-medium text-white mb-6">Follow {venue.name}</h3>
                  
                  <div className="space-y-3">
                    {Object.entries(venue.social_links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="capitalize">{platform}</span>
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading venue:', error)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-white mb-4">Venue not found</h1>
          <p className="text-slate-400 mb-6">The venue you're looking for doesn't exist or has been removed.</p>
          <Link href="/venues">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              Browse All Venues
            </Button>
          </Link>
        </div>
      </div>
    )
  }
} 