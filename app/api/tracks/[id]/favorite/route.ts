import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For demo purposes, return success without updating database
    // In production, you would update database with proper authentication
    const { isFavorite } = await request.json()
    const trackId = params.id

    // Mock updated track
    const updatedTrack = {
      id: trackId,
      is_favorite: isFavorite,
      updated_at: new Date().toISOString(),
    }

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
