'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { dbQueryRequired, isNeonConfigured, memoryDb } from '@/lib/db'
import { MAX_ACHIEVEMENTS } from '@/lib/data/achievement-defaults'

export type AchievementState = { error?: string; success?: string } | undefined

function fields(form: FormData) {
  const date = String(form.get('date') || '').trim()
  const category = String(form.get('category') || '').trim()
  const title = String(form.get('title') || '').trim()
  const description = String(form.get('description') || '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
    return { error: 'Enter a valid achievement date.' } as const
  }
  if (!category || category.length > 80) return { error: 'Category must be between 1 and 80 characters.' } as const
  if (!title || title.length > 200) return { error: 'Title must be between 1 and 200 characters.' } as const
  if (!description || description.length > 2000) return { error: 'Description must be between 1 and 2,000 characters.' } as const
  return { date, category, title, description }
}

function refresh() {
  revalidatePath('/')
  revalidatePath('/admin/achievements')
}

export async function saveAchievement(_previous: AchievementState, form: FormData): Promise<AchievementState> {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'Only administrators can manage achievements.' }
  const values = fields(form)
  if ('error' in values) return { error: values.error }
  const rawSlot = String(form.get('slot') || '')
  const slot = rawSlot ? Number(rawSlot) : null
  if (slot !== null && (!Number.isInteger(slot) || slot < 1 || slot > MAX_ACHIEVEMENTS)) return { error: 'Choose a valid achievement.' }
  try {
    if (isNeonConfigured() || process.env.NODE_ENV === 'production') {
      const params = [values.date, values.category, values.title, values.description]
      const rows = slot !== null
        ? await dbQueryRequired<{ slot: number }>('UPDATE achievements SET achievement_date=$1, category=$2, title=$3, description=$4 WHERE slot=$5 RETURNING slot', [...params, slot])
        : await dbQueryRequired<{ slot: number }>(`INSERT INTO achievements (slot, achievement_date, category, title, description)
            SELECT available.slot, $1::date, $2, $3, $4 FROM generate_series(1, 5) AS available(slot)
            WHERE NOT EXISTS (SELECT 1 FROM achievements a WHERE a.slot=available.slot)
            ORDER BY available.slot LIMIT 1 ON CONFLICT (slot) DO NOTHING RETURNING slot`, params)
      if (!rows.length) return { error: slot !== null ? 'This achievement no longer exists. Refresh and try again.' : 'Up to five achievements can be published. Delete one first, or refresh if another administrator just made a change.' }
    } else {
      if (slot !== null) {
        const achievement = memoryDb.achievements.find(item => item.slot === slot)
        if (!achievement) return { error: 'This achievement no longer exists. Refresh and try again.' }
        Object.assign(achievement, values)
      } else {
        const available = Array.from({ length: MAX_ACHIEVEMENTS }, (_, i) => i + 1).find(candidate => !memoryDb.achievements.some(item => item.slot === candidate))
        if (!available) return { error: 'Up to five achievements can be published. Delete one first.' }
        memoryDb.achievements.push({ slot: available, ...values })
      }
    }
  } catch {
    return { error: 'The achievement could not be saved. Please try again.' }
  }
  refresh()
  return { success: slot !== null ? 'Achievement updated.' : 'Achievement published.' }
}

export async function deleteAchievement(_previous: AchievementState, form: FormData): Promise<AchievementState> {
  const session = await getSession()
  if (session?.role !== 'admin') return { error: 'Only administrators can manage achievements.' }
  const slot = Number(form.get('slot'))
  if (!Number.isInteger(slot) || slot < 1 || slot > MAX_ACHIEVEMENTS) return { error: 'Choose a valid achievement.' }
  try {
    if (isNeonConfigured() || process.env.NODE_ENV === 'production') {
      await dbQueryRequired('DELETE FROM achievements WHERE slot=$1', [slot])
    } else {
      memoryDb.achievements = memoryDb.achievements.filter(item => item.slot !== slot)
    }
  } catch {
    return { error: 'The achievement could not be deleted. Please try again.' }
  }
  refresh()
  return { success: 'Achievement deleted.' }
}
