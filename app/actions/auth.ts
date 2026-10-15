'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createSession, destroySession } from '@/lib/auth/session'
import { isNeonConfigured, dbQuery, memoryDb } from '@/lib/db'
import type { Profile } from '@/lib/types'

const signupSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
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

  const passwordHash = await bcrypt.hash(data.password, 10)

  let profile: Profile

  if (isNeonConfigured()) {
    try {
      // Check if email already exists
      const existing = await dbQuery<Profile>('SELECT id FROM profiles WHERE email = $1', [data.email])
      if (existing.length > 0) {
        return { error: 'An account with this email address already exists.' }
      }

      // Security requirement: Public signup must always create a Client account
      const rows = await dbQuery<Profile>(
        `INSERT INTO profiles (full_name, email, password_hash, role, account_status)
         VALUES ($1, $2, $3, 'client', 'active')
         RETURNING id, full_name, email, role, account_status, created_at, updated_at`,
        [data.full_name, data.email, passwordHash]
      )
      profile = rows[0]
    } catch (err) {
      console.error('[Sign Up Error]:', err)
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

  await createSession(profile)
  redirect('/client')
}

export async function signIn(prevState: AuthState, formData: FormData): Promise<AuthState> {
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
        'SELECT id, full_name, email, password_hash, role, account_status, avatar_url, created_at, updated_at FROM profiles WHERE email = $1',
        [data.email]
      )
      if (rows.length > 0) {
        profile = rows[0]
        passwordHash = rows[0].password_hash
      }
    } catch (err) {
      console.warn('[Sign In DB Error, trying fallback]:', err)
    }
  }

  // Fallback if not found in Neon or during offline mode
  if (!profile || !passwordHash) {
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

  await createSession(profile)

  if (profile.role === 'admin') {
    redirect('/admin')
  } else if (profile.role === 'employee') {
    redirect('/employee')
  } else {
    redirect('/client')
  }
}

export async function signOut() {
  await destroySession()
  redirect('/login')
}

export async function forgotPassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email) return { error: 'Email address is required' }

  // Record audit or trigger email notification
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

  redirect('/login?reset=success')
}
