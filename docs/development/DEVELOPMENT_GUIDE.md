# Development Guide

This guide provides detailed information for developers working on the Drift platform.

## Table of Contents

- [Project Structure](#project-structure)
- [Development Environment](#development-environment)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Authentication & Authorization](#authentication--authorization)
- [Testing](#testing)
- [Debugging](#debugging)
- [Performance](#performance)
- [Deployment](#deployment)

## Project Structure

```
drift/
├── app/                           # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── venues/               # Venue management
│   │   ├── events/               # Event management
│   │   ├── artists/              # Artist management
│   │   ├── reviews/              # Review system
│   │   ├── search/               # Search functionality
│   │   ├── user/                 # User profile management
│   │   └── admin/                # Admin endpoints
│   ├── (routes)/                 # Page routes
│   │   ├── venue/[id]/          # Venue detail pages
│   │   ├── event/[id]/          # Event detail pages
│   │   ├── artist/[id]/         # Artist detail pages
│   │   ├── explore/             # Search/browse page
│   │   └── auth/                # Authentication pages
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── Header.tsx               # Navigation header
│   └── Footer.tsx               # Site footer
├── lib/                         # Utility libraries
│   ├── services/                # Business logic
│   │   ├── auth.ts             # Authentication service
│   │   ├── venues.ts           # Venue operations
│   │   ├── events.ts           # Event operations
│   │   ├── artists.ts          # Artist operations
│   │   └── reviews.ts          # Review operations
│   ├── types/                   # TypeScript definitions
│   │   └── database.ts         # Supabase types
│   ├── api-utils.ts            # API utilities
│   ├── supabase.ts             # Supabase client
│   ├── supabase-server.ts      # Server-side Supabase
│   └── utils.ts                # General utilities
├── docs/                        # Documentation
├── supabase/                    # Database migrations
└── public/                      # Static assets
```

## Development Environment

### Environment Variables

Create `.env.local` with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: External APIs
OPENAI_API_KEY=your_openai_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Development
NODE_ENV=development
```

### Development Scripts

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Database operations
npm run db:generate  # Generate types
npm run db:push      # Push schema changes
npm run db:reset     # Reset database

# Build and production
npm run build
npm run start
```

## Architecture Overview

### Frontend Architecture

- **Framework**: Next.js 14 with App Router
- **State Management**: React Context + Local State
- **Styling**: Tailwind CSS + shadcn/ui
- **Data Fetching**: Native fetch + Supabase client
- **Authentication**: Supabase Auth

### Backend Architecture

- **API**: Next.js API Routes (App Router)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with JWT
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime subscriptions

### Key Design Patterns

1. **Service Layer Pattern**: Business logic in `/lib/services/`
2. **Repository Pattern**: Database operations abstracted
3. **Middleware Pattern**: Authentication and validation
4. **Error Boundary Pattern**: Centralized error handling

## Database Schema

### Core Tables

```sql
-- Users and Profiles
profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('fan','artist','promoter','club_owner','admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Venues
venues (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  capacity INTEGER,
  owner_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Events
events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  venue_id UUID REFERENCES venues(id),
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Artists
artists (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  genres TEXT[],
  user_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Reviews
reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  target_type TEXT CHECK (target_type IN ('venue','event','artist')),
  target_id UUID NOT NULL,
  rating_overall INTEGER CHECK (rating_overall BETWEEN 1 AND 5),
  rating_sound INTEGER CHECK (rating_sound BETWEEN 1 AND 5),
  rating_vibe INTEGER CHECK (rating_vibe BETWEEN 1 AND 5),
  rating_crowd INTEGER CHECK (rating_crowd BETWEEN 1 AND 5),
  comment TEXT,
  status TEXT CHECK (status IN ('visible','pending_review','hidden')) DEFAULT 'visible',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### Relationships

- **One-to-Many**: Users → Venues, Events, Artists, Reviews
- **Many-to-Many**: Events ↔ Artists (via junction table)
- **Self-referencing**: Reviews can reference any entity type

### Indexing Strategy

```sql
-- Performance indexes
CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_venues_location ON venues(city, country);
```

## API Development

### Route Structure

API routes follow RESTful conventions:

```
GET    /api/venues          # List venues
POST   /api/venues          # Create venue
GET    /api/venues/[id]     # Get venue
PUT    /api/venues/[id]     # Update venue
DELETE /api/venues/[id]     # Delete venue
```

### Request/Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "count": 10,
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description"
}
```

### Authentication Middleware

```typescript
import { requireAuth, requireRole } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  // Require authentication
  const { user, supabase } = await requireAuth()
  
  // Require specific role
  const { user, profile } = await requireRole(['club_owner', 'admin'])
  
  // Your logic here
}
```

### Input Validation

```typescript
import { validateRequired, validateEmail, validateRating } from '@/lib/api-utils'

// Validate required fields
validateRequired(body, ['name', 'email', 'rating'])

// Validate email format
validateEmail(body.email)

// Validate rating range
validateRating(body.rating)
```

## Frontend Development

### Component Structure

```typescript
// components/VenueCard.tsx
interface VenueCardProps {
  venue: Venue
  onSelect?: (venue: Venue) => void
}

export function VenueCard({ venue, onSelect }: VenueCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{venue.name}</CardTitle>
        <CardDescription>{venue.city}, {venue.country}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{venue.description}</p>
      </CardContent>
    </Card>
  )
}
```

### Data Fetching Patterns

```typescript
// Client-side data fetching
'use client'

import { useEffect, useState } from 'react'
import { getVenues } from '@/lib/services/venues'

export function VenueList() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVenues() {
      try {
        const data = await getVenues()
        setVenues(data)
      } catch (error) {
        console.error('Error fetching venues:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {venues.map(venue => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  )
}
```

### Server-side Data Fetching

```typescript
// app/venues/page.tsx
import { getVenues } from '@/lib/services/venues'

export default async function VenuesPage() {
  const venues = await getVenues()

  return (
    <div>
      <h1>Venues</h1>
      <VenueGrid venues={venues} />
    </div>
  )
}
```

## Authentication & Authorization

### User Roles

1. **Fan** - Basic user privileges
2. **Artist** - Can create artist profiles
3. **Promoter** - Can create events
4. **Club Owner** - Can create venues and events
5. **Admin** - Full access

### Route Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { user } = await getUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.redirect('/auth/login')
    }
  }
}
```

### Component-level Protection

```typescript
// components/AdminOnly.tsx
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  if (user?.role !== 'admin') {
    return <div>Access denied</div>
  }
  
  return <>{children}</>
}
```

## Testing

### Unit Testing

```typescript
// __tests__/api/venues.test.ts
import { GET } from '@/app/api/venues/route'
import { NextRequest } from 'next/server'

describe('/api/venues', () => {
  it('returns venues list', async () => {
    const request = new NextRequest('http://localhost:3000/api/venues')
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })
})
```

### Integration Testing

```typescript
// __tests__/integration/venue-flow.test.ts
describe('Venue Management Flow', () => {
  it('creates, updates, and deletes venue', async () => {
    // Test complete CRUD flow
  })
})
```

## Debugging

### Development Tools

1. **Next.js DevTools**: Built-in debugging
2. **React DevTools**: Component inspection
3. **Supabase Dashboard**: Database queries
4. **Browser DevTools**: Network and console

### Logging

```typescript
// lib/logger.ts
export function logError(error: Error, context?: string) {
  console.error(`[${context}]`, error)
  // Send to monitoring service in production
}

export function logInfo(message: string, data?: any) {
  console.log(`[INFO] ${message}`, data)
}
```

### Common Issues

1. **Supabase Connection**: Check environment variables
2. **Authentication**: Verify JWT tokens
3. **Type Errors**: Run `npm run type-check`
4. **Build Errors**: Check imports and dependencies

## Performance

### Optimization Strategies

1. **Code Splitting**: Dynamic imports for large components
2. **Image Optimization**: Next.js Image component
3. **Caching**: API responses and static data
4. **Database**: Proper indexing and query optimization

### Monitoring

```typescript
// lib/performance.ts
export function measurePerformance(name: string, fn: () => Promise<any>) {
  const start = performance.now()
  
  return fn().finally(() => {
    const duration = performance.now() - start
    console.log(`${name} took ${duration.toFixed(2)}ms`)
  })
}
```

## Deployment

### Production Build

```bash
# Type check and build
npm run type-check
npm run build

# Test production build locally
npm run start
```

### Environment Configuration

```env
# Production environment
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=prod_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build passes without errors
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Security review completed

For detailed deployment instructions, see [Deployment Guide](../deployment/SETUP.md).

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)