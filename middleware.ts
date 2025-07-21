import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // Add CORS headers to actual requests
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  }

  // Handle Supabase auth for protected routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )
  
  // Refresh session if expired
  await supabase.auth.getSession()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect dashboard routes
  if (false && request.nextUrl.pathname.startsWith('/dashboard')) { // Temporarily disabled
    console.log('Middleware: Checking dashboard access')
    const { data: { user } } = await supabase.auth.getUser()
    
    console.log('Middleware: User found:', !!user, user?.id)
    if (!user) {
      console.log('Middleware: No user, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check if user has creator role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, is_verified')
      .eq('id', user.id)
      .single()

    console.log('Middleware: Profile lookup result:', { profile, error })

    const creatorRoles = ['artist', 'promoter', 'club_owner', 'admin']
    if (!profile || !creatorRoles.includes(profile.role)) {
      console.log('Middleware: User role not allowed:', profile?.role)
      return NextResponse.redirect(new URL('/', request.url))
    }

    console.log('Middleware: User has valid role:', profile.role)

    // Check verification for non-admin roles
    if (profile.role !== 'admin' && !profile.is_verified) {
      console.log('Middleware: User not verified, redirecting')
      return NextResponse.redirect(new URL('/verification-pending', request.url))
    }

    console.log('Middleware: Dashboard access granted')
  }

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}