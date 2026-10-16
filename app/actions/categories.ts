'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { dbQuery, isNeonConfigured, memoryDb } from '@/lib/db'
import type { TicketCategory } from '@/lib/types'

export type CategoryState = { error?: string; success?: string } | undefined

function refreshCategories() {
  revalidatePath('/admin/categories')
  revalidatePath('/client/tickets/new')
}

export async function addCategory(_previous: CategoryState, form: FormData): Promise<CategoryState> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { error: 'Only administrators can manage categories.' }
  const name = String(form.get('name') || '').trim()
  const description = String(form.get('description') || '').trim()
  if (!name || name.length > 255) return { error: 'Enter a category name between 1 and 255 characters.' }
  if (description.length > 2000) return { error: 'Description must be 2,000 characters or fewer.' }
  try {
    if (isNeonConfigured()) {
      const existing = await dbQuery<TicketCategory>('SELECT * FROM ticket_categories WHERE lower(name) = lower($1)', [name])
      if (existing.some(category => category.is_active)) return { error: 'An active category with this name already exists.' }
      if (existing[0]) {
        await dbQuery('UPDATE ticket_categories SET name=$1, description=$2, is_active=true WHERE id=$3', [name, description, existing[0].id])
      } else {
        await dbQuery('INSERT INTO ticket_categories(name,description,is_active) VALUES($1,$2,true)', [name, description])
      }
    } else {
      const existing = memoryDb.categories.find(category => category.name.toLowerCase() === name.toLowerCase())
      if (existing?.is_active) return { error: 'An active category with this name already exists.' }
      if (existing) Object.assign(existing, { name, description, is_active: true })
      else memoryDb.categories.push({ id: randomUUID(), name, description, is_active: true, created_at: new Date().toISOString() })
    }
  } catch {
    return { error: 'The category could not be added. Please try again.' }
  }
  refreshCategories()
  return { success: 'Category added. Clients can now select it when creating a ticket.' }
}

export async function deleteCategory(_previous: CategoryState, form: FormData): Promise<CategoryState> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { error: 'Only administrators can manage categories.' }
  const id = String(form.get('category_id') || '')
  if (!id) return { error: 'Choose a category to delete.' }
  try {
    // Keep the reference and label on historical tickets; hide from new requests.
    if (isNeonConfigured()) await dbQuery('UPDATE ticket_categories SET is_active=false WHERE id=$1', [id])
    else {
      const category = memoryDb.categories.find(category => category.id === id)
      if (category) category.is_active = false
    }
  } catch {
    return { error: 'The category could not be deleted. Please try again.' }
  }
  refreshCategories()
  return { success: 'Category removed from new tickets.' }
}
