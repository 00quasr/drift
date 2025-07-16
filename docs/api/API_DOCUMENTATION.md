# Drift API Documentation

## Overview

This document provides a comprehensive overview of the Drift platform's backend API implementation. The API is built using Next.js 14 App Router with TypeScript, Supabase for backend services, and follows RESTful conventions.

## Architecture

- **Framework**: Next.js 14 App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Language**: TypeScript
- **Validation**: Custom validation utilities
- **Error Handling**: Centralized error handling with consistent response format

## API Routes Structure

### Authentication Routes (`/api/auth/`)

#### POST `/api/auth/signup`
- **Purpose**: Register a new user
- **Body**: `{ email, password, fullName, role }`
- **Roles**: `fan`, `artist`, `promoter`, `club_owner`
- **Response**: User data and session

#### POST `/api/auth/signin`
- **Purpose**: Sign in existing user
- **Body**: `{ email, password }`
- **Response**: User data, session, and profile

#### POST `/api/auth/signout`
- **Purpose**: Sign out current user
- **Response**: Success confirmation

#### POST `/api/auth/reset-password`
- **Purpose**: Send password reset email
- **Body**: `{ email }`
- **Response**: Success confirmation

#### POST `/api/auth/update-password`
- **Purpose**: Update user password (requires auth)
- **Body**: `{ password }`
- **Response**: Success confirmation

### Venues Routes (`/api/venues/`)

#### GET `/api/venues/`
- **Purpose**: List venues with filtering and search
- **Query Params**: `city`, `country`, `genres`, `limit`, `offset`, `q` (search)
- **Response**: Array of venues with owner info

#### POST `/api/venues/`
- **Purpose**: Create new venue (requires verified creator)
- **Body**: Venue data (name, description, address, etc.)
- **Permissions**: `club_owner`, `promoter`, `admin`
- **Response**: Created venue

#### GET `/api/venues/[id]`
- **Purpose**: Get specific venue by ID
- **Response**: Venue with events and ratings

#### PUT `/api/venues/[id]`
- **Purpose**: Update venue (requires ownership or admin)
- **Body**: Updated venue data
- **Permissions**: Owner or admin
- **Response**: Updated venue

#### DELETE `/api/venues/[id]`
- **Purpose**: Soft delete venue (sets is_active: false)
- **Permissions**: Owner or admin
- **Response**: Success confirmation

### Events Routes (`/api/events/`)

#### GET `/api/events/`
- **Purpose**: List events with filtering
- **Query Params**: `city`, `country`, `venue_id`, `genres`, `start_date`, `end_date`, `limit`, `offset`, `q`, `type` (upcoming/trending)
- **Response**: Array of events with venue and artist info

#### POST `/api/events/`
- **Purpose**: Create new event (requires verified creator)
- **Body**: Event data (title, date, venue_id, etc.)
- **Permissions**: `club_owner`, `promoter`, `admin`
- **Response**: Created event

#### GET `/api/events/[id]`
- **Purpose**: Get specific event by ID
- **Response**: Event with venue and artists

#### PUT `/api/events/[id]`
- **Purpose**: Update event
- **Permissions**: Creator, venue owner, or admin
- **Response**: Updated event

#### DELETE `/api/events/[id]`
- **Purpose**: Soft delete event
- **Permissions**: Creator, venue owner, or admin
- **Response**: Success confirmation

### Artists Routes (`/api/artists/`)

#### GET `/api/artists/`
- **Purpose**: List artists with filtering
- **Query Params**: `city`, `country`, `genres`, `limit`, `offset`, `q`, `type` (top-rated)
- **Response**: Array of artists

#### POST `/api/artists/`
- **Purpose**: Create artist profile (requires verification)
- **Body**: Artist data (name, bio, genres, etc.)
- **Permissions**: `artist`, `promoter`, `admin`
- **Response**: Created artist

#### GET `/api/artists/[id]`
- **Purpose**: Get specific artist by ID
- **Response**: Artist with events and ratings

#### PUT `/api/artists/[id]`
- **Purpose**: Update artist profile
- **Permissions**: Owner or admin
- **Response**: Updated artist

#### DELETE `/api/artists/[id]`
- **Purpose**: Soft delete artist
- **Permissions**: Owner or admin
- **Response**: Success confirmation

#### GET `/api/artists/[id]/events`
- **Purpose**: Get artist's events
- **Query Params**: `type` (upcoming/past), `limit`
- **Response**: Array of artist's events

### Reviews Routes (`/api/reviews/`)

#### GET `/api/reviews/`
- **Purpose**: Get reviews for a target entity
- **Query Params**: `target_type`, `target_id`, `status`, `limit`, `offset`
- **Response**: Array of reviews with user info

#### POST `/api/reviews/`
- **Purpose**: Create new review (requires auth)
- **Body**: `{ target_type, target_id, rating_sound, rating_vibe, rating_crowd, comment }`
- **Validation**: Ratings 1-5, one review per user per target
- **Response**: Created review

#### GET `/api/reviews/[id]`
- **Purpose**: Get specific review
- **Response**: Review with user info

#### PUT `/api/reviews/[id]`
- **Purpose**: Update review
- **Permissions**: Author or admin
- **Response**: Updated review

#### DELETE `/api/reviews/[id]`
- **Purpose**: Delete review
- **Permissions**: Author or admin
- **Response**: Success confirmation

#### GET `/api/reviews/stats`
- **Purpose**: Get review statistics for a target
- **Query Params**: `target_type`, `target_id`
- **Response**: Average ratings, count, distribution

#### POST `/api/reviews/flag`
- **Purpose**: Flag a review for moderation
- **Body**: `{ review_id, reason }`
- **Response**: Success confirmation

### Search & Explore Routes

#### GET `/api/search`
- **Purpose**: Global search across venues, events, artists
- **Query Params**: `q` (required), `type`, `city`, `country`, `genres`, `limit`
- **Response**: Categorized search results

#### GET `/api/explore`
- **Purpose**: Get explore page data
- **Query Params**: `section`, `limit`
- **Response**: Trending venues, upcoming events, top artists

### User Routes (`/api/user/`)

#### GET `/api/user/profile`
- **Purpose**: Get current user's profile (requires auth)
- **Response**: User and profile data

#### PUT `/api/user/profile`
- **Purpose**: Update current user's profile
- **Body**: Profile data (excluding protected fields)
- **Response**: Updated profile

#### GET `/api/user/reviews`
- **Purpose**: Get current user's reviews
- **Query Params**: `limit`
- **Response**: User's reviews with target info

### Admin Routes (`/api/admin/`)

#### GET `/api/admin/moderate`
- **Purpose**: Get flagged reviews for moderation
- **Permissions**: Admin only
- **Query Params**: `limit`
- **Response**: Flagged reviews with flag details

#### POST `/api/admin/moderate`
- **Purpose**: Moderate a review
- **Permissions**: Admin only
- **Body**: `{ review_id, action, notes }`
- **Actions**: `approve`, `hide`, `remove_flags`
- **Response**: Moderation result

## Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  count?: number
}
```

### Success Response Example
```json
{
  "success": true,
  "data": [...],
  "count": 10,
  "message": "Data fetched successfully"
}
```

### Error Response Example
```json
{
  "success": false,
  "error": "Authentication required"
}
```

## HTTP Status Codes

- `200` - OK (successful GET, PUT)
- `201` - Created (successful POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Authentication & Authorization

### Authentication
- Uses Supabase Auth with JWT tokens
- Tokens automatically handled by Supabase client
- Protected routes require valid session

### Authorization Levels
1. **Public** - No authentication required (GET routes for browsing)
2. **Authenticated** - Valid user session required (reviews, profile)
3. **Verified Creator** - Specific roles with verification (content creation)
4. **Owner** - Resource ownership required (editing own content)
5. **Admin** - Admin role required (moderation, user management)

### User Roles
- `fan` - Basic user, can browse and review
- `artist` - Can create artist profiles (requires verification)
- `promoter` - Can create events and venues (requires verification)
- `club_owner` - Can create venues and events (requires verification)
- `admin` - Full access to all features and moderation

## Input Validation

### Common Validations
- Email format validation
- Password strength (minimum 8 characters)
- Required field validation
- Enum validation for roles and statuses
- Rating validation (1-5 integers)
- Content length limits
- SQL injection prevention via parameterized queries

### Rate Limiting
- Basic rate limiting implemented in utility functions
- Default: 100 requests per minute per IP

## Error Handling

### Centralized Error Handling
- All routes wrapped with error handling middleware
- Consistent error response format
- Proper error logging
- Client-friendly error messages

### Common Error Types
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Conflict errors (409)
- Server errors (500)

## Security Features

### Data Protection
- SQL injection prevention
- XSS protection via input sanitization
- CORS configuration
- Rate limiting
- Input validation and sanitization

### Authentication Security
- Secure password hashing via Supabase
- JWT token validation
- Session management
- Password reset flows

### Authorization Security
- Role-based access control (RBAC)
- Resource ownership validation
- Admin-only routes protection
- Verification requirements for creators

## Integration Points

### Supabase Services Used
- **Auth** - User authentication and session management
- **Database** - PostgreSQL with Row Level Security
- **Storage** - File uploads (images, documents)
- **Realtime** - Live updates for reviews and notifications

### Third-Party Integrations (Planned)
- OpenAI - Content moderation
- Mapbox - Location services
- Email Service - Notifications

## Development Notes

### Service Layer
- Business logic separated into service functions
- Reusable across API routes and frontend
- Located in `/lib/services/`

### Utility Functions
- Common validation and helper functions
- Located in `/lib/api-utils.ts`
- Includes pagination, sanitization, slug generation

### Middleware
- Authentication checks for protected routes
- CORS handling for API routes
- Security headers
- Request/response preprocessing

## Performance Considerations

### Optimization Strategies
- Efficient database queries with proper indexing
- Pagination for large datasets
- Caching strategies for frequently accessed data
- Lazy loading for related data

### Monitoring
- Error logging and tracking
- Performance metrics collection
- Rate limiting monitoring
- Database query optimization

This API provides a robust foundation for the Drift platform, supporting all core features including user management, content creation, reviews and ratings, search functionality, and administrative tools.