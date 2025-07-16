import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getUserReviews } from '@/lib/services/reviews'

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

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    const data = await getUserReviews(user.id, limit)

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length
    })
  } catch (error) {
    console.error('Error in GET /api/user/reviews:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch user reviews' 
    }, { status: 500 })
  }
}