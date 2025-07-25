import { NextRequest, NextResponse } from 'next/server'

// Handle requests to /api/v2/projects/ that don't exist in our app
// This prevents 404 errors from external services or extensions
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Endpoint not available',
      message: 'This API endpoint is not implemented in this application',
      available_endpoints: [
        '/api/generate',
        '/api/tracks',
        '/api/webhooks/clerk'
      ]
    },
    { status: 404 }
  )
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Endpoint not available',
      message: 'This API endpoint is not implemented in this application'
    },
    { status: 404 }
  )
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Endpoint not available',
      message: 'This API endpoint is not implemented in this application'
    },
    { status: 404 }
  )
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Endpoint not available',
      message: 'This API endpoint is not implemented in this application'
    },
    { status: 404 }
  )
}
