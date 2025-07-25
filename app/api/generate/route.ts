import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { supabase, saveGeneratedTrack } from '@/lib/supabase'
import { generateTrackTitle } from '@/lib/utils'
import { musicGenerationLimiter, createRateLimitResponse } from '@/lib/rate-limit'

export interface GenerationRequest {
  prompt: string
  genre: string
  mood: string
  duration: number
}

// Mock audio URLs - replace with actual AI service integration
const SAMPLE_AUDIO_URLS = [
  'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'https://file-examples.com/storage/fe68c1b7c1a9d6b/2017/11/file_example_MP3_700KB.mp3',
  // Fallback data URL with simple tone
  'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmHgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
]

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await musicGenerationLimiter(request)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    // Get user authentication
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: GenerationRequest = await request.json()
    const { prompt, genre, mood, duration } = body

    // Validate input
    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!genre || !mood) {
      return NextResponse.json(
        { error: 'Genre and mood are required' },
        { status: 400 }
      )
    }

    if (duration < 15 || duration > 120) {
      return NextResponse.json(
        { error: 'Duration must be between 15 and 120 seconds' },
        { status: 400 }
      )
    }

    // Simulate AI generation delay (5 seconds)
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      return NextResponse.json(
        { error: 'Generation failed. Please try again.' },
        { status: 500 }
      )
    }

    // Generate track data
    const title = generateTrackTitle(prompt, genre, mood)
    const audioUrl = SAMPLE_AUDIO_URLS[Math.floor(Math.random() * SAMPLE_AUDIO_URLS.length)]
    
    const trackData = {
      user_id: userId,
      title,
      prompt,
      genre,
      mood,
      duration,
      audio_url: audioUrl,
      is_favorite: false,
      play_count: 0,
    }

    // Save to database
    const savedTrack = await saveGeneratedTrack(trackData)

    const response = NextResponse.json({
      success: true,
      track: savedTrack
    })

    // Add rate limit headers to successful response
    const { headers } = createRateLimitResponse(rateLimitResult)
    headers.forEach((value, key) => {
      response.headers.set(key, value)
    })

    return response

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
