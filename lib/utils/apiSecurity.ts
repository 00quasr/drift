import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RateLimitConfig, getRateLimitHeaders } from './rateLimit'
import { createErrorResponse } from '../validations/api'
import { z } from 'zod'

export interface SecurityOptions {
  rateLimit?: RateLimitConfig
  requireAuth?: boolean
  allowedMethods?: string[]
  validation?: z.ZodSchema
}

export async function withSecurity(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: SecurityOptions = {}
) {
  try {
    // Method validation
    if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
      return NextResponse.json(
        createErrorResponse(`Method ${request.method} not allowed`),
        { status: 405 }
      )
    }

    // Rate limiting
    if (options.rateLimit) {
      const identifier = getClientIdentifier(request)
      const rateLimitResult = await checkRateLimit(identifier, options.rateLimit)
      
      if (!rateLimitResult.success) {
        return NextResponse.json(
          createErrorResponse('Too many requests'),
          { 
            status: 429,
            headers: getRateLimitHeaders(rateLimitResult)
          }
        )
      }
    }

    // Input validation
    if (options.validation && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.json()
        const validatedData = options.validation.parse(body)
        // Attach validated data to request for use in handler
        ;(request as any).validatedData = validatedData
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            createErrorResponse('Validation failed', error.errors),
            { status: 400 }
          )
        }
        return NextResponse.json(
          createErrorResponse('Invalid request body'),
          { status: 400 }
        )
      }
    }

    // Execute the handler
    const response = await handler(request)
    
    // Add security headers
    if (options.rateLimit) {
      const identifier = getClientIdentifier(request)
      const rateLimitResult = await checkRateLimit(identifier, options.rateLimit)
      const headers = getRateLimitHeaders(rateLimitResult)
      
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }
    
    return response
    
  } catch (error) {
    console.error('API Security Error:', error)
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get user identifier from various sources
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const userAgent = request.headers.get('user-agent') || ''
  
  // Use IP address as primary identifier
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // Create a more unique identifier by combining IP and User-Agent hash
  const identifier = `${ip}:${hashString(userAgent)}`
  
  return identifier
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

// Specific security configurations for different endpoint types
export const authEndpointSecurity: SecurityOptions = {
  rateLimit: { requests: 5, windowMs: 60 * 1000 }, // 5 requests per minute
  allowedMethods: ['POST']
}

export const searchEndpointSecurity: SecurityOptions = {
  rateLimit: { requests: 20, windowMs: 60 * 1000 }, // 20 requests per minute
  allowedMethods: ['GET']
}

export const uploadEndpointSecurity: SecurityOptions = {
  rateLimit: { requests: 3, windowMs: 60 * 1000 }, // 3 uploads per minute
  allowedMethods: ['POST']
}

export const standardEndpointSecurity: SecurityOptions = {
  rateLimit: { requests: 10, windowMs: 10 * 1000 }, // 10 requests per 10 seconds
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
}