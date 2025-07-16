import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  count?: number
}

// Create standardized API responses
export function createSuccessResponse<T>(data?: T, message?: string, count?: number): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(count !== undefined && { count })
  }
  return NextResponse.json(response)
}

export function createErrorResponse(error: string, status: number = 500): NextResponse {
  const response: ApiResponse = {
    success: false,
    error
  }
  return NextResponse.json(response, { status })
}

// Error handling wrapper for API routes
export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof Error) {
        return createErrorResponse(error.message, 500)
      }
      return createErrorResponse('Internal server error', 500)
    }
  }
}

// Authentication middleware
export async function requireAuth() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Authentication required')
  }
  
  return { user, supabase }
}

// Role-based authorization middleware
export async function requireRole(requiredRoles: string | string[]) {
  const { user, supabase } = await requireAuth()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, is_verified')
    .eq('id', user.id)
    .single()
  
  if (error || !profile) {
    throw new Error('User profile not found')
  }
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  
  if (!roles.includes(profile.role)) {
    throw new Error('Insufficient permissions')
  }
  
  return { user, profile, supabase }
}

// Verification requirement middleware
export async function requireVerification() {
  const { user, profile, supabase } = await requireRole(['artist', 'promoter', 'club_owner', 'admin'])
  
  if (profile.role !== 'admin' && !profile.is_verified) {
    throw new Error('Account verification required')
  }
  
  return { user, profile, supabase }
}

// Input validation helpers
export function validateRequired(fields: Record<string, any>, requiredFields: string[]): void {
  const missing = requiredFields.filter(field => !fields[field])
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
}

export function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }
}

export function validateRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5')
  }
}

export function validateEnum(value: string, validValues: string[], fieldName: string = 'field'): void {
  if (!validValues.includes(value)) {
    throw new Error(`Invalid ${fieldName}. Must be one of: ${validValues.join(', ')}`)
  }
}

// Pagination helpers
export function parsePagination(searchParams: URLSearchParams) {
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')
  const page = searchParams.get('page')
  
  const parsedLimit = limit ? Math.min(parseInt(limit), 100) : 10 // Max 100 items per page
  const parsedOffset = offset ? parseInt(offset) : 0
  const parsedPage = page ? parseInt(page) : 1
  
  return {
    limit: parsedLimit,
    offset: parsedOffset,
    page: parsedPage,
    // Calculate offset from page if not provided directly
    calculatedOffset: offset ? parsedOffset : (parsedPage - 1) * parsedLimit
  }
}

// URL parameter helpers
export function parseFilters(searchParams: URLSearchParams) {
  return {
    city: searchParams.get('city') || undefined,
    country: searchParams.get('country') || undefined,
    genres: searchParams.get('genres')?.split(',').filter(Boolean) || undefined,
    query: searchParams.get('q') || undefined,
    type: searchParams.get('type') || undefined,
    status: searchParams.get('status') || undefined
  }
}

// Rate limiting (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (userLimit.count >= maxRequests) {
    return false
  }
  
  userLimit.count++
  return true
}

// Content sanitization
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .slice(0, maxLength) // Limit length
}

// Slug generation
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .slice(0, 100) // Limit length
}

// Image URL validation
export function validateImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// Common HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const

// Common error messages
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'Authentication required',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  VALIDATION_ERROR: 'Validation error',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INTERNAL_ERROR: 'Internal server error'
} as const