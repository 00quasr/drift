-- Migration: Add Labels and Collectives tables
-- Description: Creates tables for record labels and artist collectives with review support
-- Date: 2025-07-24

-- Create labels table
CREATE TABLE labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  contact_email TEXT,
  
  -- Location information
  city TEXT,
  country TEXT,
  
  -- Social media links
  instagram_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  soundcloud_url TEXT,
  spotify_url TEXT,
  
  -- Business information
  founded_year INTEGER,
  genres TEXT[], -- Array of genres they represent
  
  -- Status and timestamps
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collectives table
CREATE TABLE collectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  contact_email TEXT,
  
  -- Location information
  city TEXT,
  country TEXT,
  
  -- Social media links
  instagram_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  soundcloud_url TEXT,
  spotify_url TEXT,
  
  -- Collective information
  formed_year INTEGER,
  member_count INTEGER DEFAULT 0,
  genres TEXT[], -- Array of genres they represent
  collective_type TEXT DEFAULT 'artist' CHECK (collective_type IN ('artist', 'dj', 'producer', 'mixed')),
  
  -- Status and timestamps
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create label_artists junction table (many-to-many relationship)
CREATE TABLE label_artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'signed_artist' CHECK (role IN ('signed_artist', 'featured_artist', 'collaborator')),
  signed_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combinations
  UNIQUE(label_id, artist_id)
);

-- Create collective_members junction table (many-to-many relationship)
CREATE TABLE collective_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collective_id UUID NOT NULL REFERENCES collectives(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('founder', 'member', 'collaborator', 'resident')),
  joined_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combinations
  UNIQUE(collective_id, artist_id)
);

-- Create label_events junction table (labels can host/organize events)
CREATE TABLE label_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'organizer' CHECK (role IN ('organizer', 'sponsor', 'promoter')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combinations
  UNIQUE(label_id, event_id)
);

-- Create collective_events junction table (collectives can host/organize events)
CREATE TABLE collective_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collective_id UUID NOT NULL REFERENCES collectives(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'organizer' CHECK (role IN ('organizer', 'host', 'collaborator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combinations
  UNIQUE(collective_id, event_id)
);

-- Add indexes for performance
CREATE INDEX idx_labels_slug ON labels(slug);
CREATE INDEX idx_labels_city_country ON labels(city, country);
CREATE INDEX idx_labels_status ON labels(status);
CREATE INDEX idx_labels_created_by ON labels(created_by);

CREATE INDEX idx_collectives_slug ON collectives(slug);
CREATE INDEX idx_collectives_city_country ON collectives(city, country);
CREATE INDEX idx_collectives_status ON collectives(status);
CREATE INDEX idx_collectives_created_by ON collectives(created_by);

CREATE INDEX idx_label_artists_label_id ON label_artists(label_id);
CREATE INDEX idx_label_artists_artist_id ON label_artists(artist_id);

CREATE INDEX idx_collective_members_collective_id ON collective_members(collective_id);
CREATE INDEX idx_collective_members_artist_id ON collective_members(artist_id);

CREATE INDEX idx_label_events_label_id ON label_events(label_id);
CREATE INDEX idx_label_events_event_id ON label_events(event_id);

CREATE INDEX idx_collective_events_collective_id ON collective_events(collective_id);
CREATE INDEX idx_collective_events_event_id ON collective_events(event_id);

-- Enable RLS on all new tables
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for labels
CREATE POLICY "Anyone can view active labels" ON labels
  FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can create labels" ON labels
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Label creators can update their labels" ON labels
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all labels" ON labels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for collectives
CREATE POLICY "Anyone can view active collectives" ON collectives
  FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can create collectives" ON collectives
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Collective creators can update their collectives" ON collectives
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all collectives" ON collectives
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for junction tables (allow reading, creators and admins can manage)
CREATE POLICY "Anyone can view label artists" ON label_artists FOR SELECT USING (true);
CREATE POLICY "Anyone can view collective members" ON collective_members FOR SELECT USING (true);
CREATE POLICY "Anyone can view label events" ON label_events FOR SELECT USING (true);
CREATE POLICY "Anyone can view collective events" ON collective_events FOR SELECT USING (true);

-- Management policies for junction tables
CREATE POLICY "Label creators can manage label artists" ON label_artists
  FOR ALL USING (
    EXISTS (SELECT 1 FROM labels WHERE id = label_id AND created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Collective creators can manage collective members" ON collective_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM collectives WHERE id = collective_id AND created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Label creators can manage label events" ON label_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM labels WHERE id = label_id AND created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Collective creators can manage collective events" ON collective_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM collectives WHERE id = collective_id AND created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update reviews table to support labels and collectives
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_target_type_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_target_type_check 
  CHECK (target_type IN ('venue', 'event', 'artist', 'label', 'collective'));

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_labels_updated_at
  BEFORE UPDATE ON labels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collectives_updated_at
  BEFORE UPDATE ON collectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();