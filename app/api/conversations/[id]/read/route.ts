import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { markConversationAsRead } from '@/lib/services/messaging'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/conversations/[id]/read
 * Mark a conversation as read (update last_read_at)
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

    await markConversationAsRead(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking conversation as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
