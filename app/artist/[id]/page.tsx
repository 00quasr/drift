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
  try {
    // Fetch artist data and reviews in parallel
    const [artist, reviews, reviewStats] = await Promise.all([
      getArtistById(params.id),
      getReviews('artist', params.id, { limit: 10 }),
      getReviewStats('artist', params.id)
    ])
    
    // For now, we'll set empty arrays for events until we implement artist event filtering
    const upcomingEvents: any[] = []
    const pastEvents: any[] = []

    if (!artist) {
      notFound()
    }

    // Get the primary image or fallback
    const artistImage = Array.isArray(artist.images) && artist.images.length > 0 
      ? String(artist.images[0])
      : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

    const coverImage = Array.isArray(artist.images) && artist.images.length > 1
      ? String(artist.images[1])
      : 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'

    const overallRating = reviewStats?.averageRating || 0
    const totalReviews = reviewStats?.totalReviews || 0

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        {/* Hero Section */}
        <div className="relative h-[70vh] w-full overflow-hidden">
          <Image
            src={coverImage}
            alt={`${artist.name} cover`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end gap-8">
                
                {/* Artist Image */}
                <div className="relative">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-900">
                    <Image
                      src={artistImage}
                      alt={artist.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                
                {/* Artist Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-slate-900 text-white border-slate-700">Artist</Badge>
                    {artist.genres?.map((genre: string) => (
                      <Badge key={genre} variant="outline" className="bg-slate-900/50 text-slate-300 border-slate-700">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-medium mb-4 leading-tight">{artist.name}</h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-lg text-slate-300">
                    {artist.city && artist.country && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <span>{artist.city}, {artist.country}</span>
                      </div>
                    )}
                    
                    {totalReviews > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span>{overallRating.toFixed(1)} ({totalReviews} reviews)</span>
                      </div>
                    )}
                    
                    {(upcomingEvents?.length || 0) + (pastEvents?.length || 0) > 0 && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span>{(upcomingEvents?.length || 0) + (pastEvents?.length || 0)} events</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="bg-slate-900/50 border-slate-700 text-white hover:bg-slate-800">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="bg-slate-900/50 border-slate-700 text-white hover:bg-slate-800">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 border border-slate-700">
                    Rate Artist
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
              
              {/* Biography */}
              {artist.bio && (
                <section>
                  <h2 className="text-3xl font-medium mb-6">Biography</h2>
                  <div className="prose prose-gray prose-invert max-w-none">
                    <p className="text-slate-300 text-lg leading-relaxed">{artist.bio}</p>
                  </div>
                </section>
              )}

              {/* Upcoming Events */}
              {upcomingEvents && upcomingEvents.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-medium">Upcoming Performances</h2>
                    <Link href={`/events?artist=${artist.id}`} className="text-slate-400 hover:text-white transition-colors">
                      View All →
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <Link key={event.id} href={`/event/${event.id}`}>
                        <Card className="group bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 transition-all duration-300 p-6">
                          <div className="flex items-center gap-6">
                            {/* Event Image */}
                            <div className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                              {event.flyer_url ? (
                                <Image
                                  src={event.flyer_url}
                                  alt={event.title}
                                  width={80}
                                  height={80}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <Music2 className="w-8 h-8 text-slate-400" />
                              )}
                            </div>
                            
                            {/* Event Info */}
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold group-hover:text-slate-300 transition-colors mb-2">
                                {event.title}
                              </h3>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(event.start_date).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                                
                                {event.venue && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.venue.name}, {event.venue.city}</span>
                                  </div>
                                )}
                                
                                {event.genres && event.genres.length > 0 && (
                                  <div className="flex gap-1">
                                    {event.genres.slice(0, 2).map((genre: string) => (
                                      <Badge key={genre} variant="outline" className="text-xs border-slate-700 text-slate-400">
                                        {genre}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Past Events */}
              {pastEvents && pastEvents.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-medium">Past Performances</h2>
                    <Link href={`/events?artist=${artist.id}&past=true`} className="text-slate-400 hover:text-white transition-colors">
                      View All →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastEvents.slice(0, 4).map((event) => (
                      <Link key={event.id} href={`/event/${event.id}`}>
                        <Card className="group bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 transition-all duration-300 p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center">
                              <Music2 className="w-6 h-6 text-slate-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold group-hover:text-slate-300 transition-colors line-clamp-1">
                                {event.title}
                              </h4>
                              <div className="text-sm text-slate-400">
                                {new Date(event.start_date).toLocaleDateString()} • {event.venue?.name}
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
                  <h2 className="text-3xl font-medium">Reviews & Ratings</h2>
                  <Button className="bg-slate-900 hover:bg-slate-800 border border-slate-700">
                    Write Review
                  </Button>
                </div>

                {/* Rating Overview */}
                {totalReviews > 0 && (
                  <Card className="bg-slate-900/50 border-slate-800 p-6 mb-8">
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
              
              {/* Artist Info Card */}
              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <h3 className="text-xl font-semibold mb-4">Artist Information</h3>
                <div className="space-y-4">
                  
                  {/* Location */}
                  {artist.city && artist.country && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="font-medium">Based in</div>
                        <div className="text-slate-400 text-sm">{artist.city}, {artist.country}</div>
                      </div>
                    </div>
                  )}

                  {/* Genres */}
                  {artist.genres && artist.genres.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Music2 className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium mb-2">Genres</div>
                        <div className="flex flex-wrap gap-2">
                          {artist.genres.map((genre: string) => (
                            <Badge key={genre} variant="outline" className="text-xs border-slate-700 text-slate-400">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {artist.social_links && Object.keys(artist.social_links as any).length > 0 && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <div className="font-medium mb-2">Social Media</div>
                        <div className="flex gap-2">
                          {Object.entries(artist.social_links as any).map(([platform, url]: [string, any]) => {
                            if (!url) return null
                            const Icon = platform === 'instagram' ? Instagram : 
                                       platform === 'facebook' ? Facebook :
                                       platform === 'twitter' ? Twitter : Globe
                            return (
                              <a
                                key={platform}
                                href={String(url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                              >
                                <Icon className="w-4 h-4 text-slate-400" />
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  {totalReviews > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Average Rating</span>
                      <span className="font-medium">{overallRating.toFixed(1)}/5</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Reviews</span>
                    <span className="font-medium">{totalReviews}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-400">Upcoming Events</span>
                    <span className="font-medium">{upcomingEvents?.length || 0}</span>
                  </div>
                  
                  {artist.genres && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Main Genre</span>
                      <span className="font-medium">{artist.genres[0]}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading artist:', error)
    notFound()
  }
} 