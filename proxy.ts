import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import {
  SESSION_COOKIE,
  clearSessionCookieOptions,
  getSessionSecretKey,
} from '@/lib/auth/cookies'

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/unauthorized']

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

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  if (pathname === '/') {
    if (!sessionUser) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      return tokenInvalid ? clearInvalidSession(response) : response
    }
    return NextResponse.redirect(new URL(dashboardPath(sessionUser.role), request.url))
  }

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

  if (sessionUser && isPublicRoute && pathname !== '/unauthorized') {
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
