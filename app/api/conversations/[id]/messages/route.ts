import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getMessages, sendMessage } from '@/lib/services/messaging'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/conversations/[id]/messages
 * Get messages for a conversation with pagination
 * Query params: limit, before (cursor for pagination)
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

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const before = searchParams.get('before') || undefined

    const messages = await getMessages(id, user.id, { limit, before })

    return NextResponse.json({ data: messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Not a participant of this conversation' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Send a new message to a conversation
 * Body: { content: string }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const { content } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Message exceeds maximum length of 5000 characters' }, { status: 400 })
    }

    // Moderate the message content
    try {
      const moderationResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/moderate/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      const moderationResult = await moderationResponse.json()

      if (!moderationResult.approved) {
        return NextResponse.json({
          error: moderationResult.reason || 'Message content violates community guidelines',
          categories: moderationResult.categories
        }, { status: 400 })
      }
    } catch (moderationError) {
      console.error('Moderation service error:', moderationError)
      // Continue if moderation fails - don't block users
    }

    const message = await sendMessage({
      conversationId: id,
      senderId: user.id,
      content: content.trim()
    })

    return NextResponse.json({ data: message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Not a participant of this conversation' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
