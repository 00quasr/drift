import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { flagReview } from '@/lib/services/reviews'

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
    const { review_id, reason } = body

    if (!review_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'review_id is required' 
      }, { status: 400 })
    }

    // Check if review exists
    const { data: review } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', review_id)
      .single()

    if (!review) {
      return NextResponse.json({ 
        success: false, 
        error: 'Review not found' 
      }, { status: 404 })
    }

    // Prevent users from flagging their own reviews
    if (review.user_id === user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You cannot flag your own review' 
      }, { status: 400 })
    }

    // Check if user has already flagged this review
    const { data: existingFlag } = await supabase
      .from('review_flags')
      .select('id')
      .eq('review_id', review_id)
      .eq('flagged_by', user.id)
      .maybeSingle()

    if (existingFlag) {
      return NextResponse.json({ 
        success: false, 
        error: 'You have already flagged this review' 
      }, { status: 409 })
    }

    const data = await flagReview(review_id, user.id, reason)

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Review flagged successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/reviews/flag:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to flag review' 
    }, { status: 500 })
  }
}