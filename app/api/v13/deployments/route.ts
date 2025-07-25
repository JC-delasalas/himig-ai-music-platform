import { NextRequest, NextResponse } from 'next/server'

// Handle requests to /api/v13/deployments/ that don't exist in our app
// This prevents 400/404 errors from external services
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Deployment API not available',
      message: 'This application does not provide deployment API endpoints',
      suggestion: 'Use Vercel CLI or dashboard for deployment management'
    },
    { status: 404 }
  )
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Deployment API not available',
      message: 'This application does not provide deployment API endpoints'
    },
    { status: 404 }
  )
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Deployment API not available',
      message: 'This application does not provide deployment API endpoints'
    },
    { status: 404 }
  )
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Deployment API not available',
      message: 'This application does not provide deployment API endpoints'
    },
    { status: 404 }
  )
}
