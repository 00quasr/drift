-- RLS Policies for Drift Platform

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verification requests policies
CREATE POLICY "Users can view own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Users can create verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update verification requests" ON verification_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Venues policies
CREATE POLICY "Anyone can view active venues" ON venues
  FOR SELECT USING (is_active = true OR 
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Verified club owners can create venues" ON venues
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() 
            AND profiles.role = 'club_owner' AND profiles.is_verified = true)
  );

CREATE POLICY "Venue owners and admins can update venues" ON venues
  FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Artists policies
CREATE POLICY "Anyone can view active artists" ON artists
  FOR SELECT USING (is_active = true OR 
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Verified artists can create artist profiles" ON artists
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() 
            AND profiles.role = 'artist' AND profiles.is_verified = true)
  );

CREATE POLICY "Artist owners and admins can update artists" ON artists
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Events policies
CREATE POLICY "Anyone can view active events" ON events
  FOR SELECT USING (is_active = true OR 
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM venues WHERE venues.id = events.venue_id AND venues.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Verified promoters and venue owners can create events" ON events
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() 
             AND profiles.role IN ('promoter', 'club_owner') AND profiles.is_verified = true) OR
     EXISTS (SELECT 1 FROM venues WHERE venues.id = events.venue_id AND venues.owner_id = auth.uid()))
  );

CREATE POLICY "Event creators, venue owners and admins can update events" ON events
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM venues WHERE venues.id = events.venue_id AND venues.owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Event artists policies
CREATE POLICY "Anyone can view event artists" ON event_artists
  FOR SELECT USING (true);

CREATE POLICY "Event creators and venue owners can manage lineups" ON event_artists
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_artists.event_id 
            AND (events.created_by = auth.uid() OR 
                 EXISTS (SELECT 1 FROM venues WHERE venues.id = events.venue_id AND venues.owner_id = auth.uid()))) OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Reviews policies
CREATE POLICY "Anyone can view visible reviews" ON reviews
  FOR SELECT USING (status = 'visible' OR 
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own reviews, admins can update any" ON reviews
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Users can delete own reviews, admins can delete any" ON reviews
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Review flags policies
CREATE POLICY "Anyone can view review flags (for admins)" ON review_flags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Authenticated users can flag reviews" ON review_flags
  FOR INSERT WITH CHECK (auth.uid() = flagged_by AND auth.uid() IS NOT NULL);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 