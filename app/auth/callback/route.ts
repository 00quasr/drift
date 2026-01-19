import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/auth/signin?error=${error}`)
  }

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/auth/signin?error=auth_error`)
    }

    // Get the session to check if user needs a profile
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      // Check if user has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        // Create profile via API route (to use service role)
        try {
          await fetch(`${origin}/api/auth/create-profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              user_id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || 'User',
              role: 'fan'
            })
          })
        } catch (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }
    }

    // Redirect to explore page after successful auth
    return NextResponse.redirect(`${origin}/explore`)
  }

  // No code provided, redirect to signin
  return NextResponse.redirect(`${origin}/auth/signin`)
}
