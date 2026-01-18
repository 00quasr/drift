import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface FollowingProfile {
  id: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: string
  is_verified: boolean
}

interface FollowingConnection {
  id: string
  created_at: string
  following: FollowingProfile | null
}

// GET /api/users/[id]/following - Get list of users this user follows
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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get current user (optional - for showing follow status)
    const { data: { user } } = await supabase.auth.getUser()

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

    // Get following list with their profile info
    const { data, error: followingError, count } = await supabase
      .from('user_connections')
      .select(`
        id,
        created_at,
        following:profiles!user_connections_following_id_fkey (
          id,
          full_name,
          display_name,
          avatar_url,
          bio,
          role,
          is_verified
        )
      `, { count: 'exact' })
      .eq('follower_id', targetUserId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const following = data as FollowingConnection[] | null

    if (followingError) {
      console.error('Error fetching following:', followingError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch following' },
        { status: 500 }
      )
    }

    // If there's a current user, get their follow status with each followed user
    let followStatuses: Record<string, boolean> = {}
    if (user && following && following.length > 0) {
      const followingIds = following
        .map(f => f.following?.id)
        .filter((id): id is string => !!id)

      if (followingIds.length > 0) {
        const { data: connections } = await supabase
          .from('user_connections')
          .select('following_id')
          .eq('follower_id', user.id)
          .eq('status', 'accepted')
          .in('following_id', followingIds)

        if (connections) {
          followStatuses = connections.reduce((acc, c) => {
            acc[c.following_id] = true
            return acc
          }, {} as Record<string, boolean>)
        }
      }
    }

    // Format the response
    const formattedFollowing = following?.map(f => ({
      id: f.following?.id,
      fullName: f.following?.full_name,
      displayName: f.following?.display_name,
      avatarUrl: f.following?.avatar_url,
      bio: f.following?.bio,
      role: f.following?.role,
      isVerified: f.following?.is_verified,
      followedAt: f.created_at,
      isFollowedByMe: user ? (followStatuses[f.following?.id || ''] ?? false) : undefined
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        following: formattedFollowing,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error in GET /api/users/[id]/following:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch following' },
      { status: 500 }
    )
  }
}
