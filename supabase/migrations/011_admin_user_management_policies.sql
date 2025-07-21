-- Migration 011: Admin User Management & Fixed RLS Policies
-- Date: 2025-01-21
-- Description: Update RLS policies to support admin user management and fix infinite recursion issues

-- =============================================
-- Fix Events Table RLS Policies
-- =============================================

-- Drop and recreate events INSERT policy to include admins
DROP POLICY IF EXISTS "Verified promoters and venue owners can create events" ON events;

CREATE POLICY "Verified promoters, venue owners and admins can create events" ON events
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND (
    -- Verified promoters and club owners
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('promoter', 'club_owner') 
        AND profiles.is_verified = true
      )
    ) OR
    -- Venue owners can create events at their venues
    (
      EXISTS (
        SELECT 1 FROM venues 
        WHERE venues.id = events.venue_id 
        AND venues.owner_id = auth.uid()
      )
    ) OR
    -- Admins can create events anywhere
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  )
);

-- =============================================
-- Fix Artists Table RLS Policies  
-- =============================================

-- Drop and recreate artists INSERT policy to include admins
DROP POLICY IF EXISTS "Verified artists can create artist profiles" ON artists;

CREATE POLICY "Verified artists and admins can create artist profiles" ON artists
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    -- Verified artists can create their own profile
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'artist' 
        AND profiles.is_verified = true
      )
    ) OR
    -- Admins can create artist profiles
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  )
);

-- =============================================
-- Fix Profiles Table RLS Policies (Remove Infinite Recursion)
-- =============================================

-- Drop all existing profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone or admins can see all" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

-- Create non-recursive SELECT policy
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT USING (
  -- Users can see their own profile
  id = auth.uid() OR
  -- Everyone can see all profiles (privacy controls can be added later)
  true
);

-- Create non-recursive UPDATE policy for users
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Create separate admin UPDATE policy that avoids recursion
CREATE POLICY "Admins can update any profile" ON profiles
FOR UPDATE USING (
  -- Check if current user is admin by looking at their role directly
  (
    SELECT role FROM profiles 
    WHERE id = auth.uid() 
    LIMIT 1
  ) = 'admin'
);

-- Create admin DELETE policy that avoids recursion
CREATE POLICY "Only admins can delete profiles" ON profiles
FOR DELETE USING (
  (
    SELECT role FROM profiles 
    WHERE id = auth.uid() 
    LIMIT 1
  ) = 'admin'
);

-- =============================================
-- Comments
-- =============================================

COMMENT ON POLICY "Verified promoters, venue owners and admins can create events" ON events IS 
'Allows verified promoters, club owners, venue owners, and admins to create events. Admins can create events at any venue.';

COMMENT ON POLICY "Verified artists and admins can create artist profiles" ON artists IS 
'Allows verified artists to create their own profiles and admins to create any artist profile.';

COMMENT ON POLICY "Public profiles are viewable by everyone" ON profiles IS 
'Non-recursive policy allowing users to see their own profile and everyone to see all profiles. Privacy controls can be added later.';

COMMENT ON POLICY "Users can update own profile" ON profiles IS 
'Allows users to update their own profile information.';

COMMENT ON POLICY "Admins can update any profile" ON profiles IS 
'Non-recursive policy allowing admins to update any user profile. Uses direct SELECT to avoid infinite recursion.';

COMMENT ON POLICY "Only admins can delete profiles" ON profiles IS 
'Non-recursive policy allowing only admins to delete user profiles. Uses direct SELECT to avoid infinite recursion.';