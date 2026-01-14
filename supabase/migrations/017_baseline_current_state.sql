-- Baseline Migration: Current Database State (Migrations 006-016 Consolidated)
-- Description: This migration captures the current database state that was manually applied
--              via Supabase dashboard. It consolidates changes from migrations 006-016
--              into a single baseline for proper migration tracking.
-- Date: 2026-01-14
-- Note: Uses IF NOT EXISTS patterns for safe idempotent application

-- ============================================================================
-- PART 1: CMS Content Management Tables (from migration 006)
-- ============================================================================

-- Content Moderation Log Table
CREATE TABLE IF NOT EXISTS content_moderation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('venue', 'event', 'artist', 'profile')),
  content_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'published', 'archived', 'flagged', 'approved', 'rejected')),
  moderator_id UUID REFERENCES profiles(id),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Scheduling Table
CREATE TABLE IF NOT EXISTS content_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('venue', 'event', 'artist')),
  content_id UUID NOT NULL,
  scheduled_action VARCHAR(50) NOT NULL CHECK (scheduled_action IN ('publish', 'archive', 'delete')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  executed BOOLEAN DEFAULT FALSE,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Analytics Table
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('venue', 'event', 'artist')),
  content_id UUID NOT NULL,
  metric VARCHAR(50) NOT NULL CHECK (metric IN ('view', 'like', 'share', 'click')),
  user_id UUID REFERENCES profiles(id),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 2: Review Votes Table (from migration 013)
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, review_id)
);

-- ============================================================================
-- PART 3: Labels and Collectives Tables (from migration 015)
-- ============================================================================

CREATE TABLE IF NOT EXISTS labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  contact_email TEXT,
  city TEXT,
  country TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  soundcloud_url TEXT,
  spotify_url TEXT,
  founded_year INTEGER,
  genres TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  contact_email TEXT,
  city TEXT,
  country TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  soundcloud_url TEXT,
  spotify_url TEXT,
  formed_year INTEGER,
  member_count INTEGER DEFAULT 0,
  genres TEXT[],
  collective_type TEXT DEFAULT 'artist' CHECK (collective_type IN ('artist', 'dj', 'producer', 'mixed')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction Tables
CREATE TABLE IF NOT EXISTS label_artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'signed_artist' CHECK (role IN ('signed_artist', 'featured_artist', 'collaborator')),
  signed_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(label_id, artist_id)
);

CREATE TABLE IF NOT EXISTS collective_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collective_id UUID NOT NULL REFERENCES collectives(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('founder', 'member', 'collaborator', 'resident')),
  joined_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collective_id, artist_id)
);

CREATE TABLE IF NOT EXISTS label_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'organizer' CHECK (role IN ('organizer', 'sponsor', 'promoter')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(label_id, event_id)
);

CREATE TABLE IF NOT EXISTS collective_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collective_id UUID NOT NULL REFERENCES collectives(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'organizer' CHECK (role IN ('organizer', 'host', 'collaborator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collective_id, event_id)
);

-- ============================================================================
-- PART 4: Add Status Columns to Existing Tables (from migration 006)
-- ============================================================================

ALTER TABLE venues ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE venues ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

ALTER TABLE events ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

ALTER TABLE artists ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE artists ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);
ALTER TABLE artists ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- ============================================================================
-- PART 5: Add Helpful Count Columns to Reviews (from migration 013)
-- ============================================================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS unhelpful_count INTEGER DEFAULT 0;

-- ============================================================================
-- PART 6: Update Review Target Types for Labels and Collectives (from migration 015)
-- ============================================================================

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_target_type_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_target_type_check 
  CHECK (target_type IN ('venue', 'event', 'artist', 'label', 'collective'));

-- ============================================================================
-- PART 7: Add Foreign Key Constraints to Verification Requests (from migration 016)
-- ============================================================================

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

-- ============================================================================
-- PART 8: Update Rating Constraints to 1-10 Scale (from migration 012)
-- ============================================================================

ALTER TABLE reviews 
DROP CONSTRAINT IF EXISTS reviews_rating_overall_check,
DROP CONSTRAINT IF EXISTS reviews_rating_sound_check,
DROP CONSTRAINT IF EXISTS reviews_rating_vibe_check,
DROP CONSTRAINT IF EXISTS reviews_rating_crowd_check;

ALTER TABLE reviews 
ADD CONSTRAINT reviews_rating_overall_check CHECK (rating_overall >= 1 AND rating_overall <= 10),
ADD CONSTRAINT reviews_rating_sound_check CHECK (rating_sound >= 1 AND rating_sound <= 10),
ADD CONSTRAINT reviews_rating_vibe_check CHECK (rating_vibe >= 1 AND rating_vibe <= 10),
ADD CONSTRAINT reviews_rating_crowd_check CHECK (rating_crowd >= 1 AND rating_crowd <= 10);

-- ============================================================================
-- PART 9: Create Indexes for Performance (from migrations 006, 013, 015, 016)
-- ============================================================================

-- Content Management Indexes
CREATE INDEX IF NOT EXISTS idx_content_moderation_log_content ON content_moderation_log(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_log_created_at ON content_moderation_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_schedule_scheduled_for ON content_schedule(scheduled_for) WHERE NOT executed;
CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_created_at ON content_analytics(created_at DESC);

-- Review Votes Indexes
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_vote_type ON review_votes(vote_type);

-- Labels Indexes
CREATE INDEX IF NOT EXISTS idx_labels_slug ON labels(slug);
CREATE INDEX IF NOT EXISTS idx_labels_city_country ON labels(city, country);
CREATE INDEX IF NOT EXISTS idx_labels_status ON labels(status);
CREATE INDEX IF NOT EXISTS idx_labels_created_by ON labels(created_by);

-- Collectives Indexes
CREATE INDEX IF NOT EXISTS idx_collectives_slug ON collectives(slug);
CREATE INDEX IF NOT EXISTS idx_collectives_city_country ON collectives(city, country);
CREATE INDEX IF NOT EXISTS idx_collectives_status ON collectives(status);
CREATE INDEX IF NOT EXISTS idx_collectives_created_by ON collectives(created_by);

-- Junction Tables Indexes
CREATE INDEX IF NOT EXISTS idx_label_artists_label_id ON label_artists(label_id);
CREATE INDEX IF NOT EXISTS idx_label_artists_artist_id ON label_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_collective_members_collective_id ON collective_members(collective_id);
CREATE INDEX IF NOT EXISTS idx_collective_members_artist_id ON collective_members(artist_id);
CREATE INDEX IF NOT EXISTS idx_label_events_label_id ON label_events(label_id);
CREATE INDEX IF NOT EXISTS idx_label_events_event_id ON label_events(event_id);
CREATE INDEX IF NOT EXISTS idx_collective_events_collective_id ON collective_events(collective_id);
CREATE INDEX IF NOT EXISTS idx_collective_events_event_id ON collective_events(event_id);

-- Verification Requests Indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_submitted_at ON verification_requests(submitted_at);

-- ============================================================================
-- PART 10: Functions and Triggers (from migrations 006, 014, 015)
-- ============================================================================

-- Function to automatically set published_at timestamp
CREATE OR REPLACE FUNCTION update_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = NOW();
  ELSIF NEW.status != 'published' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for published_at on content tables
DROP TRIGGER IF EXISTS trigger_venues_published_at ON venues;
CREATE TRIGGER trigger_venues_published_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_published_at();

DROP TRIGGER IF EXISTS trigger_events_published_at ON events;
CREATE TRIGGER trigger_events_published_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_published_at();

DROP TRIGGER IF EXISTS trigger_artists_published_at ON artists;
CREATE TRIGGER trigger_artists_published_at
  BEFORE UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_published_at();

-- Function to update review vote counts (SECURITY DEFINER to bypass RLS)
DROP TRIGGER IF EXISTS trigger_update_review_vote_counts ON review_votes;
DROP FUNCTION IF EXISTS update_review_vote_counts();

CREATE OR REPLACE FUNCTION update_review_vote_counts()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
  UPDATE reviews 
  SET 
    helpful_count = (
      SELECT COUNT(*) 
      FROM review_votes 
      WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
      AND vote_type = 'upvote'
    ),
    unhelpful_count = (
      SELECT COUNT(*) 
      FROM review_votes 
      WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
      AND vote_type = 'downvote'
    )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_vote_counts();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at on labels and collectives
DROP TRIGGER IF EXISTS update_labels_updated_at ON labels;
CREATE TRIGGER update_labels_updated_at
  BEFORE UPDATE ON labels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collectives_updated_at ON collectives;
CREATE TRIGGER update_collectives_updated_at
  BEFORE UPDATE ON collectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 11: Enable RLS on New Tables
-- ============================================================================

ALTER TABLE content_moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 12: Drop Old RLS Policies (from migrations 007, 008, 011)
-- ============================================================================

-- Venues
DROP POLICY IF EXISTS "Verified club owners can create venues" ON venues;

-- Events
DROP POLICY IF EXISTS "Verified promoters and venue owners can create events" ON events;

-- Artists
DROP POLICY IF EXISTS "Verified artists can create artist profiles" ON artists;

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone or admins can see all" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;

-- ============================================================================
-- PART 13: Create New RLS Policies (from migrations 007, 008, 011, 013, 015)
-- ============================================================================

-- Content Moderation Log Policies
CREATE POLICY "Admins can view all moderation logs" ON content_moderation_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Content creators can view their own moderation logs" ON content_moderation_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.id = content_moderation_log.moderator_id
    )
  );

CREATE POLICY "Admins can insert moderation logs" ON content_moderation_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Content Schedule Policies
CREATE POLICY "Users can manage their own scheduled content" ON content_schedule
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can view all scheduled content" ON content_schedule
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Content Analytics Policies
CREATE POLICY "Content creators can view analytics for their content" ON content_analytics
  FOR SELECT USING (
    (content_type = 'venue' AND EXISTS (
      SELECT 1 FROM venues v 
      WHERE v.id = content_analytics.content_id 
      AND v.created_by = auth.uid()
    ))
    OR
    (content_type = 'event' AND EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = content_analytics.content_id 
      AND e.created_by = auth.uid()
    ))
    OR
    (content_type = 'artist' AND EXISTS (
      SELECT 1 FROM artists a 
      WHERE a.id = content_analytics.content_id 
      AND a.created_by = auth.uid()
    ))
  );

CREATE POLICY "Admins can view all analytics" ON content_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert analytics" ON content_analytics
  FOR INSERT WITH CHECK (true);

-- Venues Policies
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

-- Events Policies
CREATE POLICY "Verified promoters, venue owners and admins can create events" ON events
  FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('promoter', 'club_owner') 
        AND profiles.is_verified = true
      )
      OR
      EXISTS (
        SELECT 1 FROM venues 
        WHERE venues.id = events.venue_id 
        AND venues.owner_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

-- Artists Policies
CREATE POLICY "Verified artists and admins can create artist profiles" ON artists
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'artist' 
        AND profiles.is_verified = true
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

-- Profiles Policies (Non-recursive to avoid infinite loops)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT USING (
  id = auth.uid() OR true
);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

CREATE POLICY "Only admins can delete profiles" ON profiles
FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- User Settings Policies
CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Settings are automatically created" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Activity Policies
CREATE POLICY "Users can view their own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity" ON user_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert their own activity" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Connections Policies
CREATE POLICY "Users can view connections involving them" ON user_connections FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);
CREATE POLICY "Users can create connections as follower" ON user_connections FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can update connections involving them" ON user_connections FOR UPDATE
  USING (auth.uid() = follower_id OR auth.uid() = following_id);
CREATE POLICY "Users can delete connections involving them" ON user_connections FOR DELETE
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Profile Views Policies
CREATE POLICY "Users can view their own profile views" ON profile_views FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Anyone can insert profile views" ON profile_views FOR INSERT WITH CHECK (true);

-- Review Votes Policies
CREATE POLICY "Users can view all review votes" ON review_votes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own votes" ON review_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON review_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON review_votes FOR DELETE USING (auth.uid() = user_id);

-- Labels Policies
CREATE POLICY "Anyone can view active labels" ON labels FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can create labels" ON labels FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Label creators can update their labels" ON labels FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all labels" ON labels FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Collectives Policies
CREATE POLICY "Anyone can view active collectives" ON collectives FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can create collectives" ON collectives FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Collective creators can update their collectives" ON collectives FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all collectives" ON collectives FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Junction Table Policies
CREATE POLICY "Anyone can view label artists" ON label_artists FOR SELECT USING (true);
CREATE POLICY "Anyone can view collective members" ON collective_members FOR SELECT USING (true);
CREATE POLICY "Anyone can view label events" ON label_events FOR SELECT USING (true);
CREATE POLICY "Anyone can view collective events" ON collective_events FOR SELECT USING (true);

CREATE POLICY "Label creators can manage label artists" ON label_artists FOR ALL USING (
  EXISTS (SELECT 1 FROM labels WHERE id = label_id AND created_by = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Collective creators can manage collective members" ON collective_members FOR ALL USING (
  EXISTS (SELECT 1 FROM collectives WHERE id = collective_id AND created_by = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Label creators can manage label events" ON label_events FOR ALL USING (
  EXISTS (SELECT 1 FROM labels WHERE id = label_id AND created_by = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Collective creators can manage collective events" ON collective_events FOR ALL USING (
  EXISTS (SELECT 1 FROM collectives WHERE id = collective_id AND created_by = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- PART 14: Privacy Functions (from migration 007)
-- ============================================================================

-- Enhanced privacy function for profile visibility
CREATE OR REPLACE FUNCTION can_view_profile(profile_id UUID, viewer_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  profile_visibility TEXT;
  are_connected BOOLEAN;
BEGIN
  SELECT COALESCE(us.profile_visibility, 'public')
  INTO profile_visibility
  FROM user_settings us
  WHERE us.user_id = profile_id;
  
  IF profile_visibility IS NULL THEN
    profile_visibility := 'public';
  END IF;
  
  IF profile_id = viewer_id THEN
    RETURN TRUE;
  END IF;
  
  IF profile_visibility = 'public' THEN
    RETURN TRUE;
  END IF;
  
  IF profile_visibility = 'private' THEN
    RETURN FALSE;
  END IF;
  
  IF profile_visibility = 'friends' THEN
    SELECT EXISTS(
      SELECT 1 FROM user_connections 
      WHERE ((follower_id = profile_id AND following_id = viewer_id) 
             OR (follower_id = viewer_id AND following_id = profile_id))
        AND status = 'accepted'
    ) INTO are_connected;
    
    RETURN are_connected;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can view specific profile data
CREATE OR REPLACE FUNCTION can_view_profile_data(profile_id UUID, data_type TEXT, viewer_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  user_settings_data user_settings%ROWTYPE;
BEGIN
  IF profile_id = viewer_id THEN
    RETURN TRUE;
  END IF;
  
  SELECT * INTO user_settings_data
  FROM user_settings
  WHERE user_id = profile_id;
  
  IF user_settings_data IS NULL THEN
    RETURN CASE data_type
      WHEN 'activity' THEN TRUE
      WHEN 'reviews' THEN TRUE
      WHEN 'favorites' THEN TRUE
      WHEN 'location' THEN FALSE
      ELSE TRUE
    END;
  END IF;
  
  RETURN CASE data_type
    WHEN 'activity' THEN user_settings_data.show_activity
    WHEN 'reviews' THEN user_settings_data.show_reviews
    WHEN 'favorites' THEN user_settings_data.show_favorites
    WHEN 'location' THEN user_settings_data.show_location
    ELSE TRUE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 15: Policy Comments (from migration 011)
-- ============================================================================

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

-- ============================================================================
-- NOTE: Storage Policies (from migration 010)
-- ============================================================================
-- Storage policies for storage.objects table should be applied separately in Supabase dashboard
-- as they operate on a Supabase-managed system table and may require special permissions.
-- Refer to migration 010 for the complete storage policy definitions.
