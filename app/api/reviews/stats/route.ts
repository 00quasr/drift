import { NextRequest, NextResponse } from 'next/server'
import { getReviewStats } from '@/lib/services/reviews'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('target_type') as 'venue' | 'event' | 'artist' | 'label' | 'collective'
    const targetId = searchParams.get('target_id')

    if (!targetType || !targetId) {
      return NextResponse.json({ 
        success: false, 
        error: 'target_type and target_id are required' 
      }, { status: 400 })
    }

    if (!['venue', 'event', 'artist', 'label', 'collective'].includes(targetType)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid target_type. Must be venue, event, artist, label, or collective' 
      }, { status: 400 })
    }

    const data = await getReviewStats(targetType, targetId)

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Error in GET /api/reviews/stats:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch review statistics' 
    }, { status: 500 })
  }
}