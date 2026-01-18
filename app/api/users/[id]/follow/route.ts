import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Helper to create authenticated Supabase client
async function getSupabaseClient(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const cookieStore = cookies()

  return createServerClient(
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
}

// POST /api/users/[id]/follow - Follow a user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseClient(request)
    const targetUserId = params.id

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Prevent self-follow
    if (user.id === targetUserId) {
      return NextResponse.json(
        { success: false, error: 'You cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if target user exists
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', targetUserId)
      .single()

    if (profileError || !targetProfile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already following
    const { data: existingConnection } = await supabase
      .from('user_connections')
      .select('id, status')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single()

    if (existingConnection) {
      if (existingConnection.status === 'blocked') {
        return NextResponse.json(
          { success: false, error: 'Unable to follow this user' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Already following this user' },
        { status: 409 }
      )
    }

    // Check if target user allows friend requests (optional privacy check)
    const { data: targetSettings } = await supabase
      .from('user_settings')
      .select('allow_friend_requests, profile_visibility')
      .eq('user_id', targetUserId)
      .single()

    // Determine initial status based on target's settings
    // Twitter-style: instant follow for public profiles
    // Instagram-style: pending for private/friends-only profiles
    let initialStatus = 'accepted'

    if (targetSettings) {
      if (!targetSettings.allow_friend_requests) {
        return NextResponse.json(
          { success: false, error: 'This user is not accepting follow requests' },
          { status: 403 }
        )
      }
      // For private profiles, require approval
      if (targetSettings.profile_visibility === 'private' ||
          targetSettings.profile_visibility === 'friends') {
        initialStatus = 'pending'
      }
    }

    // Create the follow connection
    const { data: connection, error: insertError } = await supabase
      .from('user_connections')
      .insert({
        follower_id: user.id,
        following_id: targetUserId,
        status: initialStatus,
        accepted_at: initialStatus === 'accepted' ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating follow connection:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to follow user' },
        { status: 500 }
      )
    }

    // Create notification for the followed user
    await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: initialStatus === 'accepted' ? 'new_follower' : 'follow_request',
        title: initialStatus === 'accepted' ? 'New follower' : 'Follow request',
        message: initialStatus === 'accepted'
          ? 'Someone started following you'
          : 'Someone wants to follow you',
        data: {
          follower_id: user.id,
          connection_id: connection.id
        }
      })

    return NextResponse.json({
      success: true,
      data: {
        status: initialStatus,
        message: initialStatus === 'accepted'
          ? 'Successfully followed user'
          : 'Follow request sent'
      }
    })
  } catch (error) {
    console.error('Error in POST /api/users/[id]/follow:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to follow user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id]/follow - Unfollow a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseClient(request)
    const targetUserId = params.id

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Delete the follow connection
    const { error: deleteError } = await supabase
      .from('user_connections')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)

    if (deleteError) {
      console.error('Error deleting follow connection:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to unfollow user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Successfully unfollowed user'
      }
    })
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]/follow:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unfollow user' },
      { status: 500 }
    )
  }
}

// GET /api/users/[id]/follow - Get follow status between current user and target
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseClient(request)
    const targetUserId = params.id

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get connection status in both directions
    const { data: connections } = await supabase
      .from('user_connections')
      .select('follower_id, following_id, status')
      .or(`and(follower_id.eq.${user.id},following_id.eq.${targetUserId}),and(follower_id.eq.${targetUserId},following_id.eq.${user.id})`)

    const isFollowing = connections?.some(
      c => c.follower_id === user.id && c.following_id === targetUserId && c.status === 'accepted'
    ) ?? false

    const isFollowedBy = connections?.some(
      c => c.follower_id === targetUserId && c.following_id === user.id && c.status === 'accepted'
    ) ?? false

    const pendingRequest = connections?.some(
      c => c.follower_id === user.id && c.following_id === targetUserId && c.status === 'pending'
    ) ?? false

    return NextResponse.json({
      success: true,
      data: {
        isFollowing,
        isFollowedBy,
        isMutual: isFollowing && isFollowedBy,
        pendingRequest
      }
    })
  } catch (error) {
    console.error('Error in GET /api/users/[id]/follow:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get follow status' },
      { status: 500 }
    )
  }
}
