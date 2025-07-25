import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { getUserTracks } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get user authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's tracks from database
    const tracks = await getUserTracks(userId)

    return NextResponse.json({
      success: true,
      tracks
    })

  } catch (error) {
    console.error('Tracks fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
