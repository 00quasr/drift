import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { editMessage, deleteMessage } from '@/lib/services/messaging'

interface RouteParams {
  params: Promise<{ id: string; messageId: string }>
}

/**
 * PUT /api/conversations/[id]/messages/[messageId]
 * Edit a message
 * Body: { content: string }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, messageId } = await params
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

    // Moderate the updated content
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
    }

    const message = await editMessage(messageId, user.id, content.trim())

    return NextResponse.json({ data: message })
  } catch (error) {
    console.error('Error editing message:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Message not found or not authorized' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

/**
 * DELETE /api/conversations/[id]/messages/[messageId]
 * Delete (soft delete) a message
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, messageId } = await params
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

    await deleteMessage(messageId, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Message not found or not authorized' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
