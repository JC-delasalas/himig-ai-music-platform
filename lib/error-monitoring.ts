// Error monitoring and prevention utilities
export interface ErrorReport {
  message: string
  stack?: string
  url?: string
  timestamp: number
  userAgent?: string
  userId?: string
}

class ErrorMonitor {
  private static instance: ErrorMonitor
  private errorQueue: ErrorReport[] = []
  private maxQueueSize = 50

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor()
    }
    return ErrorMonitor.instance
  }

  // Log error for monitoring (can be sent to external service)
  logError(error: Error | string, context?: Record<string, any>) {
    const errorReport: ErrorReport = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...context
    }

    // Add to queue
    this.errorQueue.push(errorReport)
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // In production, you might want to send this to a monitoring service
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error logged:', errorReport)
    }
  }

  // Get recent errors for debugging
  getRecentErrors(): ErrorReport[] {
    return [...this.errorQueue]
  }

  // Clear error queue
  clearErrors() {
    this.errorQueue = []
  }
}

export const errorMonitor = ErrorMonitor.getInstance()

// Utility to check if error should be suppressed
export function shouldSuppressError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : error.message
  const stack = typeof error === 'object' ? error.stack : ''

  const suppressPatterns = [
    'Extension context invalidated',
    'polyfill.js',
    'knock.app',
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    'Script error',
  ]

  return suppressPatterns.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase()) ||
    stack.toLowerCase().includes(pattern.toLowerCase())
  )
}

// Enhanced error handler for API routes
export function handleAPIError(error: unknown, context?: string): Response {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  
  // Log error if not suppressed
  if (!shouldSuppressError(errorMessage)) {
    errorMonitor.logError(errorMessage, { context, api: true })
  }

  return new Response(
    JSON.stringify({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? errorMessage : 'Something went wrong',
      timestamp: new Date().toISOString()
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
