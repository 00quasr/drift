# Drift

A platform for electronic music enthusiasts, artists, promoters, and venue owners to discover, rate, and manage venues, events, and artist profiles.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

https://github.com/user-attachments/assets/e02c2b94-c1e2-41dd-89f4-699c446ef7cf

## Status

**Development Phase**: Active development with core features implemented.

### Implemented

- User authentication (Google OAuth, email/password)
- Venue discovery and management
- Event creation and management with archive/republish workflows
- Artist profiles with publish/draft states
- Multi-faceted review system (sound, vibe, crowd ratings)
- Real-time search across venues, events, and artists
- Role-based access control (Fan, Artist, Promoter, Venue Owner, Admin)
- AI content moderation for images and text (OpenAI)
- Profile management with avatar uploads
- Mapbox integration for venue maps
- Mobile-responsive design

### In Progress

- Social features (following system)
- Direct messaging
- Language switching (German/English)
- Typography standardization
- User profile page redesign

### Not Yet Implemented

- Stripe payment integration
- Email notifications (Resend)
- Notifications system
- Festival support
- Test infrastructure

### Known Issues

- Auth callback can get stuck after OAuth login (requires page refresh)
- Settings preferences don't persist (loadUserSettings not implemented)
- Account deletion blocked (GDPR compliance issue)
- Reviews auto-approved without AI moderation
- Debug info exposed in some API error responses

See [Linear](https://linear.app/drift-yourself) for full issue tracking.

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

**Backend**
- Supabase (PostgreSQL, Auth, Storage)
- Next.js API Routes
- OpenAI API

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- Supabase account

### Installation

```bash
git clone https://github.com/00quasr/drift.git
cd drift
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup

```bash
npm install -g supabase
supabase db push
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
drift/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── explore/           # Discovery pages
│   ├── events/            # Event pages
│   ├── venue/             # Venue pages
│   └── artist/            # Artist pages
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities
│   ├── services/         # Business logic
│   ├── supabase/         # Database clients
│   └── types/            # TypeScript definitions
├── supabase/             # Database migrations
└── public/               # Static assets
```

## User Roles

| Role | Access |
|------|--------|
| Fan | Browse, review, manage personal profile |
| Artist | Single profile management at `/artist-profile` |
| Promoter | Event management at `/events/manage` |
| Venue Owner | Single venue management at `/my-venue` |
| Admin | Full dashboard and moderation tools |

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/auth/*` | Authentication |
| `/api/user/profile` | Profile management |
| `/api/venues/*` | Venue CRUD |
| `/api/events/*` | Event CRUD |
| `/api/artists/*` | Artist CRUD |
| `/api/reviews/*` | Reviews and ratings |
| `/api/search` | Real-time search |
| `/api/moderate/*` | Content moderation |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run type-check   # TypeScript checks
```

## Database

The project uses Supabase with the following main tables:

- `profiles` - User profiles
- `venues` - Venue listings
- `events` - Event listings
- `artists` - Artist profiles
- `reviews` - User reviews
- `labels` - Record labels (schema exists, API pending)
- `collectives` - Artist collectives (schema exists, API pending)
- `notifications` - User notifications (schema exists, API pending)

## Contributing

1. Create a feature branch: `feature/DRI-XXX-description`
2. Make changes and test locally
3. Run `npm run lint` and `npm run type-check`
4. Submit pull request

## License

MIT License

---

Built for the electronic music community.
