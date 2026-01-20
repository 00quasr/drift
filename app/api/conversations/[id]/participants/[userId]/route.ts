import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { removeParticipant } from '@/lib/services/messaging'

interface RouteParams {
  params: Promise<{ id: string; userId: string }>
}

/**
 * DELETE /api/conversations/[id]/participants/[userId]
 * Remove a participant from a group conversation (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, userId: userIdToRemove } = await params
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

    await removeParticipant(id, user.id, userIdToRemove)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing participant:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('admin') || message.includes('leaveConversation') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
