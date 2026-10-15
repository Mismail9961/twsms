import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { Profile, Role } from '@/lib/types'

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'technology-world-sms-jwt-secret-key-32-chars-minimum-prod-2026'
)

const COOKIE_NAME = 'twsms_session'

export interface SessionPayload {
  id: string
  email: string
  role: Role
  full_name: string
  avatar_url?: string
}

/**
 * Creates an encrypted JWT session cookie valid for 7 days
 */
export async function createSession(user: Profile) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })

  return token
}

/**
 * Retrieves and validates the current session from the HTTP-only cookie
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, SECRET_KEY)
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
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Ensures user is authenticated or returns null
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  return getSession()
}
