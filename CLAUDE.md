# Claude Code Development Notes

This document outlines the development process and key implementation details for the Drift project, developed with assistance from Claude Code.

## 🛠️ Development Environment

### Claude Agents 
Use Claude Code Subagents for specific tasks. Inside of .claude/agents & .claude/skills are .md that explain the project in a more specific ways. Always use one of those agents or skills for a specific task.

/agents
- drift-reviewer.md = Expert code reviewer for Drift platform
- event-optimizer.md = Performance and UX specialist for event discovery features. Optimizes search, trending algorithms
- maintenance-agent.md = Maintenance specialist that reviews and updates agents and skills to keep them current with the evolving codebase
- security-auditor.md = Security specialist for content moderation, API protection, and data safety.
- supabase-assistant.md = Database expert for Supabase queries, schema design, and RLS policies. Use when working with database tables, migrations, or query optimization. MUST BE USED for any database-related changes.
- supabase-realtime-agent.md = You are an expert developer assistant specializing in Supabase Realtime implementations

/skills
- /drift-api-patterns/SKILL.md = Write secure Next.js API routes following Drift patterns.
- /drift-component-generator/SKILL.md = Generate React components following Drift's minimalist design system
- /supabase-query-helper/SKILL.md = Query Supabase schema, write SQL, and generate TypeScript types.
- /typography-standards/SKILL.md = All typography must use Geist Sans.

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
  - Take screenshots for visual validation but wait a few seconds that the website can load
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
- icons at all

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
- Avoid one-off styling when a reusable component exists.

#### TypeScript Standards
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` types unless absolutely necessary
- Use proper type inference from Supabase database types

### Typography Standards

#### Font Family: Geist Sans
**PROJECT-WIDE STANDARD** - All typography must use Geist Sans.

- **Primary typeface**: [Geist Sans](https://vercel.com/font) by Vercel
- **Modern, clean, optimized** for digital interfaces
- **Installation**: `npm install geist`

**Next.js Configuration** (in `app/layout.tsx`):
```tsx
import { GeistSans } from 'geist/font/sans';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

#### Typography Scale
shadcn/ui does NOT ship typography styles by default - we define them using Tailwind utilities.

**Headings:**
```tsx
// H1 - Large page titles
<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">

// H2 - Section headings
<h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">

// H3 - Subsection headings
<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">

// H4 - Card/component titles
<h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
```

**Body Text:**
```tsx
// Paragraph - Standard body text
<p className="leading-7 [&:not(:first-child)]:mt-6">

// Lead - Introduction/highlight text
<p className="text-xl text-muted-foreground">

// Large - Emphasized text
<div className="text-lg font-semibold">

// Small - Secondary/supporting text
<small className="text-sm font-medium leading-none">

// Muted - De-emphasized text
<p className="text-sm text-muted-foreground">
```

**Special Elements:**
```tsx
// Blockquote - Quotes and callouts
<blockquote className="mt-6 border-l-2 pl-6 italic">

// Inline code - Code snippets
<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">

// Lists - Ordered and unordered
<ul className="my-6 ml-6 list-disc [&>li]:mt-2">
```

#### Typography Rules
1. **Use Geist Sans** - All text must use the Geist Sans font family
2. **Use Tailwind utilities** - No custom CSS for typography unless absolutely necessary
3. **Semantic HTML** - Use proper heading hierarchy (h1, h2, h3, etc.)
4. **Consistent spacing** - Follow the patterns above for margins and line heights
5. **Color variants** - Use `text-muted-foreground`, `text-primary`, etc. from theme

**Reference**: See [shadcn/ui Typography Guide](https://ui.shadcn.com/docs/components/typography) and Linear issue DES-4.

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

## 🔄 Git Workflow for Linear Issues

### Overview
To work on multiple Linear issues simultaneously with separate Claude Code instances, we use Git branches and worktrees. This allows parallel development without branch switching conflicts.

### Branch Naming Convention
Always create branches with Linear issue IDs for traceability:
```bash
# Format: feature/[LINEAR-ID]-brief-description
feature/DRI-123-add-user-authentication
feature/DRI-456-fix-search-performance
bugfix/DRI-789-resolve-upload-error
```

### Working with Single Branch (Traditional Approach)
When working on one issue at a time:
```bash
# 1. Create and switch to new branch from main
git checkout main
git pull origin main
git checkout -b feature/DRI-123-add-user-authentication

# 2. Work on the issue
# Make changes, commit regularly

# 3. Push branch to remote
git push -u origin feature/DRI-123-add-user-authentication

# 4. Create PR when ready
gh pr create --title "DRI-123: Add user authentication" --body "Implements OAuth..."
```

### Using Git Worktrees for Multiple Issues (Recommended)
Git worktrees allow multiple branches to be checked out in different directories simultaneously, perfect for multiple Claude Code instances.

#### Setting Up Worktrees
```bash
# 1. From main drift directory, create a worktree for each Linear issue
git worktree add ../drift-DRI-123 feature/DRI-123-add-user-authentication
git worktree add ../drift-DRI-456 feature/DRI-456-fix-search-performance

# 2. Directory structure will be:
# /Documents/GitHub/
#   ├── drift/                  (main branch)
#   ├── drift-DRI-123/          (feature/DRI-123 branch)
#   └── drift-DRI-456/          (feature/DRI-456 branch)
```

#### Working in Worktrees

**IMPORTANT: Worktrees only contain tracked git files.** Files in `.gitignore` must be copied manually.

**Crucial files to copy:**
| File/Folder | Purpose |
|-------------|---------|
| `.env` | Supabase, OpenAI, Mapbox API keys |
| `.claude/` | Agents, skills, Claude Code settings |
| `.mcp.json` | MCP server configuration |

```bash
# After creating a worktree, set it up:
cd ../drift-DRI-123

# Copy essential untracked files
cp ../drift/.env .
cp ../drift/.mcp.json .
cp -r ../drift/.claude .

# Install dependencies
npm install

# Now open Claude Code in this directory
```

**One-liner setup for new worktrees:**
```bash
cd ../drift-DRI-123 && cp ../drift/.env . && cp ../drift/.mcp.json . && cp -r ../drift/.claude . && npm install
```

#### Managing Worktrees

**IMPORTANT: You must remove the worktree BEFORE deleting the branch.**

```bash
# List all worktrees
git worktree list

# Step 1: Remove the worktree (use --force if it has untracked files like .env, node_modules)
git worktree remove ../drift-DRI-123 --force

# Step 2: Now delete the branch
git branch -d feature/DRI-123-issue-title

# Clean up stale worktree references
git worktree prune
```

**Common issue:** Worktrees with copied `.env`, `.claude/`, or `node_modules/` will require `--force` to remove since these are untracked files.

### Linear Integration Workflow

#### 1. Start Work on Linear Issue
```bash
# Get issue details from Linear using MCP
# Create branch with Linear issue ID
git checkout -b feature/DRI-123-issue-title

# Or with worktree
git worktree add ../drift-DRI-123 feature/DRI-123-issue-title
```

#### 2. During Development
```bash
# Commit with Linear issue reference
git commit -m "DRI-123: Add user profile editing

- Implements profile form
- Adds validation
- Updates API endpoint"

never use CLAUDE as co-author 

# Push regularly
git push origin feature/DRI-123-issue-title
```

#### 3. Create Pull Request
```bash
# Use gh CLI with Linear reference in title
gh pr create \
  --title "DRI-123: Issue title from Linear" \
  --body "## Linear Issue
  [DRI-123](https://linear.app/drift/issue/DRI-123)

  ## Changes
  - Implementation details
  - Testing notes

  ## Screenshots
  [Add if UI changes]"
```

### Best Practices for Multiple Issues

1. **Keep Branches Updated**
```bash
# In each worktree/branch, regularly sync with main
git fetch origin
git rebase origin/main
```

2. **Stash Management**
```bash
# When switching context temporarily
git stash push -m "DRI-123: WIP profile form"
git stash list
git stash pop
```

3. **Environment Files**
```bash
# Each worktree needs its own .env.local
cp ../.env.local .env.local  # Copy from main directory
```

4. **Database Migrations**
```bash
# Be careful with migrations across branches
# Always pull latest migrations from main before creating new ones
git checkout main -- supabase/migrations/
```

5. **Clean Up Regularly**
```bash
# Remove merged branches
git branch -d feature/DRI-123-completed-issue

# Remove remote tracking branches
git remote prune origin

# Clean up worktrees
git worktree prune
```

### Typical Multi-Issue Workflow

```bash
# Monday: Start 3 Linear issues
git worktree add ../drift-DRI-100 feature/DRI-100-nav-update
git worktree add ../drift-DRI-101 feature/DRI-101-search-fix
git worktree add ../drift-DRI-102 feature/DRI-102-new-component

# Open 3 Claude Code instances, one in each directory
# Work on issues in parallel

# Complete DRI-100
cd ../drift-DRI-100
git push origin feature/DRI-100-nav-update
gh pr create --title "DRI-100: Update navigation"
cd ../drift
git worktree remove ../drift-DRI-100

# Continue with other issues...
```

### Troubleshooting

#### Worktree Conflicts
```bash
# If worktree is locked
rm .git/worktrees/[worktree-name]/locked

# If worktree path changed
git worktree repair
```

#### Branch Conflicts
```bash
# Resolve conflicts during rebase
git rebase origin/main
# Fix conflicts in files
git add .
git rebase --continue
```

#### Clean State Reset
```bash
# If things go wrong, reset to clean state
git worktree remove --force ../drift-DRI-XXX
git branch -D feature/DRI-XXX-broken
git worktree prune
```

### Quick Reference

| Action | Command |
|--------|---------|
| Create worktree | `git worktree add ../drift-DRI-123 feature/DRI-123-title` |
| List worktrees | `git worktree list` |
| Remove worktree | `git worktree remove ../drift-DRI-123` |
| Create branch | `git checkout -b feature/DRI-123-title` |
| Link to Linear | Use `DRI-XXX:` prefix in commit messages |
| Create PR | `gh pr create --title "DRI-123: Title"` |

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

---

**Last Updated**: January 2026
**Development Status**: Design system and MCP integration documented, role-specific UX complete, core features implemented