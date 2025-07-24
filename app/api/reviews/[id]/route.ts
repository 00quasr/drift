import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
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
    const { rating_sound, rating_vibe, rating_crowd, rating_overall, comment } = body

    // Validate ratings if provided (1-10 scale)
    const newRatings = [rating_sound, rating_vibe, rating_crowd, rating_overall].filter(r => r !== null && r !== undefined)
    for (const rating of newRatings) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        return NextResponse.json({ 
          success: false, 
          error: 'Ratings must be integers between 1 and 10' 
        }, { status: 400 })
      }
    }

    const reviewData = {
      rating_overall: rating_overall || null,
      rating_sound: rating_sound || null,
      rating_vibe: rating_vibe || null,
      rating_crowd: rating_crowd || null,
      comment: comment ? comment.trim() : null,
      updated_at: new Date().toISOString()
    }

    // Update review directly with authenticated client
    const { data, error: updateError } = await supabase
      .from('reviews')
      .update(reviewData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating review:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update review' 
      }, { status: 500 })
    }

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

    // Delete review directly with authenticated client
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting review:', deleteError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete review' 
      }, { status: 500 })
    }

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