 -- User Settings and Preferences Migration
-- Add user preferences and settings for personalization

-- Add additional profile fields for fans
ALTER TABLE profiles 
ADD COLUMN avatar_url TEXT,
ADD COLUMN display_name TEXT,
ADD COLUMN favorite_genres TEXT[] DEFAULT '{}',
ADD COLUMN privacy_settings JSONB DEFAULT '{}',
ADD COLUMN theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark', 'auto')),
ADD COLUMN language_preference TEXT DEFAULT 'en',
ADD COLUMN timezone TEXT DEFAULT 'UTC'
-- Create user settings table for app-specific preferences
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Notification preferences
  email_notifications JSONB DEFAULT '{
    "new_events": true,
    "favorite_venues": true,
    "review_replies": true,
    "weekly_digest": false,
    "marketing": false
  }',
  
  push_notifications JSONB DEFAULT '{
    "new_events": true,
    "favorite_venues": true,
    "review_replies": true,
    "event_reminders": true
  }',
  
  -- Privacy preferences
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  show_activity BOOLEAN DEFAULT true,
  show_reviews BOOLEAN DEFAULT true,
  show_favorites BOOLEAN DEFAULT true,
  show_location BOOLEAN DEFAULT false,
  
  -- App preferences
  default_location TEXT,
  search_radius INTEGER DEFAULT 50, -- km
  currency_preference TEXT DEFAULT 'EUR',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  time_format TEXT DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  
  -- Content preferences
  content_filter JSONB DEFAULT '{
    "explicit_content": false,
    "age_restriction": 18,
    "content_warnings": true
  }',
  
  -- Social features
  allow_friend_requests BOOLEAN DEFAULT true,
  allow_messages BOOLEAN DEFAULT true,
  show_online_status BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
-- Create user activity tracking for stats
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('profile_view', 'venue_visit', 'event_attend', 'review_posted', 'favorite_added')),
  target_type TEXT CHECK (target_type IN ('venue', 'event', 'artist', 'user')),
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
-- Create user connections (friends/following)
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
)
-- Create user profile views tracking
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewer_ip INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
-- Add indexes for performance
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id)
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id)
CREATE INDEX idx_user_activity_type ON user_activity(activity_type)
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at DESC)
CREATE INDEX idx_user_connections_follower ON user_connections(follower_id)
CREATE INDEX idx_user_connections_following ON user_connections(following_id)
CREATE INDEX idx_user_connections_status ON user_connections(status)
CREATE INDEX idx_profile_views_profile_id ON profile_views(profile_id)
CREATE INDEX idx_profile_views_created_at ON profile_views(created_at DESC)
CREATE INDEX idx_profiles_display_name ON profiles(display_name)
CREATE INDEX idx_profiles_favorite_genres ON profiles USING GIN(favorite_genres)
-- Enable Row Level Security for new tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY
-- Create trigger to automatically create user_settings when profile is created
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
CREATE TRIGGER trigger_create_user_settings
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_settings()
-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column()
CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column()