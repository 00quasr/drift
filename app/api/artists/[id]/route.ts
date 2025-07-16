import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getArtistById, updateArtist, deleteArtist } from '@/lib/services/artists'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getArtistById(params.id)
    
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Error in GET /api/artists/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch artist' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get artist to check ownership
    const artist = await getArtistById(params.id)
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist not found' 
      }, { status: 404 })
    }

    // Check permissions - user must be artist owner or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner = artist.user_id === user.id
    const isAdmin = profile?.role === 'admin'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    const artistData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const data = await updateArtist(params.id, artistData)

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Error in PUT /api/artists/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update artist' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get artist to check ownership
    const artist = await getArtistById(params.id)
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist not found' 
      }, { status: 404 })
    }

    // Check permissions - user must be artist owner or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isOwner = artist.user_id === user.id
    const isAdmin = profile?.role === 'admin'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    await deleteArtist(params.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Artist deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/artists/[id]:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete artist' 
    }, { status: 500 })
  }
}