import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// GET /api/users/[id]/stats - Get user statistics (followers, following counts)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
        global: authHeader ? {
          headers: {
            Authorization: authHeader,
          },
        } : undefined,
      }
    )

    const targetUserId = params.id

    // Check if target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get follower count (people who follow this user)
    const { count: followersCount, error: followersError } = await supabase
      .from('user_connections')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId)
      .eq('status', 'accepted')

    // Get following count (people this user follows)
    const { count: followingCount, error: followingError } = await supabase
      .from('user_connections')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', targetUserId)
      .eq('status', 'accepted')

    if (followersError || followingError) {
      console.error('Error fetching stats:', { followersError, followingError })
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        followersCount: followersCount || 0,
        followingCount: followingCount || 0
      }
    })
  } catch (error) {
    console.error('Error in GET /api/users/[id]/stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
