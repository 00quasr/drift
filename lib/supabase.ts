import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables!')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING')
    console.error('Please check your .env file contains:')
    console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
    
    // Return a mock client that will fail gracefully
    throw new Error('Supabase configuration missing. Please check your .env file.')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
} 