# Drift Database Migrations

This directory contains all database migrations for the Drift electronic music platform. Migrations are executed in numerical order and should never be modified once applied to production.

## Migration Overview

### Core Platform Setup (001-003)
- **001_initial_schema.sql** - Core database schema (profiles, venues, events, artists)
- **002_rls_policies.sql** - Row Level Security policies for data access control
- **003_seed_data.sql** - Initial seed data for venues and test content

### Feature Enhancements (004-005)
- **004_upcoming_events.sql** - Enhanced event management with upcoming events view
- **005_user_settings.sql** - User preferences, privacy settings, and activity tracking

### Content Management System (006-010)
- **006_cms_content_management.sql** - CMS columns and moderation logging system
- **007_user_settings_rls.sql** - Privacy controls and profile visibility policies
- **008_fix_venue_rls_policy.sql** - Admin and club owner venue access permissions
- **009_fix_venue_status.sql** - Venue status management for published/draft workflow
- **010_storage_policies_cms.sql** - File storage policies for CMS content

## Database Structure

### Core Tables
- `profiles` - User profiles with role-based access (fan, artist, promoter, club_owner, admin)
- `venues` - Venues with location, capacity, and CMS status management
- `events` - Electronic music events with venue relationships
- `artists` - Artist profiles with social links and bio information

### CMS Tables
- `content_moderation_log` - Audit trail for all content changes and moderation actions
- `user_settings` - Privacy preferences and notification settings
- `user_activity` - User action tracking for analytics
- `user_connections` - Social connections between users

### Key Features
- **Role-based Access Control**: Different permission levels for each user type
- **Content Moderation**: Automated text/image moderation with OpenAI integration
- **Privacy Controls**: Granular profile visibility settings (public/private/friends)
- **Audit Logging**: Complete audit trail for all content management actions
- **Status Workflow**: Draft → Published workflow for all content types

## Migration Management

### Running Migrations
```bash
# Apply all migrations
npx supabase db push

# Reset to specific migration
npx supabase db reset --version <migration_number>
```

### Creating New Migrations
```bash
# Create new migration file
npx supabase migration new <migration_name>
```

### Migration Guidelines
1. **Never modify existing migrations** once applied to production
2. **Use sequential numbering** (001, 002, 003...)
3. **Include descriptive comments** explaining the purpose
4. **Test locally** before pushing to production
5. **Create rollback scripts** for complex changes

## Security Policies

### Row Level Security (RLS)
All tables implement RLS policies to ensure data security:
- Users can only access their own data
- Public content is visible to all users
- Admins have elevated access for content management
- Privacy settings are enforced at the database level

### Content Moderation
- All user-generated content goes through automated moderation
- Moderation results are logged for audit purposes
- Failed moderation prevents content publication
- Manual review workflow for edge cases

## Development Workflow

1. **Local Development**: Use Supabase local development for testing
2. **Staging**: Apply migrations to staging environment first
3. **Production**: Only deploy tested migrations to production
4. **Monitoring**: Monitor migration execution and database performance

## Troubleshooting

### Common Issues
- **Foreign Key Constraints**: Ensure referenced data exists before creating relationships
- **RLS Policy Conflicts**: Check policy order and conditions for access issues  
- **Migration Failures**: Always backup before major schema changes

### Debug Queries
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- View user permissions
SELECT * FROM profiles WHERE id = auth.uid();

-- Check content moderation logs
SELECT * FROM content_moderation_log ORDER BY created_at DESC LIMIT 10;
```