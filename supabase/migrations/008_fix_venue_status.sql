-- Fix venue status for existing seed data venues
-- Update existing venues that are active but in draft status to be published
UPDATE venues 
SET status = 'published'
WHERE status = 'draft' AND is_active = true;

-- This will make the existing Berghain, Tresor, Watergate, Fabric, De School venues visible on the public site