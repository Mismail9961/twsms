'use server'

import { scheduleEmailDelivery } from '@/lib/email/dispatch'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createSession, destroySession, dashboardPathForRole, getSession } from '@/lib/auth/session'
import { isNeonConfigured, dbQuery, memoryDb } from '@/lib/db'
import { allowAuthRequest } from '@/lib/auth/rate-limit'
import { issueChallenge, requestReset, consumeChallenge } from '@/lib/auth/challenges'
import { emailQuery } from '@/lib/email/store'
import { assertAuthReady, logAuthFailure } from '@/lib/auth/readiness'
import type { Profile } from '@/lib/types'

const signupSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
})

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type AuthState =
  | {
    error?: string
    errors?: Record<string, string[]>
    success?: boolean
  }
  | undefined

export async function signUp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  try { await assertAuthReady() } catch (error) {
    logAuthFailure('configuration', error)
    return { error: 'Authentication is temporarily unavailable. Please contact support.' }
  }
  const data = {
    full_name: (formData.get('full_name') as string)?.trim(),
    email: (formData.get('email') as string)?.trim().toLowerCase(),
    password: formData.get('password') as string,
  }
  const confirmPassword = formData.get('confirmPassword') as string

  if (data.password !== confirmPassword) {
    return { errors: { confirmPassword: ['Passwords do not match'] } }
  }

  const result = signupSchema.safeParse(data)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  if (Buffer.byteLength(data.password, 'utf8') > 72) return { error: 'Password must be at most 72 UTF-8 bytes.' }
  const passwordHash = await bcrypt.hash(data.password, 12)

  let profile: Profile

  if (isNeonConfigured()) {
    try {
      // Check if email already exists
      const existing = await dbQuery<Profile>('SELECT id FROM profiles WHERE lower(email) = $1', [data.email])
      if (existing.length > 0) {
        return { error: 'An account with this email address already exists.' }
      }

      // Security requirement: Public signup must always create a Client account
      const rows = await dbQuery<Profile>(
        `INSERT INTO profiles (full_name, email, password_hash, role, account_status, email_verified_at, requires_email_verification)
         VALUES ($1, $2, $3, 'client', 'active', NULL, true)
         RETURNING id, full_name, email, role, account_status, created_at, updated_at`,
        [data.full_name, data.email, passwordHash]
      )
      profile = rows[0]
    } catch (error) {
      if ((error as { code?: string })?.code === '23505') return { error: 'An account with this email address already exists. Please sign in or reset your password.' }
      logAuthFailure('signup', error)
      return { error: 'Registration failed. Please try again.' }
    }
  } else {
    // Memory fallback mode
    const existing = memoryDb.profiles.find((p) => p.email.toLowerCase() === data.email)
    if (existing) {
      return { error: 'An account with this email address already exists.' }
    }

    const newProfile: Profile = {
      id: `client-${Date.now()}`,
      full_name: data.full_name,
      email: data.email,
      role: 'client', // Always client on public signup
      account_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    memoryDb.profiles.push(newProfile)
    memoryDb.passwords[data.email] = passwordHash
    profile = newProfile
  }

  if (isNeonConfigured()) {
    try { await issueChallenge(profile.id, 'verify') } catch { console.error('[Verification] Could not enqueue challenge') }
  }
  try { await createSession(profile) } catch (error) {
    logAuthFailure('signup-session', error)
    return { error: 'Your account was created, but sign-in could not be completed. Please sign in again.' }
  }
  scheduleEmailDelivery()
  redirect(isNeonConfigured() ? '/verify-email' : '/client')
}

export async function signIn(prevState: AuthState, formData: FormData): Promise<AuthState> {
  try { await assertAuthReady() } catch (error) {
    logAuthFailure('configuration', error)
    return { error: 'Authentication is temporarily unavailable. Please contact support.' }
  }
  const data = {
    email: (formData.get('email') as string)?.trim().toLowerCase(),
    password: formData.get('password') as string,
  }

  const result = loginSchema.safeParse(data)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  let profile: Profile | null = null
  let passwordHash = ''

  if (isNeonConfigured()) {
    try {
      const rows = await dbQuery<Profile & { password_hash: string }>(
        'SELECT id, full_name, email, password_hash, role, account_status, avatar_url, created_at, updated_at FROM profiles WHERE lower(email) = $1',
        [data.email]
      )
      if (rows.length > 0) {
        profile = rows[0]
        passwordHash = rows[0].password_hash
      }
    } catch (err) {
      logAuthFailure('signin-database', err)
      return { error: 'Unable to sign in right now. Please try again.' }
    }
  }

  if (!isNeonConfigured() && (!profile || !passwordHash)) {
    const found = memoryDb.profiles.find((p) => p.email.toLowerCase() === data.email)
    if (found) {
      profile = found
      passwordHash = memoryDb.passwords[data.email] || ''
    }
  }

  if (!profile || !passwordHash) {
    return { error: 'Invalid email or password' }
  }

  if (profile.account_status !== 'active') {
    return { error: 'This account has been deactivated or suspended. Please contact IT support.' }
  }

  const passwordMatch = await bcrypt.compare(data.password, passwordHash)
  if (!passwordMatch) {
    return { error: 'Invalid email or password' }
  }

  let requiresVerification = false
  try {
    if (isNeonConfigured()) {
      const [verification] = await emailQuery<{ requires_email_verification: boolean }>(
        'SELECT requires_email_verification FROM profiles WHERE id=$1', [profile.id]
      )
      requiresVerification = verification?.requires_email_verification ?? false
      try {
        await emailQuery(`WITH changed AS (UPDATE profiles SET last_login_notice_at=now() WHERE id=$1 AND (last_login_notice_at IS NULL OR last_login_notice_at<now()-interval '30 days') RETURNING id) INSERT INTO email_outbox(event_key,kind,recipient_id) SELECT 'login:'||id||':'||CURRENT_DATE,'login',id FROM changed ON CONFLICT DO NOTHING`, [profile.id])
      } catch { console.error('[Login notice] Could not enqueue') }
    }
    await createSession(profile)
  } catch {
    console.error('[Sign In] Authentication database setup or session creation failed. Check npm run db:check.')
    return { error: 'Sign-in is temporarily unavailable. Please try again later.' }
  }
  scheduleEmailDelivery()
  if (requiresVerification) redirect('/verify-email')

  const from = (formData.get('from') as string)?.trim()
  let destination = dashboardPathForRole(profile.role)

  if (from && from.startsWith('/') && !from.startsWith('//') && !from.includes('\\') && !/[\x00-\x1f]/.test(from) && !from.startsWith('/login') && !from.startsWith('/signup')) {
    const isAllowed =
      profile.role === 'admin' ||
      (profile.role === 'employee' && !from.startsWith('/admin')) ||
      (profile.role === 'client' && from.startsWith('/client'))

    if (isAllowed) {
      destination = from
    }
  }

  redirect(destination)
}

export async function signOut() {
  await destroySession()
  redirect('/login?logged_out=true')
}

export async function forgotPassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email) return { error: 'Email address is required' }

  try { if (await allowAuthRequest('reset-request', email)) await requestReset(email) } catch { console.error('[Password recovery] Request could not be queued') }
  scheduleEmailDelivery()
  return { success: true }
}

export async function resetPassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters long' }
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (Buffer.byteLength(password, 'utf8') > 72) return { error: 'Password must be at most 72 UTF-8 bytes.' }
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const token = String(formData.get('token') || '')
  try {
    if (!await allowAuthRequest('reset-consume', email)) return { error: 'Too many attempts. Try again later.' }
    if (!await consumeChallenge(email, token, 'reset', password)) return { error: 'This reset link is invalid or expired. Request a new link.' }
  } catch { return { error: 'Password reset is unavailable. Please try again.' } }
  await destroySession()
  redirect('/login?reset=success')
}

export async function verifyEmail(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const session = await getSession()
  if (!session) return { error: 'Please sign in again to verify your email.' }
  const email = session.email.trim().toLowerCase()
  try {
    if (!await allowAuthRequest('verify-consume', email)) return { error: 'Too many attempts. Try again later.' }
    if (!await consumeChallenge(email, String(formData.get('code') || '').trim(), 'verify')) return { error: 'Code invalid, expired, or too many attempts. Request a new code.' }
    return { success: true }
  } catch { return { error: 'Verification is unavailable. Please try again.' } }
}
export async function resendVerification(): Promise<AuthState> {
  const session = await getSession()
  if (!session) return { error: 'Please sign in again to resend your verification code.' }
  const email = session.email.trim().toLowerCase()
  try {
    if (!await allowAuthRequest('verify-request', email)) return { success: true }
    const rows = await emailQuery<{ id: string }>("SELECT id FROM profiles WHERE id=$1 AND requires_email_verification=true AND account_status='active'", [session.id])
    if (rows[0]) { await issueChallenge(rows[0].id, 'verify'); scheduleEmailDelivery() }
  } catch { console.error('[Verification] Resend could not be queued') }
  return { success: true }
}
