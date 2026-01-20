import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import {
  getConversation,
  leaveConversation,
  toggleMuteConversation
} from '@/lib/services/messaging'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/conversations/[id]
 * Get a specific conversation with participants
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const conversation = await getConversation(id, user.id)

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ data: conversation })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/conversations/[id]
 * Update conversation settings (name for groups, mute status)
 * Body: { name?: string, isMuted?: boolean }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { name, isMuted } = body

    // Handle mute toggle
    if (typeof isMuted === 'boolean') {
      await toggleMuteConversation(id, user.id, isMuted)
    }

    // Handle name update (group chats only, admin only)
    if (name !== undefined) {
      // Verify admin status and group chat
      const { data: participation } = await supabase
        .from('conversation_participants')
        .select('role')
        .eq('conversation_id', id)
        .eq('user_id', user.id)
        .is('left_at', null)
        .single()

      if (!participation || participation.role !== 'admin') {
        return NextResponse.json({ error: 'Only admins can update group name' }, { status: 403 })
      }

      const { error: updateError } = await supabase
        .from('conversations')
        .update({ name })
        .eq('id', id)
        .eq('is_group', true)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
      }
    }

    const conversation = await getConversation(id, user.id)
    return NextResponse.json({ data: conversation })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/conversations/[id]
 * Leave a conversation
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await leaveConversation(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error leaving conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
