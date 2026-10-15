import { after } from 'next/server'
import { emailConfigurationIssues } from './config.mjs'
import { runEmailWorker } from './worker'

// Jobs already live in Postgres. Request-bound background work makes first delivery automatic;
// the scheduled worker still handles backoff, unread chat reminders and interrupted requests.
export function scheduleEmailDelivery() {
  if (emailConfigurationIssues().length) return
  try {
    after(async () => {
      try { await runEmailWorker() }
      catch { console.error('[Email] Background delivery unavailable; jobs remain in the durable queue.') }
    })
  } catch {
    console.error('[Email] Could not schedule delivery; jobs remain in the durable queue.')
  }
}
