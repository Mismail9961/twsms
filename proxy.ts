import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { emailQuery } from '@/lib/email/store'
import { isNeonConfigured } from '@/lib/db'
import { jwtVerify } from 'jose'
import {
  SESSION_COOKIE,
  clearSessionCookieOptions,
  getSessionSecretKey,
} from '@/lib/auth/cookies'

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password']
const PUBLIC_ROUTES = [
  ...AUTH_ROUTES,
  '/verify-email',
  '/unauthorized',
  '/contact',
  '/contact-us',
  '/privacy',
  '/terms',
]

function dashboardPath(role: string) {
  if (role === 'admin') return '/admin'
  if (role === 'employee') return '/employee'
  return '/client'
}

function clearInvalidSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', clearSessionCookieOptions())
  response.cookies.delete(SESSION_COOKIE)
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const rawToken = request.cookies.get(SESSION_COOKIE)?.value
  const token = rawToken?.trim()
  let sessionUser: { id: string; role: string; email: string } | null = null
  let tokenInvalid = false

  if (token && token.length > 0) {
    try {
      const { payload } = await jwtVerify(token, getSessionSecretKey())
      if (isNeonConfigured()) {
        const [record] = await emailQuery<{ session_version: number; account_status: string; role: string }>('SELECT session_version,account_status,role FROM profiles WHERE id=$1', [payload.id])
        if (!record || record.account_status !== 'active' || record.session_version !== (payload.session_version ?? 0)) throw new Error('Invalid session')
        payload.role = record.role
      }
      sessionUser = {
        id: payload.id as string,
        role: payload.role as string,
        email: payload.email as string,
      }
    } catch {
      sessionUser = null
      tokenInvalid = true
    }
  } else if (rawToken !== undefined) {
    tokenInvalid = true
  }

  // Alias /contact-us to /contact
  if (pathname === '/contact-us') {
    return NextResponse.redirect(new URL('/contact', request.url))
  }

  // Public pages accessible to everyone without auth or authorization
  if (pathname === '/' || pathname.startsWith('/contact')) {
    const response = NextResponse.next()
    return tokenInvalid ? clearInvalidSession(response) : response
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  if (!sessionUser && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    if (pathname !== '/login') {
      loginUrl.searchParams.set('from', pathname)
    }
    if (tokenInvalid) {
      loginUrl.searchParams.set('expired', 'true')
    }
    const response = NextResponse.redirect(loginUrl)
    return tokenInvalid ? clearInvalidSession(response) : response
  }

  // Logged-in users navigating to login/signup/reset are redirected to their dashboard
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))
  if (sessionUser && isAuthRoute && pathname !== '/reset-password') {
    return NextResponse.redirect(new URL(dashboardPath(sessionUser.role), request.url))
  }

  if (sessionUser) {
    if (pathname.startsWith('/admin') && sessionUser.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (pathname.startsWith('/employee') && sessionUser.role !== 'employee' && sessionUser.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (pathname.startsWith('/client') && sessionUser.role !== 'client') {
      return NextResponse.redirect(new URL(dashboardPath(sessionUser.role), request.url))
    }
  }

  const response = NextResponse.next()
  return tokenInvalid ? clearInvalidSession(response) : response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
