import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getReviewById, updateReview, deleteReview, validateRating, sanitizeComment, calculateOverallRating } from '@/lib/services/reviews'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getReviewById(params.id)
    
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Review not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Error in GET /api/reviews/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch review' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get review to check ownership
    const review = await getReviewById(params.id)
    if (!review) {
      return NextResponse.json({ 
        success: false, 
        error: 'Review not found' 
      }, { status: 404 })
    }

    // Check permissions - user must be review author or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAuthor = review.user_id === user.id
    const isAdmin = profile?.role === 'admin'
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { rating_sound, rating_vibe, rating_crowd, comment } = body

    // Validate ratings if provided
    const newRatings = [rating_sound, rating_vibe, rating_crowd].filter(r => r !== null && r !== undefined)
    for (const rating of newRatings) {
      if (!validateRating(rating)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Ratings must be integers between 1 and 5' 
        }, { status: 400 })
      }
    }

    // Calculate new overall rating if any ratings are being updated
    let rating_overall = review.rating_overall
    if (newRatings.length > 0) {
      rating_overall = calculateOverallRating(
        rating_sound !== undefined ? rating_sound : review.rating_sound,
        rating_vibe !== undefined ? rating_vibe : review.rating_vibe,
        rating_crowd !== undefined ? rating_crowd : review.rating_crowd
      )
    }

    const reviewData = {
      ...body,
      rating_overall,
      comment: comment ? sanitizeComment(comment) : review.comment,
      updated_at: new Date().toISOString()
    }

    const data = await updateReview(params.id, reviewData)

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Error in PUT /api/reviews/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update review' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get review to check ownership
    const review = await getReviewById(params.id)
    if (!review) {
      return NextResponse.json({ 
        success: false, 
        error: 'Review not found' 
      }, { status: 404 })
    }

    // Check permissions - user must be review author or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAuthor = review.user_id === user.id
    const isAdmin = profile?.role === 'admin'
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    await deleteReview(params.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Review deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/reviews/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete review' 
    }, { status: 500 })
  }
}