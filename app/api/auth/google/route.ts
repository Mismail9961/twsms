import { assertAuthReady, logAuthFailure } from '@/lib/auth/readiness'
import { randomBytes } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { getGoogleOAuthConfig, GOOGLE_OAUTH_COOKIE } from '@/lib/auth/google'

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('mode')
  const returnPath = mode === 'signup' ? '/signup' : '/login'
  const config = getGoogleOAuthConfig(request)

  if (!config) {
    return NextResponse.redirect(new URL(`${returnPath}?googleError=not_configured`, request.url))
  }

  // OAuth state is host-only. Start on the callback host before setting it.
  const callbackOrigin = new URL(config.redirectUri).origin
  if (callbackOrigin !== new URL(request.url).origin) {
    return NextResponse.redirect(new URL(`/api/auth/google?mode=${returnPath === '/signup' ? 'signup' : 'login'}`, callbackOrigin))
  }
  try { await assertAuthReady() } catch (error) {
    logAuthFailure('google-configuration', error)
    return NextResponse.redirect(new URL(`${returnPath}?googleError=unavailable`, request.url))
  }

  const state = randomBytes(32).toString('base64url')
  const nonce = randomBytes(32).toString('base64url')
  const cookieValue = Buffer.from(
    JSON.stringify({ mode: returnPath === '/signup' ? 'signup' : 'login', state, nonce })
  ).toString('base64url')

  const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authorizationUrl.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    nonce,
  }).toString()

  const response = NextResponse.redirect(authorizationUrl)
  response.cookies.set(GOOGLE_OAUTH_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/google',
    maxAge: 10 * 60,
  })

  return response
}
