# User Management System Documentation

## Overview

The Drift platform now includes a comprehensive user management system that allows administrators to manage all user accounts, roles, and permissions. This system provides complete CRUD operations for user profiles while maintaining security through role-based access control.

## Features

### Admin Dashboard Access
- **Route**: `/dashboard/users`
- **Permissions**: Admin role required
- **Functionality**: Lists all users with filtering, search, and statistics

### User Management Capabilities

#### 1. User Listing & Filtering
- **Search**: Filter users by name, display name
- **Role Filter**: Filter by user role (fan, artist, promoter, club_owner, admin)
- **Statistics**: Real-time counts of total users, verified users, admins, and artists
- **Pagination**: Supports large user bases with limit/offset pagination

#### 2. User Profile Viewing  
- **Profile Access**: View any user's public profile page
- **Quick Navigation**: Direct links to user profiles from admin dashboard
- **Profile Integration**: Seamless integration with existing profile system

#### 3. User Profile Editing
- **Route**: `/dashboard/users/[id]/edit`
- **Basic Info**: Edit name, display name, location, biography
- **Admin Controls**: Change user roles and verification status
- **Restrictions**: Admins cannot edit their own role/verification status
- **Location Handling**: Combined city/country fields stored as single location

#### 4. User Account Management
- **Role Management**: Change user roles between fan, artist, promoter, club_owner, admin
- **Verification Control**: Grant or revoke user verification status
- **Account Deletion**: Delete user accounts (with safety restrictions)
- **Self-Protection**: Admins cannot delete their own accounts

## Technical Implementation

### API Endpoints

#### `GET /api/users`
```typescript
// Query Parameters
interface UserListParams {
  role?: 'fan' | 'artist' | 'promoter' | 'club_owner' | 'admin' | 'all'
  search?: string
  limit?: number
  offset?: number
}

// Response
interface UserListResponse {
  success: true
  data: User[]
  count: number
}
```

#### `GET /api/users/[id]`
```typescript
// Response
interface UserResponse {
  success: true
  data: {
    id: string
    full_name: string
    display_name: string
    email: string // Fetched from auth.users table
    role: UserRole
    is_verified: boolean
    avatar_url?: string
    city?: string // Parsed from location field
    country?: string // Parsed from location field
    bio?: string
    created_at: string
    updated_at: string
  }
}
```

#### `PUT /api/users/[id]`
```typescript
// Request Body
interface UserUpdateRequest {
  full_name: string
  display_name: string
  role?: UserRole // Admin only
  is_verified?: boolean // Admin only
  city: string
  country: string
  bio: string
}
```

#### `DELETE /api/users/[id]`
```typescript
// Response
interface DeleteResponse {
  success: true
  message: "User deleted successfully"
}
```

### Database Schema Compatibility

The user management system works with the existing profiles table structure:

```sql
-- Profiles table columns used
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  display_name TEXT,
  role user_role,
  is_verified BOOLEAN,
  avatar_url TEXT,
  location TEXT, -- Combined city, country
  bio TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
  -- Other existing columns...
);
```

### Row Level Security (RLS) Policies

#### Fixed Infinite Recursion Issues
The system addresses PostgreSQL infinite recursion problems with non-recursive policy design:

```sql
-- Non-recursive admin check using direct SELECT
CREATE POLICY "Admins can update any profile" ON profiles
FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);
```

#### Enhanced Content Creation Policies
Admins can now create content regardless of verification requirements:

```sql
-- Events: Admins can create events at any venue
CREATE POLICY "Verified promoters, venue owners and admins can create events" ON events
FOR INSERT WITH CHECK (
  auth.uid() = created_by AND (
    -- Existing verification checks OR admin role
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
);
```

### Email Integration

#### Admin Service Client
Uses Supabase service role key for admin-level operations:

```typescript
// Create admin client for email lookup
const adminSupabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Required env var
  {
    cookies: { get() { return undefined } }
  }
)

// Fetch user email from auth.users table
const { data: { user } } = await adminSupabase.auth.admin.getUserById(userId)
const email = user?.email || 'Email unavailable'
```

### Frontend Components

#### User Management Dashboard
- **Component**: `/app/dashboard/users/page.tsx`
- **Features**: Search, filtering, statistics, batch operations
- **Styling**: Consistent with existing CMS design system
- **Responsive**: Mobile-friendly interface

#### User Edit Interface  
- **Component**: `/app/dashboard/users/[id]/edit/page.tsx`
- **Features**: Form validation, real-time updates, admin controls
- **Security**: Role-based field visibility and editing restrictions
- **UX**: Clear visual feedback for successful operations

### Security Features

#### Access Control
- **Authentication**: Requires valid admin session
- **Authorization**: Admin role verification on all endpoints
- **Self-Protection**: Prevents admins from compromising their own accounts

#### Data Protection
- **Input Validation**: Comprehensive validation on all user inputs
- **SQL Injection Prevention**: Parameterized queries and RLS policies
- **Privacy**: Email addresses protected via admin-only access

#### Audit Trail
- **Change Tracking**: Updated timestamps on all profile modifications
- **Role Changes**: Logged in database with admin user tracking
- **Content Moderation**: Integration with existing CMS logging system

## Environment Configuration

### Required Environment Variables
```bash
# .env.local
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

The service role key is required for admin-level operations like fetching user emails from the auth.users table.

## Integration Points

### CMS Integration
- **Navigation**: Added to admin section of CMS sidebar
- **Consistent UI**: Follows existing CMS design patterns
- **Role-Based Visibility**: Only visible to admin users

### Profile System Integration
- **Seamless Navigation**: Direct links to user profiles
- **Consistent Data**: Shares same database structure
- **Avatar Support**: Displays user avatars where available

### Authentication Integration
- **Session Management**: Uses existing auth context
- **Permission Checks**: Integrates with role-based routing
- **Security Headers**: Consistent with existing API security

## Usage Guidelines

### Admin Workflow
1. **Access Dashboard**: Navigate to `/dashboard/users`
2. **Filter/Search**: Use controls to find specific users
3. **View Profile**: Click "View Profile" to see public profile
4. **Edit User**: Click "Edit" to modify user information
5. **Manage Roles**: Change roles and verification status as needed
6. **Delete Users**: Remove accounts when necessary (with caution)

### Best Practices
- **Role Changes**: Document significant role changes
- **Verification Status**: Only verify legitimate accounts
- **Account Deletion**: Use sparingly, consider deactivation instead
- **Regular Review**: Periodically audit user roles and permissions

## Error Handling

### Common Issues
1. **Email Not Found**: Service role key not configured
2. **Access Denied**: User lacks admin permissions
3. **Infinite Recursion**: RLS policies reference themselves (fixed)
4. **Update Failures**: Database constraint violations

### Troubleshooting
```bash
# Check service role key configuration
echo $SUPABASE_SERVICE_ROLE_KEY

# Verify admin role in database
SELECT role FROM profiles WHERE id = 'user-id-here';

# Check RLS policies
\d+ profiles -- In psql to see policies
```

## Future Enhancements

### Planned Features
- **Bulk Operations**: Mass role changes and user management
- **User Activity Logs**: Track user actions and login history
- **Advanced Filtering**: More granular search and filter options
- **Export Functionality**: CSV/Excel export of user data
- **User Communication**: Direct messaging to users from admin panel

### Integration Opportunities
- **Notification System**: Notify users of role/status changes
- **Analytics Dashboard**: User growth and engagement metrics
- **Automated Moderation**: AI-powered user behavior analysis
- **Backup/Recovery**: User data backup and restoration tools

## Migration Notes

### Database Changes
- Migration 011 includes all necessary RLS policy updates
- No schema changes required for existing installations
- Backward compatible with existing user data

### Deployment Requirements
- Service role key must be configured before deployment
- Admin users must be designated before using the system
- Test user management features in development environment

This user management system provides a robust foundation for platform administration while maintaining security, performance, and user experience standards.