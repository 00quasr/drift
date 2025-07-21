import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    
    console.log('=== USERS API GET DEBUG ===')
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('API: Auth header present:', !!authHeader)
    
    // Create SSR Supabase client for authentication
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
    console.log('API: Auth check:', { hasUser: !!user, userId: user?.id, authError })
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    // Get user role and verify admin access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('API: Profile check:', { profile, profileError })

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 })
    }

    // Build query for users - join with auth.users to get email
    let query = supabase
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
      .order('created_at', { ascending: false })

    // Apply role filter if provided
    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    // Apply search filter if provided (search in name fields only since email is in different table)
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,display_name.ilike.%${search}%`)
    }

    // Apply pagination
    if (limit) {
      query = query.limit(limit)
    }
    if (offset) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data: profilesData, error } = await query
    
    if (error) {
      console.error('Error fetching profiles:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch users' 
      }, { status: 500 })
    }

    // Get emails from auth.users for each profile
    const usersWithEmails = await Promise.all(
      (profilesData || []).map(async (profile) => {
        try {
          // Create admin client for getting user emails
          const adminSupabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
              cookies: {
                get() { return undefined }
              }
            }
          )
          
          const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(profile.id)
          console.log('Email lookup for user:', profile.id, { hasUser: !!user, email: user?.email, error: userError })
          
          return {
            ...profile,
            email: user?.email || 'No email found',
            // Parse location if it exists, or provide empty city/country
            city: profile.location ? profile.location.split(',')[0]?.trim() : '',
            country: profile.location ? profile.location.split(',')[1]?.trim() : ''
          }
        } catch (emailError) {
          console.warn('Failed to get email for user:', profile.id, emailError)
          return {
            ...profile,
            email: 'Email unavailable',
            city: profile.location ? profile.location.split(',')[0]?.trim() : '',
            country: profile.location ? profile.location.split(',')[1]?.trim() : ''
          }
        }
      })
    )

    const data = usersWithEmails
    
    console.log('API: Query result:', { 
      dataCount: data?.length || 0, 
      error,
      users: data?.map(u => ({ id: u.id, name: u.full_name, role: u.role }))
    })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch users' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length 
    })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch users' 
    }, { status: 500 })
  }
}