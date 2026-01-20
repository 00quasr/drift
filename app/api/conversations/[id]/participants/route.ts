import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { addParticipant } from '@/lib/services/messaging'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/conversations/[id]/participants
 * Add a participant to a group conversation (admin only)
 * Body: { userId: string }
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
    const { userId } = body

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    await addParticipant(id, user.id, userId)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Error adding participant:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('admin') || message.includes('not a group') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
