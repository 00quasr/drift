# Drift Platform API Documentation

## Overview

The Drift API is a comprehensive RESTful API built with Next.js 14 App Router and TypeScript, designed specifically for electronic music event discovery and community engagement. It provides a complete backend infrastructure for managing venues, events, artists, reviews, and user interactions in the electronic music ecosystem.

### Technology Stack

- **Framework**: Next.js 14 App Router with TypeScript
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with JWT tokens
- **AI Integration**: OpenAI GPT-4 for content moderation
- **File Storage**: Supabase Storage for images and media
- **Real-time**: Supabase Realtime for live updates

### API Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Response Format

All API endpoints return a consistent JSON response structure:

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
  "data": {...},
  "count": 10,
  "message": "Operation completed successfully"
}
```

### Error Response Example
```json
{
  "success": false,
  "error": "Authentication required"
}
```

## Authentication & Authorization

### Authentication Methods

1. **Bearer Token Authentication**
   ```http
   Authorization: Bearer <jwt_token>
   ```

2. **Cookie-based Authentication** (SSR)
   - Automatic session cookies from Supabase
   - Used for server-side rendering

3. **CMS Authentication**
   - Enhanced authentication for content management
   - Includes role-based permissions

### User Roles & Permissions

| Role | Permissions |
|------|-------------|
| `fan` | Browse content, create reviews, manage own profile |
| `artist` | Artist role + create/manage artist profiles |
| `promoter` | Promoter role + create/manage events |
| `club_owner` | Club owner role + create/manage venues and events |
| `admin` | Full platform access + moderation capabilities |

### Permission Levels

1. **Public**: No authentication required
2. **Authenticated**: Valid session required
3. **Verified Creator**: Role-specific verification required
4. **Owner**: Resource ownership required
5. **Admin**: Administrator privileges required

## Core API Endpoints

### 1. Search & Discovery

#### Global Search
```http
GET /api/search
```
**Purpose**: Universal search across venues, events, and artists

**Query Parameters**:
- `q` (required): Search query string
- `type`: Filter by content type (`venues`, `events`, `artists`)
- `city`: Filter by city
- `country`: Filter by country  
- `genres`: Comma-separated list of genres
- `limit`: Maximum results per type (default: 10)

**Response**: Categorized search results
```json
{
  "success": true,
  "data": {
    "venues": [...],
    "events": [...],
    "artists": [...]
  }
}
```

#### Explore Content
```http
GET /api/explore
```
**Purpose**: Curated content for homepage and discovery

**Query Parameters**:
- `section`: Specific section (`trending-venues`, `upcoming-events`, `trending-events`, `top-artists`)
- `limit`: Maximum results (default: 12)

**Response**: Trending and featured content organized by sections

### 2. Authentication System

#### User Registration
```http
POST /api/auth/signup
```
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullName": "John Doe",
  "role": "fan"
}
```

**Validation**:
- Email format validation
- Password minimum 8 characters
- Valid role selection
- Unique email requirement

#### User Login
```http
POST /api/auth/signin
```
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**: User data, session, and profile information

#### Password Reset
```http
POST /api/auth/reset-password
```
**Request Body**:
```json
{
  "email": "user@example.com"
}
```

#### Update Password
```http
POST /api/auth/update-password
```
**Authentication**: Required
**Request Body**:
```json
{
  "password": "newsecurepassword123"
}
```

#### Admin User Creation
```http
POST /api/auth/register
```
**Purpose**: Administrative user creation with service role
**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "adminpassword123",
  "full_name": "Admin User",
  "role": "admin"
}
```

#### Profile Creation
```http
POST /api/auth/create-profile
```
**Purpose**: Create user profile after registration
**Request Body**:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "fan"
}
```

### 3. Content Moderation

#### Text Content Moderation
```http
POST /api/moderate/text
```
**Purpose**: AI-powered text content moderation using OpenAI
**Request Body**:
```json
{
  "text": "Content to be moderated"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "approved": true,
    "reason": null,
    "categories": []
  }
}
```

**Features**:
- OpenAI Moderation API integration
- GPT-4o-mini for contextual analysis
- Liberal approval policy
- Fallback to approval if service unavailable

#### Image Content Moderation
```http
POST /api/moderate/image
```
**Purpose**: AI-powered image moderation using OpenAI Vision
**Request Body**:
```json
{
  "image": "base64_encoded_image",
  "filename": "image.jpg"
}
```

**Features**:
- GPT-4o Vision model analysis
- Profile image focus
- Liberal approval for user-generated content

### 4. User Management

#### Get Current User Profile
```http
GET /api/user/profile
```
**Authentication**: Required (Bearer token)
**Response**: Complete user profile with settings

#### Update Current User Profile
```http
PUT /api/user/profile
```
**Authentication**: Required
**Request Body**: Profile update fields
**Features**:
- Automatic content moderation
- Avatar upload support
- Social links management

#### Get User Reviews
```http
GET /api/user/reviews
```
**Authentication**: Required
**Query Parameters**:
- `limit`: Maximum reviews (default: 10)
**Response**: User's review history with target information

#### List All Users (Admin)
```http
GET /api/users
```
**Authentication**: Admin required
**Query Parameters**:
- `role`: Filter by user role
- `search`: Search in user names
- `limit`, `offset`: Pagination
**Response**: User list with email addresses

#### Get Specific User
```http
GET /api/users/[id]
```
**Authentication**: Admin or own profile access
**Response**: User profile with email information

#### Update Specific User
```http
PUT /api/users/[id]
```
**Authentication**: Admin or own profile access
**Admin Features**:
- Change user role
- Modify verification status
- Update any profile field

#### Delete User Account
```http
DELETE /api/users/[id]
```
**Authentication**: Admin only
**Restrictions**: Cannot delete own admin account
**Response**: Account deletion confirmation

### 5. Venue Management

#### List Venues
```http
GET /api/venues
```
**Query Parameters**:
- `city`, `country`: Location filters
- `genres`: Genre filtering
- `limit`, `offset`: Pagination
- `q`: Search query
- `status`: Status filter (default: 'published')
- `cms=true`: CMS mode (requires authentication)

**CMS Mode Features**:
- Role-based filtering (admins see all, club owners see own)
- Additional metadata for management
- Draft/published workflow support

#### Create Venue
```http
POST /api/venues
```
**Authentication**: Club owner or admin required
**Request Body**:
```json
{
  "name": "Club Venue Name",
  "description": "Venue description",
  "address": "123 Music Street",
  "city": "Berlin",
  "country": "Germany",
  "capacity": 500,
  "sound_system": "Funktion-One",
  "genres": ["Techno", "House"]
}
```

**Features**:
- Automatic content moderation
- Address validation
- Capacity and technical specifications

#### Get Specific Venue
```http
GET /api/venues/[id]
```
**Query Parameters**:
- `cms=true`: CMS mode with enhanced data
**Response**: Venue details with events and ratings

#### Update Venue
```http
PUT /api/venues/[id]
```
**Authentication**: Owner or admin required
**Features**:
- Content moderation for updated text
- Maintains ownership validation
- Status workflow support

#### Delete Venue
```http
DELETE /api/venues/[id]
```
**Authentication**: Owner or admin required
**Action**: Soft delete (sets is_active: false)

### 6. Artist Management

#### List Artists
```http
GET /api/artists
```
**Query Parameters**:
- `city`, `country`: Location filters
- `genres`: Genre filtering
- `type`: `top-rated` for featured artists
- `q`: Search query (searches name, bio, city)
- `cms=true`: CMS mode
- `limit`, `offset`: Pagination

**Search Fields**:
- Artist name
- Biography content
- City location

#### Create Artist Profile
```http
POST /api/artists
```
**Authentication**: Artist role or admin required
**Restriction**: Artists can only create one profile
**Request Body**:
```json
{
  "name": "Artist Name",
  "bio": "Artist biography",
  "genres": ["Techno", "Minimal"],
  "city": "Berlin",
  "country": "Germany",
  "social_links": {
    "soundcloud": "artistname",
    "instagram": "@artistname"
  },
  "booking_email": "booking@artist.com"
}
```

#### Get Specific Artist
```http
GET /api/artists/[id]
```
**Query Parameters**:
- `cms=true`: CMS mode with management data
**Response**: Artist profile with events and statistics

#### Update Artist Profile
```http
PUT /api/artists/[id]
```
**Authentication**: Owner or admin required
**Features**:
- Content moderation
- Social links validation
- Genre management

#### Get Artist Events
```http
GET /api/artists/[id]/events
```
**Query Parameters**:
- `type`: `upcoming`, `past`, or null for all
- `limit`: Maximum results (default: 10)
**Response**: Artist's performance history

### 7. Event Management

#### List Events
```http
GET /api/events
```
**Query Parameters**:
- `city`, `country`, `venue_id`: Location and venue filters
- `genres`: Genre filtering
- `start_date`, `end_date`: Date range filtering
- `type`: `upcoming` or `trending`
- `cms=true`: CMS mode
- `limit`, `offset`: Pagination

**Caching**: 60s cache with 300s stale-while-revalidate
**Response**: Events with venue and artist information

#### Create Event
```http
POST /api/events
```
**Authentication**: Promoter, club owner, or admin required
**Request Body**:
```json
{
  "title": "Techno Night",
  "description": "Underground techno event",
  "venue_id": "venue-uuid",
  "start_time": "2024-07-25T22:00:00Z",
  "end_time": "2024-07-26T06:00:00Z",
  "genres": ["Techno", "Minimal"],
  "price_min": 15.00,
  "price_max": 25.00,
  "ticket_url": "https://tickets.com/event",
  "images": ["image-url-1", "image-url-2"]
}
```

**Features**:
- Database field mapping (start_time → start_date)
- Content moderation
- Pricing validation

#### Get Specific Event
```http
GET /api/events/[id]
```
**Query Parameters**:
- `cms=true`: CMS mode with management features
**Response**: Event details with venue, artists, and lineup

#### Update Event
```http
PUT /api/events/[id]
```
**Authentication**: Owner or admin required
**Special Features**:
- Status-only updates for workflow management
- Full event updates
- Artist lineup preservation

**Status-only Update**:
```json
{
  "status": "published"
}
```

### 8. Event-Artist Lineup Management

#### Get Event Lineup
```http
GET /api/events/[id]/artists
```
**Authentication**: None required
**Response**: Artist lineup with performance details
```json
{
  "success": true,
  "data": {
    "artists": [
      {
        "id": "artist-uuid",
        "name": "Ben Klock",
        "performance_order": 1,
        "performance_type": "headliner",
        "set_time": "02:00"
      }
    ]
  }
}
```

#### Add Artist to Event
```http
POST /api/events/[id]/artists
```
**Authentication**: Event owner (promoter) or admin required
**Request Body**:
```json
{
  "artist_id": "artist-uuid",
  "performance_order": 1,
  "performance_type": "headliner",
  "set_time": "02:00"
}
```

**Validation**:
- Prevents duplicate artists on same event
- Validates artist existence
- Auto-assigns performance order if not provided

#### Remove Artist from Event
```http
DELETE /api/events/[id]/artists
```
**Authentication**: Event owner or admin required
**Request Body**:
```json
{
  "artist_id": "artist-uuid"
}
```

### 9. Review & Rating System

#### Get Reviews
```http
GET /api/reviews
```
**Query Parameters**:
- `target_type` (required): `venue`, `event`, `artist`, `label`, `collective`
- `target_id` (required): UUID of target entity
- `status`: Review status filter
- `sort`: `newest`, `oldest`, `helpful`
- `limit`, `offset`: Pagination

**Response**: Reviews with user information and vote counts

#### Create Review
```http
POST /api/reviews
```
**Authentication**: Required
**Request Body**:
```json
{
  "target_type": "venue",
  "target_id": "venue-uuid",
  "rating_sound": 8,
  "rating_vibe": 9,
  "rating_crowd": 7,
  "comment": "Great venue with amazing sound system!"
}
```

**Features**:
- Multi-dimensional rating system (1-10 scale)
- Automatic overall rating calculation
- One review per user per target
- Comment is optional, at least one rating required

**Rating Categories by Entity Type**:
- **Venues**: Sound, Vibe, Crowd, Overall
- **Events**: Sound, Organization, Atmosphere, Overall  
- **Artists**: Sound, Performance, Energy, Overall

#### Update Review
```http
PUT /api/reviews/[id]
```
**Authentication**: Review author or admin required
**Request Body**: Same as create review

#### Delete Review
```http
DELETE /api/reviews/[id]
```
**Authentication**: Review author or admin required

#### Vote on Review
```http
POST /api/reviews/[id]/vote
```
**Authentication**: Required
**Request Body**:
```json
{
  "vote_type": "upvote"
}
```

**Vote Types**: `upvote`, `downvote`
**Logic**: 
- Same vote removes existing vote
- Different vote updates existing vote
- Cannot vote on own reviews

#### Get Review Statistics
```http
GET /api/reviews/stats
```
**Query Parameters**:
- `target_type` (required): Entity type
- `target_id` (required): Entity UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "average_sound": 8.2,
    "average_vibe": 7.8,
    "average_crowd": 8.5,
    "average_overall": 8.1,
    "total_reviews": 25,
    "rating_distribution": {
      "1": 0, "2": 1, "3": 2, "4": 5, "5": 17
    }
  }
}
```

#### Flag Review
```http
POST /api/reviews/flag
```
**Authentication**: Required
**Request Body**:
```json
{
  "review_id": "review-uuid",
  "reason": "Inappropriate content"
}
```

**Restrictions**:
- Cannot flag own reviews
- Cannot flag already flagged reviews
- Reason is optional

### 10. Admin Moderation

#### Get Flagged Reviews
```http
GET /api/admin/moderate
```
**Authentication**: Admin required
**Query Parameters**:
- `limit`: Maximum results (default: 50)

**Response**: Flagged reviews with flag reasons and user information

#### Moderate Review
```http
POST /api/admin/moderate
```
**Authentication**: Admin required
**Request Body**:
```json
{
  "review_id": "review-uuid",
  "action": "approve",
  "notes": "Review approved after manual review"
}
```

**Actions**:
- `approve`: Make review visible and clear flags
- `hide`: Hide review from public view and clear flags
- `remove_flags`: Clear flags without changing visibility

### 11. Dashboard Analytics

#### Get Dashboard Statistics
```http
GET /api/dashboard/stats
```
**Authentication**: Required (Bearer token or cookies)

**Role-based Data**:
- **Admin**: Platform-wide statistics and moderation activity
- **Content Creators**: Own content performance metrics
- **Fans**: Basic profile statistics

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1250,
      "totalVenues": 89,
      "totalEvents": 342,
      "totalArtists": 156
    },
    "chartData": [...],
    "recentActivity": [...],
    "topContent": {
      "venues": [...],
      "events": [...],
      "artists": [...]
    }
  }
}
```

## Advanced Features

### CMS Mode

Many endpoints support `cms=true` parameter for content management:

**Features**:
- Enhanced authentication with role-based filtering
- Additional metadata for management interfaces
- Draft/published workflow support
- Creator-specific data filtering

**Usage**:
```http
GET /api/events?cms=true
Authorization: Bearer <token>
```

### Content Workflow

Content supports status-based publishing workflow:

**Statuses**:
- `draft`: Work in progress, not publicly visible
- `published`: Live content, publicly accessible  
- `archived`: Removed from public view but preserved

**Status Transitions**:
- Draft → Published (publish action)
- Published → Archived (archive action)
- Archived → Published (republish action)

### AI-Powered Moderation

Integrated OpenAI content moderation system:

**Text Moderation**:
- OpenAI Moderation API base filtering
- GPT-4o-mini for contextual analysis
- Considers platform context and music industry norms
- Liberal approval policy with detailed logging

**Image Moderation**:
- GPT-4o Vision model analysis
- Profile picture and event image focus
- Cultural sensitivity for electronic music scene
- Automatic approval fallback

### Security Features

**Authentication Security**:
- JWT token validation
- Secure session management
- Password strength requirements
- Rate limiting ready infrastructure

**Data Protection**:
- Row Level Security (RLS) policies
- SQL injection prevention
- XSS protection via input sanitization
- CORS configuration

**Authorization Security**:
- Role-based access control (RBAC)
- Resource ownership validation
- Admin-only route protection
- Creator verification requirements

## HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT requests |
| 201 | Created | Successful POST requests |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource, constraint violations |
| 500 | Internal Server Error | Server-side errors |

## Error Handling

### Centralized Error Handling

All routes include comprehensive error handling:

```json
{
  "success": false,
  "error": "Detailed error message",
  "code": "ERROR_CODE"
}
```

### Common Error Patterns

**Validation Errors (400)**:
```json
{
  "success": false,
  "error": "Validation failed: Email is required"
}
```

**Authentication Errors (401)**:
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Permission Errors (403)**:
```json
{
  "success": false,
  "error": "Insufficient permissions to access this resource"
}
```

## Rate Limiting

**Default Limits**:
- 100 requests per minute per IP address
- Enhanced limits for authenticated users
- Special limits for admin operations

**Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

## Caching Strategy

**API Response Caching**:
- Public content: 60s cache with 300s stale-while-revalidate
- User-specific data: No caching
- Search results: 30s cache

**Cache Headers**:
```http
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

## Integration Points

### Supabase Services

**Authentication**:
- User registration and login
- JWT token management
- Password reset flows
- Session handling

**Database**:
- PostgreSQL with Row Level Security
- Real-time subscriptions
- Automatic schema migrations
- Connection pooling

**Storage**:
- Image and media file uploads
- Automatic CDN distribution
- Access control policies
- Image optimization

### OpenAI Integration

**Content Moderation**:
- Text content analysis
- Image content review
- Context-aware decisions
- Automatic approval workflows

### Third-Party Ready

**Planned Integrations**:
- Email service providers
- Payment processing
- Social media platforms
- Analytics services

## Development Guidelines

### API Design Principles

1. **RESTful Design**: Standard HTTP methods and resource-based URLs
2. **Consistent Responses**: Uniform response structure across all endpoints
3. **Comprehensive Validation**: Input validation with clear error messages
4. **Security First**: Authentication and authorization on all protected routes
5. **Performance Optimized**: Efficient queries with pagination and caching

### Service Layer Architecture

**Business Logic Separation**:
- Core business logic in `/lib/services/`
- API routes handle HTTP concerns only
- Reusable service functions across frontend and backend
- Centralized data access patterns

**Utility Functions**:
- Common validation functions
- Sanitization and formatting utilities
- Pagination helpers
- Response formatting

### Testing Strategy

**API Testing**:
- Unit tests for service functions
- Integration tests for API endpoints
- Authentication flow testing
- Permission verification tests

## Monitoring & Analytics

### Performance Monitoring

**Key Metrics**:
- Response time distribution
- Error rate tracking
- Database query performance
- Cache hit ratios

### Security Monitoring

**Security Events**:
- Failed authentication attempts
- Permission violations
- Content moderation triggers
- Suspicious activity patterns

### Business Analytics

**Platform Metrics**:
- User engagement statistics
- Content creation rates
- Review and rating trends
- Popular venues and events

---

This comprehensive API documentation provides complete coverage of the Drift platform's backend capabilities, supporting a full-featured electronic music event discovery and community platform. The API is designed for scalability, security, and extensibility to support the growing electronic music community.

**Version**: 2.0.0  
**Last Updated**: July 2024  
**Status**: Production Ready