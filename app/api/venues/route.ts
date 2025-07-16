import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getVenues, createVenue, searchVenues } from '@/lib/services/venues'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const country = searchParams.get('country')
    const genres = searchParams.get('genres')?.split(',').filter(Boolean)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    const query = searchParams.get('q')

    let data
    if (query) {
      data = await searchVenues(query, { city: city || undefined, genres, limit })
    } else {
      data = await getVenues({ city: city || undefined, country: country || undefined, genres, limit, offset })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length 
    })
  } catch (error) {
    console.error('Error in GET /api/venues:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch venues' 
    }, { status: 500 })
  }
}

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

    // Check user role permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const allowedRoles = ['club_owner', 'promoter', 'admin']
    if (!profile || !allowedRoles.includes(profile.role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Add user_id to venue data
    const venueData = {
      ...body,
      owner_id: user.id,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const data = await createVenue(venueData)

    return NextResponse.json({ 
      success: true, 
      data 
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/venues:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create venue' 
    }, { status: 500 })
  }
}