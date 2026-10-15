import { emailQuery } from '@/lib/email/store'
import { isNeonConfigured } from '@/lib/db'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'
import type { Profile, Role } from '@/lib/types'
import {
  SESSION_COOKIE,
  clearSessionCookieOptions,
  getSessionSecretKey,
  sessionCookieOptions,
} from '@/lib/auth/cookies'

export interface SessionPayload {
  id: string
  email: string
  role: Role
  full_name: string
  avatar_url?: string
}

export async function encodeSessionToken(user: Profile) {
  if (process.env.NODE_ENV === 'production' && !isNeonConfigured()) throw new Error('Persistent database required')
  const [record] = isNeonConfigured() ? await emailQuery<{ session_version: number }>('SELECT session_version FROM profiles WHERE id=$1', [user.id]) : []
  return new SignJWT({
    session_version: record?.session_version ?? 0,
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSessionSecretKey())
}

/**
 * Creates a signed JWT session cookie valid for 7 days
 */
export async function createSession(user: Profile) {
  const token = await encodeSessionToken(user)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions())
  return token
}

export function applySessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  return response
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', clearSessionCookieOptions())
  response.cookies.delete(SESSION_COOKIE)
  return response
}

/**
 * Retrieves and validates the current session from the HTTP-only cookie
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    if (process.env.NODE_ENV === 'production' && !isNeonConfigured()) return null
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token || token.trim().length === 0) return null

    const { payload } = await jwtVerify(token, getSessionSecretKey())
    if (isNeonConfigured()) {
      const [record] = await emailQuery<{ session_version: number; account_status: string; role: Role; email: string; full_name: string }>('SELECT session_version,account_status,role,email,full_name FROM profiles WHERE id=$1', [payload.id])
      if (!record || record.account_status !== 'active' || record.session_version !== (payload.session_version ?? 0)) return null
      payload.role = record.role; payload.email = record.email; payload.full_name = record.full_name
    }
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as Role,
      full_name: payload.full_name as string,
      avatar_url: payload.avatar_url as string | undefined,
    }
  } catch {
    return null
  }
}

/**
 * Removes the session cookie to log the user out
 */
export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, '', clearSessionCookieOptions())
  cookieStore.delete(SESSION_COOKIE)
}

/**
 * Ensures user is authenticated or returns null
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  return getSession()
}

export function dashboardPathForRole(role: string) {
  if (role === 'admin') return '/admin'
  if (role === 'employee') return '/employee'
  return '/client'
}
