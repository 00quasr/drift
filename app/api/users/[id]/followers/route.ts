import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface FollowerProfile {
  id: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: string
  is_verified: boolean
}

interface FollowerConnection {
  id: string
  created_at: string
  follower: FollowerProfile | null
}

// GET /api/users/[id]/followers - Get list of users who follow this user
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

    // Check if target user exists and get their privacy settings
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

    // Get followers with their profile info
    const { data, error: followersError, count } = await supabase
      .from('user_connections')
      .select(`
        id,
        created_at,
        follower:profiles!user_connections_follower_id_fkey (
          id,
          full_name,
          display_name,
          avatar_url,
          bio,
          role,
          is_verified
        )
      `, { count: 'exact' })
      .eq('following_id', targetUserId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const followers = data as FollowerConnection[] | null

    if (followersError) {
      console.error('Error fetching followers:', followersError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch followers' },
        { status: 500 }
      )
    }

    // If there's a current user, get their follow status with each follower
    let followStatuses: Record<string, boolean> = {}
    if (user && followers && followers.length > 0) {
      const followerIds = followers
        .map(f => f.follower?.id)
        .filter((id): id is string => !!id)

      if (followerIds.length > 0) {
        const { data: connections } = await supabase
          .from('user_connections')
          .select('following_id')
          .eq('follower_id', user.id)
          .eq('status', 'accepted')
          .in('following_id', followerIds)

        if (connections) {
          followStatuses = connections.reduce((acc, c) => {
            acc[c.following_id] = true
            return acc
          }, {} as Record<string, boolean>)
        }
      }
    }

    // Format the response
    const formattedFollowers = followers?.map(f => ({
      id: f.follower?.id,
      fullName: f.follower?.full_name,
      displayName: f.follower?.display_name,
      avatarUrl: f.follower?.avatar_url,
      bio: f.follower?.bio,
      role: f.follower?.role,
      isVerified: f.follower?.is_verified,
      followedAt: f.created_at,
      isFollowedByMe: user ? (followStatuses[f.follower?.id || ''] ?? false) : undefined
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        followers: formattedFollowers,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error in GET /api/users/[id]/followers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch followers' },
      { status: 500 }
    )
  }
}
