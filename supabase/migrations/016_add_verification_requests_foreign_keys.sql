-- Migration: Add foreign key constraints for verification_requests table
-- Created: 2025-01-26
-- Purpose: Establish proper relationships between verification_requests and profiles table

-- Add foreign key constraint from verification_requests.user_id to profiles.id (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'verification_requests_user_id_fkey'
        AND table_name = 'verification_requests'
    ) THEN
        ALTER TABLE verification_requests 
        ADD CONSTRAINT verification_requests_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint from verification_requests.reviewed_by to profiles.id (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'verification_requests_reviewed_by_fkey'
        AND table_name = 'verification_requests'
    ) THEN
        ALTER TABLE verification_requests 
        ADD CONSTRAINT verification_requests_reviewed_by_fkey 
        FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for better query performance (these are safe with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted_at ON verification_requests(submitted_at);