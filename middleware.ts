import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add secure CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://drift.vercel.app',
      process.env.NEXT_PUBLIC_SITE_URL
    ].filter(Boolean)

    const isAllowedOrigin = origin && allowedOrigins.includes(origin)
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
          'Access-Control-Allow-Credentials': 'true',
        },
      })
    }

    // Add CORS headers to actual requests
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  }

  // Handle Supabase auth for protected routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          response.cookies.set(name, '', {
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )
  
  // Get session and verify with server for security
  const { data: { session } } = await supabase.auth.getSession()
  
  // For dashboard routes, verify user with server for security
  let verifiedUser = null
  if (request.nextUrl.pathname.startsWith('/dashboard') && session) {
    const { data: { user } } = await supabase.auth.getUser()
    verifiedUser = user
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    const user = session.user

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
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      // Use server-verified user for security
      if (!verifiedUser) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }

      // Check if user has creator role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_verified')
        .eq('id', verifiedUser.id)
        .single()

      if (profileError || !profile) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }

      const creatorRoles = ['artist', 'promoter', 'club_owner', 'admin']
      if (!creatorRoles.includes(profile.role)) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Check verification for non-admin roles
      if (profile.role !== 'admin' && !profile.is_verified) {
        return NextResponse.redirect(new URL('/verification-pending', request.url))
      }

      // Dashboard access granted
    } catch (error) {
      console.error('Dashboard middleware error:', error)
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
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