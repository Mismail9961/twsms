import { isNeonConfigured, dbQuery } from '@/lib/db'
import { getSessionSecretKey } from './cookies'

// Check before creating accounts or starting OAuth, so a broken deployment cannot
// appear to accept a registration that it cannot subsequently authenticate.
export async function assertAuthReady() {
  getSessionSecretKey()
  if (!isNeonConfigured()) {
    if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL is required for production authentication')
    return
  }
  await dbQuery('SELECT session_version, requires_email_verification, email_verified_at, auth_provider FROM profiles LIMIT 0')
}

export function logAuthFailure(stage: string, error: unknown) {
  const code = (error as { code?: unknown })?.code
  // Provider errors can contain SQL parameters and credentials. Log only a safe code.
  console.error(`[Auth:${stage}] Failed. Check environment settings and npm run db:check.`,
    typeof code === 'string' && /^[A-Z0-9_]+$/.test(code) ? code : '')
}
