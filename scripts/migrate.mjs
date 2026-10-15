import nextEnv from '@next/env'
import { neon } from '@neondatabase/serverless'
import { setDefaultResultOrder } from 'node:dns'
import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { applyMigration, schemaCheckSql } from '../lib/db/migrations.mjs'

async function main() {
  const root = fileURLToPath(new URL('../', import.meta.url))
  nextEnv.loadEnvConfig(root, process.env.NODE_ENV !== 'production')
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
  setDefaultResultOrder('ipv4first')
  const sql = neon(process.env.DATABASE_URL, { fetchOptions: { signal: AbortSignal.timeout(60000) } })
  if (!process.argv.includes('--check')) {
    const directory = new URL('../db/migrations/', import.meta.url)
    const files = (await readdir(directory)).filter(name => /^\d+.*\.sql$/.test(name)).sort()
    for (const name of files) {
      const source = await readFile(new URL(name, directory), 'utf8')
      console.log(`${name}: ${await applyMigration(sql, name, source)}`)
    }
  }
  const checks = await sql.query(schemaCheckSql)
  const missing = checks.filter(row => !row.present)
  if (missing.length) {
    for (const row of missing) console.error(`Missing ${row.kind}: ${row.name}`)
    process.exitCode = 1
  } else console.log(`Database schema verified (${checks.length} checks).`)
}
main().catch(error => {
  const code = error?.code || error?.cause?.code
  // Never print connection strings, credentials, SQL parameters or raw provider errors.
  console.error('Database migration/check failed.', /^[A-Z0-9_]+$/.test(code || '') ? `Code: ${code}` : '')
  process.exitCode = 1
})
