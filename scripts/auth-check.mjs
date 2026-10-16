import nextEnv from '@next/env'
import { fileURLToPath } from 'node:url'
import { emailConfigurationIssues } from '../lib/email/config.mjs'

nextEnv.loadEnvConfig(fileURLToPath(new URL('../', import.meta.url)), false)
const issues = emailConfigurationIssues({ ...process.env, NODE_ENV: 'production' })
if (!process.env.SESSION_SECRET?.trim() || process.env.SESSION_SECRET.trim().length < 32) issues.push('SESSION_SECRET must contain at least 32 characters')
if (!process.env.GOOGLE_CLIENT_ID?.trim() || !process.env.GOOGLE_CLIENT_SECRET?.trim()) {
  console.log('Google sign-in is disabled: configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.')
} else {
  try {
    const callback = new URL(process.env.GOOGLE_REDIRECT_URI?.trim() || '/api/auth/google/callback', process.env.APP_BASE_URL)
    if (callback.protocol !== 'https:' || callback.pathname !== '/api/auth/google/callback' || callback.search || callback.hash || callback.username || callback.password) throw new Error()
    console.log('Google callback URL is valid. Register its exact value in Google Cloud Console.')
  } catch { issues.push('Google callback requires a valid HTTPS APP_BASE_URL or GOOGLE_REDIRECT_URI') }
}
for (const issue of issues) console.error(issue)
if (issues.length) process.exitCode = 1
else console.log('Production authentication settings verified. Run npm run db:check to verify the database.')
