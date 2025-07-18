 -- Row Level Security Policies for User Settings and Profile Features

-- User Settings Policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id)
CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
CREATE POLICY "Settings are automatically created"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id)
-- User Activity Policies
CREATE POLICY "Users can view their own activity"
  ON user_activity FOR SELECT
  USING (auth.uid() = user_id)
CREATE POLICY "System can insert activity"
  ON user_activity FOR INSERT
  WITH CHECK (true)
CREATE POLICY "Users can insert their own activity"
  ON user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id)
-- User Connections Policies
CREATE POLICY "Users can view connections involving them"
  ON user_connections FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id)
CREATE POLICY "Users can create connections as follower"
  ON user_connections FOR INSERT
  WITH CHECK (auth.uid() = follower_id)
CREATE POLICY "Users can update connections involving them"
  ON user_connections FOR UPDATE
  USING (auth.uid() = follower_id OR auth.uid() = following_id)
CREATE POLICY "Users can delete connections involving them"
  ON user_connections FOR DELETE
  USING (auth.uid() = follower_id OR auth.uid() = following_id)
-- Profile Views Policies
CREATE POLICY "Users can view their own profile views"
  ON profile_views FOR SELECT
  USING (auth.uid() = profile_id)
CREATE POLICY "Anyone can insert profile views"
  ON profile_views FOR INSERT
  WITH CHECK (true)
-- Updated Profiles Policies (add new columns)
-- Drop existing policies and recreate with enhanced logic
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles
-- Allow users to view public profiles or their own
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT
  USING (
    id = auth.uid() OR 
    (
      SELECT COALESCE(
        (SELECT profile_visibility FROM user_settings WHERE user_id = profiles.id), 
        'public'
      ) = 'public'
    )
  )
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
-- Enhanced privacy function for profile visibility
CREATE OR REPLACE FUNCTION can_view_profile(profile_id UUID, viewer_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  profile_visibility TEXT;
  are_connected BOOLEAN;
BEGIN
  -- Get profile visibility setting
  SELECT COALESCE(us.profile_visibility, 'public')
  INTO profile_visibility
  FROM user_settings us
  WHERE us.user_id = profile_id;
  
  -- If no setting found, default to public
  IF profile_visibility IS NULL THEN
    profile_visibility := 'public';
  END IF;
  
  -- Owner can always view their own profile
  IF profile_id = viewer_id THEN
    RETURN TRUE;
  END IF;
  
  -- Public profiles are viewable by everyone
  IF profile_visibility = 'public' THEN
    RETURN TRUE;
  END IF;
  
  -- Private profiles only viewable by owner
  IF profile_visibility = 'private' THEN
    RETURN FALSE;
  END IF;
  
  -- Friends-only profiles
  IF profile_visibility = 'friends' THEN
    -- Check if users are connected
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
$$ LANGUAGE plpgsql SECURITY DEFINER
-- Function to check if user can view specific profile data
CREATE OR REPLACE FUNCTION can_view_profile_data(profile_id UUID, data_type TEXT, viewer_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  user_settings_data user_settings%ROWTYPE;
BEGIN
  -- Owner can always view their own data
  IF profile_id = viewer_id THEN
    RETURN TRUE;
  END IF;
  
  -- Get user settings
  SELECT * INTO user_settings_data
  FROM user_settings
  WHERE user_id = profile_id;
  
  -- If no settings found, use defaults
  IF user_settings_data IS NULL THEN
    RETURN CASE data_type
      WHEN 'activity' THEN TRUE
      WHEN 'reviews' THEN TRUE
      WHEN 'favorites' THEN TRUE
      WHEN 'location' THEN FALSE
      ELSE TRUE
    END;
  END IF;
  
  -- Check specific data type permissions
  RETURN CASE data_type
    WHEN 'activity' THEN user_settings_data.show_activity
    WHEN 'reviews' THEN user_settings_data.show_reviews
    WHEN 'favorites' THEN user_settings_data.show_favorites
    WHEN 'location' THEN user_settings_data.show_location
    ELSE TRUE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER