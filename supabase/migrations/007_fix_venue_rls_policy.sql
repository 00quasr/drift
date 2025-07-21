-- Fix venue RLS policy to allow admins to create venues
-- Drop the old insert policy
DROP POLICY IF EXISTS "Verified club owners can create venues" ON venues;

-- Create new policy that allows both club owners and admins to create venues
CREATE POLICY "Verified club owners and admins can create venues" ON venues
FOR INSERT TO public
WITH CHECK (
  auth.uid() = owner_id 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (
      (profiles.role = 'club_owner' AND profiles.is_verified = true)
      OR profiles.role = 'admin'
    )
  )
);