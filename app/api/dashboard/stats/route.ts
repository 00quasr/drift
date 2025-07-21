import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      // Try to get session from cookies as fallback
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
        }
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        return NextResponse.json({ 
          success: false, 
          error: 'Authentication required' 
        }, { status: 401 })
      }
    }
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
        global: token ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } : undefined,
      }
    )
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 })
    }

    const stats = {
      venues: 0,
      events: 0,
      artists: 0,
      totalViews: 0,
      totalLikes: 0,
      recentActivity: []
    }

    // Role-based stats fetching
    if (profile.role === 'admin') {
      // Admin can see all stats
      const [venuesResult, eventsResult, artistsResult] = await Promise.all([
        supabase.from('venues').select('id', { count: 'exact' }),
        supabase.from('events').select('id', { count: 'exact' }),
        supabase.from('artists').select('id', { count: 'exact' })
      ])

      stats.venues = venuesResult.count || 0
      stats.events = eventsResult.count || 0
      stats.artists = artistsResult.count || 0

      // Get recent activity for admin
      const { data: recentActivity } = await supabase
        .from('content_moderation_log')
        .select(`
          action,
          content_type,
          created_at,
          profiles!moderator_id(display_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      stats.recentActivity = recentActivity?.map(activity => ({
        action: `${activity.action.toUpperCase()} ${activity.content_type.toUpperCase()}`,
        description: `Moderated by ${activity.profiles?.display_name || activity.profiles?.email || 'System'}`,
        time: new Date(activity.created_at).toLocaleDateString()
      })) || []

    } else {
      // Content creators see only their own stats
      const [venuesResult, eventsResult, artistsResult] = await Promise.all([
        profile.role === 'club_owner' 
          ? supabase.from('venues').select('id', { count: 'exact' }).eq('created_by', user.id)
          : Promise.resolve({ count: 0 }),
        ['promoter', 'club_owner'].includes(profile.role)
          ? supabase.from('events').select('id', { count: 'exact' }).eq('created_by', user.id)
          : Promise.resolve({ count: 0 }),
        profile.role === 'artist'
          ? supabase.from('artists').select('id', { count: 'exact' }).eq('created_by', user.id)
          : Promise.resolve({ count: 0 })
      ])

      stats.venues = venuesResult.count || 0
      stats.events = eventsResult.count || 0
      stats.artists = artistsResult.count || 0

      // Get user's recent content activity
      const contentTypes = []
      if (profile.role === 'club_owner') contentTypes.push('venue')
      if (['promoter', 'club_owner'].includes(profile.role)) contentTypes.push('event')
      if (profile.role === 'artist') contentTypes.push('artist')

      if (contentTypes.length > 0) {
        const { data: recentActivity } = await supabase
          .from('content_moderation_log')
          .select('action, content_type, created_at')
          .in('content_type', contentTypes)
          .eq('moderator_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        stats.recentActivity = recentActivity?.map(activity => ({
          action: `${activity.action.toUpperCase()} ${activity.content_type.toUpperCase()}`,
          description: `You ${activity.action}d a ${activity.content_type}`,
          time: new Date(activity.created_at).toLocaleDateString()
        })) || []
      }
    }

    // Mock some additional stats for now (these would come from analytics table in production)
    stats.totalViews = Math.floor(Math.random() * 10000) + 1000
    stats.totalLikes = Math.floor(Math.random() * 1000) + 100

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch dashboard stats'
    }, { status: 500 })
  }
}