import { track } from '@vercel/analytics'

// Analytics event types
export type AnalyticsEvent = 
  | 'music_generation_started'
  | 'music_generation_completed'
  | 'music_generation_failed'
  | 'track_played'
  | 'track_downloaded'
  | 'track_favorited'
  | 'track_shared'
  | 'user_signed_up'
  | 'user_signed_in'
  | 'dashboard_visited'

interface AnalyticsProperties {
  genre?: string
  mood?: string
  duration?: number
  track_id?: string
  track_title?: string
  error_message?: string
  user_id?: string
  [key: string]: any
}

// Track analytics events
export function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
  try {
    // Track with Vercel Analytics
    track(event, properties)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event, properties)
    }
  } catch (error) {
    console.error('Analytics tracking error:', error)
  }
}

// Performance monitoring
export function trackPerformance(name: string, duration: number, metadata?: Record<string, any>) {
  try {
    // Track performance metrics
    track('performance_metric', {
      metric_name: name,
      duration_ms: duration,
      ...metadata
    })
    
    // Use Performance API if available
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${name}-end`)
      window.performance.measure(name, `${name}-start`, `${name}-end`)
    }
  } catch (error) {
    console.error('Performance tracking error:', error)
  }
}

// Error tracking
export function trackError(error: Error, context?: Record<string, any>) {
  try {
    track('error_occurred', {
      error_message: error.message,
      error_stack: error.stack || 'No stack trace available',
      error_name: error.name,
      ...context
    })
    
    console.error('Tracked Error:', error, context)
  } catch (trackingError) {
    console.error('Error tracking failed:', trackingError)
  }
}

// User interaction tracking
export function trackUserInteraction(action: string, element: string, metadata?: Record<string, any>) {
  trackEvent('user_interaction' as AnalyticsEvent, {
    action,
    element,
    timestamp: Date.now(),
    ...metadata
  })
}

// Music generation specific tracking
export function trackMusicGeneration(phase: 'start' | 'complete' | 'error', data: {
  prompt?: string
  genre?: string
  mood?: string
  duration?: number
  track_id?: string
  error?: string
  generation_time?: number
}) {
  const eventMap = {
    start: 'music_generation_started',
    complete: 'music_generation_completed',
    error: 'music_generation_failed'
  } as const

  trackEvent(eventMap[phase], {
    ...data,
    timestamp: Date.now()
  })
}

// Page view tracking
export function trackPageView(page: string, metadata?: Record<string, any>) {
  trackEvent('page_viewed' as AnalyticsEvent, {
    page,
    timestamp: Date.now(),
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    ...metadata
  })
}
