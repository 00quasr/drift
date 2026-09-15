import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getUserFromRequest } from '@/lib/api-utils'
import { checkRateLimit, getRateLimitHeaders, strictRateLimit } from '@/lib/utils/rateLimit'

/**
 * GDPR data export (right of access / portability, Art. 15 and 20).
 *
 * Returns everything we hold that is tied to the requesting account, as a JSON
 * download. Authorship on shared content (venues, events, artists) is listed by
 * reference only - those records belong to the platform, not solely to the user.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const rateLimit = await checkRateLimit(`account-export:${user.id}`, strictRateLimit)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      )
    }

    const supabase = createClient()
    const userId = user.id

    const [
      profile,
      settings,
      reviews,
      favorites,
      notifications,
      verificationRequests,
      activity,
      connections,
      venues,
      events,
      artists,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('reviews').select('*').eq('user_id', userId),
      supabase.from('favorites').select('*').eq('user_id', userId),
      supabase.from('notifications').select('*').eq('user_id', userId),
      supabase.from('verification_requests').select('*').eq('user_id', userId),
      supabase.from('user_activity').select('*').eq('user_id', userId),
      supabase.from('user_connections').select('*').or(`follower_id.eq.${userId},following_id.eq.${userId}`),
      supabase.from('venues').select('id, name, created_at').eq('owner_id', userId),
      supabase.from('events').select('id, title, created_at').eq('created_by', userId),
      supabase.from('artists').select('id, name, created_at').eq('user_id', userId),
    ])

    const payload = {
      exported_at: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        provider: user.app_metadata?.provider ?? null,
      },
      profile: profile.data ?? null,
      settings: settings.data ?? null,
      reviews: reviews.data ?? [],
      favorites: favorites.data ?? [],
      notifications: notifications.data ?? [],
      verification_requests: verificationRequests.data ?? [],
      activity: activity.data ?? [],
      connections: connections.data ?? [],
      content_you_authored: {
        venues: venues.data ?? [],
        events: events.data ?? [],
        artists: artists.data ?? [],
      },
    }

    const filename = `drift-data-export-${new Date().toISOString().slice(0, 10)}.json`

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        ...getRateLimitHeaders(rateLimit),
      },
    })

  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
