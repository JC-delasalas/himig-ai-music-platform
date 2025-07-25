import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, return empty tracks array
    // In production, you would fetch from database with proper authentication
    const tracks: any[] = []

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
