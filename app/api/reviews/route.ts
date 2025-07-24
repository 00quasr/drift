import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createReview, getReviews, validateRating, sanitizeComment, calculateOverallRating } from '@/lib/services/reviews'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('target_type') as 'venue' | 'event' | 'artist' | 'label' | 'collective'
    const targetId = searchParams.get('target_id')
    const status = searchParams.get('status') as 'visible' | 'pending_review' | 'hidden' | undefined
    const sort = searchParams.get('sort') as 'newest' | 'oldest' | 'helpful' | undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    if (!targetType || !targetId) {
      return NextResponse.json({ 
        success: false, 
        error: 'target_type and target_id are required' 
      }, { status: 400 })
    }

    const data = await getReviews(targetType, targetId, { status, sort, limit, offset })

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length 
    })
  } catch (error) {
    console.error('Error in GET /api/reviews:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch reviews' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required - no token provided' 
      }, { status: 401 })
    }
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined }, // Don't use cookies
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required',
        debug: { authError: authError?.message, hasUser: !!user }
      }, { status: 401 })
    }

    const body = await request.json()
    const { target_type, target_id, rating_sound, rating_vibe, rating_crowd, comment } = body

    // Validate required fields
    if (!target_type || !target_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'target_type and target_id are required' 
      }, { status: 400 })
    }

    // Validate target type
    if (!['venue', 'event', 'artist', 'label', 'collective'].includes(target_type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid target_type. Must be venue, event, artist, label, or collective' 
      }, { status: 400 })
    }

    // Validate ratings
    const ratings = [rating_sound, rating_vibe, rating_crowd].filter(r => r !== null && r !== undefined)
    if (ratings.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'At least one rating (sound, vibe, or crowd) is required' 
      }, { status: 400 })
    }

    for (const rating of ratings) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        return NextResponse.json({ 
          success: false, 
          error: 'Ratings must be integers between 1 and 10' 
        }, { status: 400 })
      }
    }

    // Calculate overall rating
    const rating_overall = calculateOverallRating(rating_sound, rating_vibe, rating_crowd)

    // Prepare review data
    const reviewData = {
      user_id: user.id,
      target_type,
      target_id,
      rating_overall,
      rating_sound: rating_sound || null,
      rating_vibe: rating_vibe || null,
      rating_crowd: rating_crowd || null,
      comment: comment ? sanitizeComment(comment) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Create review directly with authenticated supabase client
    // Check if user already has a review for this target
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', reviewData.user_id)
      .eq('target_type', reviewData.target_type)
      .eq('target_id', reviewData.target_id)
      .maybeSingle()

    if (existingReview) {
      return NextResponse.json({ 
        success: false, 
        error: 'You have already reviewed this item' 
      }, { status: 409 })
    }

    // Set status to visible by default (TODO: Add AI moderation)
    const moderatedReviewData = {
      ...reviewData,
      status: 'visible' as const
    }

    const { data, error: insertError } = await supabase
      .from('reviews')
      .insert(moderatedReviewData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating review:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create review' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data 
    }, { status: 201 })
  } catch (error) {

    console.error('Error in POST /api/reviews:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create review' 
    }, { status: 500 })
  }
}