import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, getRateLimitHeaders, strictRateLimit } from '@/lib/utils/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Throttle per IP so this endpoint can't be used to mass-create accounts.
    const rateLimit = await checkRateLimit(`register:${getClientIp(request)}`, strictRateLimit)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      )
    }

    const body = await request.json()
    const { email, password, full_name, role } = body

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Create the user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name,
        role
      },
      email_confirm: true // Auto-confirm for now, can be changed to false for email verification
    })

    if (authError) {
      // This is the admin API - its messages can carry internal detail, so log the
      // real error and return something generic.
      console.error('Auth creation error:', authError)
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create the profile using service role (bypasses RLS)
    // All new users start as 'fan' and must go through verification for other roles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name,
        role: 'fan', // Always start as fan
        is_verified: false // All users start unverified
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Try to clean up the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'fan',
        is_verified: false
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 