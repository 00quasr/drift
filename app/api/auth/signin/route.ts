import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isValidEmail } from '@/lib/services/auth'
import { checkRateLimit, getClientIp, getRateLimitHeaders, strictRateLimit } from '@/lib/utils/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Throttle per IP so this endpoint can't be used for credential stuffing.
    const rateLimit = await checkRateLimit(`signin:${getClientIp(request)}`, strictRateLimit)
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      )
    }

    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 })
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email format' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Error signing in user:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }

    // Get user profile
    let profile = null
    if (data.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()
      
      profile = profileData
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        user: data.user,
        session: data.session,
        profile
      },
      message: 'Signed in successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/auth/signin:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to sign in' 
    }, { status: 500 })
  }
}