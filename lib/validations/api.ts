import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required')
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters')
export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long')

// User role validation
export const userRoleSchema = z.enum(['fan', 'artist', 'promoter', 'club_owner', 'admin'])

// Rating validation (1-10 scale)
export const ratingSchema = z.number().min(1, 'Rating must be at least 1').max(10, 'Rating must be at most 10')

// Search validation
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  limit: z.number().min(1).max(50).optional().default(10)
})

// Auth validation schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema,
  role: userRoleSchema.optional().default('fan')
})

// Event validation
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  venue_id: z.string().uuid('Invalid venue ID'),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date'),
  ticket_price: z.number().min(0, 'Price cannot be negative').optional(),
  max_capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
  genres: z.array(z.string()).max(5, 'Too many genres').optional(),
  age_restriction: z.number().min(0).max(21).optional()
})

// Venue validation
export const createVenueSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  address: z.string().min(1, 'Address is required').max(300, 'Address too long'),
  city: z.string().min(1, 'City is required').max(100, 'City too long'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional(),
  website: z.string().url('Invalid website URL').optional()
})

// Review validation
export const createReviewSchema = z.object({
  content: z.string().min(1, 'Review content is required').max(1000, 'Review too long'),
  rating: ratingSchema,
  venue_id: z.string().uuid('Invalid venue ID').optional(),
  event_id: z.string().uuid('Invalid event ID').optional()
}).refine(data => data.venue_id || data.event_id, {
  message: 'Either venue_id or event_id must be provided'
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['avatar', 'venue_image', 'event_image', 'document']),
  maxSize: z.number().default(5 * 1024 * 1024) // 5MB default
}).refine(data => data.file.size <= data.maxSize, {
  message: 'File too large'
}).refine(data => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (data.type.includes('image')) {
    return allowedTypes.includes(data.file.type)
  }
  return true
}, {
  message: 'Invalid file type'
})

// Verification request validation
export const verificationRequestSchema = z.object({
  requested_role: z.enum(['artist', 'promoter', 'club_owner']),
  documents: z.record(z.string().url('Invalid document URL')),
  social_links: z.record(z.string().url('Invalid social link URL')),
  business_info: z.record(z.any())
})

// Generic pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

// ID validation
export const uuidSchema = z.string().uuid('Invalid ID format')

// Common response wrapper
export function createApiResponse<T>(data: T, success = true, message?: string) {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  }
}

// Error response
export function createErrorResponse(message: string, errors?: any) {
  return {
    success: false,
    error: message,
    errors,
    timestamp: new Date().toISOString()
  }
}