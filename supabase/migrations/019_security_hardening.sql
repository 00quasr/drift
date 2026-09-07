-- Migration 019: Security hardening
--
-- Addresses two findings from a production readiness audit:
--   1. Functions with a mutable search_path (Supabase advisor:
--      `function_search_path_mutable`). This matters most for the four
--      SECURITY DEFINER functions, which run with the definer's privileges - a
--      caller who can influence search_path could get them to resolve an
--      attacker-controlled object. The remaining four are pinned for consistency.
--   2. Storage buckets accepting arbitrary files at arbitrary size. The app
--      enforces 5MB and image-only in lib/services/storage.ts, but that is
--      client-side only; the buckets themselves had no limits.
--
-- Idempotent and safe to re-run, matching the convention set by migration 017.

-- ---------------------------------------------------------------------------
-- 1. Pin search_path on all public functions
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER - these are the privilege-escalation relevant ones.
ALTER FUNCTION public.can_view_profile(profile_id uuid, viewer_id uuid)
  SET search_path = public, pg_temp;

ALTER FUNCTION public.can_view_profile_data(profile_id uuid, data_type text, viewer_id uuid)
  SET search_path = public, pg_temp;

ALTER FUNCTION public.update_conversation_timestamp()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.update_review_vote_counts()
  SET search_path = public, pg_temp;

-- SECURITY INVOKER trigger functions - pinned for consistency.
ALTER FUNCTION public.create_user_settings()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.update_message_timestamp()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.update_published_at()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.update_updated_at_column()
  SET search_path = public, pg_temp;

-- ---------------------------------------------------------------------------
-- 2. Constrain storage buckets
-- ---------------------------------------------------------------------------
-- 5MB ceiling matches the limit lib/services/storage.ts already enforces in the
-- browser. Image buckets are restricted to the types the upload UI accepts.

UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id IN ('profiles', 'assets', 'logoassets');

-- The general-purpose 'public' bucket keeps a size ceiling but a broader type
-- allowlist, since it also serves non-image site assets.
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
    ]
WHERE id = 'public';
