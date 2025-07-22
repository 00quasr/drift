# Drift

> A comprehensive platform for electronic music enthusiasts, artists, promoters, and venue owners to discover, rate, and manage venues, events, and artist profiles.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

## Overview

Drift solves the fragmented nature of underground electronic music scenes by providing a centralized platform where fans can discover venues and events, artists can showcase their work, and promoters can connect with their audience. The platform features a comprehensive review system, real-time search, role-based access control, and AI-powered content moderation.

### Key Features

https://github.com/user-attachments/assets/3a99f07d-f601-41c1-8a00-5ff72eb54857

- **Role-Specific UX Design** - Tailored interfaces for each user type instead of complex CMS dashboards
- **Simplified Content Management** - Artists create one profile, club owners manage one venue, promoters focus on events
- **Venue Discovery** - Find and explore electronic music venues with detailed ratings
- **Event Management** - Discover upcoming events and manage event listings with archive/republish workflows
- **Artist Profiles** - Comprehensive artist pages with gig history and reviews
- **User Profiles** - Complete profile management with avatar uploads and social links
- **Multi-facet Reviews** - Rate venues and events on sound, vibe, and crowd
- **Real-time Search** - Live search across venues, events, and artists with instant results
- **Smart Navigation** - Role-based header dropdown menus with contextual options
- **AI Content Moderation** - OpenAI-powered content filtering for images and text
- **Secure File Upload** - Profile image uploads with content validation and storage
- **Mobile-first Design** - Responsive design optimized for all devices

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/drift.git
   cd drift
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Update `.env.local` with your credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # OpenAI Configuration (for content moderation)
   OPENAI_API_KEY=your_openai_api_key
   
   # Optional: Mapbox (for venue maps)
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   
   # Site Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Install Supabase CLI if you haven't already
   npm install -g supabase

   # Run migrations
   supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Architecture

### Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- Radix UI (Accessibility)
- Framer Motion (Animations)

**Backend**
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Next.js API Routes
- TypeScript
- OpenAI API (Content Moderation)

**Development & Tools**
- ESLint & Prettier
- Husky (Git Hooks)
- Claude Code (AI Development Assistant)

### Project Structure
```
drift/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (pages)/           # Page components
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── services/         # Business logic
│   ├── types/           # TypeScript definitions
│   └── utils.ts         # Helper functions
├── docs/                  # Documentation
│   ├── api/              # API documentation
│   ├── architecture/     # Architecture docs
│   ├── development/      # Development guides
│   └── deployment/       # Deployment guides
├── supabase/             # Database migrations
└── public/               # Static assets
```

## 🎯 User Roles & Interfaces

### Fan
- Browse venues, events, and artists
- Leave reviews and ratings
- Create and customize user profile with avatar upload
- Personalized search and discovery
- **Interface**: Standard browsing with universal settings page

### Artist (Simplified UX)
- **Single Artist Profile Management** - Create and edit one comprehensive profile
- **Direct Public Profile Access** - View how profile appears to fans
- **Status Control** - Publish, archive, or republish profile with one click
- **Performance History** - Track gig history and upcoming shows
- **Interface**: `/artist-profile` - No complex dashboard needed

### Promoter (Event-Focused)
- **Event Creation & Management** - Streamlined tools for multiple events
- **Archive/Republish Events** - Simple lifecycle management
- **Event Statistics** - Track published, draft, and upcoming events
- **Event Discovery** - Link events to venues and artists
- **Interface**: `/events/manage` + `/events/create` - Lightweight event tools

### Club Owner (Venue-Focused)
- **Single Venue Management** - One comprehensive venue profile
- **Technical Specifications** - Sound system and capacity details
- **Booking Information** - Contact details for artists and promoters
- **Status Management** - Draft, publish, or take down venue
- **Interface**: `/my-venue` - Single-page venue management

### Admin (Full Platform Access)
- **Complete CMS Dashboard** - Access to all content management features
- **User Management** - Verification and role management
- **Content Moderation** - Review flagged content and user reports
- **Platform Analytics** - Comprehensive insights across all entities
- **Interface**: Full dashboard with advanced features

## 📱 Core Features

### Venue Management
- Detailed venue profiles with photos and information
- Location mapping with Mapbox integration
- Capacity, contact info, and social links
- Upcoming and past events listing

### Event Discovery
- Comprehensive event listings with dates and lineups
- Advanced filtering by date, location, genre, and rating
- Ticket integration with external platforms
- Artist lineup management

### Artist Profiles
- Professional artist pages with biographies
- Performance history and upcoming shows
- Genre categorization and social media links
- Photo galleries and press kit support

### Review System
- Multi-faceted ratings (Sound, Vibe, Crowd)
- Detailed written reviews with moderation
- Review flagging and admin oversight
- Average rating calculations and statistics

### Search & Discovery
- Real-time search across venues, events, and artists
- Live search suggestions with categorized results
- Advanced filtering and sorting options
- Trending and recommended content
- Location-based discovery

### User Profile Management
- Complete profile editing with real-time validation
- Secure avatar upload with AI content moderation
- Social media links and genre preferences
- Privacy controls and account settings
- Activity feed and user statistics

### Content Moderation System
- OpenAI-powered image content analysis
- Automated text moderation for inappropriate content
- Real-time content validation during uploads
- Admin oversight and manual review capabilities
- Community reporting and flagging system

## 🔐 Security & Privacy

- JWT-based authentication with Supabase Auth
- Role-based access control (RBAC)
- Row-level security policies
- Input validation and sanitization
- Content moderation with AI assistance
- GDPR compliance ready

## 🚀 API Reference

The platform provides a comprehensive RESTful API. See [API Documentation](docs/api/API_DOCUMENTATION.md) for detailed endpoint information.

### Quick API Overview

- **Authentication**: `/api/auth/*` - User registration, login, password reset
- **User Profiles**: `/api/user/profile` - Profile management and updates
- **Venues**: `/api/venues/*` - Venue CRUD operations
- **Events**: `/api/events/*` - Event management
- **Artists**: `/api/artists/*` - Artist profile management
- **Reviews**: `/api/reviews/*` - Review and rating system
- **Search**: `/api/search` - Real-time search functionality
- **Content Moderation**: `/api/moderate/*` - AI-powered content validation
- **Admin**: `/api/admin/*` - Administrative functions

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # Run TypeScript checks

# Database
npm run db:generate  # Generate database types
npm run db:push     # Push schema changes
npm run db:reset    # Reset database
```

### Development Workflow

1. Create feature branch from `main`
2. Make changes and test locally
3. Run linting and type checks
4. Submit pull request
5. Code review and merge

### Contributing

Please read our [Contributing Guidelines](docs/development/CONTRIBUTING.md) for details on our code of conduct and development process.

## 📋 Roadmap

### Phase 1 (Completed ✅)
- ✅ User authentication and profile management
- ✅ Real-time search integration across all content
- ✅ Complete profile editing with avatar uploads
- ✅ AI-powered content moderation system
- ✅ Venue, event, and artist management
- ✅ Review and rating system
- ✅ Secure file upload and storage
- ✅ Admin moderation tools
- ✅ **Role-Specific UX Redesign** - Simplified interfaces for non-admin users
- ✅ **Smart Navigation** - Role-based header dropdown menus
- ✅ **Content Lifecycle Management** - Publish/Archive/Republish workflows

### Phase 2 (Planned)
- 🔄 Advanced AI recommendations
- 🔄 Real-time notifications
- 🔄 Mobile app development
- 🔄 Social features and following
- 🔄 Advanced analytics dashboard

### Phase 3 (Future)
- 📋 Direct ticket sales integration
- 📋 Artist press kit hosting
- 📋 Event livestreaming
- 📋 Marketplace features
- 📋 API for third-party integrations

## 🤝 Community

- [GitHub Issues](https://github.com/your-username/drift/issues) - Bug reports and feature requests
- [Discussions](https://github.com/your-username/drift/discussions) - Community discussions
- [Discord](#) - Real-time community chat (coming soon)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for deployment platform
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Claude Code](https://claude.ai/code) for AI-assisted development

---

**Built with ❤️ for the electronic music community**

For detailed setup instructions, see [Deployment Guide](docs/deployment/SETUP.md)

For development guidelines, see [Development Docs](docs/development/)

For architecture details, see [Architecture Docs](docs/architecture/)
