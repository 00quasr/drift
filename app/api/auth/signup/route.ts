import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isValidEmail, isValidPassword } from '@/lib/services/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role } = body

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email, password, full name, and role are required' 
      }, { status: 400 })
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email format' 
      }, { status: 400 })
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 })
    }

    // Validate role
    const validRoles = ['fan', 'artist', 'promoter', 'club_owner']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role. Must be fan, artist, promoter, or club_owner' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    })

    if (error) {
      console.error('Error signing up user:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 })
    }

    // Create profile if user was created successfully
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          role: role,
          is_verified: role === 'fan' // Fans are auto-verified
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Don't return error to user since auth succeeded
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        user: data.user,
        session: data.session
      },
      message: 'Account created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/auth/signup:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create account' 
    }, { status: 500 })
  }
}