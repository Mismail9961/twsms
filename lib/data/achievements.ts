import { dbQueryRequired, isNeonConfigured, memoryDb } from '@/lib/db'
import type { Achievement } from './achievement-defaults'

export async function getAchievements(): Promise<Achievement[]> {
  if (!isNeonConfigured() && process.env.NODE_ENV !== 'production') {
    return [...memoryDb.achievements].sort((a, b) => a.slot - b.slot)
  }
  return dbQueryRequired<Achievement>(
    "SELECT slot, to_char(achievement_date, 'YYYY-MM-DD') AS date, category, title, description FROM achievements ORDER BY slot"
  )
}
