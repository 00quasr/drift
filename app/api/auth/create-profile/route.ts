import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { checkRateLimit, getRateLimitHeaders, strictRateLimit } from '@/lib/utils/rateLimit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client with service role key. This bypasses RLS, so every code path below
// must derive the target user from a verified access token - never from the body.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Only the profile's display fields are accepted from the caller. The user id comes
// from the verified bearer token and the role is fixed to 'fan' - role elevation must
// go through the verification flow, never through a request body.
const createProfileSchema = z.object({
  full_name: z.string().trim().min(1).max(100).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const identifier = request.headers.get('x-forwarded-for') ?? 'unknown'
    const rateLimit = await checkRateLimit(`create-profile:${identifier}`, strictRateLimit)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      )
    }

    // Require a valid Supabase access token. The OAuth callback already sends one.
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const parsed = createProfileSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Callers may only ever create their own profile, as a fan.
    const userId = user.id
    const fullName = parsed.data.full_name
      || user.user_metadata?.full_name
      || user.user_metadata?.name
      || 'User'

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { message: 'Profile already exists', profile: existingProfile },
        { status: 200 }
      )
    }

    // Create new profile
    const { data: newProfile, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        role: 'fan',
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    // Also create user settings with defaults
    const { error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .insert({
        user_id: userId,
        email_notifications: {
          marketing: false,
          new_events: true,
          weekly_digest: false,
          review_replies: true,
          favorite_venues: true
        },
        push_notifications: {
          new_events: true,
          review_replies: true,
          event_reminders: true,
          favorite_venues: true
        },
        profile_visibility: 'public',
        show_activity: true,
        show_reviews: true,
        show_favorites: true,
        show_location: false,
        search_radius: 50,
        currency_preference: 'EUR',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        allow_friend_requests: true,
        allow_messages: true,
        show_online_status: false
      })

    if (settingsError) {
      console.error('Settings creation error:', settingsError)
      // Don't fail the whole request if settings creation fails
    }

    return NextResponse.json(
      {
        message: 'Profile created successfully',
        profile: newProfile
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
