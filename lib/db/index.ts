import { neon, neonConfig } from '@neondatabase/serverless'
import https from 'node:https'
import { memoryDb } from './memory-db'

if (typeof process !== 'undefined' && process.versions?.node) {
  neonConfig.fetchFunction = (url: string, options: Record<string, unknown> = {}) => {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url)
      const req = https.request(
        parsed,
        {
          method: (options.method as string) || 'POST',
          headers: (options.headers as Record<string, string>) || {},
          family: 4,
          timeout: 10000,
        },
        (res) => {
          const chunks: Buffer[] = []
          res.on('data', (chunk) => chunks.push(chunk))
          res.on('end', () => {
            const body = Buffer.concat(chunks).toString('utf8')
            resolve({
              ok: (res.statusCode ?? 500) >= 200 && (res.statusCode ?? 500) < 300,
              status: res.statusCode ?? 500,
              statusText: res.statusMessage ?? '',
              headers: new Headers(res.headers as Record<string, string>),
              text: async () => body,
              json: async () => JSON.parse(body),
              arrayBuffer: async () => Buffer.concat(chunks).buffer,
            } as unknown as Response)
          })
        }
      )
      req.on('timeout', () => {
        req.destroy(new Error('Database request timed out'))
      })
      req.on('error', reject)
      if (options.body) {
        req.write(options.body as string | Buffer)
      }
      req.end()
    })
  }
}

let neonClient: ReturnType<typeof neon> | null = null

export function isNeonConfigured(): boolean {
  const url = process.env.DATABASE_URL
  return Boolean(url && url.trim().length > 0 && !url.includes('placeholder'))
}

export function getDbClient() {
  if (!isNeonConfigured()) {
    return null
  }
  if (!neonClient) {
    neonClient = neon(process.env.DATABASE_URL!)
  }
  return neonClient
}

async function queryNeon<T>(queryText: string, params: unknown[]): Promise<T[]> {
  const sql = getDbClient()
  if (!sql) {
    throw new Error('Database is not configured.')
  }

  let lastError: unknown
  // Retrying an ambiguous INSERT could create a second business record and notification.
  const maxAttempts = /^\s*SELECT\b/i.test(queryText) ? 2 : 1
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const rows = await sql.query(queryText, params)
      return (Array.isArray(rows) ? rows : []) as T[]
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error?.code && /^[0-9A-Z]{5}$/.test(error.code)) {
        throw err
      }
      lastError = err
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
    }
  }

  throw lastError
}

/**
 * Execute a SQL query either against Neon Postgres or the in-memory store.
 * When DATABASE_URL is set, queries run against Neon and failures never fall back to demo data.
 */
export async function dbQuery<T = unknown>(queryText: string, params: unknown[] = []): Promise<T[]> {
  if (isNeonConfigured()) {
    try {
      return await queryNeon<T>(queryText, params)
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error?.code && /^[0-9A-Z]{5}$/.test(error.code)) {
        throw err
      }
      throw err
    }
  }

  if (process.env.NODE_ENV === 'production') throw new Error('Database is not configured')
  return memoryDb.query<T>(queryText, params)
}

export async function dbQueryRequired<T = unknown>(
  queryText: string,
  params: unknown[] = []
): Promise<T[]> {
  if (!isNeonConfigured()) {
    if (process.env.NODE_ENV === 'production') throw new Error('Database is not configured')
    return memoryDb.query<T>(queryText, params)
  }

  return queryNeon<T>(queryText, params)
}

export { memoryDb }
