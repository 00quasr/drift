"use client"

import React, { useState, useEffect } from 'react'
import { Star, User, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { ReviewModal } from './ReviewModal'
import { StarRating } from '@/components/ui/star-rating'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'
import ClassicLoader from '@/components/ui/loader'

interface Review {
  id: string
  user_id: string
  rating_overall: number
  rating_sound: number | null
  rating_vibe: number | null
  rating_crowd: number | null
  comment: string | null
  created_at: string
  helpful_count: number
  unhelpful_count: number
  user_vote?: 'upvote' | 'downvote' | null
  user?: {
    full_name: string | null
    display_name: string | null
    avatar_url: string | null
    role: string
  }
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  soundRating: number
  vibeRating: number
  crowdRating: number
  ratingDistribution: { [key: number]: number }
}

interface VenueReviewsProps {
  venueId: string
  venueName: string
}

export const VenueReviews: React.FC<VenueReviewsProps> = ({ venueId, venueName }) => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userHasReviewed, setUserHasReviewed] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const [votingReviewId, setVotingReviewId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful'>('newest')

  const fetchReviews = async () => {
    try {
      const [reviewsResponse, statsResponse] = await Promise.all([
        fetch(`/api/reviews?target_type=venue&target_id=${venueId}&sort=${sortBy}`),
        fetch(`/api/reviews/stats?target_type=venue&target_id=${venueId}`)
      ])

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        const reviewsArray = reviewsData.data || []
        setReviews(reviewsArray)
        
        // Check if current user has already reviewed this venue
        if (user) {
          const existingReview = reviewsArray.find((review: Review) => review.user_id === user.id)
          setUserHasReviewed(!!existingReview)
          setUserReview(existingReview || null)
        }
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data || null)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [venueId, sortBy])

  const handleReviewSubmitted = () => {
    fetchReviews() // Refresh reviews after submission
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return

    // Show confirmation
    if (!confirm('Are you sure you want to delete your review? This action cannot be undone.')) {
      return
    }

    setDeletingReviewId(reviewId)

    try {
      // Get access token for authentication
      const token = await authService.getAccessToken()
      if (!token) {
        throw new Error('Authentication token not available')
      }

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete review')
      }

      // Refresh reviews after deletion
      fetchReviews()
    } catch (error: any) {
      console.error('Error deleting review:', error)
      alert(error.message || 'Failed to delete review')
    } finally {
      setDeletingReviewId(null)
    }
  }

  const handleVote = async (reviewId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return

    setVotingReviewId(reviewId)

    try {
      // Get access token for authentication
      const token = await authService.getAccessToken()
      if (!token) {
        throw new Error('Authentication token not available')
      }

      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ vote_type: voteType })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote')
      }

      // Refresh reviews to get updated vote counts
      fetchReviews()
    } catch (error: any) {
      console.error('Error voting:', error)
      alert(error.message || 'Failed to vote')
    } finally {
      setVotingReviewId(null)
    }
  }

  if (loading) {
    return (
      <div className="relative bg-black border-2 border-white/20 p-6">
        <div className="absolute top-4 right-4 w-6 h-6 z-10">
          <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-widest uppercase text-white">
            REVIEWS & RATINGS
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <ClassicLoader />
          </div>
          <p className="text-white/60 font-bold tracking-widest uppercase text-sm">
            LOADING REVIEWS...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative bg-black border-2 border-white/20 p-6">
        <div className="absolute top-4 right-4 w-6 h-6 z-10">
          <div className="w-full h-full border-l-2 border-t-2 border-white/60 transform rotate-45" />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-widest uppercase text-white">
            REVIEWS & RATINGS
          </h2>
          {user && !userHasReviewed && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-white text-black hover:bg-white/90 border-2 border-white font-bold tracking-wider uppercase transition-all duration-200 text-sm"
            >
              WRITE REVIEW
            </button>
          )}
          {user && userHasReviewed && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 hover:border-white/50 font-bold tracking-wider uppercase transition-all duration-200 text-sm"
            >
              EDIT REVIEW
            </button>
          )}
        </div>

        {stats && stats.totalReviews > 0 ? (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="bg-white/5 border border-white/20 p-6">
              {/* Overall Rating */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-white">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      {Array.from({ length: 10 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(stats.averageRating)
                              ? 'fill-white text-white'
                              : 'fill-transparent text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-white/60 font-bold tracking-wider uppercase text-sm">
                      {stats.totalReviews} REVIEW{stats.totalReviews !== 1 ? 'S' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Ratings */}
              <div className="grid grid-cols-3 gap-4">
                {/* Sound Rating */}
                <div className="bg-black border border-white/30 p-4 text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    {stats.soundRating > 0 ? stats.soundRating.toFixed(1) : '-'}
                  </div>
                  <div className="text-white/60 font-bold tracking-widest uppercase text-xs">
                    SOUND
                  </div>
                  {stats.soundRating > 0 && (
                    <div className="flex items-center justify-center mt-2">
                      {Array.from({ length: 10 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(stats.soundRating)
                              ? 'fill-white text-white'
                              : 'fill-transparent text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Vibe Rating */}
                <div className="bg-black border border-white/30 p-4 text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    {stats.vibeRating > 0 ? stats.vibeRating.toFixed(1) : '-'}
                  </div>
                  <div className="text-white/60 font-bold tracking-widest uppercase text-xs">
                    VIBE
                  </div>
                  {stats.vibeRating > 0 && (
                    <div className="flex items-center justify-center mt-2">
                      {Array.from({ length: 10 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(stats.vibeRating)
                              ? 'fill-white text-white'
                              : 'fill-transparent text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Crowd Rating */}
                <div className="bg-black border border-white/30 p-4 text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    {stats.crowdRating > 0 ? stats.crowdRating.toFixed(1) : '-'}
                  </div>
                  <div className="text-white/60 font-bold tracking-widest uppercase text-xs">
                    CROWD
                  </div>
                  {stats.crowdRating > 0 && (
                    <div className="flex items-center justify-center mt-2">
                      {Array.from({ length: 10 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(stats.crowdRating)
                              ? 'fill-white text-white'
                              : 'fill-transparent text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sorting Controls */}
            <div className="flex items-center justify-between bg-white/5 border border-white/20 p-4">
              <h3 className="text-white font-bold tracking-widest uppercase text-sm">
                REVIEWS
              </h3>
              <div className="flex items-center space-x-3">
                <span className="text-white/60 font-bold tracking-wider uppercase text-xs">
                  SORT BY:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'helpful')}
                  className="bg-black border border-white/30 text-white font-bold tracking-wider uppercase text-xs px-3 py-2 focus:outline-none focus:border-white/50"
                >
                  <option value="newest">NEWEST</option>
                  <option value="oldest">OLDEST</option>
                  <option value="helpful">MOST HELPFUL</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white/5 border border-white/20 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/10 border border-white/20 flex items-center justify-center">
                        {review.user?.avatar_url ? (
                          <img 
                            src={review.user.avatar_url} 
                            alt="User" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white/60" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-bold tracking-wider uppercase text-sm">
                          {review.user?.display_name || review.user?.full_name || 'Anonymous User'}
                        </div>
                        <div className="text-white/60 font-medium tracking-wider uppercase text-xs">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true }).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-bold text-lg">
                        {review.rating_overall}/10
                      </div>
                      
                      {/* Delete button - only show for user's own review */}
                      {user && review.user_id === user.id && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                          className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 border border-white/20 hover:border-red-500/30 transition-all duration-200 disabled:opacity-50"
                          title="Delete Review"
                        >
                          {deletingReviewId === review.id ? (
                            <div className="scale-50">
                              <ClassicLoader />
                            </div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Individual Ratings */}
                  {(review.rating_sound || review.rating_vibe || review.rating_crowd) && (
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      {review.rating_sound && (
                        <div>
                          <div className="text-white/60 font-bold tracking-widest uppercase text-xs mb-1">SOUND</div>
                          <div className="text-white font-bold">{review.rating_sound}/10</div>
                        </div>
                      )}
                      {review.rating_vibe && (
                        <div>
                          <div className="text-white/60 font-bold tracking-widest uppercase text-xs mb-1">VIBE</div>
                          <div className="text-white font-bold">{review.rating_vibe}/10</div>
                        </div>
                      )}
                      {review.rating_crowd && (
                        <div>
                          <div className="text-white/60 font-bold tracking-widest uppercase text-xs mb-1">CROWD</div>
                          <div className="text-white font-bold">{review.rating_crowd}/10</div>
                        </div>
                      )}
                    </div>
                  )}

                  {review.comment && (
                    <p className="text-white/80 leading-relaxed mb-4">
                      {review.comment}
                    </p>
                  )}

                  {/* Vote section - always show counts, only show buttons for logged in users (but not on own review) */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-4">
                      {user && review.user_id !== user.id ? (
                        <>
                          {/* Interactive voting buttons for logged-in users */}
                          <button
                            onClick={() => handleVote(review.id, 'upvote')}
                            disabled={votingReviewId === review.id}
                            className={`flex items-center space-x-2 px-3 py-2 border transition-all duration-200 disabled:opacity-50 ${
                              review.user_vote === 'upvote'
                                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                : 'bg-white/5 hover:bg-green-500/10 border-white/20 hover:border-green-500/30 text-white/60 hover:text-green-400'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="font-bold tracking-wider uppercase text-xs">
                              {review.helpful_count}
                            </span>
                          </button>
                          
                          <button
                            onClick={() => handleVote(review.id, 'downvote')}
                            disabled={votingReviewId === review.id}
                            className={`flex items-center space-x-2 px-3 py-2 border transition-all duration-200 disabled:opacity-50 ${
                              review.user_vote === 'downvote'
                                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                : 'bg-white/5 hover:bg-red-500/10 border-white/20 hover:border-red-500/30 text-white/60 hover:text-red-400'
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span className="font-bold tracking-wider uppercase text-xs">
                              {review.unhelpful_count}
                            </span>
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Static vote display for anonymous users or own reviews */}
                          <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 border border-white/20 text-white/60">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="font-bold tracking-wider uppercase text-xs">
                              {review.helpful_count}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 border border-white/20 text-white/60">
                            <ThumbsDown className="w-4 h-4" />
                            <span className="font-bold tracking-wider uppercase text-xs">
                              {review.unhelpful_count}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {user && review.user_id !== user.id && (
                      <div className="text-white/40 font-bold tracking-wider uppercase text-xs">
                        WAS THIS HELPFUL?
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
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
        )}
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetType="venue"
        targetId={venueId}
        targetName={venueName}
        onSubmit={handleReviewSubmitted}
        existingReview={userReview}
      />
    </>
  )
}