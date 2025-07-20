import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validateProfileData } from '@/lib/services/profile'
import { moderateText } from '@/lib/services/storage'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log('Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required - no token provided' 
      }, { status: 401 })
    }
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined }, // Don't use cookies
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth debug GET:', { user: user?.id, error: authError?.message })
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required',
        debug: { authError: authError?.message, hasUser: !!user }
      }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch profile' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        user,
        profile
      }
    })
  } catch (error) {
    console.error('Error in GET /api/user/profile:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch profile' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log('PUT Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required - no token provided' 
      }, { status: 401 })
    }
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined }, // Don't use cookies
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth debug PUT:', { user: user?.id, error: authError?.message })
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required',
        debug: { authError: authError?.message, hasUser: !!user }
      }, { status: 401 })
    }

    const body = await request.json()
    
    // Remove fields that shouldn't be updated directly
    const { id, created_at, is_verified, role, ...updateData } = body
    
    // Validate the data
    const validation = validateProfileData(updateData)
    if (!validation.valid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }

    // Moderate text content if present
    const { full_name, display_name, bio, location } = updateData
    const textToModerate = [full_name, display_name, bio, location].filter(Boolean).join(' ')
    
    if (textToModerate.trim()) {
      try {
        const moderationResult = await moderateText(textToModerate)
        if (!moderationResult.approved) {
          return NextResponse.json({ 
            success: false, 
            error: 'Content was rejected by moderation',
            reason: moderationResult.reason
          }, { status: 422 })
        }
      } catch (moderationError) {
        console.error('Moderation error:', moderationError)
        // Continue with update if moderation fails
      }
    }
    
    // Add updated timestamp
    const profileData = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    // Update profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update profile' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: profile,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error in PUT /api/user/profile:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update profile' 
    }, { status: 500 })
  }
}