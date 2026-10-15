import { setTimeout } from 'node:timers/promises'
import { loadEmailEnv, emailConfigurationIssues } from './email-config.mjs'

loadEmailEnv()
const issues = emailConfigurationIssues()
if (issues.length) {
  for (const issue of issues) console.error(issue)
  process.exitCode = 1
} else {
  const stop = new AbortController()
  process.once('SIGINT', () => stop.abort())
  process.once('SIGTERM', () => stop.abort())
  do {
    try {
      const response = await fetch(new URL('/api/internal/email', process.env.APP_BASE_URL), {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.EMAIL_WORKER_SECRET}` },
        signal: AbortSignal.any([stop.signal, AbortSignal.timeout(65000)]),
        redirect: 'error',
      })
      if (!response.ok) {
        console.error(`Email worker returned HTTP ${response.status}. Confirm the app is running and has been restarted after environment changes.`)
        if (!process.argv.includes('--watch')) process.exitCode = 1
      } else {
        const result = await response.json()
        console.log(`Email worker processed ${Number(result.processed) || 0} job(s). Inspect /admin/email for delivery status.`)
      }
    } catch {
      if (!stop.signal.aborted) console.error('Email worker request failed. Check APP_BASE_URL and make sure the app is running.')
      if (!process.argv.includes('--watch') && !stop.signal.aborted) process.exitCode = 1
    }
    if (!process.argv.includes('--watch') || stop.signal.aborted) break
    await setTimeout(60000, undefined, { signal: stop.signal }).catch(() => {})
  } while (!stop.signal.aborted)
}
