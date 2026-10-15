import { neon } from '@neondatabase/serverless'
import { memoryDb } from './memory-db'

export function isNeonConfigured(): boolean {
  const url = process.env.DATABASE_URL
  return Boolean(url && url.trim().length > 0 && !url.includes('placeholder'))
}

export function getDbClient() {
  const url = process.env.DATABASE_URL
  if (!isNeonConfigured()) {
    return null
  }
  return neon(url!)
}

/**
 * Execute a SQL query either against Neon Postgres or fallback memory DB
 */
export async function dbQuery<T = unknown>(queryText: string, params: unknown[] = []): Promise<T[]> {
  if (isNeonConfigured()) {
    // Retry up to 3 times to handle serverless cold starts and intermittent network latency
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const sql = neon(process.env.DATABASE_URL!)
        const client = sql as unknown as {
          query: (q: string, p: unknown[]) => Promise<{ rows?: T[] } | T[]>
        }
        const result = await client.query(queryText, params)
        if (Array.isArray(result)) return result as T[]
        return (result?.rows || []) as T[]
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string }
        // If it's a database constraint violation or syntax error, do not retry or fallback — throw directly
        if (error?.code && error.code.length === 5) {
          throw err
        }
        if (attempt === 3) {
          console.warn('[Neon DB Connection Unavailable - Falling back to store]:', error?.message || err)
        } else {
          await new Promise((r) => setTimeout(r, 600))
        }
      }
    }
  }

  // Fallback to high-fidelity memory/file store
  return memoryDb.query<T>(queryText, params)
}

export async function dbQueryRequired<T = unknown>(
  queryText: string,
  params: unknown[] = []
): Promise<T[]> {
  if (!isNeonConfigured()) {
    return memoryDb.query<T>(queryText, params)
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const sql = neon(process.env.DATABASE_URL!)
      const client = sql as unknown as {
        query: (query: string, values: unknown[]) => Promise<{ rows?: T[] } | T[]>
      }
      const result = await client.query(queryText, params)
      if (Array.isArray(result)) return result as T[]
      return (result?.rows || []) as T[]
    } catch (err: unknown) {
      const error = err as { code?: string }
      if (error?.code && error.code.length === 5) {
        throw err
      }
      if (attempt === 3) {
        throw err
      }
      await new Promise((resolve) => setTimeout(resolve, 600))
    }
  }

  throw new Error('The database query could not be completed.')
}

export { memoryDb }
