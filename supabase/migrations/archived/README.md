# Archived Migrations

## Overview

This directory contains migrations (006-016) that were manually applied in Supabase dashboard but never properly tracked in migration history.

## Migration 017: Baseline Current State

On 2026-01-14, a comprehensive baseline migration (`017_baseline_current_state.sql`) was created to capture the current database state. This migration consolidates all changes from the archived migrations into a single, idempotent baseline file.

## Why These Were Archived

- Migration 007 has syntax errors (missing semicolons after CREATE POLICY statements)
- Remote migration 006 contains content that matches local migration 007
- Migrations 006-016 were manually applied in Supabase dashboard
- This created a drift between local migration files and remote migration history

## Archived Migrations

| File | Description | Status |
|-------|-------------|--------|
| `006_cms_content_management.sql` | CMS content tables and status columns | Manually applied in Supabase |
| `007_user_settings_rls.sql` | User settings RLS policies (has syntax errors) | Manually applied in Supabase |
| `008_fix_venue_rls_policy.sql` | Fix venue RLS policy for admins | Manually applied in Supabase |
| `009_fix_venue_status.sql` | Update venue status to published | Data migration, run once |
| `010_storage_policies_cms.sql` | Storage bucket policies | Applied in Supabase dashboard |
| `011_admin_user_management_policies.sql` | Admin user management policies, fix recursion | Manually applied in Supabase |
| `012_update_rating_constraints_to_10_scale.sql` | Change rating scale 1-5 to 1-10 | Manually applied in Supabase |
| `013_add_review_votes_table.sql` | Review votes table and triggers | Manually applied in Supabase |
| `014_fix_vote_count_triggers.sql` | Fix vote count triggers for RLS | Manually applied in Supabase |
| `015_add_labels_and_collectives_tables.sql` | Labels, collectives, and junction tables | Manually applied in Supabase |
| `016_add_verification_requests_foreign_keys.sql` | Add foreign key constraints | Manually applied in Supabase |

## Current State

- ✅ All tables, functions, triggers, indexes, and policies from these migrations are active in production database
- ✅ Baseline migration 017 documents current database state with IF NOT EXISTS patterns
- ✅ Migration 017 is idempotent (safe to run multiple times)
- ✅ Future migrations can start from 018

## Migration 009 Data Update Note

Migration 009 (`fix_venue_status.sql`) is a one-time data migration that updates venue status from 'draft' to 'published'. This should NOT be re-applied as it modifies production data.

## Storage Policies (Migration 010)

Storage policies for `storage.objects` are applied directly in Supabase dashboard as they operate on Supabase-managed system tables and may require special permissions. Refer to `010_storage_policies_cms.sql` for complete policy definitions.

## Going Forward

All new database changes should:
1. Be created as migration files starting from 018
2. Use IF NOT EXISTS patterns for safety
3. Include comprehensive documentation and comments
4. Be tested locally before deployment
