import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isValidPassword } from '@/lib/services/auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { password } = body

    // Validate required fields
    if (!password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password is required' 
      }, { status: 400 })
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 })
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      console.error('Error updating password:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update password' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/auth/update-password:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update password' 
    }, { status: 500 })
  }
}