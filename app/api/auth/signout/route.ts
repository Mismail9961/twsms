import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth/session'

function logoutRedirect(request: Request) {
  const response = NextResponse.redirect(new URL('/login?logged_out=true', request.url), 303)
  return clearSessionCookie(response)
}

export async function POST(request: Request) {
  return logoutRedirect(request)
}

export async function GET(request: Request) {
  return logoutRedirect(request)
}
