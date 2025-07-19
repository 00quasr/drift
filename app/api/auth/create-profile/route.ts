import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { user_id, email, full_name, role } = await request.json()

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user_id)
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
        id: user_id,
        full_name: full_name || 'User',
        role: role || 'fan',
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create profile', details: error.message },
        { status: 500 }
      )
    }

    // Also create user settings with defaults
    const { error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .insert({
        user_id: user_id,
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