import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/types/database'

type Review = Database['public']['Tables']['reviews']['Row']
type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
type ReviewUpdate = Database['public']['Tables']['reviews']['Update']
type ReviewFlag = Database['public']['Tables']['review_flags']['Row']
type ReviewFlagInsert = Database['public']['Tables']['review_flags']['Insert']

// Client-side functions
export async function getReviews(
  targetType: 'venue' | 'event' | 'artist' | 'label' | 'collective',
  targetId: string,
  filters?: {
    status?: 'visible' | 'pending_review' | 'hidden'
    sort?: 'newest' | 'oldest' | 'helpful'
    limit?: number
    offset?: number
  }
) {
  const supabase = createClient()
  
  let query = supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(full_name, display_name, role, avatar_url)
    `)
    .eq('target_type', targetType)
    .eq('target_id', targetId)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.eq('status', 'visible') // Default to visible reviews
  }

  // Apply sorting
  switch (filters?.sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'helpful':
      query = query.order('helpful_count', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching reviews:', error)
    throw error
  }

  // Get current user's votes for these reviews
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  if (currentUser && data && data.length > 0) {
    const reviewIds = data.map(review => review.id)
    const { data: userVotes } = await supabase
      .from('review_votes')
      .select('review_id, vote_type')
      .eq('user_id', currentUser.id)
      .in('review_id', reviewIds)

    // Add user votes to reviews
    const reviewsWithVotes = data.map(review => ({
      ...review,
      user_vote: userVotes?.find(vote => vote.review_id === review.id)?.vote_type || null
    }))

    return reviewsWithVotes
  }

  return data
}

export async function getReviewById(id: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(full_name, role)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching review:', error)
    throw error
  }

  return data
}

export async function getUserReviews(userId: string, limit = 10) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      venue:venues(id, name, slug),
      event:events(id, title, slug),
      artist:artists(id, name, slug)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching user reviews:', error)
    throw error
  }

  return data
}

export async function getUserReviewForTarget(
  userId: string,
  targetType: 'venue' | 'event' | 'artist',
  targetId: string
) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user review:', error)
    throw error
  }

  return data
}

export async function getReviewStats(
  targetType: 'venue' | 'event' | 'artist' | 'label' | 'collective',
  targetId: string
) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select('rating_overall, rating_sound, rating_vibe, rating_crowd')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('status', 'visible')
    .not('rating_overall', 'is', null)

  if (error) {
    console.error('Error fetching review stats:', error)
    throw error
  }

  if (!data || data.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      soundRating: 0,
      vibeRating: 0,
      crowdRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }
    }
  }

  const validRatings = data.filter(r => r.rating_overall !== null)
  const soundRatings = data.filter(r => r.rating_sound !== null)
  const vibeRatings = data.filter(r => r.rating_vibe !== null)
  const crowdRatings = data.filter(r => r.rating_crowd !== null)

  const averageRating = validRatings.length > 0
    ? validRatings.reduce((sum, r) => sum + (r.rating_overall || 0), 0) / validRatings.length
    : 0

  const soundRating = soundRatings.length > 0
    ? soundRatings.reduce((sum, r) => sum + (r.rating_sound || 0), 0) / soundRatings.length
    : 0

  const vibeRating = vibeRatings.length > 0
    ? vibeRatings.reduce((sum, r) => sum + (r.rating_vibe || 0), 0) / vibeRatings.length
    : 0

  const crowdRating = crowdRatings.length > 0
    ? crowdRatings.reduce((sum, r) => sum + (r.rating_crowd || 0), 0) / crowdRatings.length
    : 0

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }
  validRatings.forEach(r => {
    if (r.rating_overall && r.rating_overall >= 1 && r.rating_overall <= 10) {
      ratingDistribution[r.rating_overall as keyof typeof ratingDistribution]++
    }
  })

  return {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews: validRatings.length,
    soundRating: Number(soundRating.toFixed(1)),
    vibeRating: Number(vibeRating.toFixed(1)),
    crowdRating: Number(crowdRating.toFixed(1)),
    ratingDistribution
  }
}

// Server-side functions
export async function createReview(reviewData: ReviewInsert) {
  const supabase = createClient()
  
  // Check if user already has a review for this target
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', reviewData.user_id)
    .eq('target_type', reviewData.target_type)
    .eq('target_id', reviewData.target_id)
    .maybeSingle()

  if (existingReview) {
    throw new Error('User has already reviewed this item')
  }

  // TODO: Add AI moderation here
  // For now, we'll set status to 'visible' by default
  const moderatedReviewData = {
    ...reviewData,
    status: 'visible' as const
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert(moderatedReviewData)
    .select()
    .single()

  if (error) {
    console.error('Error creating review:', error)
    throw error
  }

  return data
}

export async function updateReview(id: string, reviewData: ReviewUpdate) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .update(reviewData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating review:', error)
    throw error
  }

  return data
}

export async function deleteReview(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting review:', error)
    throw error
  }
}

export async function moderateReview(
  id: string,
  status: 'visible' | 'pending_review' | 'hidden',
  moderationNotes?: string
) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .update({ 
      status,
      moderation_notes: moderationNotes || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error moderating review:', error)
    throw error
  }

  return data
}

// Review flagging functions
export async function flagReview(reviewId: string, flaggedBy: string, reason?: string) {
  const supabase = createClient()
  
  const flagData: ReviewFlagInsert = {
    review_id: reviewId,
    flagged_by: flaggedBy,
    reason: reason || null
  }

  const { data, error } = await supabase
    .from('review_flags')
    .insert(flagData)
    .select()
    .single()

  if (error) {
    console.error('Error flagging review:', error)
    throw error
  }

  // Update the review to mark it as user flagged
  await supabase
    .from('reviews')
    .update({ user_flagged: true })
    .eq('id', reviewId)

  return data
}

export async function getFlaggedReviews(limit = 50) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(full_name, role),
      review_flags(
        id,
        reason,
        flagged_by,
        created_at,
        flagger:profiles(full_name, role)
      )
    `)
    .eq('user_flagged', true)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching flagged reviews:', error)
    throw error
  }

  return data
}

export async function removeFlagsFromReview(reviewId: string) {
  const supabase = createClient()
  
  // Remove all flags for this review
  await supabase
    .from('review_flags')
    .delete()
    .eq('review_id', reviewId)

  // Update review to remove user_flagged status
  const { data, error } = await supabase
    .from('reviews')
    .update({ user_flagged: false })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) {
    console.error('Error removing flags from review:', error)
    throw error
  }

  return data
}

// Utility functions
export function validateRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating)
}

export function sanitizeComment(comment: string): string {
  return comment
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .slice(0, 1000) // Limit to 1000 characters
}

export function calculateOverallRating(
  sound?: number | null,
  vibe?: number | null,
  crowd?: number | null
): number | null {
  const ratings = [sound, vibe, crowd].filter((r): r is number => r !== null && r !== undefined)
  
  if (ratings.length === 0) return null
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  return Math.round(sum / ratings.length)
} 