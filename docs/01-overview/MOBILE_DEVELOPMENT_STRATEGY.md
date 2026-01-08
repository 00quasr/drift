# Mobile Development Strategy - Drift Platform

**Last Updated**: January 2025
**Target Launch**: 4 months (16 weeks)
**Approach**: Expo React Native + Optimized PWA
**Developer**: Solo project

---

## Executive Summary

This document outlines the comprehensive mobile development strategy for the Drift platform, designed to deliver native iOS and Android applications alongside an optimized Progressive Web App (PWA) within a 4-month timeline.

### Key Decisions

| Decision | Rationale | Impact |
|----------|-----------|--------|
| **Framework**: Expo React Native | Fastest development for solo developer, over-the-air updates, proven track record | 3-4 month delivery achievable |
| **Architecture**: Monorepo with shared code | Single source of truth, reduced duplication, easier maintenance | ~30% code reuse between web and mobile |
| **PWA First**: Quick wins in Week 1 | Instant mobile experience, validates features, tests core flows | PWA ready by end of Week 1 |
| **Parallel Development**: Web + Mobile | Backend complete, no API conflicts, consistent feature set | Both platforms launch together |

### Current State Analysis

**Mobile Readiness: 7/10**

- ✅ **Backend**: 100% complete (31 RESTful API endpoints)
- ✅ **Responsive Design**: Mobile-first Tailwind CSS implementation
- ✅ **Component Library**: shadcn/ui with mobile-optimized components
- ✅ **Authentication**: JWT-based auth with role management
- ✅ **API Structure**: RESTful, production-ready, well-documented

**Gaps to Address:**
- ❌ No PWA features (manifest, service worker, offline)
- ❌ No native mobile application
- ❌ No App Store distribution
- ❌ No push notifications
- ❌ No mobile-specific optimizations

### Deliverables at Launch

1. **Progressive Web App** - Installable mobile web experience
2. **iOS App** - Native application on App Store
3. **Android App** - Native application on Google Play Store
4. **Shared Services** - Unified business logic across all platforms
5. **Consistent Design** - Cyber-themed UI across web, iOS, and Android

---

## Strategy Overview

### Technology Stack Decision Matrix

| Option | Development Time | Code Reuse | App Store | Device Features | Solo Dev Friendly | Score |
|--------|------------------|------------|-----------|-----------------|-------------------|-------|
| **PWA Only** | 2 weeks | 100% | ❌ | Limited | ✅ Excellent | 6/10 |
| **React Native** | 3-6 months | 30% | ✅ | Full | ⚠️ Moderate | 7/10 |
| **Expo React Native** | 3-4 months | 40% | ✅ | Full | ✅ Excellent | **9/10** |
| **Hybrid (Capacitor)** | 1-2 months | 80% | ✅ | Partial | ✅ Good | 7/10 |
| **Flutter** | 4-5 months | 0% | ✅ | Full | ❌ Hard | 5/10 |

### Why Expo React Native is Best for Drift

#### 1. Solo Developer Optimizations
- **Faster Development**: No native code setup (Xcode/Android Studio)
- **Easier Debugging**: Expo Dev Tools, Expo Go for quick testing
- **Over-the-Air Updates**: Push updates without App Store review
- **Community Support**: Large ecosystem of pre-built modules

#### 2. 4-Month Timeline Achievable
- **Proven Success**: Many solo devs shipped in 3-4 months
- **Built-in Navigation**: Expo Router (file-based, zero config)
- **UI Libraries**: Expo components for common patterns
- **EAS Build**: Automated builds for iOS and Android

#### 3. Business Requirements
- **App Store Distribution**: Required for credibility in Germany market
- **Native Performance**: Smooth animations and native feel
- **Push Notifications**: Critical for user engagement
- **Device Features**: Camera, GPS, biometrics support

#### 4. Future-Proofing
- **Eject Option**: Can eject to pure React Native if needed
- **Web Support**: Expo for Web (future web-based mobile app)
- **Cross-Platform**: iOS, Android, and web from one codebase
- **Monorepo Ready**: Fits seamlessly with shared code strategy

### Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Timeline Overrun** | Medium | High | Built-in 4-week buffer in 16-week plan |
| **Learning Curve** | Low | Medium | Expo simplifies React Native, abundant resources |
| **App Store Rejection** | Low | High | Follow Apple/Google guidelines, test thoroughly |
| **Performance Issues** | Low | Medium | Use Expo optimization tools, test on real devices |
| **API Changes** | Very Low | Low | Backend complete and stable, unlikely to change |

### Success Metrics

#### Technical Metrics
- App Store submission by Week 16
- <3 second app launch time
- <500KB bundle size (per screen)
- 4.5+ star rating on App Store within 3 months
- <1% crash rate

#### Business Metrics
- 1,000+ downloads in first month
- 30% conversion from web to app
- 50% weekly active user rate
- Average session duration >5 minutes

---

## Technology Stack

### Core Framework
```
Expo React Native SDK 50+
- iOS 13.0+ and Android 7.0+ support
- TypeScript support
- Hermes JavaScript engine
```

### Navigation
```
Expo Router (File-Based Routing)
- Automatic TypeScript types
- Deep linking support
- Screen components as files
- Built-in navigation patterns (stack, tabs, drawer)
```

### State Management
```
Zustand 4.x
- Lightweight (1KB)
- No boilerplate
- TypeScript support
- Easy to test
- Better than Context for complex state
```

### UI Framework
```
Custom Components (React Native Paper-lite approach)
- Built on React Native primitives
- Matches Drift cyber aesthetic
- Responsive design system
- Accessibility support
```

### Authentication
```
Expo Auth Session + Supabase
- Secure token storage (Expo SecureStore)
- Google OAuth integration
- Session management
- Role-based access control
```

### Maps & Location
```
Expo Mapbox
- Dark theme matching cyber aesthetic
- Custom markers
- Venue clustering
- Location-based search
```

### Push Notifications
```
Expo Notifications
- iOS (APNs) and Android (FCM)
- Permission handling
- Notification channels (Android)
- Rich notifications
```

### Image Handling
```
Expo Image + Expo ImagePicker
- Optimized image loading
- Cache management
- Camera and gallery access
- Image compression
```

### Data Fetching
```
Fetch API (built-in) + Custom Hooks
- Shared with web application
- Error handling
- Request/response interceptors
- Caching strategy
```

### Testing
```
Jest (Unit Testing)
- Component testing
- Service testing
- Snapshot testing

Detox (E2E Testing - Optional)
- Gray box testing
- Real device testing
- Fast and reliable
```

### CI/CD
```
EAS Build (Expo Application Services)
- Automated builds
- iOS TestFlight
- Google Play Internal Testing
- Over-the-Air updates
```

### Development Tools
```
- Expo Dev Tools: Hot reload, debugging
- React DevTools: Component inspection
- Flipper: Advanced debugging (optional)
- TypeScript: Type safety
- ESLint + Prettier: Code quality
```

---

## Architecture Approach

### Monorepo Structure

```
drift/                                    # Root repository
├── shared/                                # SHARED CODE PACKAGE
│   ├── src/
│   │   ├── services/                      # API SERVICES (40% reuse)
│   │   │   ├── auth.ts                   # Auth logic (supabase auth)
│   │   │   ├── venues.ts                 # Venue CRUD
│   │   │   ├── events.ts                 # Event CRUD
│   │   │   ├── artists.ts                # Artist CRUD
│   │   │   ├── reviews.ts                # Review operations
│   │   │   ├── favorites.ts              # Favorites management
│   │   │   └── search.ts                 # Search functionality
│   │   ├── types/                        # TYPESCRIPT TYPES
│   │   │   ├── database.ts               # Database types (auto-generated)
│   │   │   ├── api.ts                    # API request/response types
│   │   │   └── models.ts                 # Business logic types
│   │   ├── constants/                    # CONFIGURATION
│   │   │   ├── endpoints.ts              # API endpoints
│   │   │   ├── roles.ts                  # User roles enum
│   │   │   └── config.ts                # App configuration
│   │   ├── utils/                        # UTILITIES
│   │   │   ├── validation.ts             # Zod schemas
│   │   │   ├── helpers.ts                # Helper functions
│   │   │   └── formatters.ts             # Data formatting
│   │   └── hooks/                        # SHARED HOOKS
│   │       ├── useAuth.ts                # Authentication hook
│   │       ├── useApi.ts                 # API wrapper hook
│   │       └── useFavorites.ts           # Favorites hook
│   └── package.json
├── web/                                   # NEXT.JS WEB APP (existing)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
└── mobile/                                # EXPO REACT NATIVE APP
    ├── app/                               # EXPO ROUTER (file-based)
    │   ├── _layout.tsx                    # Root navigation
    │   ├── index.tsx                       # Landing screen
    │   ├── auth/
    │   │   ├── _layout.tsx                # Auth stack (no header)
    │   │   ├── signin.tsx                 # Login screen
    │   │   ├── signup.tsx                 # Registration screen
    │   │   ├── callback.tsx               # OAuth callback
    │   │   └── reset-password.tsx        # Password reset
    │   ├── (tabs)/                        # TAB NAVIGATION
    │   │   ├── _layout.tsx                # Tab container
    │   │   ├── index.tsx                  # Explore/Home
    │   │   ├── venues.tsx                 # Venues
    │   │   ├── events.tsx                 # Events
    │   │   ├── artists.tsx                # Artists
    │   │   └── favorites.tsx              # Favorites
    │   ├── [id]/
    │   │   ├── venue.tsx                  # Venue detail
    │   │   ├── event.tsx                  # Event detail
    │   │   └── artist.tsx                 # Artist detail
    │   ├── search.tsx                     # Global search
    │   ├── settings/
    │   │   ├── _layout.tsx                # Settings stack
    │   │   ├── index.tsx                  # Settings menu
    │   │   ├── profile.tsx                # Profile settings
    │   │   └── notifications.tsx         # Notification settings
    │   └── notifications.tsx              # Notification center
    ├── components/                         # REACT NATIVE COMPONENTS
    │   ├── ui/                           # Base UI components
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Card.tsx
    │   │   ├── Avatar.tsx
    │   │   └── ...
    │   ├── layout/                       # Layout components
    │   │   ├── Header.tsx
    │   │   ├── BottomNavigation.tsx
    │   │   └── TabBar.tsx
    │   └── features/                      # Feature components
    │       ├── VenueCard.tsx
    │       ├── EventCard.tsx
    │       ├── ArtistCard.tsx
    │       ├── ReviewCard.tsx
    │       └── ...
    ├── screens/                            # SCREEN COMPONENTS
    │   ├── landing/                       # Landing screens
    │   ├── auth/                          # Auth screens
    │   ├── discovery/                     # Discovery screens
    │   ├── profile/                       # Profile screens
    │   └── settings/                      # Settings screens
    ├── hooks/                              # MOBILE-SPECIFIC HOOKS
    │   ├── useNotifications.ts            # Push notifications
    │   ├── useLocation.ts                 # GPS location
    │   ├── useCamera.ts                   # Camera access
    │   └── useBiometrics.ts               # Biometric auth
    ├── utils/                              # MOBILE UTILITIES
    │   ├── navigation.ts                  # Navigation helpers
    │   ├── storage.ts                     # Storage helpers
    │   └── permissions.ts                 # Permission handling
    ├── theme/                              # THEME & STYLING
    │   ├── colors.ts                      # Color palette (cyber theme)
    │   ├── typography.ts                  # Fonts and text styles
    │   ├── spacing.ts                     # Spacing scale
    │   └── theme.ts                       # Complete theme
    ├── assets/                             # ASSETS
    │   ├── images/                        # Images
    │   ├── icons/                         # Icons
    │   └── fonts/                         # Custom fonts
    ├── app.json                            # EXPO CONFIGURATION
    ├── package.json
    ├── eas.json                            # EAS BUILD CONFIG
    └── tsconfig.json
```

### Shared Code Strategy

#### What to Share (High Value)

**1. API Services (40% Code Reuse)**
```typescript
// shared/src/services/venues.ts
import { apiRequest } from '@/utils/helpers';
import type { Venue, CreateVenueInput, UpdateVenueInput } from '@/types/api';

export const venueService = {
  // Fetch all venues with filters
  async getVenues(filters?: VenueFilters): Promise<Venue[]> {
    return apiRequest<Venue[]>('/api/venues', { method: 'GET', params: filters });
  },

  // Fetch single venue
  async getVenueById(id: string): Promise<Venue> {
    return apiRequest<Venue>(`/api/venues/${id}`, { method: 'GET' });
  },

  // Create venue
  async createVenue(data: CreateVenueInput): Promise<Venue> {
    return apiRequest<Venue>('/api/venues', { method: 'POST', body: data });
  },

  // Update venue
  async updateVenue(id: string, data: UpdateVenueInput): Promise<Venue> {
    return apiRequest<Venue>(`/api/venues/${id}`, { method: 'PUT', body: data });
  },

  // Delete venue
  async deleteVenue(id: string): Promise<void> {
    return apiRequest<void>(`/api/venues/${id}`, { method: 'DELETE' });
  },
};
```

**2. TypeScript Types (100% Reuse)**
```typescript
// shared/src/types/database.ts (auto-generated from Supabase)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'fan' | 'artist' | 'promoter' | 'club_owner' | 'admin'
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: { ... }
        Update: { ... }
      }
      venues: { ... }
      events: { ... }
      artists: { ... }
      reviews: { ... }
      // ... other tables
    }
  }
}

// shared/src/types/api.ts
export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  capacity: number | null;
  website_url: string | null;
  phone: string | null;
  email: string | null;
  image_url: string | null;
  amenities: string[] | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CreateVenueInput {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  // ... other fields
}
```

**3. Validation Schemas (100% Reuse)**
```typescript
// shared/src/utils/validation.ts
import { z } from 'zod';

export const venueSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().default('Germany'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  capacity: z.number().positive().nullable().optional(),
  website_url: z.string().url().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  amenities: z.array(z.string()).nullable().optional(),
});

export const createVenueSchema = venueSchema.omit({ id: true });
export const updateVenueSchema = venueSchema.partial();
```

**4. Constants and Config (100% Reuse)**
```typescript
// shared/src/constants/endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  VENUES: {
    LIST: '/api/venues',
    DETAIL: (id: string) => `/api/venues/${id}`,
  },
  EVENTS: {
    LIST: '/api/events',
    DETAIL: (id: string) => `/api/events/${id}`,
    ARTISTS: (id: string) => `/api/events/${id}/artists`,
  },
  ARTISTS: {
    LIST: '/api/artists',
    DETAIL: (id: string) => `/api/artists/${id}`,
    EVENTS: (id: string) => `/api/artists/${id}/events`,
  },
  REVIEWS: {
    LIST: '/api/reviews',
    DETAIL: (id: string) => `/api/reviews/${id}`,
    FLAG: '/api/reviews/flag',
    STATS: '/api/reviews/stats',
  },
  SEARCH: '/api/search',
  FAVORITES: '/api/favorites',
} as const;

// shared/src/constants/roles.ts
export const USER_ROLES = {
  FAN: 'fan',
  ARTIST: 'artist',
  PROMOTER: 'promoter',
  CLUB_OWNER: 'club_owner',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
```

#### What's Platform-Specific

**Web-Specific (Not Shared)**
- Next.js Image component (different from React Native Image)
- Next.js routing (different from Expo Router)
- CSS/Tailwind styling (React Native uses StyleSheet)
- Server components (mobile is client-only)
- Next.js specific APIs (middleware, headers, cookies)

**Mobile-Specific (Not Shared)**
- Native navigation (stack, tabs, modals)
- Touch gestures (swipe, long press)
- Haptic feedback
- Camera access
- GPS location
- Push notifications
- Biometric authentication
- Device permissions
- Deep linking

### Code Sharing Implementation

#### Step 1: Setup Monorepo

```bash
# Install Turborepo (recommended for monorepo management)
npm install -g turbo
npm init turbo

# This creates:
# apps/ (web, mobile)
# packages/ (shared)
```

#### Step 2: Create Shared Package

```bash
mkdir packages/shared
cd packages/shared
npm init -y
```

```json
// packages/shared/package.json
{
  "name": "@drift/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

#### Step 3: Export from Shared Package

```typescript
// packages/shared/src/index.ts
export * from './services/auth';
export * from './services/venues';
export * from './services/events';
export * from './services/artists';
export * from './services/reviews';
export * from './services/favorites';
export * from './services/search';

export * from './types/database';
export * from './types/api';
export * from './types/models';

export * from './constants/endpoints';
export * from './constants/roles';
export * from './constants/config';

export * from './utils/validation';
export * from './utils/helpers';
export * from './utils/formatters';

export * from './hooks/useAuth';
export * from './hooks/useApi';
export * from './hooks/useFavorites';
```

#### Step 4: Import in Web App

```typescript
// web/app/api/venues/route.ts
import { venueService } from '@drift/shared';

export async function GET(request: Request) {
  const venues = await venueService.getVenues();
  return Response.json(venues);
}
```

#### Step 5: Import in Mobile App

```typescript
// mobile/app/venues.tsx
import { venueService } from '@drift/shared';
import { useEffect, useState } from 'react';
import type { Venue } from '@drift/shared';

export default function VenuesScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    async function loadVenues() {
      const data = await venueService.getVenues();
      setVenues(data);
    }
    loadVenues();
  }, []);

  // ... render venues
}
```

### API Request Pattern

```typescript
// shared/src/utils/helpers.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`;

  // Get auth token
  const token = await AsyncStorage.getItem('auth_token');

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...options, ...defaultOptions });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}
```

---

## Timeline & Milestones

### 16-Week Development Timeline

| Week | Focus | Deliverables | Effort |
|------|-------|--------------|--------|
| **1** | PWA Optimization | Installable PWA, offline support | Low (2-3 days) |
| **2** | Shared Code | Monorepo setup, code extraction | Medium (5 days) |
| **3** | React Native Setup | Expo init, navigation, design system | Medium (5 days) |
| **4-5** | Auth & Profiles | Login, signup, profile management | High (10 days) |
| **6-8** | Discovery | Venues, events, artists, maps | High (15 days) |
| **9-10** | Engagement | Reviews, favorites, search | Medium (10 days) |
| **11-12** | Advanced | Push notifications, optimization | Medium (10 days) |
| **13-14** | Polish | Testing, bug fixes, UX improvements | Medium (10 days) |
| **15-16** | Launch | App Store submission, beta testing | Medium (10 days) |

### Parallel Development Strategy

```
Weeks 1-16:
├── Mobile Development (60% focus)
│   └── New React Native features and screens
│
└── Web Development (40% focus)
    ├── Week 1-6: Email notifications
    ├── Week 7-10: Real-time chat
    ├── Week 11-14: Spotify integration
    └── Week 15-16: Bug fixes and optimization
```

### Critical Milestones

| Milestone | Week | Success Criteria |
|-----------|------|-----------------|
| **PWA Launch** | Week 1 | PWA installable on iOS & Android, offline support working |
| **Shared Code Foundation** | Week 2 | All services extracted, web app still works, types are consistent |
| **Mobile App Running** | Week 3 | Expo app launches, navigation works, design system in place |
| **Auth Complete** | Week 5 | Sign up, sign in, OAuth, profile editing all working |
| **Discovery MVP** | Week 8 | Can browse venues, events, artists with search and filters |
| **Review System** | Week 10 | Can submit and view reviews, favorites working |
| **Push Notifications** | Week 12 | Notifications working on iOS and Android |
| **Feature Complete** | Week 14 | All core features implemented, bugs fixed |
| **App Store Ready** | Week 16 | Apps submitted to App Store and Google Play |

### Buffer Time

Built-in 4-week buffer for:
- Unexpected issues (2 weeks)
- Testing and polish (1 week)
- App Store review delays (1 week)

---

## Phase-by-Phase Implementation

## Phase 1: PWA Optimization (Week 1)

**Goal**: Make existing web app installable and work offline

### Tasks

#### Day 1: PWA Manifest

**File**: `/web/public/manifest.json`
```json
{
  "name": "Drift - Electronic Music Discovery",
  "short_name": "Drift",
  "description": "Discover the best electronic music venues, events, and artists in Germany",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

**Generate Icons** (use PWA Asset Generator):
```bash
npx pwa-asset-generator public/icon.png public/icons
```

#### Day 2: Service Worker

**File**: `/web/public/sw.js`
```javascript
const CACHE_NAME = 'drift-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

**Register Service Worker**: `/web/app/layout.tsx`
```typescript
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### Day 3: Add to Home Screen Prompt

**File**: `/web/components/ui/InstallPWA.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInstall}
        className="bg-white text-black px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
      >
        Install App
      </button>
    </div>
  );
}
```

#### Day 4: Offline Fallback Pages

**File**: `/web/app/offline/page.tsx`
```typescript
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">You're Offline</h1>
        <p className="text-gray-400 mb-8">
          Check your internet connection to continue
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-white text-black px-6 py-3 rounded-lg font-bold"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
```

#### Day 5: Testing & Verification

**Testing Checklist**:
- [ ] PWA installs on iOS (Safari → Share → Add to Home Screen)
- [ ] PWA installs on Android (Chrome → Install)
- [ ] Service worker registered (Chrome DevTools → Application → Service Workers)
- [ ] Static assets cached (Chrome DevTools → Application → Cache Storage)
- [ ] Offline fallback page loads (disconnect internet, refresh)
- [ ] App launches in standalone mode (no browser UI)
- [ ] Manifest validates (https://manifest-validator.appspot.com/)

### Deliverables

✅ Installable PWA on iOS and Android
✅ Offline support for static assets
✅ Add to Home Screen prompt
✅ Service worker registered
✅ Icons generated (all sizes)

---

## Phase 2: Shared Code Foundation (Week 2)

**Goal**: Extract reusable code into shared package

### Tasks

#### Day 1: Monorepo Setup

**Initialize Turborepo**:
```bash
# From project root
npm install -g turbo
npm init turbo

# This creates:
# /apps (web, mobile)
# /packages (shared)
# /turbo.json
```

**File**: `/turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false
    }
  }
}
```

**Restructure Project**:
```bash
# Move existing web app
mkdir -p apps
mv web apps/web

# Create shared package
mkdir -p packages/shared
cd packages/shared
npm init -y
```

#### Day 2-3: Extract API Services

**Move Services**:
```bash
# From apps/web/lib/services to packages/shared/src/services
mv apps/web/lib/services/* packages/shared/src/services/
```

**Update Imports in Shared Package**:
```typescript
// packages/shared/src/services/venues.ts
import { apiRequest } from '../utils/helpers';
import type { Venue, CreateVenueInput, UpdateVenueInput } from '../types/api';

export const venueService = {
  async getVenues(filters?: any): Promise<Venue[]> {
    return apiRequest<Venue[]>('/api/venues', { method: 'GET', params: filters });
  },

  async getVenueById(id: string): Promise<Venue> {
    return apiRequest<Venue>(`/api/venues/${id}`, { method: 'GET' });
  },

  // ... other methods
};
```

**Export Index**:
```typescript
// packages/shared/src/index.ts
export * from './services/auth';
export * from './services/venues';
export * from './services/events';
export * from './services/artists';
export * from './services/reviews';
export * from './services/favorites';
export * from './services/search';
```

#### Day 4: Extract Types and Constants

**Move Types**:
```bash
# From apps/web/lib/types to packages/shared/src/types
mv apps/web/lib/types/* packages/shared/src/types/
```

**Extract Constants**:
```typescript
// packages/shared/src/constants/endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  VENUES: {
    LIST: '/api/venues',
    DETAIL: (id: string) => `/api/venues/${id}`,
  },
  // ... other endpoints
} as const;
```

**Move Validation**:
```bash
# From apps/web/lib/validations to packages/shared/src/utils
mv apps/web/lib/validations/* packages/shared/src/utils/
```

#### Day 5: Update Web App and Test

**Update Web App Imports**:
```typescript
// Before
import { venueService } from '@/lib/services/venues';

// After
import { venueService } from '@drift/shared';
```

**Install Shared Package**:
```bash
cd apps/web
npm install ../packages/shared
```

**Update package.json**:
```json
{
  "name": "@drift/web",
  "dependencies": {
    "@drift/shared": "*"
  }
}
```

**Test Web App**:
```bash
npm run dev
# Test that all pages still work
```

### Deliverables

✅ Monorepo structure in place
✅ All API services extracted to shared package
✅ Types, constants, and validation shared
✅ Web app imports from shared package
✅ Web app still fully functional

---

## Phase 3: React Native Setup (Week 3)

**Goal**: Initialize Expo project and set up foundation

### Tasks

#### Day 1: Initialize Expo Project

**Create Expo App**:
```bash
# From apps/
npx create-expo-app@latest mobile --template blank-typescript

# This creates:
# /apps/mobile
```

**Install Dependencies**:
```bash
cd apps/mobile

# Core dependencies
npm install @react-navigation/native react-native-screens react-native-safe-area-context

# Expo Router
npx expo install expo-router

# State management
npm install zustand

# Maps
npm install @maplibre/maplibre-react-native @expo/vector-icons

# Auth and storage
npm install @react-native-async-storage/async-storage
npm install expo-secure-store
npm install expo-auth-session expo-crypto

# Push notifications
npx expo install expo-notifications

# Image handling
npx expo install expo-image-picker expo-file-system

# Utils
npm install date-fns zod
```

**Install Shared Package**:
```bash
npm install ../packages/shared
```

#### Day 2: Configure Expo

**File**: `/apps/mobile/app.json`
```json
{
  "expo": {
    "name": "Drift",
    "slug": "drift",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.drift.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "package": "com.drift.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "scheme": "drift",
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

**File**: `/apps/mobile/eas.json`
```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### Day 3: Setup Expo Router

**File**: `/apps/mobile/app/_layout.tsx`
```typescript
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/signin" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="[id]/venue" options={{ title: 'Venue' }} />
        <Stack.Screen name="[id]/event" options={{ title: 'Event' }} />
        <Stack.Screen name="[id]/artist" options={{ title: 'Artist' }} />
      </Stack>
    </>
  );
}
```

**File**: `/apps/mobile/app/index.tsx`
```typescript
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>DRIFT</Text>
          <Text style={styles.subtitle}>
            Discover Electronic Music in Germany
          </Text>

          <View style={styles.buttons}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/signin')}
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#888888',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

#### Day 4: Create Theme and Design System

**File**: `/apps/mobile/theme/colors.ts`
```typescript
export const colors = {
  // Base
  black: '#000000',
  white: '#ffffff',
  transparent: 'transparent',

  // Grays
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#e5e5e5',
  gray300: '#d4d4d4',
  gray400: '#a3a3a3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',

  // Accents
  accent: '#00ff88', // Cyber green
  accentHover: '#00cc6a',
  secondary: '#ff00ff', // Cyber magenta

  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

export type Color = typeof colors[keyof typeof colors];
```

**File**: `/apps/mobile/theme/typography.ts`
```typescript
import { TextStyle } from 'react-native';

export const typography = {
  // Font families
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export type TypographyStyle = TextStyle;
```

**File**: `/apps/mobile/theme/spacing.ts`
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;
```

**File**: `/apps/mobile/theme/index.ts`
```typescript
import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
};

export const createStyles = <T extends StyleSheet.NamedStyles<T>>(
  styles: T
): T => styles;
```

#### Day 5: Create Base UI Components

**File**: `/apps/mobile/components/ui/Button.tsx`
```typescript
import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  PressableProps,
  ActivityIndicator,
} from 'react-native';
import { colors, typography } from '../../theme';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.black : colors.white} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  primary: {
    backgroundColor: colors.white,
  },
  secondary: {
    backgroundColor: colors.gray800,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.white,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.fontFamily.bold,
  },
  primaryText: {
    color: colors.black,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.white,
  },
  ghostText: {
    color: colors.white,
  },
  smallText: {
    fontSize: typography.fontSize.sm,
  },
  mediumText: {
    fontSize: typography.fontSize.base,
  },
  largeText: {
    fontSize: typography.fontSize.lg,
  },
});
```

**File**: `/apps/mobile/components/ui/Input.tsx`
```typescript
import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.gray500}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.gray400,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.gray900,
    color: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.gray800,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
```

### Deliverables

✅ Expo project initialized
✅ Expo Router navigation configured
✅ Theme and design system created
✅ Base UI components (Button, Input)
✅ Landing screen implemented

---

## Phase 4: Authentication & Profiles (Weeks 4-5)

**Goal**: Complete authentication flow and user profile management

### Tasks

#### Week 4: Authentication

**Day 1-2: Sign In Screen**

**File**: `/apps/mobile/app/auth/signin.tsx`
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@drift/shared';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { colors, spacing, typography } from '../../theme';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authService.signIn({ email, password });

      // Store auth token
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('user_id', response.user.id);

      Alert.alert('Success', 'Signed in successfully');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Implement Google OAuth with Expo Auth Session
    Alert.alert('Coming Soon', 'Google sign in will be available soon');
  };

  const handleForgotPassword = () => {
    router.push('/auth/reset-password');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <View style={styles.forgotPassword}>
              <Text
                style={styles.forgotPasswordText}
                onPress={handleForgotPassword}
              >
                Forgot password?
              </Text>
            </View>

            <Button
              variant="primary"
              size="large"
              loading={loading}
              onPress={handleSignIn}
              style={styles.signInButton}
            >
              Sign In
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              variant="outline"
              size="large"
              onPress={handleGoogleSignIn}
              style={styles.googleButton}
            >
              Sign in with Google
            </Button>

            <View style={styles.signUp}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <Text
                style={styles.signUpLink}
                onPress={() => router.push('/auth/signup')}
              >
                Sign up
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.fontFamily.bold,
    fontSize: typography.fontSize['4xl'],
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.fontFamily.regular,
    fontSize: typography.fontSize.lg,
    color: colors.gray400,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.accent,
  },
  signInButton: {
    marginTop: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray800,
  },
  dividerText: {
    ...typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    marginHorizontal: spacing.md,
  },
  googleButton: {},
  signUp: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signUpText: {
    ...typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.gray400,
  },
  signUpLink: {
    ...typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: colors.accent,
  },
});
```

**Day 3-4: Sign Up Screen**

**File**: `/apps/mobile/app/auth/signup.tsx`
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@drift/shared';
import { USER_ROLES } from '@drift/shared';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { colors, spacing, typography } from '../../theme';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<keyof typeof USER_ROLES>('FAN');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};

    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authService.signUp({
        email,
        password,
        full_name: fullName,
        role: USER_ROLES[role],
      });

      // Store auth token
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('user_id', response.user.id);

      Alert.alert('Success', 'Account created successfully');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { key: 'FAN', label: 'Fan', description: 'Discover music, leave reviews' },
    { key: 'ARTIST', label: 'Artist', description: 'Showcase your work' },
    { key: 'PROMOTER', label: 'Promoter', description: 'Organize events' },
    { key: 'CLUB_OWNER', label: 'Club Owner', description: 'Manage your venue' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Drift community</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
            />

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roles}>
              {roleOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.roleCard,
                    role === option.key && styles.roleCardActive,
                  ]}
                  onPress={() => setRole(option.key as any)}
                >
                  <Text style={[
                    styles.roleTitle,
                    role === option.key && styles.roleTitleActive,
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.roleDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              variant="primary"
              size="large"
              loading={loading}
              onPress={handleSignUp}
              style={styles.signUpButton}
            >
              Create Account
            </Button>

            <View style={styles.signIn}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <Text
                style={styles.signInLink}
                onPress={() => router.push('/auth/signin')}
              >
                Sign in
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.fontFamily.bold,
    fontSize: typography.fontSize['4xl'],
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.fontFamily.regular,
    fontSize: typography.fontSize.lg,
    color: colors.gray400,
  },
  form: {
    width: '100%',
  },
  roleLabel: {
    ...typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.gray400,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  roles: {
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  roleCard: {
    backgroundColor: colors.gray900,
    borderWidth: 2,
    borderColor: colors.gray800,
    borderRadius: 12,
    padding: spacing.lg,
  },
  roleCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.gray800,
  },
  roleTitle: {
    ...typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  roleTitleActive: {
    color: colors.accent,
  },
  roleDescription: {
    ...typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.gray400,
  },
  signUpButton: {
    marginTop: spacing.md,
  },
  signIn: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signInText: {
    ...typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.gray400,
  },
  signInLink: {
    ...typography.fontFamily.bold,
    fontSize: typography.fontSize.base,
    color: colors.accent,
  },
});
```

**Day 5: Auth Context and Session Management**

**File**: `/apps/mobile/context/AuthContext.tsx`
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@drift/shared';
import type { User } from '@drift/shared';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUserId = await AsyncStorage.getItem('user_id');

      if (storedToken && storedUserId) {
        setToken(storedToken);
        // Fetch user profile
        // const userProfile = await authService.getProfile(storedUserId);
        // setUser(userProfile);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await authService.signIn({ email, password });
    setToken(response.token);
    setUser(response.user);

    await AsyncStorage.setItem('auth_token', response.token);
    await AsyncStorage.setItem('user_id', response.user.id);
  };

  const signUp = async (data: any) => {
    const response = await authService.signUp(data);
    setToken(response.token);
    setUser(response.user);

    await AsyncStorage.setItem('auth_token', response.token);
    await AsyncStorage.setItem('user_id', response.user.id);
  };

  const signOut = async () => {
    await authService.signOut();
    setToken(null);
    setUser(null);

    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_id');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### Week 5: Profile Management

**Day 1-2: Profile View Screen**

**File**: `/apps/mobile/app/settings/profile.tsx`
```typescript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { colors, spacing, typography } from '../../theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatarUrl(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update profile via API
      // await profileService.updateProfile({ full_name: fullName, bio, avatar_url: avatarUrl });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => router.replace('/auth/signin'),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleImageUpload}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {fullName?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditIcon}>📷</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.name}>{fullName || 'Your Name'}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />

            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              placeholder="Tell us about yourself..."
            />

            <Button
              variant="primary"
              size="large"
              loading={loading}
              onPress={handleSave}
              style={styles.saveButton}
            >
              Save Changes
            </Button>

            <Button
              variant="outline"
              size="large"
              onPress={handleSignOut}
              style={styles.signOutButton}
            >
              Sign Out
            </Button>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    minHeight: '100%',
  },
  content: {
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    ...typography.fontFamily.bold,
    fontSize: typography.fontSize['3xl'],
    color: colors.white,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.black,
  },
  avatarEditIcon: {
    fontSize: 20,
  },
  name: {
    ...typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.gray400,
  },
  form: {
    width: '100%',
  },
  saveButton: {
    marginBottom: spacing.md,
  },
  signOutButton: {},
});
```

**Day 3-5: Settings and Preferences**

Create settings screen with notification preferences, privacy settings, etc.

### Deliverables

✅ Sign-in screen with email/password and Google OAuth
✅ Sign-up screen with role selection
✅ Auth context and session management
✅ Profile view and edit screens
✅ Avatar upload functionality
✅ Settings and preferences screen

---

## Phase 5: Discovery Features (Weeks 6-8)

**Goal**: Venues, events, and artists discovery with maps

### Tasks

#### Week 6: Venues

**Day 1-2: Venues List Screen**

**File**: `/apps/mobile/app/(tabs)/venues.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { venueService } from '@drift/shared';
import type { Venue } from '@drift/shared';
import Input from '../../components/ui/Input';
import VenueCard from '../../components/features/VenueCard';
import { colors, spacing, typography } from '../../theme';

export default function VenuesScreen() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    const filtered = venues.filter(venue =>
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVenues(filtered);
  }, [searchQuery, venues]);

  const loadVenues = async () => {
    try {
      const data = await venueService.getVenues();
      setVenues(data);
    } catch (error) {
      console.error('Failed to load venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVenues();
    setRefreshing(false);
  };

  const handleVenuePress = (venue: Venue) => {
    router.push(`/venue?id=${venue.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Venues</Text>
        <Text style={styles.subtitle}>Discover electronic music clubs</Text>
      </View>

      <Input
        placeholder="Search venues or cities..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      <FlatList
        data={filteredVenues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleVenuePress(item)}>
            <VenueCard venue={item} />
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.fontFamily.bold,
    fontSize: typography.fontSize['3xl'],
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.gray400,
  },
  searchInput: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
});
```

**Day 3-5: Venue Detail and Map**

Create venue detail screen with:
- Image gallery
- Venue information
- Upcoming events
- Reviews
- Map integration (Expo Mapbox)

#### Week 7: Events

Similar implementation for events:
- Events list with filters (date, genre, city)
- Event detail with flyer and lineup
- Ticket integration

#### Week 8: Artists

Similar implementation for artists:
- Artists discovery (trending, newcomers)
- Artist profile with genre tags
- Performance history

### Deliverables

✅ Venues list with search
✅ Venue detail with map
✅ Events list with filters
✅ Event detail with lineup
✅ Artists discovery
✅ Artist profile

---

## Phase 6: Engagement Features (Weeks 9-10)

**Goal**: Reviews, favorites, and advanced search

### Tasks

#### Week 9: Reviews and Favorites

- Review submission screen with multi-facet ratings
- Review display on venues and events
- Voting and flagging system
- Favorites list screen
- "Been Here" functionality

#### Week 10: Advanced Search

- Global search across venues, events, artists
- Advanced filters (location, genre, date, rating)
- Search suggestions and autocomplete
- Saved searches

### Deliverables

✅ Complete review system
✅ Favorites management
✅ Advanced search functionality

---

## Phase 7: Advanced Features (Weeks 11-12)

**Goal**: Push notifications and performance optimization

### Tasks

#### Week 11: Push Notifications

**Setup Push Notifications**:
```typescript
// apps/mobile/hooks/useNotifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    setExpoPushToken(token);

    // Send token to backend
    // await apiRequest('/api/user/push-token', {
    //   method: 'POST',
    //   body: { token },
    // });
  };

  return { expoPushToken };
}
```

#### Week 12: Performance Optimization

- Image optimization (Expo Image)
- Lazy loading
- Code splitting
- Loading skeletons
- Pull-to-refresh

### Deliverables

✅ Push notifications working
✅ Notification center screen
✅ Performance optimizations
✅ Bundle size optimized

---

## Phase 8: Polish & Testing (Weeks 13-14)

**Goal**: Production-ready app

### Tasks

#### Week 13: Testing and Bug Fixes

**Testing Checklist**:
- [ ] All screens render correctly on different screen sizes
- [ ] Touch interactions work smoothly
- [ ] Offline scenarios handled gracefully
- [ ] Error states display properly
- [ ] Loading states shown everywhere
- [ ] Navigation flows work end-to-end
- [ ] Deep links work correctly

#### Week 14: UX Polish

- Smooth transitions and animations
- Haptic feedback
- Empty states
- Error messages
- Onboarding flow for new users
- Accessibility improvements

### Deliverables

✅ All critical bugs fixed
✅ UI polished and consistent
✅ Accessibility improvements
✅ Onboarding complete

---

## Phase 9: App Store Submission (Weeks 15-16)

**Goal**: Submit to App Store and Google Play

### Tasks

#### Week 15: Testing and Preparation

**Beta Testing**:
- TestFlight (iOS)
- Google Play Internal Testing (Android)
- Beta testing with friends
- Collect feedback
- Fix reported bugs

**App Store Assets**:
- Screenshots (all device sizes)
- App icons
- Promo video (optional)
- App descriptions
- Keywords and metadata

#### Week 16: Submission

**iOS App Store**:
```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --path ./build/path/to/app.ipa
```

**Google Play Store**:
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android --path ./build/path/to/app.apk
```

### Deliverables

✅ Apps submitted to App Store and Google Play
✅ Beta testing complete
✅ All feedback addressed

---

## Testing & Quality Assurance

### Testing Strategy

#### Unit Testing (Jest)
```bash
npm install --save-dev jest @testing-library/react-native
```

Test business logic, services, and utilities.

#### Component Testing
Test UI components in isolation.

#### End-to-End Testing (Detox - Optional)
```bash
npm install --save-dev detox detox-cli
```

Test critical user flows:
- Sign up
- Sign in
- Browse venues
- View venue detail
- Submit review
- Add to favorites

### Device Testing Checklist

**iOS**:
- [ ] iPhone 8 (minimum supported)
- [ ] iPhone 13 (standard)
- [ ] iPhone 14 Pro (latest)
- [ ] iPad (various sizes)

**Android**:
- [ ] Android 7.0 (minimum supported)
- [ ] Android 10 (common)
- [ ] Android 13 (latest)
- [ ] Various screen sizes and densities

### Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| App Launch Time | <3 seconds | Expo DevTools |
| Screen Load Time | <1 second | Performance monitor |
| Bundle Size | <50MB (total) | `npx expo export` |
| Memory Usage | <100MB | Memory profiler |
| FPS | 60fps | Performance monitor |

---

## App Store Submission

### iOS App Store

**Requirements**:
- Apple Developer Account ($99/year)
- TestFlight beta testing
- App Review Guidelines compliance
- Privacy policy URL
- App Store Connect screenshots (6.7" display)

**Submission Process**:
1. Create app in App Store Connect
2. Upload build via EAS
3. Add screenshots and metadata
4. Submit for review
5. Wait for approval (1-7 days)

### Google Play Store

**Requirements**:
- Google Play Developer Account ($25 one-time)
- Internal testing with testers
- Play Store policies compliance
- Privacy policy URL
- Screenshots (phone, 7" tablet, 10" tablet)

**Submission Process**:
1. Create app in Google Play Console
2. Upload build via EAS
3. Add screenshots and metadata
4. Submit for review
4. Wait for approval (1-3 days)

### Required Screenshots

**iOS**:
- 6.7" display (iPhone 14 Pro Max): 1290 x 2796
- 6.5" display (iPhone 14 Pro): 1284 x 2778
- 5.5" display (iPhone 8 Plus): 1242 x 2208

**Android**:
- Phone: 1080 x 1920
- 7" tablet: 1200 x 1920
- 10" tablet: 1800 x 2700

### App Store Optimization (ASO)

**Keywords** (iOS):
- Electronic music
- DJ
- Club
- Venue
- Event
- Germany
- Berlin
- Music discovery
- Nightlife
- Techno

**Keywords** (Android):
- Electronic music venues
- DJ events
- Club finder
- Berlin nightlife
- Techno clubs
- Music discovery app

---

## Maintenance & Future Roadmap

### Over-the-Air Updates

Use EAS Updates for instant updates without App Store review:

```bash
# Publish update
eas update --branch production --message "Bug fixes"
```

### Bug Fixing Process

1. Identify bug in production
2. Fix in development
3. Test thoroughly
4. Use EAS Update for non-breaking changes
5. Submit new build for breaking changes

### Feature Additions

1. Create feature branch
2. Implement feature
3. Test on all platforms
4. Submit PR
5. Merge and deploy

### Analytics

**Track**:
- Daily active users (DAU)
- Monthly active users (MAU)
- Session duration
- Screen views
- Feature usage
- Crash reports

**Tools**:
- Expo Analytics
- Sentry (error tracking)
- Firebase Analytics

### Future Roadmap

**Phase 1 (Post-Launch)**:
- Real-time chat
- Spotify integration
- Advanced notifications

**Phase 2 (6 months)**:
- Social features (friends, following)
- Groups and communities
- AI recommendations

**Phase 3 (1 year)**:
- Ticket sales integration
- Marketplace features
- Global expansion

---

## Summary

This comprehensive mobile development strategy provides a clear path to delivering production-ready iOS and Android applications for the Drift platform within a 4-month timeline.

### Key Takeaways

1. **Expo React Native** is optimal for solo development with fast iteration
2. **Monorepo with shared code** maximizes code reuse and reduces maintenance
3. **PWA foundation** provides quick wins while mobile is built
4. **16-week timeline** with built-in buffer for unexpected issues
5. **Parallel development** allows web and mobile to launch together

### Success Factors

- Stick to the timeline and scope
- Use shared code to reduce duplication
- Test early and often
- Focus on core features first
- Launch with MVP, iterate based on feedback

### Next Steps

1. **Week 1**: Implement PWA optimizations
2. **Week 2**: Set up monorepo and extract shared code
3. **Week 3**: Initialize Expo project
4. **Week 4-16**: Follow phase-by-phase implementation plan

---

**Ready to start building!** Begin with Phase 1 (Week 1) PWA Optimization, then proceed through each phase systematically. Good luck with the Drift mobile app development! 🚀
