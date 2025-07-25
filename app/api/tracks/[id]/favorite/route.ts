import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { updateTrackFavorite } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { isFavorite } = await request.json()
    const trackId = params.id

    // Update track favorite status
    const updatedTrack = await updateTrackFavorite(trackId, isFavorite)

    return NextResponse.json({
      success: true,
      track: updatedTrack
    })

  } catch (error) {
    console.error('Favorite update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
