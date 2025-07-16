import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isValidEmail } from '@/lib/services/auth'

export async function POST(request: NextRequest) {
  try {
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