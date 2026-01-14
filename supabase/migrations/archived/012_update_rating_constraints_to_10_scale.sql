-- Migration: Update rating constraints to use 1-10 scale instead of 1-5
-- Description: Changes all rating check constraints to allow 1-10 ratings like IMDB
-- Date: 2025-07-24

-- Drop existing 1-5 rating constraints
ALTER TABLE reviews 
DROP CONSTRAINT IF EXISTS reviews_rating_overall_check,
DROP CONSTRAINT IF EXISTS reviews_rating_sound_check,
DROP CONSTRAINT IF EXISTS reviews_rating_vibe_check,
DROP CONSTRAINT IF EXISTS reviews_rating_crowd_check;

-- Add new 1-10 rating constraints
ALTER TABLE reviews 
ADD CONSTRAINT reviews_rating_overall_check CHECK (rating_overall >= 1 AND rating_overall <= 10),
ADD CONSTRAINT reviews_rating_sound_check CHECK (rating_sound >= 1 AND rating_sound <= 10),
ADD CONSTRAINT reviews_rating_vibe_check CHECK (rating_vibe >= 1 AND rating_vibe <= 10),
ADD CONSTRAINT reviews_rating_crowd_check CHECK (rating_crowd >= 1 AND rating_crowd <= 10);