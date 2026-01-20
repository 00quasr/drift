import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import {
  getUserConversations,
  createConversation,
  canMessageUser
} from '@/lib/services/messaging'

/**
 * GET /api/conversations
 * List all conversations for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
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

    const conversations = await getUserConversations(user.id)

    return NextResponse.json({ data: conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/conversations
 * Create a new conversation (1:1 or group)
 * Body: { participantIds: string[], name?: string, isGroup?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
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
    const { participantIds, name, isGroup } = body

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: 'participantIds is required and must be a non-empty array' }, { status: 400 })
    }

    // Ensure the creator is included in participants
    const allParticipantIds = Array.from(new Set([user.id, ...participantIds]))

    // For 1:1 chats, check messaging permissions
    if (!isGroup && allParticipantIds.length === 2) {
      const recipientId = allParticipantIds.find(id => id !== user.id)
      if (recipientId) {
        const { canMessage, reason } = await canMessageUser(user.id, recipientId)
        if (!canMessage) {
          return NextResponse.json({ error: reason }, { status: 403 })
        }
      }
    }

    // Validate group requirements
    if (isGroup) {
      if (allParticipantIds.length < 3) {
        return NextResponse.json({ error: 'Group conversations require at least 3 participants' }, { status: 400 })
      }
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: 'Group conversations require a name' }, { status: 400 })
      }
    }

    const conversation = await createConversation({
      participantIds: allParticipantIds,
      name: isGroup ? name : undefined,
      isGroup: isGroup || false,
      createdBy: user.id
    })

    return NextResponse.json({ data: conversation }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
