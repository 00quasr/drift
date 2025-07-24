import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(
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
          get() { return undefined },
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

    const reviewId = params.id
    const body = await request.json()
    const { vote_type } = body

    // Validate vote type
    if (!vote_type || !['upvote', 'downvote'].includes(vote_type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid vote_type. Must be "upvote" or "downvote"' 
      }, { status: 400 })
    }

    // Check if review exists
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', reviewId)
      .single()

    if (reviewError || !review) {
      return NextResponse.json({ 
        success: false, 
        error: 'Review not found' 
      }, { status: 404 })
    }

    // Users cannot vote on their own reviews
    if (review.user_id === user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot vote on your own review' 
      }, { status: 403 })
    }

    // Check if user already has a vote for this review
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('review_votes')
      .select('id, vote_type')
      .eq('user_id', user.id)
      .eq('review_id', reviewId)
      .maybeSingle()

    if (voteCheckError) {
      console.error('Error checking existing vote:', voteCheckError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to check existing vote' 
      }, { status: 500 })
    }

    let data, error

    if (existingVote) {
      // If same vote type, remove the vote (toggle off)
      if (existingVote.vote_type === vote_type) {
        const { error: deleteError } = await supabase
          .from('review_votes')
          .delete()
          .eq('id', existingVote.id)

        if (deleteError) {
          error = deleteError
        } else {
          return NextResponse.json({ 
            success: true, 
            message: `${vote_type === 'upvote' ? 'Upvote' : 'Downvote'} removed`
          })
        }
      } else {
        // Update to new vote type
        const { data: updateData, error: updateError } = await supabase
          .from('review_votes')
          .update({
            vote_type: vote_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVote.id)
          .select()

        data = updateData
        error = updateError
      }
    } else {
      // Create new vote
      const { data: insertData, error: insertError } = await supabase
        .from('review_votes')
        .insert({
          user_id: user.id,
          review_id: reviewId,
          vote_type: vote_type
        })
        .select()

      data = insertData
      error = insertError
    }

    if (error) {
      console.error('Error creating/updating vote:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to vote' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: `${vote_type === 'upvote' ? 'Upvoted' : 'Downvoted'} successfully`
    })
  } catch (error) {
    console.error('Error in POST /api/reviews/[id]/vote:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to vote' 
    }, { status: 500 })
  }
}