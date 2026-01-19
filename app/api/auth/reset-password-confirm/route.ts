import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accessToken, password } = body

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Access token is required'
      }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({
        success: false,
        error: 'Password is required'
      }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 8 characters long'
      }, { status: 400 })
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({
        success: false,
        error: 'Password must contain at least one uppercase letter'
      }, { status: 400 })
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json({
        success: false,
        error: 'Password must contain at least one lowercase letter'
      }, { status: 400 })
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json({
        success: false,
        error: 'Password must contain at least one number'
      }, { status: 400 })
    }

    // Verify the access token and get user
    const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(accessToken)

    if (verifyError || !user) {
      console.error('Token verification failed:', verifyError)
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired reset link. Please request a new one.'
      }, { status: 401 })
    }

    // Update password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update password. Please try again.'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/auth/reset-password-confirm:', error)
    return NextResponse.json({
      success: false,
      error: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
}
