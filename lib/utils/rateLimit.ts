// Simple in-memory rate limiter for development/small scale
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  requests: number
  windowMs: number
}

export const defaultRateLimit: RateLimitConfig = {
  requests: 10,
  windowMs: 10 * 1000 // 10 seconds
}

export const strictRateLimit: RateLimitConfig = {
  requests: 5,
  windowMs: 60 * 1000 // 1 minute
}

export const uploadRateLimit: RateLimitConfig = {
  requests: 3,
  windowMs: 60 * 1000 // 1 minute
}

export async function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig = defaultRateLimit
): Promise<{
  success: boolean
  remaining: number
  reset: number
  limit: number
}> {
  const now = Date.now()
  const key = `${identifier}:${config.requests}:${config.windowMs}`
  
  // Clean up expired entries
  const entry = rateLimitStore.get(key)
  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(key)
  }
  
  const currentEntry = rateLimitStore.get(key)
  
  if (!currentEntry) {
    // First request in this window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    
    return {
      success: true,
      remaining: config.requests - 1,
      reset: now + config.windowMs,
      limit: config.requests
    }
  }
  
  if (currentEntry.count >= config.requests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      reset: currentEntry.resetTime,
      limit: config.requests
    }
  }
  
  // Increment count
  currentEntry.count++
  rateLimitStore.set(key, currentEntry)
  
  return {
    success: true,
    remaining: config.requests - currentEntry.count,
    reset: currentEntry.resetTime,
    limit: config.requests
  }
}

// Best-effort client IP for rate limiting unauthenticated routes. Behind Vercel the
// first x-forwarded-for entry is the real client.
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

export function getRateLimitHeaders(result: {
  remaining: number
  reset: number
  limit: number
}) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  }
}