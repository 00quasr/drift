import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== USER GET API DEBUG ===')
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('API: Auth header present:', !!authHeader)
    
    // Create SSR Supabase client with cookies
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
        global: authHeader ? {
          headers: {
            Authorization: authHeader,
          },
        } : undefined,
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('API: Auth result:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError ? authError.message : null 
    })
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: `Authentication required${authError ? ': ' + authError.message : ''}` 
      }, { status: 401 })
    }

    // Get user role and verify admin access (or own profile)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('API: Profile lookup result:', { 
      profile, 
      profileError: profileError ? profileError.message : null 
    })

    const isAdmin = profile?.role === 'admin'
    const isOwnProfile = user.id === params.id

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied' 
      }, { status: 403 })
    }

    // Get the user profile
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        display_name,
        role,
        is_verified,
        avatar_url,
        created_at,
        updated_at,
        location,
        bio
      `)
      .eq('id', params.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 })
      }
      console.error('Error fetching user profile:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch user' 
      }, { status: 500 })
    }

    // Get email from auth.users using admin client
    let email = 'Email unavailable'
    try {
      const adminSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get() { return undefined }
          }
        }
      )
      
      const { data: { user: authUser }, error: authError } = await adminSupabase.auth.admin.getUserById(params.id)
      console.log('Email lookup for user:', params.id, { hasUser: !!authUser, email: authUser?.email, error: authError })
      
      if (authUser?.email) {
        email = authUser.email
      }
    } catch (emailError) {
      console.warn('Failed to get email for user:', params.id, emailError)
    }

    // Combine profile and email data
    const data = {
      ...profileData,
      email,
      // Parse location into city/country
      city: profileData.location ? profileData.location.split(',')[0]?.trim() : '',
      country: profileData.location ? profileData.location.split(',')[1]?.trim() : ''
    }
    
    console.log('API: User fetch result:', { data: !!data })

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch user' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== USER UPDATE API DEBUG ===')
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('API UPDATE: Auth header present:', !!authHeader)
    
    // Create SSR Supabase client with cookies
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
        global: authHeader ? {
          headers: {
            Authorization: authHeader,
          },
        } : undefined,
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('API UPDATE: Auth result:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError ? authError.message : null 
    })
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: `Authentication required${authError ? ': ' + authError.message : ''}` 
      }, { status: 401 })
    }

    // Get user role and verify admin access (or own profile)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('API UPDATE: Profile lookup result:', { 
      profile, 
      profileError: profileError ? profileError.message : null 
    })

    const isAdmin = profile?.role === 'admin'
    const isOwnProfile = user.id === params.id

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate and prepare update data
    const {
      full_name,
      display_name,
      role,
      is_verified,
      city,
      country,
      bio
    } = body

    // Only admins can change role and verification status
    const updateData: any = {
      full_name,
      display_name,
      bio,
      // Combine city and country into location field
      location: [city, country].filter(Boolean).join(', '),
      updated_at: new Date().toISOString()
    }

    if (isAdmin && !isOwnProfile) {
      // Admins can change role and verification status of other users
      if (role !== undefined) updateData.role = role
      if (is_verified !== undefined) updateData.is_verified = is_verified
    }

    console.log('API UPDATE: Updating user with data:', JSON.stringify(updateData, null, 2))
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('API UPDATE: Error updating user:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update user' 
      }, { status: 500 })
    }

    console.log('API UPDATE: User updated successfully:', data.id)

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Error in PUT /api/users/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update user' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('=== USER DELETE API DEBUG ===')
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('API DELETE: Auth header present:', !!authHeader)
    
    // Create SSR Supabase client with cookies
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
        global: authHeader ? {
          headers: {
            Authorization: authHeader,
          },
        } : undefined,
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('API DELETE: Auth result:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError ? authError.message : null 
    })
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: `Authentication required${authError ? ': ' + authError.message : ''}` 
      }, { status: 401 })
    }

    // Get user role and verify admin access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required for user deletion' 
      }, { status: 403 })
    }

    // Prevent admins from deleting themselves
    if (user.id === params.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You cannot delete your own account' 
      }, { status: 400 })
    }

    // Get user info before deletion for logging
    const { data: userToDelete } = await supabase
      .from('profiles')
      .select('full_name, email, role')
      .eq('id', params.id)
      .single()

    if (!userToDelete) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    console.log('API DELETE: Deleting user:', userToDelete.full_name)
    
    // Delete the user profile (this will cascade to related data)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('API DELETE: Error deleting user:', deleteError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete user' 
      }, { status: 500 })
    }

    console.log('API DELETE: User deleted successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete user' 
    }, { status: 500 })
  }
}