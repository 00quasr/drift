# Drift - Project Status

**Last Updated**: January 2026

A platform for electronic music enthusiasts, artists, promoters, and venue owners to discover, rate, and manage venues, events, and artist profiles.

---

## Current Status

**Development Phase**: Active development with core features implemented.

---

## Implemented Features

### Authentication & Users
- User authentication (Google OAuth, email/password)
- Role-based access control (Fan, Artist, Promoter, Venue Owner, Admin)
- Profile management with avatar uploads
- JWT-based session management

### Content Management
- Venue discovery and management
- Event creation and management with archive/republish workflows
- Artist profiles with publish/draft states
- Real-time search across venues, events, and artists

### Reviews & Ratings
- Multi-faceted review system (sound, vibe, crowd ratings)
- Review submission and display
- Rating aggregation

### Integrations
- AI content moderation for images and text (OpenAI)
- Mapbox integration for venue maps
- Mobile-responsive design

---

## In Progress

- Social features (following system)
- Direct messaging
- Language switching (German/English)
- User profile page redesign

---

## Not Yet Implemented

- Stripe payment integration
- Email notifications (Resend)
- Notifications system
- Festival support
- Test infrastructure
- GDPR-compliant account deletion

---

## Known Issues

These issues are tracked in [Linear](https://linear.app/drift-yourself):

| Issue | Description | Status |
|-------|-------------|--------|
| DRI-47/DRI-41 | Auth callback can get stuck after OAuth login (requires page refresh) | Open |
| DRI-31 | Settings preferences don't persist (loadUserSettings not implemented) | Open |
| DRI-29 | Account deletion blocked (GDPR compliance issue) | Open |
| DRI-17 | Reviews auto-approved without AI moderation | Open |
| DRI-22 | Debug info exposed in some API error responses | Open |
| DRI-50 | Localhost fallback URLs in codebase | Open |
| DRI-51 | Labels page uses mock data despite DB schema existing | Open |

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Geist Sans typography

### Backend
- Supabase (PostgreSQL, Auth, Storage)
- Next.js API Routes
- OpenAI API (content moderation)

### Infrastructure
- Vercel (deployment)
- Supabase (database, auth, storage)

---

## Database Schema

Core tables:
- `profiles` - User profiles with role system
- `venues` - Venue listings with location data
- `events` - Event listings with lineup
- `artists` - Artist profiles
- `reviews` - User reviews with multi-dimensional ratings
- `labels` - Record labels (schema exists, API pending)
- `collectives` - Artist collectives (schema exists, API pending)
- `notifications` - User notifications (schema exists, API pending)

---

## API Endpoints

| Category | Endpoints | Status |
|----------|-----------|--------|
| Authentication | `/api/auth/*` | Complete |
| User Profile | `/api/user/profile` | Complete |
| Venues | `/api/venues/*` | Complete |
| Events | `/api/events/*` | Complete |
| Artists | `/api/artists/*` | Complete |
| Reviews | `/api/reviews/*` | Complete |
| Search | `/api/search` | Complete |
| Moderation | `/api/moderate/*` | Complete |

---

## Project Links

- **Repository**: [GitHub](https://github.com/00quasr/drift)
- **Issue Tracking**: [Linear](https://linear.app/drift-yourself)
- **Documentation**: See `/docs` folder

---

## Contributing

1. Create a feature branch: `feature/DRI-XXX-description`
2. Make changes and test locally
3. Run `npm run lint` and `npm run type-check`
4. Submit pull request

See [CONTRIBUTING.md](../06-development/development/CONTRIBUTING.md) for detailed guidelines.
