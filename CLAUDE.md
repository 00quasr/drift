# Claude Code Development Notes

This document outlines the development process and key implementation details for the Drift project, developed with assistance from Claude Code.

## 🛠️ Development Environment

### Required Tools & Versions
- **Node.js**: 20.x or higher
- **npm**: 9.x or higher
- **Supabase CLI**: Latest version
- **Claude Code**: AI development assistant

### Environment Variables
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

### MCP Servers (Model Context Protocol)
Claude Code uses MCP servers to enhance development capabilities. The following servers are configured for this project:

- **Supabase MCP**: Database operations, migrations, SQL queries, RLS policies, and type generation
  - Use for all database-related tasks
  - Manages schema changes and table operations
  - Generates TypeScript types automatically

- **Playwright MCP**: Browser automation and testing
  - Use for automated UI testing
  - Take screenshots for visual validation
  - Test user flows and interactions
  - Validate responsive behavior across breakpoints

- **shadcn MCP**: UI component integration
  - Use for adding pre-built UI components
  - Search and install shadcn/ui components
  - Ensures consistent design system usage
  - Access to component examples and documentation

- **Linear MCP**: Project management and issue tracking
  - Use for creating and managing tickets
  - Track bugs, features, and tasks
  - Integrate development workflow with project management
  - Access issue status and project information

## 🏗️ Architecture Decisions

### Frontend Framework
- **Next.js 14** with App Router for modern React development
- **TypeScript** for type safety across the entire codebase
- **Tailwind CSS** with **shadcn/ui** components for consistent design
- **Framer Motion** for smooth animations and transitions

### Backend Infrastructure
- **Supabase** as the primary backend service (PostgreSQL, Auth, Storage, Realtime)
- **Next.js API Routes** for server-side logic and data processing
- **OpenAI API** integration for AI-powered content moderation

### Database Design
- **Row Level Security (RLS)** policies for secure data access
- **User roles** system (Fan, Artist, Promoter, Venue Owner, Admin)
- **Multi-dimensional rating** system for venues and events
- **Content moderation** tables for flagged content management

## 🎨 Design Principles & Frontend Standards

### Core Design Philosophy
We aim for **minimalistic, calm, and clean interfaces**. Every design decision should prioritize clarity and simplicity over decoration.

#### Visual Design Principles
- **Few colors.** Prefer a very limited color palette:
  - Neutral base (white / off-white / dark)
  - One primary accent color
  - Optional muted secondary for states
- **Minimalism over decoration.** Every visual element must earn its place.
- **Form over function (visually).**
  - If something looks cluttered or heavy, it is wrong.
  - Functional density must not compromise visual clarity.
- **Clean, boring, professional.** No flashy gradients, excessive shadows, or visual noise.
- **Whitespace is intentional.** Spacing is a feature, not wasted space.
- **Consistency beats creativity.** Reuse patterns relentlessly.

#### Practical Rules
**Avoid:**
- Rainbow color schemes
- Unnecessary icons
- Excessive borders, outlines, dividers
- "UI tricks" that don't improve clarity

**Prefer:**
- Typography hierarchy over boxes
- Alignment over decoration
- Spacing over separators

**If in doubt: remove, then reassess.**

#### Validation Guidelines
- Screenshots are mandatory for UI work.
- If a screen feels "busy," simplify until it feels calm.
- If two elements compete for attention, one must go.

### Frontend Standards (TypeScript + shadcn/ui)

#### UI Library
- Prefer **shadcn/ui** for primitives.
- Follow Radix UI patterns.
- Avoid one-off styling when a reusable component exists.

#### TypeScript Standards
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` types unless absolutely necessary
- Use proper type inference from Supabase database types

#### Component Development Requirements

Before declaring any UI work complete, you must:

1. **Take screenshots:**
   - Before changes (baseline)
   - After each meaningful change
   - Before declaring done

2. **Validate:**
   - Spacing & alignment
   - Typography consistency
   - Color restraint
   - Responsiveness (≥2 breakpoints)
   - Empty/loading/error states
   - Basic accessibility (labels, focus)

#### Development Loop

1. Implement smallest change
2. Screenshot
3. Simplify visually
4. Repeat

Prefer automated screenshots (Playwright) where feasible.

## 🔧 Key Implementation Details

### Real-time Search System
- **Location**: `/components/Header.tsx`
- **Features**:
  - Live search with 300ms debouncing
  - Categorized results (venues, events, artists)
  - Real-time API calls to `/api/search`
  - Navigation to individual content pages

### Role-Specific UX System (🆕 July 2025)
- **Simplified Artist Interface**: `/app/artist-profile/page.tsx`
  - Single form for complete artist profile management
  - Publish/Archive/Republish workflow with status indicators
  - Direct link to public profile page (`/artist/{id}`)
  - No complex CMS dashboard required

- **Streamlined Venue Management**: `/app/my-venue/page.tsx`
  - One-page venue creation and editing for club owners
  - Complete venue information form with image uploads
  - Status management (draft/published/archived)
  - Technical specifications and booking information

- **Lightweight Event Management**: `/app/events/manage` + `/app/events/create`
  - Focused event creation and management for promoters
  - Archive/republish functionality with confirmation dialogs
  - Event statistics dashboard with status breakdowns
  - Simple event lifecycle management

- **Role-Specific Header Navigation**: `/components/Header.tsx`
  - Smart dropdown menus based on authenticated user role
  - Direct links to role-appropriate management pages
  - Eliminates navigation to complex CMS for simple use cases
  - Universal settings page accessible to all users

- **Admin-Only Dashboard Access**: 
  - Complex CMS dashboard restricted to administrators only
  - Other roles get simplified, focused interfaces
  - Maintains full functionality while improving UX

### Profile Management System
- **Profile Editing**: `/app/settings/profile/page.tsx`
- **Form Component**: `/components/profile/ProfileEditForm.tsx`
- **Features**:
  - Complete profile editing with real-time validation
  - Avatar upload with content moderation
  - Social media links and genre preferences
  - Biography and location management

### Content Moderation System
- **Image Moderation**: `/app/api/moderate/image/route.ts`
- **Text Moderation**: `/app/api/moderate/text/route.ts`
- **Features**:
  - OpenAI GPT-4 Vision for image analysis
  - OpenAI Moderation API for text content
  - Real-time validation during upload
  - Liberal approval policy for profile content

### File Upload & Storage
- **Storage Service**: `/lib/services/storage.ts`
- **Supabase Storage**: Secure file uploads with proper policies
- **Features**:
  - File size limits (5MB for images)
  - Type validation (JPG, PNG, GIF, WebP)
  - Content moderation before storage
  - Proper URL generation for Next.js Image component

## 🔐 Security Implementation

### Authentication & Authorization
- **JWT-based authentication** with Supabase Auth
- **Google OAuth integration** for social login
- **Role-based access control** with proper permission checks
- **Row Level Security** policies for database-level authorization

### Storage Security
- **Bucket policies** configured for user-specific access
- **File path structure**: `avatars/USER_ID/filename.ext`
- **Content validation** before storage
- **Public read access** with private write access

### API Security
- **Input validation** on all endpoints
- **Error sanitization** to prevent information leakage
- **Rate limiting** for API protection
- **CORS configuration** for cross-origin requests

## 📝 Development Commands

### Essential Commands
```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting and formatting
npm run lint
npm run lint:fix

# Database operations
npm run db:generate  # Generate TypeScript types
npm run db:push      # Push schema changes
npm run db:reset     # Reset database

# Production build
npm run build
npm run start
```

### Supabase Operations
```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref YOUR_PROJECT_ID

# Apply migrations
supabase db push

# Generate types
supabase gen types typescript --project-id=YOUR_PROJECT_ID > lib/types/database.ts
```

## 🎯 Development Best Practices

### Code Organization
- **Modular architecture** with clear separation of concerns
- **TypeScript interfaces** for all data structures
- **Reusable components** following shadcn/ui patterns
- **Service layer** for business logic separation

### UI/UX Development Workflow
- **Always use Playwright MCP** for automated screenshot validation
- **Follow the design principles** outlined in the Design Principles section
- **Simplify before adding complexity** - remove elements that don't serve a clear purpose
- **Test at multiple breakpoints** - mobile and desktop minimum
- **Validate all interactive states** - empty, loading, error, and success states
- **Use shadcn MCP** to find and install appropriate components before building custom solutions

### Database Best Practices
- **Use Supabase MCP** for all database operations and schema changes
- **RLS policies** for all tables requiring user access control
- **Proper indexing** for search and filtering operations
- **Data validation** at both frontend and backend levels
- **Consistent naming conventions** across all entities
- **Generate TypeScript types** after any schema changes using Supabase MCP

### Project Management
- **Use Linear MCP** for creating and tracking issues
- **Create tickets** for bugs, features, and technical debt
- **Link commits to issues** when possible
- **Update issue status** as work progresses
- **Document decisions** in issue comments

### Security Best Practices
- **Never expose sensitive keys** in frontend code
- **Validate all user inputs** before processing
- **Use prepared statements** to prevent SQL injection
- **Implement proper error handling** without exposing system details

## 🚀 Deployment Configuration

### Vercel Deployment (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up custom domain (optional)
4. Enable automatic deployments from main branch

### Environment Variables for Production
- All development environment variables
- **NEXT_PUBLIC_SITE_URL** set to production domain
- **Supabase production credentials**
- **OpenAI production API key**

### Database Migration
- Use Supabase CLI to push schema changes
- Set up storage policies in Supabase dashboard
- Configure authentication providers

## 🔍 Troubleshooting Guide

### Common Issues

#### Storage Upload Failures
- **Check storage policies** in Supabase dashboard
- **Verify file path structure** matches policy expectations
- **Ensure proper authentication** tokens are being sent

#### Search Not Working
- **Verify API endpoint** is accessible
- **Check authentication** for protected search results
- **Validate search query parameters**

#### Content Moderation Errors
- **Check OpenAI API key** configuration
- **Verify API quota** and usage limits
- **Review moderation prompt** effectiveness

### Debug Tools
- **Browser Developer Tools** for frontend debugging
- **Supabase Dashboard** for database and storage inspection
- **Next.js Development Server** for server-side logging
- **Claude Code** for AI-assisted debugging and problem solving

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community
- [GitHub Repository Issues](https://github.com/your-username/drift/issues)
- [Supabase Discord Community](https://discord.supabase.com/)
- [Next.js Discord Community](https://nextjs.org/discord)

---

**Last Updated**: January 2026
**Development Status**: Design system and MCP integration documented, role-specific UX complete, core features implemented