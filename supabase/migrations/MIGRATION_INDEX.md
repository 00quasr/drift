# Database Migration Index

## Active Migrations

| Version | Name | Date | Description |
|----------|-------|-------|-------------|
| 001 | `initial_schema` | 2025-07-15 | Core tables: profiles, venues, artists, events, reviews, favorites, notifications, verification_requests |
| 002 | `rls_policies` | 2025-07-15 | Row Level Security policies for all core tables |
| 003 | `seed_data` | 2025-07-15 | Sample venues, artists, events, and lineups for development |
| 004 | `upcoming_events` | 2025-07-15 | Add upcoming events for 2025 |
| 005 | `user_settings` | 2025-07-19 | User settings, activity tracking, connections, and profile views |
| 017 | `baseline_current_state` | 2026-01-14 | **BASELINE**: Consolidates migrations 006-016 into current database state |

## Archived Migrations (006-016)

See `archived/README.md` for complete details.

**Summary of archived migrations:**
- 006: CMS content management tables and status columns
- 007: User settings RLS policies (had syntax errors)
- 008: Fix venue RLS policy to include admins
- 009: Data update for venue status (one-time migration)
- 010: Storage policies for Supabase storage buckets
- 011: Admin user management policies, fix infinite recursion
- 012: Update rating constraints from 1-5 to 1-10 scale
- 013: Add review_votes table and triggers
- 014: Fix vote count triggers to work with RLS (SECURITY DEFINER)
- 015: Add labels, collectives, and junction tables
- 016: Add foreign key constraints to verification_requests

## Migration 017: Baseline Current State

Created on 2026-01-14 to address migration drift between local files and remote database state.

### What happened?

Migrations 006-016 were manually applied in Supabase dashboard but never tracked in migration history. This created a situation where:

1. Local migration files existed (006-016)
2. Remote database had all changes applied
3. Migration tracking was out of sync
4. Some local files had syntax errors (migration 007)

### Solution

Migration 017 was created as a **comprehensive, idempotent baseline** that:

- ✅ Uses `IF NOT EXISTS` patterns for all CREATE statements
- ✅ Uses `IF NOT EXISTS` for policy creation
- ✅ Captures entire current database state
- ✅ Safe to run multiple times
- ✅ Documents all changes from migrations 006-016

### What's included in baseline 017?

**Tables:**
- `content_moderation_log` - Content moderation tracking
- `content_schedule` - Scheduled content operations
- `content_analytics` - Content metrics
- `review_votes` - Upvote/downvote system
- `labels` - Record label management
- `collectives` - Artist collectives
- `label_artists`, `collective_members`, `label_events`, `collective_events` - Junction tables

**Columns added to existing tables:**
- Venues, events, artists: `status`, `created_by`, `updated_by`, `published_at`
- Reviews: `helpful_count`, `unhelpful_count`
- Reviews target_type: Extended to include 'label' and 'collective'
- Verification requests: Foreign key constraints added

**Functions & Triggers:**
- `update_published_at()` - Auto-set published_at on status change
- `update_review_vote_counts()` - Vote count triggers (SECURITY DEFINER)
- `update_updated_at_column()` - Timestamp management
- Triggers on: venues, events, artists, labels, collectives, review_votes

**RLS Policies:**
- Content management tables (admin & creator access)
- User settings & activity tables
- Profiles (non-recursive to avoid infinite loops)
- Events/Artists/Venues (admin inclusive)
- Labels, collectives, junction tables

**Indexes:**
- Performance indexes for content tables
- Indexes for labels, collectives, junction tables
- Indexes for review votes
- Indexes for verification requests

**Constraints:**
- 1-10 rating scale on reviews
- Foreign key constraints on verification_requests
- Check constraints on status fields

### Applying Migration 017

**Important:** Migration 017 is already applied in production (via manual application of 006-016).

To sync migration tracking, you have two options:

**Option 1: Manual tracking update (Recommended)**
```bash
# Connect to your Supabase project
supabase db remote commit

# This will detect the baseline migration in your local files
# and update remote tracking without running SQL
```

**Option 2: Direct SQL insertion**
```sql
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('017', 'baseline_current_state')
ON CONFLICT (version) DO NOTHING;
```

### Going Forward

All new migrations should:
1. Start from version 018
2. Use `IF NOT EXISTS` patterns for safety
3. Include comprehensive documentation and comments
4. Be tested locally before deployment
5. Follow the same structure as baseline 017

### Notes

- Migration 009 is a **data migration** that should NOT be re-run (changes production data)
- Migration 010 (storage policies) is applied in Supabase dashboard (operates on system tables)
- Migration 007 had syntax errors (missing semicolons) which is included in baseline 017
- All archived migrations are preserved in `supabase/migrations/archived/` for reference
