import { getDbClient } from '@/lib/db'
// Security and delivery must never use the demo database or silently fall back to it.
export async function emailQuery<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const db = getDbClient()
  if (!db) throw new Error('Persistent database required')
  return await db.query(sql, params) as T[]
}
