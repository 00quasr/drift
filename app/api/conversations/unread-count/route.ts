import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ count: 0 })
    }

    // Get all conversations the user is part of with their last_read_at
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id)
      .is('left_at', null)

    if (participantsError || !participants || participants.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    // Count unread messages across all conversations
    let totalUnread = 0

    for (const participant of participants) {
      const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', participant.conversation_id)
        .neq('sender_id', user.id)
        .eq('is_deleted', false)
        .gt('created_at', participant.last_read_at || '1970-01-01')

      if (!countError && count) {
        totalUnread += count
      }
    }

    return NextResponse.json({ count: totalUnread })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json({ count: 0 })
  }
}
