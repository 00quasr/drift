"use client"

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  Music,
  Clock,
  TrendingUp,
  Volume2,
  Users,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface Review {
  id: string
  target_type: string
  target_id: string
  rating_overall: number | null
  rating_sound: number | null
  rating_vibe: number | null
  rating_crowd: number | null
  comment: string | null
  created_at: string
  target_name?: string
  target_slug?: string
  target_location?: string
  target_date?: string
}

interface ProfileReviewsProps {
  profileId: string
  isOwnProfile: boolean
}

export const ProfileReviews: React.FC<ProfileReviewsProps> = ({
  profileId,
  isOwnProfile
}) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    venueReviews: 0,
    eventReviews: 0,
    artistReviews: 0
  })

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true)

        // Fetch reviews
        const { data: reviewsData, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', profileId)
          .eq('status', 'visible')
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        // Enrich reviews with target details
        const enrichedReviews = await Promise.all(
          reviewsData.map(async (review) => {
            let targetName = ''
            let targetSlug = ''
            let targetLocation = ''
            let targetDate = ''

            try {
              if (review.target_type === 'venue') {
                const { data } = await supabase
                  .from('venues')
                  .select('name, slug, city, country')
                  .eq('id', review.target_id)
                  .single()
                
                if (data) {
                  targetName = data.name
                  targetSlug = data.slug
                  targetLocation = `${data.city}, ${data.country}`
                }
              } else if (review.target_type === 'event') {
                const { data } = await supabase
                  .from('events')
                  .select('title, slug, start_date, venues(city, country)')
                  .eq('id', review.target_id)
                  .single()
                
                if (data) {
                  targetName = data.title
                  targetSlug = data.slug
                  targetDate = data.start_date
                  if (data.venues) {
                    targetLocation = `${data.venues.city}, ${data.venues.country}`
                  }
                }
              } else if (review.target_type === 'artist') {
                const { data } = await supabase
                  .from('artists')
                  .select('name, slug, city, country')
                  .eq('id', review.target_id)
                  .single()
                
                if (data) {
                  targetName = data.name
                  targetSlug = data.slug
                  targetLocation = `${data.city}, ${data.country}`
                }
              }
            } catch (e) {
              console.error('Error fetching target details:', e)
            }

            return {
              ...review,
              target_name: targetName,
              target_slug: targetSlug,
              target_location: targetLocation,
              target_date: targetDate
            }
          })
        )

        setReviews(enrichedReviews)

        // Calculate stats
        const total = reviewsData.length
        const ratings = reviewsData.filter(r => r.rating_overall).map(r => r.rating_overall)
        const avgRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0
        const venueReviews = reviewsData.filter(r => r.target_type === 'venue').length
        const eventReviews = reviewsData.filter(r => r.target_type === 'event').length
        const artistReviews = reviewsData.filter(r => r.target_type === 'artist').length

        setStats({
          total,
          avgRating,
          venueReviews,
          eventReviews,
          artistReviews
        })

      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [profileId])

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'venue': return MapPin
      case 'event': return Calendar
      case 'artist': return Music
      default: return MessageSquare
    }
  }


  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-white/40">No rating</span>
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-white/20'
            }`}
          />
        ))}
        <span className="ml-1 text-white font-bold text-sm">{rating}</span>
      </div>
    )
  }

  const renderDetailedRatings = (review: Review) => {
    const ratings = [
      { label: 'Sound', value: review.rating_sound, icon: Volume2 },
      { label: 'Vibe', value: review.rating_vibe, icon: Zap },
      { label: 'Crowd', value: review.rating_crowd, icon: Users }
    ]

    return (
      <div className="grid grid-cols-3 gap-4 mt-4">
        {ratings.map((rating) => {
          const Icon = rating.icon
          return (
            <div key={rating.label} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-xs font-bold uppercase tracking-wider">
                  {rating.label}
                </span>
              </div>
              {renderStars(rating.value)}
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Review Stats */}
      <div>
        <h2 className="text-2xl font-bold tracking-wider uppercase mb-6 text-white">
          REVIEW STATISTICS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/5 border border-white/20 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
              <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                TOTAL REVIEWS
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/5 border border-white/20 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.avgRating.toFixed(1)}
              </div>
              <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                AVG RATING
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/5 border border-white/20 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.venueReviews}</div>
              <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                VENUES
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/5 border border-white/20 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.eventReviews + stats.artistReviews}
              </div>
              <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                EVENTS & ARTISTS
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold tracking-wider uppercase text-white">
            RECENT REVIEWS
          </h3>
          <div className="flex items-center gap-2 text-white/60">
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium tracking-wider uppercase text-sm">
              LAST {reviews.length} REVIEWS
            </span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <Card className="bg-white/5 border border-white/20 p-12">
            <div className="text-center space-y-4">
              <MessageSquare className="w-16 h-16 text-white/40 mx-auto" />
              <h3 className="text-xl font-bold tracking-wider uppercase text-white">
                NO REVIEWS YET
              </h3>
              <p className="text-white/60 font-medium max-w-md mx-auto">
                {isOwnProfile 
                  ? "Share your experiences by writing your first review!"
                  : "This user hasn't written any reviews yet."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => {
              const Icon = getTargetIcon(review.target_type)

              return (
                <Card key={review.id} className="bg-white/5 border border-white/20 p-6">
                  <div className="space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-white/20 bg-white/5 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white/60" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="font-bold tracking-wider uppercase text-xs bg-white/10 text-white border-white/20">
                              {review.target_type}
                            </Badge>
                          </div>
                          {review.target_name && (
                            <Link 
                              href={`/${review.target_type}s/${review.target_slug}`}
                              className="text-lg font-bold tracking-wider uppercase text-white hover:text-white/80 transition-colors"
                            >
                              {review.target_name}
                            </Link>
                          )}
                          {review.target_location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-white/40" />
                              <span className="text-white/60 text-sm font-medium">
                                {review.target_location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {review.rating_overall && renderStars(review.rating_overall)}
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-white/40" />
                          <span className="text-white/60 text-sm font-medium">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Ratings */}
                    {(review.rating_sound || review.rating_vibe || review.rating_crowd) && (
                      renderDetailedRatings(review)
                    )}

                    {/* Review Comment */}
                    {review.comment && (
                      <div className="bg-white/5 border border-white/10 p-4 rounded">
                        <p className="text-white/90 leading-relaxed font-medium">
                          "{review.comment}"
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}

            {reviews.length >= 20 && (
              <Card className="bg-white/5 border border-white/20 p-4">
                <div className="text-center">
                  <button className="text-white hover:text-white/80 font-bold tracking-wider uppercase text-sm transition-colors">
                    LOAD MORE REVIEWS
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}