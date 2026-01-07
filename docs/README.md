# Drift Documentation

Welcome to the comprehensive documentation for the Drift platform - a web application for electronic music enthusiasts, artists, promoters, and venue owners.

---

## Documentation Structure

### 01. Overview - Project Status & Planning

High-level project information and current status:

- **[PROJECT_STATUS.md](./01-overview/PROJECT_STATUS.md)** - **MAIN STATUS** - Complete project overview and implementation status
- **[RECENT_IMPLEMENTATIONS.md](./01-overview/RECENT_IMPLEMENTATIONS.md)** - Latest features and changes (Updated July 2025)
- **[IMPLEMENTATION_PLAN_2025.md](./01-overview/IMPLEMENTATION_PLAN_2025.md)** - Strategic roadmap and milestones
- **[NEXT_STEPS_ROADMAP.md](./01-overview/NEXT_STEPS_ROADMAP.md)** - Short-term action items and priorities

### 02. Features - Feature Documentation

Specific feature implementations and guides:

- **[REALTIME_CHAT_IMPLEMENTATION.md](./02-features/REALTIME_CHAT_IMPLEMENTATION.md)** - **NEW** - Complete chat system implementation guide
- **[USER_MANAGEMENT_SYSTEM.md](./02-features/USER_MANAGEMENT_SYSTEM.md)** - Authentication and user management
- **[MAPBOX_SETUP.md](./02-features/MAPBOX_SETUP.md)** - Map integration setup guide
- **[TESTING_IMAGE_VIEWER.md](./02-features/TESTING_IMAGE_VIEWER.md)** - Image viewer testing procedures

### 03. Technical - Architecture & API

Core system design and technical specifications:

**Architecture Documentation**
- **[tech_stack_document.mdc](./03-technical/architecture/tech_stack_document.mdc)** - Technology choices and rationale
- **[backend_structure_document.mdc](./03-technical/architecture/backend_structure_document.mdc)** - Database design and API architecture
- **[frontend_guidelines_document.mdc](./03-technical/architecture/frontend_guidelines_document.mdc)** - UI/UX patterns and component structure
- **[project_requirements_document.mdc](./03-technical/architecture/project_requirements_document.mdc)** - Complete project specifications
- **[app_flow_document.mdc](./03-technical/architecture/app_flow_document.mdc)** - User journey and interaction flows

**API Documentation**
- **[API_DOCUMENTATION.md](./03-technical/api/API_DOCUMENTATION.md)** - Comprehensive REST API reference

### 04. Security - Security & Enterprise

Security documentation and enterprise deployment:

- **[SECURITY_AUDIT_REPORT.md](./04-security/SECURITY_AUDIT_REPORT.md)** - Security analysis and hardening measures
- **[ENTERPRISE_DEPLOYMENT_CHECKLIST.md](./04-security/ENTERPRISE_DEPLOYMENT_CHECKLIST.md)** - Production deployment requirements

### 05. Deployment - Deployment & Infrastructure

Setup and deployment instructions:

- **[SETUP.md](./05-deployment/deployment/SETUP.md)** - Complete deployment and configuration guide

### 06. Development - Development Workflow

Guides for developers working on the platform:

- **[DEVELOPMENT_GUIDE.md](./06-development/development/DEVELOPMENT_GUIDE.md)** - Complete development setup and workflow
- **[CLAUDE_CODE_GUIDE.md](./06-development/development/CLAUDE_CODE_GUIDE.md)** - **NEW** - AI agents and skills for development
- **[CONTRIBUTING.md](./06-development/development/CONTRIBUTING.md)** - How to contribute to the project
- **[security_guideline_document.mdc](./06-development/development/security_guideline_document.mdc)** - Security best practices
- **[implementation_plan.mdc](./06-development/development/implementation_plan.mdc)** - Original development roadmap
- **[cursor_metrics.md](./06-development/development/cursor_metrics.md)** - Development metrics and tracking

### 07. Audits - Project Audits & Reviews

Project assessments and comprehensive reviews:

- **[PROJECT_AUDIT_JULY_2025.md](./07-audits/PROJECT_AUDIT_JULY_2025.md)** - **NEW** - Comprehensive project audit and analysis
- **[GIT_PUSH_SUMMARY_JULY_2025.md](./07-audits/GIT_PUSH_SUMMARY_JULY_2025.md)** - Git activity summary

### 08. Marketing - Marketing & Design

Marketing strategy and design documentation:

- **[SOCIAL_MEDIA_MARKETING.md](./08-marketing/SOCIAL_MEDIA_MARKETING.md)** - Marketing strategy and social media
- **[moodboard-design-assets.md](./08-marketing/moodboard-design-assets.md)** - Design assets and branding

---

## Quick Navigation

### Getting Started

1. **[Project Status](./01-overview/PROJECT_STATUS.md)** - Current implementation status
2. **[Recent Updates](./01-overview/RECENT_IMPLEMENTATIONS.md)** - Latest features (July 2025)
3. **[Development Guide](./06-development/development/DEVELOPMENT_GUIDE.md)** - Setup and workflow

### By Role

#### For New Developers

1. Start with **[Project Status](./01-overview/PROJECT_STATUS.md)** to understand current state
2. Review **[Tech Stack](./03-technical/architecture/tech_stack_document.mdc)** to understand technology choices
3. Follow **[Development Guide](./06-development/development/DEVELOPMENT_GUIDE.md)** for setup
4. Learn **[Claude Code Agents & Skills](./06-development/development/CLAUDE_CODE_GUIDE.md)** for AI-assisted development
5. Read **[Contributing Guidelines](./06-development/development/CONTRIBUTING.md)** for workflow

#### For API Integration

1. Review **[API Documentation](./03-technical/api/API_DOCUMENTATION.md)** for complete endpoint reference
2. Check **[Backend Structure](./03-technical/architecture/backend_structure_document.mdc)** for data models
3. Use **[Setup Guide](./05-deployment/deployment/SETUP.md)** for environment configuration

#### For UI/UX Work

1. Read **[Frontend Guidelines](./03-technical/architecture/frontend_guidelines_document.mdc)** for design patterns
2. Review **[App Flow](./03-technical/architecture/app_flow_document.mdc)** for user journeys
3. Check **[Recent Implementations](./01-overview/RECENT_IMPLEMENTATIONS.md)** for latest UI updates

#### For DevOps/Deployment

1. Follow **[Setup Guide](./05-deployment/deployment/SETUP.md)** for complete deployment instructions
2. Review **[Security Guidelines](./06-development/development/security_guideline_document.mdc)** for production considerations
3. Check **[Enterprise Checklist](./04-security/ENTERPRISE_DEPLOYMENT_CHECKLIST.md)** for enterprise deployment

#### For Project Management

1. **[Project Audit](./07-audits/PROJECT_AUDIT_JULY_2025.md)** - Comprehensive project review
2. **[Implementation Plan](./01-overview/IMPLEMENTATION_PLAN_2025.md)** - Strategic roadmap
3. **[Next Steps](./01-overview/NEXT_STEPS_ROADMAP.md)** - Action items

---

## Key Concepts

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

---

## Technology Stack

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

- **Claude Code** - AI-powered development assistant with custom agents and skills
  - 5 specialized agents (supabase-assistant, drift-reviewer, event-optimizer, security-auditor, maintenance-agent)
  - 3 knowledge skills (supabase-query-helper, drift-component-generator, drift-api-patterns)
  - See [Claude Code Guide](./06-development/development/CLAUDE_CODE_GUIDE.md) for usage
- **ESLint & Prettier** - Code quality and formatting
- **TypeScript** - Static type checking

---

## Platform Overview

Drift addresses the fragmented nature of underground electronic music scenes by providing:

1. **Centralized Discovery** - One platform for venues, events, and artists
2. **Role-Specific Experiences** - Tailored interfaces for each user type (artists, club owners, promoters)
3. **Simplified Content Management** - No complex CMS dashboards for simple use cases
4. **Community Reviews** - Detailed ratings with sound, vibe, and crowd assessments
5. **Verified Content** - Role-based verification for creators and venue owners
6. **Smart Moderation** - AI-powered content filtering with human oversight
7. **Real-time Updates** - Live search and notifications for new content

---

## Support & Community

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Community discussions and questions
- **Documentation Issues** - Report documentation problems or suggestions

---

## License

This project is licensed under the MIT License. See the main repository for license details.

---

## Documentation Organization

This documentation is organized into 8 logical sections for better navigation:

1. **Overview** - Project status and planning documents
2. **Features** - Specific feature implementations and guides
3. **Technical** - Architecture, API, and technical specifications
4. **Security** - Security audits and enterprise deployment
5. **Deployment** - Setup and infrastructure guides
6. **Development** - Development workflow and contribution guides
7. **Audits** - Project assessments and comprehensive reviews
8. **Marketing** - Marketing strategy and design documentation

**Last Updated**: January 2026
**Documentation Version**: 3.1.0
**Organization**: Logical subfolder structure for better navigation

For the most up-to-date information, always refer to the main [README.md](../README.md) in the repository root.
