import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'technology-world-sms-jwt-secret-key-32-chars-minimum-prod-2026'
)

const COOKIE_NAME = 'twsms_session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore static assets and Next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Extract session token
  const token = request.cookies.get(COOKIE_NAME)?.value
  let sessionUser: { id: string; role: string; email: string } | null = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY)
      sessionUser = {
        id: payload.id as string,
        role: payload.role as string,
        email: payload.email as string,
      }
    } catch {
      sessionUser = null
    }
  }

  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/unauthorized']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Root path redirect
  if (pathname === '/') {
    if (!sessionUser) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (sessionUser.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (sessionUser.role === 'employee') {
      return NextResponse.redirect(new URL('/employee', request.url))
    }
    return NextResponse.redirect(new URL('/client', request.url))
  }

  // Protected routes require authentication
  if (!sessionUser && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Logged-in users navigating to login/signup are redirected to their dashboard
  if (sessionUser && isPublicRoute && pathname !== '/unauthorized') {
    if (sessionUser.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (sessionUser.role === 'employee') {
      return NextResponse.redirect(new URL('/employee', request.url))
    }
    return NextResponse.redirect(new URL('/client', request.url))
  }

  // Role-based access boundaries
  if (sessionUser) {
    if (pathname.startsWith('/admin') && sessionUser.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (pathname.startsWith('/employee') && sessionUser.role !== 'employee' && sessionUser.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (pathname.startsWith('/client') && sessionUser.role !== 'client') {
      if (sessionUser.role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
      if (sessionUser.role === 'employee') return NextResponse.redirect(new URL('/employee', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
