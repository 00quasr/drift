import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isValidEmail } from '@/lib/services/auth'
import { checkRateLimit, getClientIp, getRateLimitHeaders, strictRateLimit } from '@/lib/utils/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Throttle per IP so this endpoint can't be used to spam reset mails.
    const rateLimit = await checkRateLimit(`reset-password:${getClientIp(request)}`, strictRateLimit)
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      )
    }

    const body = await request.json()
    const { email } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
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

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.nextUrl.origin}/auth/reset-password`
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send password reset email' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset email sent' 
    })
  } catch (error) {
    console.error('Error in POST /api/auth/reset-password:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send password reset email' 
    }, { status: 500 })
  }
}