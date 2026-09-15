import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getUserFromRequest } from '@/lib/api-utils'
import { checkRateLimit, getRateLimitHeaders, strictRateLimit } from '@/lib/utils/rateLimit'

/**
 * GDPR account deletion (right to erasure, Art. 17).
 *
 * Most tables reference profiles with ON DELETE NO ACTION, so the profile row
 * cannot simply be dropped - the personal rows have to go first and the
 * authorship links have to be cleared. The split below is deliberate:
 *
 *   deleted    - data that only exists because this person existed
 *   anonymised - venues, events and artists, which are platform content with
 *                independent value to other users. They survive with their
 *                authorship unlinked rather than being destroyed.
 *
 * The caller is authenticated from their bearer token first; the service-role
 * client is then used only to clean up rows for that verified id.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const rateLimit = await checkRateLimit(`account-delete:${user.id}`, strictRateLimit)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      )
    }

    const supabase = createClient()
    const userId = user.id

    // Refuse to remove the last admin - that would lock everyone out of
    // moderation and verification.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profile?.role === 'admin') {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: 'The last remaining admin account cannot be deleted. Assign another admin first.' },
          { status: 409 }
        )
      }
    }

    // 1. Personal data. Tables with ON DELETE CASCADE (user_settings,
    //    user_activity, profile_views, user_connections, review_votes,
    //    conversation_participants) are handled when the profile row goes.
    const personalDeletes = [
      supabase.from('reviews').delete().eq('user_id', userId),
      supabase.from('favorites').delete().eq('user_id', userId),
      supabase.from('notifications').delete().eq('user_id', userId),
      supabase.from('verification_requests').delete().eq('user_id', userId),
      supabase.from('review_flags').delete().eq('flagged_by', userId),
      supabase.from('content_analytics').delete().eq('user_id', userId),
      // created_by is NOT NULL here, so these rows cannot be anonymised.
      supabase.from('content_schedule').delete().eq('created_by', userId),
    ]

    for (const query of personalDeletes) {
      const { error } = await query
      if (error) {
        console.error('Account deletion - personal data cleanup failed:', error)
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
      }
    }

    // 2. Anonymise authorship on content that outlives the account.
    const anonymisations = [
      supabase.from('venues').update({ owner_id: null }).eq('owner_id', userId),
      supabase.from('venues').update({ created_by: null }).eq('created_by', userId),
      supabase.from('venues').update({ updated_by: null }).eq('updated_by', userId),
      supabase.from('events').update({ created_by: null }).eq('created_by', userId),
      supabase.from('events').update({ updated_by: null }).eq('updated_by', userId),
      supabase.from('artists').update({ user_id: null }).eq('user_id', userId),
      supabase.from('artists').update({ created_by: null }).eq('created_by', userId),
      supabase.from('artists').update({ updated_by: null }).eq('updated_by', userId),
      supabase.from('verification_requests').update({ reviewed_by: null }).eq('reviewed_by', userId),
      supabase.from('content_moderation_log').update({ moderator_id: null }).eq('moderator_id', userId),
    ]

    for (const query of anonymisations) {
      const { error } = await query
      if (error) {
        console.error('Account deletion - anonymisation failed:', error)
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
      }
    }

    // 3. The profile itself, which cascades the remaining personal tables.
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Account deletion - profile removal failed:', profileError)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    // 4. Finally the auth user, which cascades sessions, identities and MFA.
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      // The profile is already gone, so the personal data is erased even if this
      // last step needs a manual retry. Surface it loudly rather than silently.
      console.error('Account deletion - auth user removal failed:', authDeleteError)
      return NextResponse.json(
        { error: 'Account data was removed but the login could not be deleted. Please contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Account deleted' }, { status: 200 })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
