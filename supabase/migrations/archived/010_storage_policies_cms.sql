-- Storage Policies for CMS Content
-- Run these in your Supabase SQL editor after applying the migration

-- Policies for public bucket (venues, events, artists images)

-- Allow authenticated users to upload to venues folder
CREATE POLICY "Authenticated users can upload venue images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'public' 
  AND (storage.foldername(name))[1] = 'venues'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to upload to events folder
CREATE POLICY "Authenticated users can upload event images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'public' 
  AND (storage.foldername(name))[1] = 'events'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to upload to artists folder
CREATE POLICY "Authenticated users can upload artist images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'public' 
  AND (storage.foldername(name))[1] = 'artists'
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own content images (check ownership via content tables)
CREATE POLICY "Content owners can update venue images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'public' 
  AND (storage.foldername(name))[1] = 'venues'
  AND (
    -- Check if user owns the venue
    EXISTS (
      SELECT 1 FROM venues 
      WHERE created_by = auth.uid() 
      AND (storage.foldername(name))[2] = venues.id::text
    )
    OR
    -- Or if user is admin
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);

CREATE POLICY "Content owners can update event images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'public' 
  AND (storage.foldername(name))[1] = 'events'
  AND (
    EXISTS (
      SELECT 1 FROM events 
      WHERE created_by = auth.uid() 
      AND (storage.foldername(name))[2] = events.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);

CREATE POLICY "Content owners can update artist images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'public' 
  AND (storage.foldername(name))[1] = 'artists'
  AND (
    EXISTS (
      SELECT 1 FROM artists 
      WHERE created_by = auth.uid() 
      AND (storage.foldername(name))[2] = artists.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- Allow users to delete their own content images
CREATE POLICY "Content owners can delete venue images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'public' 
  AND (storage.foldername(name))[1] = 'venues'
  AND (
    EXISTS (
      SELECT 1 FROM venues 
      WHERE created_by = auth.uid() 
      AND (storage.foldername(name))[2] = venues.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);

CREATE POLICY "Content owners can delete event images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'public' 
  AND (storage.foldername(name))[1] = 'events'
  AND (
    EXISTS (
      SELECT 1 FROM events 
      WHERE created_by = auth.uid() 
      AND (storage.foldername(name))[2] = events.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);

CREATE POLICY "Content owners can delete artist images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'public' 
  AND (storage.foldername(name))[1] = 'artists'
  AND (
    EXISTS (
      SELECT 1 FROM artists 
      WHERE created_by = auth.uid() 
      AND (storage.foldername(name))[2] = artists.id::text
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- Note: Public read access is already handled by existing policies