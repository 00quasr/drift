-- CMS Content Management Migration
-- This migration adds comprehensive content management capabilities to the Drift platform

-- Add CMS content management columns to existing tables
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

-- Create content moderation log table
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

-- Create content scheduling table
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

-- Create content analytics table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_moderation_log_content ON content_moderation_log(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_log_created_at ON content_moderation_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_schedule_scheduled_for ON content_schedule(scheduled_for) WHERE NOT executed;
CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_created_at ON content_analytics(created_at DESC);

-- Enable RLS on new tables
ALTER TABLE content_moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Create trigger function for automatic published_at timestamp
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

-- Create triggers for all content tables
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

-- Create RLS policies for content_moderation_log
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

-- Create RLS policies for content_schedule
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

-- Create RLS policies for content_analytics
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