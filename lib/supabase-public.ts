import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'

/**
 * Anon-key Supabase client usable from server components and route handlers.
 *
 * Distinct from lib/supabase.ts (browser-only) and lib/supabase-server.ts
 * (service role, bypasses RLS). Use this for reading public, published content
 * during rendering - the sitemap and metadata generation - so those paths stay
 * subject to RLS and never touch the service-role key.
 *
 * Returns null instead of throwing when env vars are absent, so a build without
 * credentials degrades to reduced output rather than failing.
 */
export function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return null

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
