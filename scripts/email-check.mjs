import { neon } from '@neondatabase/serverless'
import { setDefaultResultOrder } from 'node:dns'
import { loadEmailEnv, emailConfigurationIssues } from './email-config.mjs'

loadEmailEnv()
const issues = emailConfigurationIssues()
for (const issue of issues) console.error(issue)
console.log(issues.length ? 'Email delivery is not ready.' : 'Local email configuration is complete. SMTP authentication and the worker must also be operational.')
if (issues.length) process.exitCode = 1
if (process.argv.includes('--queue') && process.env.DATABASE_URL) {
  try {
    setDefaultResultOrder('ipv4first')
    const sql = neon(process.env.DATABASE_URL, { fetchOptions: { signal: AbortSignal.timeout(15000) } })
    const rows = await sql.query('SELECT kind,status,last_error,count(*)::int AS count FROM email_outbox GROUP BY kind,status,last_error ORDER BY kind,status')
    console.log('Queue summary (no recipients, message contents, or tokens):')
    for (const row of rows) console.log(JSON.stringify(row))
  } catch { console.error('Queue inspection failed. Check database connectivity and npm run db:check.'); process.exitCode = 1 }
}
