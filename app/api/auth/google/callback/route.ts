import { randomBytes, randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { NextResponse, type NextRequest } from 'next/server'
import { createSession } from '@/lib/auth/session'
import { getGoogleOAuthConfig, GOOGLE_OAUTH_COOKIE } from '@/lib/auth/google'
import { dbQuery, isNeonConfigured, memoryDb } from '@/lib/db'
import type { Profile } from '@/lib/types'

const googleJwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

type OAuthState = {
  mode: 'login' | 'signup'
  state: string
  nonce: string
}

type GoogleTokenResponse = {
  id_token?: string
}

type GoogleProfile = {
  sub: string
  email: string
  email_verified: boolean
  name?: string
  picture?: string
}

function redirectWithError(request: NextRequest, mode: 'login' | 'signup', error: string) {
  return NextResponse.redirect(new URL(`/${mode}?googleError=${error}`, request.url))
}

function clearOAuthCookie(response: NextResponse) {
  response.cookies.set(GOOGLE_OAUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/google',
    maxAge: 0,
  })
  return response
}

async function getOrCreateProfile(googleProfile: GoogleProfile): Promise<Profile> {
  const email = googleProfile.email.trim().toLowerCase()

  if (isNeonConfigured()) {
    const matchingProfiles = await dbQuery<Profile>(
      `SELECT id, full_name, email, role, account_status, avatar_url, created_at, updated_at
       FROM profiles WHERE email = $1 LIMIT 1`,
      [email]
    )
    if (matchingProfiles[0]) return matchingProfiles[0]

    const passwordHash = await bcrypt.hash(randomBytes(32).toString('base64url'), 10)
    const createdProfiles = await dbQuery<Profile>(
      `INSERT INTO profiles (full_name, email, password_hash, role, account_status, avatar_url)
       VALUES ($1, $2, $3, 'client', 'active', $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, full_name, email, role, account_status, avatar_url, created_at, updated_at`,
      [googleProfile.name?.trim() || email, email, passwordHash, googleProfile.picture || null]
    )
    if (createdProfiles[0]) return createdProfiles[0]

    const concurrentProfile = await dbQuery<Profile>(
      `SELECT id, full_name, email, role, account_status, avatar_url, created_at, updated_at
       FROM profiles WHERE email = $1 LIMIT 1`,
      [email]
    )
    if (concurrentProfile[0]) return concurrentProfile[0]
    throw new Error('Google profile could not be saved')
  }

  const existingProfile = memoryDb.profiles.find(
    (profile) => profile.email.toLowerCase() === email
  )
  if (existingProfile) return existingProfile

  const now = new Date().toISOString()
  const profile: Profile = {
    id: randomUUID(),
    full_name: googleProfile.name?.trim() || email,
    email,
    avatar_url: googleProfile.picture,
    role: 'client',
    account_status: 'active',
    created_at: now,
    updated_at: now,
  }
  const passwordHash = await bcrypt.hash(randomBytes(32).toString('base64url'), 10)
  const concurrentProfile = memoryDb.profiles.find(
    (candidate) => candidate.email.toLowerCase() === email
  )
  if (concurrentProfile) return concurrentProfile

  memoryDb.profiles.push(profile)
  memoryDb.passwords[email] = passwordHash
  return profile
}

export async function GET(request: NextRequest) {
  const config = getGoogleOAuthConfig(request.url)
  const rawState = request.cookies.get(GOOGLE_OAUTH_COOKIE)?.value
  let oauthState: OAuthState | undefined

  try {
    if (rawState) {
      oauthState = JSON.parse(Buffer.from(rawState, 'base64url').toString('utf8')) as OAuthState
    }
  } catch {
    oauthState = undefined
  }

  const mode = oauthState?.mode === 'signup' ? 'signup' : 'login'
  const response = (error: string) =>
    clearOAuthCookie(redirectWithError(request, mode, error))

  if (!config) return response('not_configured')

  const returnedState = request.nextUrl.searchParams.get('state')
  if (!oauthState || !returnedState || returnedState !== oauthState.state) {
    return response('invalid_state')
  }

  if (request.nextUrl.searchParams.has('error')) {
    return response('cancelled')
  }

  const code = request.nextUrl.searchParams.get('code')
  if (!code) return response('failed')

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      }),
      cache: 'no-store',
    })

    if (!tokenResponse.ok) {
      throw new Error(`Google token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse
    if (!tokenData.id_token) throw new Error('Google did not return an ID token')

    const { payload } = await jwtVerify(tokenData.id_token, googleJwks, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: config.clientId,
    })
    const googleProfile = payload as typeof payload & GoogleProfile

    if (
      !googleProfile.sub ||
      !googleProfile.email ||
      googleProfile.email_verified !== true ||
      googleProfile.nonce !== oauthState.nonce
    ) {
      throw new Error('Google ID token claims were invalid')
    }

    const profile = await getOrCreateProfile(googleProfile)
    if (profile.account_status !== 'active') {
      return response('inactive_account')
    }

    await createSession(profile)
    const destination =
      profile.role === 'admin'
        ? '/admin'
        : profile.role === 'employee'
          ? '/employee'
          : '/client'

    return clearOAuthCookie(NextResponse.redirect(new URL(destination, request.url)))
  } catch (error) {
    console.error('[Google Sign In Error]:', error)
    return response('failed')
  }
}
