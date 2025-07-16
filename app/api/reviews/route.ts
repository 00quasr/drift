import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createReview, getReviews, validateRating, sanitizeComment, calculateOverallRating } from '@/lib/services/reviews'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('target_type') as 'venue' | 'event' | 'artist'
    const targetId = searchParams.get('target_id')
    const status = searchParams.get('status') as 'visible' | 'pending_review' | 'hidden' | undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    if (!targetType || !targetId) {
      return NextResponse.json({ 
        success: false, 
        error: 'target_type and target_id are required' 
      }, { status: 400 })
    }

    const data = await getReviews(targetType, targetId, { status, limit, offset })

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
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
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
    if (!['venue', 'event', 'artist'].includes(target_type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid target_type. Must be venue, event, or artist' 
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
      if (!validateRating(rating)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Ratings must be integers between 1 and 5' 
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

    const data = await createReview(reviewData)

    return NextResponse.json({ 
      success: true, 
      data 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'User has already reviewed this item') {
      return NextResponse.json({ 
        success: false, 
        error: 'You have already reviewed this item' 
      }, { status: 409 })
    }

    console.error('Error in POST /api/reviews:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create review' 
    }, { status: 500 })
  }
}