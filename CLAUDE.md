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

## 🔧 Key Implementation Details

### Real-time Search System
- **Location**: `/components/Header.tsx`
- **Features**:
  - Live search with 300ms debouncing
  - Categorized results (venues, events, artists)
  - Real-time API calls to `/api/search`
  - Navigation to individual content pages

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

### Database Best Practices
- **RLS policies** for all tables requiring user access control
- **Proper indexing** for search and filtering operations
- **Data validation** at both frontend and backend levels
- **Consistent naming conventions** across all entities

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

**Last Updated**: January 2025  
**Development Status**: Core features complete, ready for UI enhancement and additional feature development