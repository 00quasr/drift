import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
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
    
    // Remove fields that shouldn't be updated directly
    const { id, created_at, is_verified, role, ...updateData } = body
    
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