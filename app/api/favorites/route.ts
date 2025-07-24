import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const targetType = searchParams.get('target_type')
    const targetId = searchParams.get('target_id')
    const userId = searchParams.get('user_id')

    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let user = null
    let supabase = null
    
    if (token) {
      supabase = createServerClient(
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
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (!authError && authUser) {
        user = authUser
      }
    } else {
      // Create unauthenticated client
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get() { return undefined },
          },
        }
      )
    }

    let query = supabase
      .from('favorites')
      .select('id, user_id, target_type, target_id, created_at')

    // Filter by user if specified or if authenticated user wants their own
    if (userId) {
      query = query.eq('user_id', userId)
    } else if (user) {
      query = query.eq('user_id', user.id)
    }

    // Filter by target if specified
    if (targetType) {
      query = query.eq('target_type', targetType)
    }
    if (targetId) {
      query = query.eq('target_id', targetId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching favorites:', error)
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in favorites GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
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
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { target_type, target_id } = body

    if (!target_type || !target_id) {
      return NextResponse.json({ error: 'target_type and target_id are required' }, { status: 400 })
    }

    // Validate target_type
    const validTypes = ['artist', 'venue', 'event']
    if (!validTypes.includes(target_type)) {
      return NextResponse.json({ error: 'Invalid target_type' }, { status: 400 })
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', target_type)
      .eq('target_id', target_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 409 })
    }

    // Add to favorites
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        target_type,
        target_id
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding favorite:', error)
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in favorites POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
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
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const targetType = searchParams.get('target_type')
    const targetId = searchParams.get('target_id')

    if (!targetType || !targetId) {
      return NextResponse.json({ error: 'target_type and target_id are required' }, { status: 400 })
    }

    // Remove from favorites
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('target_type', targetType)
      .eq('target_id', targetId)

    if (error) {
      console.error('Error removing favorite:', error)
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in favorites DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}