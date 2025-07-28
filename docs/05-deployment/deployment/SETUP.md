# Drift Deployment Guide

This guide covers setting up Drift for development and production environments.

## Table of Contents

- [Quick Start (Development)](#quick-start-development)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Quick Start (Development)

For a quick development setup:

```bash
# Clone and install
git clone https://github.com/your-username/drift.git
cd drift
npm install

# Set up environment
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# Set up database
npm run db:push

# Start development server
npm run dev
```

## Prerequisites

### Required Software

- **Node.js** 20.x or higher
- **npm** 9.x or higher
- **Git** for version control

### Required Services

- **Supabase Account** - Database, auth, and storage
- **Vercel Account** (optional) - For deployment
- **OpenAI Account** (optional) - For content moderation
- **Mapbox Account** (optional) - For maps integration

## Environment Setup

### 1. Environment Variables

Create `.env.local` for development or `.env.production` for production:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Content Moderation
OPENAI_API_KEY=your_openai_api_key

# Optional: Maps Integration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

### 2. Supabase Project Setup

#### Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and enter project details
4. Select a region (choose closest to your users)
5. Set database password and create project

#### Get API Keys

1. Navigate to **Settings** → **API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys** → `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

#### Configure Authentication

1. Go to **Authentication** → **Settings**
2. Set **Site URL** to your domain (e.g., `https://yourdomain.com`)
3. Add **Redirect URLs**:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

#### Enable Email Auth

1. In **Authentication** → **Settings**
2. Configure **Email** provider
3. Set up **SMTP settings** (or use Supabase's built-in email)

#### Optional: Social Login

Configure OAuth providers in **Authentication** → **Providers**:
- Google OAuth
- Facebook OAuth
- Discord OAuth

## Database Setup

### 1. Install Supabase CLI

```bash
npm install -g @supabase/cli
```

### 2. Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id
```

### 3. Apply Database Schema

```bash
# Push all migrations
supabase db push

# Generate TypeScript types
npm run db:generate
```

### 4. Verify Database Setup

1. Go to **Database** → **Tables** in Supabase Dashboard
2. Verify all tables are created:
   - `profiles`
   - `venues`
   - `events`
   - `artists`
   - `reviews`
   - `review_flags`
   - `event_artists`

### 5. Set Up Row Level Security (RLS)

RLS policies are automatically applied with migrations. Verify in **Authentication** → **Policies**.

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Application

- **Frontend**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard/project/your-project-id

### 4. Development Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production build

# Code Quality
npm run lint            # Run linting
npm run lint:fix        # Fix linting issues
npm run type-check      # TypeScript checking

# Database
npm run db:generate     # Generate types
npm run db:push         # Push schema changes
npm run db:reset        # Reset database
```

## Production Deployment

### Option 1: Vercel (Recommended)

#### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure project settings

#### 2. Environment Variables

Add all environment variables in **Settings** → **Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### 3. Deploy

1. Click "Deploy"
2. Vercel will automatically build and deploy
3. Custom domain can be added in **Settings** → **Domains**

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

MKDIR .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Build and Run

```bash
# Build image
docker build -t drift .

# Run container
docker run -p 3000:3000 --env-file .env.production drift
```

### Option 3: Traditional VPS

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-username/drift.git
cd drift

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "drift" -- start
pm2 startup
pm2 save
```

#### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment Setup

### 1. Create Admin User

1. Register a user through the application
2. In Supabase Dashboard → **Authentication** → **Users**
3. Find your user and note the UUID
4. In **Database** → **Table Editor** → **profiles**
5. Update your user's role to `admin`

### 2. Configure Domain

1. Update Supabase **Site URL** and **Redirect URLs**
2. Add domain to your deployment platform
3. Set up SSL certificate

### 3. Set Up Monitoring

```bash
# Add health check endpoint
curl https://yourdomain.com/api/health

# Monitor with PM2 (if using VPS)
pm2 monit
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

```bash
# Restart development server
npm run dev

# Check environment in browser console
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

#### 2. Database Connection Issues

```bash
# Verify Supabase connection
supabase projects list

# Check project status
supabase status
```

#### 3. Build Errors

```bash
# Clean build
rm -rf .next
npm run build

# Check TypeScript errors
npm run type-check
```

#### 4. Authentication Issues

- Verify redirect URLs in Supabase
- Check Site URL configuration
- Ensure HTTPS in production

#### 5. Database Migration Issues

```bash
# Reset and reapply migrations
supabase db reset
supabase db push
```

### Getting Help

1. Check [GitHub Issues](https://github.com/your-username/drift/issues)
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Join our community Discord (coming soon)

### Health Checks

#### Application Health

```bash
# Check if application is running
curl http://localhost:3000/api/health
```

#### Database Health

```bash
# Test database connection
curl http://localhost:3000/api/venues
```

#### Authentication Health

```bash
# Test auth endpoints
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

## Security Considerations

### Production Checklist

- [ ] All environment variables configured
- [ ] HTTPS enabled
- [ ] Database RLS policies active
- [ ] Admin access restricted
- [ ] Regular backups scheduled
- [ ] Monitoring configured
- [ ] Error reporting set up

### Regular Maintenance

- [ ] Update dependencies monthly
- [ ] Review security logs
- [ ] Monitor performance metrics
- [ ] Backup database regularly
- [ ] Update documentation

For development guidelines, see [Development Guide](../development/DEVELOPMENT_GUIDE.md).

For contribution instructions, see [Contributing Guide](../development/CONTRIBUTING.md).