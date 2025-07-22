# Drift Documentation

Welcome to the comprehensive documentation for the Drift platform - a web application for electronic music enthusiasts, artists, promoters, and venue owners.

## 📚 Documentation Structure

### 🏗️ Architecture
Core system design and technical specifications:

- **[Project Requirements](architecture/project_requirements_document.mdc)** - Complete project specifications and feature requirements
- **[Tech Stack](architecture/tech_stack_document.mdc)** - Technology choices and rationale
- **[Backend Structure](architecture/backend_structure_document.mdc)** - Database design and API architecture
- **[Frontend Guidelines](architecture/frontend_guidelines_document.mdc)** - UI/UX patterns and component structure
- **[App Flow](architecture/app_flow_document.mdc)** - User journey and interaction flows

### 🔌 API Reference
Complete API documentation and integration guides:

- **[API Documentation](api/API_DOCUMENTATION.md)** - Comprehensive REST API reference with endpoints, authentication, and examples

### 👨‍💻 Development
Guides for developers working on the platform:

- **[Development Guide](development/DEVELOPMENT_GUIDE.md)** - Complete development setup and workflow
- **[Contributing Guidelines](development/CONTRIBUTING.md)** - How to contribute to the project
- **[Implementation Plan](development/implementation_plan.mdc)** - Original development roadmap
- **[Security Guidelines](development/security_guideline_document.mdc)** - Security best practices
- **[Cursor Metrics](development/cursor_metrics.md)** - Development metrics and tracking

### 🚀 Deployment
Setup and deployment instructions:

- **[Setup Guide](deployment/SETUP.md)** - Complete deployment and configuration guide

## 🎯 Quick Navigation

### For New Developers
1. Start with [Project Requirements](architecture/project_requirements_document.mdc) to understand the platform
2. Review [Tech Stack](architecture/tech_stack_document.mdc) to understand technology choices
3. Follow [Development Guide](development/DEVELOPMENT_GUIDE.md) for setup
4. Read [Contributing Guidelines](development/CONTRIBUTING.md) for workflow

### For API Integration
1. Review [API Documentation](api/API_DOCUMENTATION.md) for complete endpoint reference
2. Check [Backend Structure](architecture/backend_structure_document.mdc) for data models
3. Use [Setup Guide](deployment/SETUP.md) for environment configuration

### For UI/UX Work
1. Read [Frontend Guidelines](architecture/frontend_guidelines_document.mdc) for design patterns
2. Review [App Flow](architecture/app_flow_document.mdc) for user journeys
3. Follow [Development Guide](development/DEVELOPMENT_GUIDE.md) for component structure

### For DevOps/Deployment
1. Follow [Setup Guide](deployment/SETUP.md) for complete deployment instructions
2. Review [Security Guidelines](development/security_guideline_document.mdc) for production considerations
3. Check [Backend Structure](architecture/backend_structure_document.mdc) for infrastructure requirements

## 🔍 Key Concepts

### User Roles (Updated July 2025)
- **Fan** - Browse and review venues, events, and artists with personalized discovery
- **Artist** - Simplified single-profile management via `/artist-profile` interface
- **Promoter** - Lightweight event creation and management tools via `/events/manage`
- **Club Owner** - Streamlined single-venue management via `/my-venue` interface  
- **Admin** - Full platform access with comprehensive CMS dashboard

### Core Entities
- **Venues** - Electronic music venues with ratings and events
- **Events** - Music events with lineups, dates, and venue information
- **Artists** - DJ/Producer profiles with gig history and ratings
- **Reviews** - Multi-faceted ratings (sound, vibe, crowd) with comments

### Key Features (Updated July 2025)
- **Role-Specific UX Design** - Tailored interfaces instead of complex CMS dashboards
- **Simplified Content Management** - Single-purpose interfaces for each user type
- **Smart Navigation** - Role-based header dropdown menus with contextual options
- **Content Lifecycle Management** - Publish/Archive/Republish workflows across all content types
- **Role-based access control** with verification workflow
- **Multi-faceted review system** with AI moderation
- **Real-time search and filtering** across all content
- **Admin moderation tools** for content oversight
- **Responsive, mobile-first design** optimized for all devices

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI
- **Framer Motion** - Animation library

### Backend
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage, Realtime)
- **Next.js API Routes** - Server-side API endpoints
- **Row Level Security** - Database-level authorization

### Development Tools
- **Claude Code** - AI-powered development assistant
- **ESLint & Prettier** - Code quality and formatting
- **TypeScript** - Static type checking

## 🎵 Platform Overview

Drift addresses the fragmented nature of underground electronic music scenes by providing:

1. **Centralized Discovery** - One platform for venues, events, and artists
2. **Role-Specific Experiences** - Tailored interfaces for each user type (artists, club owners, promoters)
3. **Simplified Content Management** - No complex CMS dashboards for simple use cases
4. **Community Reviews** - Detailed ratings with sound, vibe, and crowd assessments
5. **Verified Content** - Role-based verification for creators and venue owners
6. **Smart Moderation** - AI-powered content filtering with human oversight
7. **Real-time Updates** - Live search and notifications for new content

## 📞 Support & Community

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Community discussions and questions
- **Documentation Issues** - Report documentation problems or suggestions

## 📄 License

This project is licensed under the MIT License. See the main repository for license details.

---

**Last Updated**: July 2025  
**Documentation Version**: 2.0.0 (Role-Specific UX Update)

For the most up-to-date information, always refer to the main [README.md](../README.md) in the repository root.