export const SESSION_COOKIE = 'twsms_session'
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60

const DEV_FALLBACK_SECRET =
  'technology-world-sms-jwt-secret-key-32-chars-minimum-prod-2026'

export function getSessionSecretKey() {
  const secret = process.env.SESSION_SECRET?.trim()
  return new TextEncoder().encode(secret && secret.length >= 32 ? secret : DEV_FALLBACK_SECRET)
}

export function sessionCookieOptions(maxAge: number = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function clearSessionCookieOptions() {
  return {
    ...sessionCookieOptions(0),
    maxAge: 0,
    expires: new Date(0),
  }
}
