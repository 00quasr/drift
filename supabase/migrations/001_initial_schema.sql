-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('fan', 'artist', 'promoter', 'club_owner', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE review_status AS ENUM ('visible', 'pending_review', 'hidden');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'fan',
  is_verified BOOLEAN DEFAULT FALSE,
  bio TEXT,
  location TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification requests for creators
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  requested_role user_role NOT NULL,
  documents JSONB DEFAULT '{}', -- Store file URLs and metadata
  social_links JSONB DEFAULT '{}',
  business_info JSONB DEFAULT '{}',
  status verification_status DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id)
);

-- Venues/Clubs
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER,
  website TEXT,
  phone TEXT,
  email TEXT,
  social_links JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]', -- Array of image URLs
  genres TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artists
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  country TEXT,
  city TEXT,
  genres TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  press_kit_url TEXT,
  booking_email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id),
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  genres TEXT[] DEFAULT '{}',
  ticket_url TEXT,
  ticket_price_min DECIMAL(10, 2),
  ticket_price_max DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  images JSONB DEFAULT '[]',
  flyer_url TEXT,
  age_restriction INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event-Artist relationships (lineup)
CREATE TABLE event_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  performance_order INTEGER,
  performance_type TEXT, -- 'headliner', 'support', 'opener'
  set_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, artist_id)
);

-- Reviews and ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('venue', 'event', 'artist')),
  target_id UUID NOT NULL,
  rating_overall INTEGER CHECK (rating_overall BETWEEN 1 AND 5),
  rating_sound INTEGER CHECK (rating_sound BETWEEN 1 AND 5),
  rating_vibe INTEGER CHECK (rating_vibe BETWEEN 1 AND 5),
  rating_crowd INTEGER CHECK (rating_crowd BETWEEN 1 AND 5),
  comment TEXT,
  ai_flagged BOOLEAN DEFAULT FALSE,
  user_flagged BOOLEAN DEFAULT FALSE,
  status review_status DEFAULT 'visible',
  moderation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure one review per user per target
  UNIQUE(user_id, target_type, target_id)
);

-- User flags on reviews
CREATE TABLE review_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  flagged_by UUID REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, flagged_by)
);

-- User favorites (venues, events, artists)
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('venue', 'event', 'artist')),
  target_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_verified ON profiles(is_verified);
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_country ON venues(country);
CREATE INDEX idx_venues_active ON venues(is_active);
CREATE INDEX idx_venues_genres ON venues USING GIN(genres);
CREATE INDEX idx_artists_city ON artists(city);
CREATE INDEX idx_artists_country ON artists(country);
CREATE INDEX idx_artists_active ON artists(is_active);
CREATE INDEX idx_artists_genres ON artists USING GIN(genres);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_events_active ON events(is_active);
CREATE INDEX idx_events_genres ON events USING GIN(genres);
CREATE INDEX idx_event_artists_event ON event_artists(event_id);
CREATE INDEX idx_event_artists_artist ON event_artists(artist_id);
CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_target ON favorites(target_type, target_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY; 