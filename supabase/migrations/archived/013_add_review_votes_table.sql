-- Migration: Add review votes table for upvote/downvote system
-- Description: Creates table to store user votes on reviews for helpfulness sorting
-- Date: 2025-07-24

-- Create review_votes table
CREATE TABLE review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one vote per user per review
  UNIQUE(user_id, review_id)
);

-- Add indexes for performance
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX idx_review_votes_user_id ON review_votes(user_id);
CREATE INDEX idx_review_votes_vote_type ON review_votes(vote_type);

-- Add helpful_count and unhelpful_count columns to reviews table for caching
ALTER TABLE reviews 
ADD COLUMN helpful_count INTEGER DEFAULT 0,
ADD COLUMN unhelpful_count INTEGER DEFAULT 0;

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_review_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the review's vote counts
  UPDATE reviews 
  SET 
    helpful_count = (SELECT COUNT(*) FROM review_votes WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) AND vote_type = 'upvote'),
    unhelpful_count = (SELECT COUNT(*) FROM review_votes WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) AND vote_type = 'downvote')
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update vote counts
CREATE TRIGGER trigger_update_review_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_vote_counts();

-- Enable RLS on review_votes table
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for review_votes
CREATE POLICY "Users can view all review votes" ON review_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON review_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON review_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON review_votes
  FOR DELETE USING (auth.uid() = user_id);