import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Clock, Users, ExternalLink, Star, Heart, Share2, Ticket, Music } from "lucide-react"
import Link from "next/link"
import { getEvent } from "@/lib/services/events"
import { getReviews, getReviewStats } from "@/lib/services/reviews"
import { notFound } from "next/navigation"
import Image from "next/image"

interface EventPageProps {
  params: { id: string }
}

export default async function EventPage({ params }: EventPageProps) {
  try {
    // Fetch event data and reviews in parallel
    const [event, reviews, reviewStats] = await Promise.all([
      getEvent(params.id),
      getReviews('event', params.id, { limit: 10 }),
      getReviewStats('event', params.id)
    ])

    if (!event) {
      notFound()
    }

    // Get the primary flyer or fallback
    const eventFlyer = event.flyer_url || 
      (Array.isArray(event.images) && event.images.length > 0 ? String(event.images[0]) : null) ||
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'

    const overallRating = reviewStats?.averageRating || 0
    const totalReviews = reviewStats?.totalReviews || 0

    // Format dates
    const startDate = new Date(event.start_date)
    const endDate = event.end_date ? new Date(event.end_date) : null
    const isUpcoming = startDate > new Date()
    const isPast = startDate < new Date()

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        {/* Hero Section */}
        <div className="relative h-[90vh] w-full overflow-hidden">
          <Image
            src={eventFlyer}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                <div className="flex-1">
                  {/* Event Status Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    {isUpcoming && (
                      <Badge className="bg-green-600 text-white">Upcoming</Badge>
                    )}
                    {isPast && (
                      <Badge className="bg-slate-600 text-white">Past Event</Badge>
                    )}
                    {event.genres?.map((genre: string) => (
                      <Badge key={genre} variant="outline" className="bg-slate-900/50 text-slate-300 border-slate-700">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Event Title */}
                  <h1 className="text-5xl lg:text-8xl font-medium mb-6 leading-tight">{event.title}</h1>
                  
                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-lg">
                    {/* Date & Time */}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-slate-400" />
                      <div>
                        <div className="font-semibold">
                          {startDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-slate-300 text-sm">
                          {startDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {endDate && ` - ${endDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}`}
                        </div>
                      </div>
                    </div>

                    {/* Venue */}
                    {event.venue && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-slate-400" />
                        <div>
                          <Link 
                            href={`/venue/${event.venue.id}`}
                            className="font-semibold hover:text-slate-300 transition-colors"
                          >
                            {event.venue.name}
                          </Link>
                          <div className="text-slate-300 text-sm">
                            {event.venue.city}, {event.venue.country}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    {(event.ticket_price_min || event.ticket_price_max) && (
                      <div className="flex items-center gap-3">
                        <Ticket className="w-6 h-6 text-slate-400" />
                        <div>
                          <div className="font-semibold">
                            {event.currency || '€'}{event.ticket_price_min}
                            {event.ticket_price_max && event.ticket_price_max !== event.ticket_price_min && 
                              ` - ${event.currency || '€'}${event.ticket_price_max}`
                            }
                          </div>
                          <div className="text-slate-300 text-sm">Entry fee</div>
                        </div>
                      </div>
                    )}

                    {/* Rating */}
                    {totalReviews > 0 && (
                      <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        <div>
                          <div className="font-semibold">{overallRating.toFixed(1)}/5</div>
                          <div className="text-slate-300 text-sm">{totalReviews} reviews</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="bg-slate-900/50 border-slate-700 text-white hover:bg-slate-800">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="bg-slate-900/50 border-slate-700 text-white hover:bg-slate-800">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {event.ticket_url && isUpcoming && (
                      <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-8">
                        <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                          <Ticket className="w-4 h-4 mr-2" />
                          Get Tickets
                        </a>
                      </Button>
                    )}
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 border border-slate-700">
                      Rate Event
                    </Button>
                  </div>
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
              {event.description && (
                <section>
                  <h2 className="text-3xl font-medium mb-6">About This Event</h2>
                  <div className="prose prose-gray prose-invert max-w-none">
                    <p className="text-slate-300 text-lg leading-relaxed">{event.description}</p>
                  </div>
                </section>
              )}

              {/* Lineup */}
              {event.artists && event.artists.length > 0 && (
                <section>
                  <h2 className="text-3xl font-medium mb-6">Lineup</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {event.artists.map((artist) => (
                      <Link key={artist.id} href={`/artist/${artist.id}`}>
                        <Card className="group bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 transition-all duration-300 overflow-hidden">
                          <div className="flex items-center gap-4 p-6">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                              {Array.isArray(artist.images) && artist.images.length > 0 ? (
                                <Image
                                  src={String(artist.images[0])}
                                  alt={artist.name}
                                  width={64}
                                  height={64}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <Music className="w-8 h-8 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg group-hover:text-slate-300 transition-colors">
                                {artist.name}
                              </h3>
                              {artist.genres && artist.genres.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {artist.genres.slice(0, 2).map((genre: string) => (
                                    <Badge key={genre} variant="outline" className="text-xs border-slate-700 text-slate-400">
                                      {genre}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
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
                  <h2 className="text-3xl font-medium">Reviews & Ratings</h2>
                  <Button className="bg-slate-900 hover:bg-slate-800 border border-slate-700">
                    Write Review
                  </Button>
                </div>

                <div className="space-y-6">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                      <Card key={review.id} className="bg-slate-900/50 border-slate-800 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-semibold">
                              {review.user?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold">{review.user?.full_name || 'Anonymous'}</div>
                              <div className="text-sm text-slate-400">
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating_overall ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-slate-300 leading-relaxed">{review.comment}</p>
                        )}
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-slate-900/50 border-slate-800 p-8 text-center">
                      <div className="text-slate-400 mb-4">No reviews yet</div>
                      <Button className="bg-slate-900 hover:bg-slate-800 border border-slate-700">
                        Be the first to review
                      </Button>
                    </Card>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Event Info Card */}
              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <h3 className="text-xl font-semibold mb-4">Event Details</h3>
                <div className="space-y-4">
                  
                  {/* Full Date & Time */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Date & Time</div>
                      <div className="text-slate-400 text-sm">
                        {startDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}<br />
                        {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {endDate && ` - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                    </div>
                  </div>

                  {/* Venue */}
                  {event.venue && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Venue</div>
                        <Link 
                          href={`/venue/${event.venue.id}`}
                          className="text-slate-400 hover:text-white text-sm transition-colors"
                        >
                          {event.venue.name}
                        </Link>
                        <div className="text-slate-400 text-sm">
                          {event.venue.address}<br />
                          {event.venue.city}, {event.venue.country}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  {(event.ticket_price_min || event.ticket_price_max) && (
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="font-medium">Pricing</div>
                        <div className="text-slate-400 text-sm">
                          {event.currency || '€'}{event.ticket_price_min}
                          {event.ticket_price_max && event.ticket_price_max !== event.ticket_price_min && 
                            ` - ${event.currency || '€'}${event.ticket_price_max}`
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ticket Button */}
                {event.ticket_url && isUpcoming && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                        <Ticket className="w-4 h-4 mr-2" />
                        Buy Tickets
                      </a>
                    </Button>
                  </div>
                )}
              </Card>

              {/* Artist Count */}
              {event.artists && event.artists.length > 0 && (
                <Card className="bg-slate-900/50 border-slate-800 p-6">
                  <h3 className="text-xl font-semibold mb-4">Artists</h3>
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-medium">{event.artists.length} Performing</div>
                      <div className="text-slate-400 text-sm">
                        {event.artists.slice(0, 3).map(a => a.name).join(', ')}
                        {event.artists.length > 3 && ` +${event.artists.length - 3} more`}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Related Events */}
              {event.venue && (
                <Card className="bg-slate-900/50 border-slate-800 p-6">
                  <h3 className="text-xl font-semibold mb-4">More at {event.venue.name}</h3>
                  <Link 
                    href={`/venue/${event.venue.id}`}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    View all events at this venue →
                  </Link>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading event:', error)
    notFound()
  }
} 