import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { moderateReview, getFlaggedReviews, removeFlagsFromReview } from '@/lib/services/reviews'

export async function GET(request: NextRequest) {
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

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    const data = await getFlaggedReviews(limit)

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length
    })
  } catch (error) {
    console.error('Error in GET /api/admin/moderate:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch flagged reviews' 
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

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { review_id, action, notes } = body

    if (!review_id || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'review_id and action are required' 
      }, { status: 400 })
    }

    const validActions = ['approve', 'hide', 'remove_flags']
    if (!validActions.includes(action)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid action. Must be approve, hide, or remove_flags' 
      }, { status: 400 })
    }

    let result
    switch (action) {
      case 'approve':
        result = await moderateReview(review_id, 'visible', notes)
        await removeFlagsFromReview(review_id)
        break
      case 'hide':
        result = await moderateReview(review_id, 'hidden', notes)
        await removeFlagsFromReview(review_id)
        break
      case 'remove_flags':
        result = await removeFlagsFromReview(review_id)
        break
      default:
        throw new Error('Invalid action')
    }

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: `Review ${action} successful`
    })
  } catch (error) {
    console.error('Error in POST /api/admin/moderate:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to moderate review' 
    }, { status: 500 })
  }
}