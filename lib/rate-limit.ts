import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (use Redis in production)
const store: RateLimitStore = {}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 60000) // Clean up every minute

export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config

  return async (request: NextRequest) => {
    // Generate key for rate limiting (IP address by default)
    const key = keyGenerator 
      ? keyGenerator(request)
      : getClientIP(request) || 'anonymous'

    const now = Date.now()
    const windowStart = now - windowMs

    // Initialize or get existing record
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      }
    }

    // Check if within rate limit
    if (store[key].count >= maxRequests) {
      const resetTime = store[key].resetTime
      const retryAfter = Math.ceil((resetTime - now) / 1000)

      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: new Date(resetTime),
        retryAfter
      }
    }

    // Increment counter
    store[key].count++

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - store[key].count,
      reset: new Date(store[key].resetTime),
      retryAfter: 0
    }
  }
}

// Get client IP address
function getClientIP(request: NextRequest): string | null {
  // Check various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')

  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()

  return null
}

// Predefined rate limiters
export const musicGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 generations per 15 minutes
  keyGenerator: (request) => {
    // Use user ID if available, otherwise IP
    const userId = request.headers.get('x-user-id')
    return userId || getClientIP(request) || 'anonymous'
  }
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
})

// Rate limit response helper
export function createRateLimitResponse(result: Awaited<ReturnType<ReturnType<typeof rateLimit>>>) {
  const headers = new Headers({
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toISOString(),
  })

  if (!result.success) {
    headers.set('Retry-After', result.retryAfter.toString())
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter
      }),
      {
        status: 429,
        headers
      }
    )
  }

  return { headers }
}
