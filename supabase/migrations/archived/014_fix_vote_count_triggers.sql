-- Migration: Fix vote count triggers to work with RLS
-- Description: Fixes database triggers that update helpful/unhelpful counts on reviews
-- Date: 2025-07-24

-- Fix vote count trigger to work with RLS
DROP TRIGGER IF EXISTS trigger_update_review_vote_counts ON review_votes;
DROP FUNCTION IF EXISTS update_review_vote_counts();

-- Create improved function with proper permissions
CREATE OR REPLACE FUNCTION update_review_vote_counts()
RETURNS TRIGGER 
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
BEGIN
  -- Update the review's vote counts
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

-- Recreate trigger
CREATE TRIGGER trigger_update_review_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_vote_counts();

-- Manually update existing review counts to fix current state
UPDATE reviews 
SET 
  helpful_count = (
    SELECT COUNT(*) 
    FROM review_votes 
    WHERE review_votes.review_id = reviews.id 
    AND vote_type = 'upvote'
  ),
  unhelpful_count = (
    SELECT COUNT(*) 
    FROM review_votes 
    WHERE review_votes.review_id = reviews.id 
    AND vote_type = 'downvote'
  )
WHERE EXISTS (
  SELECT 1 FROM review_votes WHERE review_votes.review_id = reviews.id
);