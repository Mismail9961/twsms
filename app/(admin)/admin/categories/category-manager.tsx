'use client'

import { useActionState, useState } from 'react'
import { Loader2, Plus, Tag, Trash2 } from 'lucide-react'
import { addCategory, deleteCategory } from '@/app/actions/categories'
import type { TicketCategory } from '@/lib/types'

function CategoryCard({ category }: { category: TicketCategory }) {
  const [confirming, setConfirming] = useState(false)
  const [state, action, pending] = useActionState(deleteCategory, undefined)
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-xl bg-[#2c2772]/5 p-2.5 text-[#2c2772]"><Tag className="h-4 w-4" /></span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Active</span>
      </div>
      <h3 className="break-words font-semibold text-slate-900">{category.name}</h3>
      <p className="mt-1 flex-1 break-words text-sm text-slate-500">{category.description || 'No description added.'}</p>
      <form action={action} className="mt-5 border-t border-slate-100 pt-3">
        <input type="hidden" name="category_id" value={category.id} />
        {confirming ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">Remove from new tickets? Existing tickets will keep this category.</p>
            <div className="flex gap-3">
              <button type="submit" disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Confirm delete</button>
              <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="px-2 text-xs font-medium text-slate-600">Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} aria-label={`Delete ${category.name}`} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />Delete category</button>
        )}
        {state?.error && <p role="alert" className="mt-2 text-xs text-red-700">{state.error}</p>}
      </form>
    </article>
  )
}

export function CategoryManager({ categories }: { categories: TicketCategory[] }) {
  const [state, action, pending] = useActionState(addCategory, undefined)
  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h3 className="font-semibold text-slate-900">Add a category</h3>
          <p className="mt-1 text-sm text-slate-500">Active categories appear in the client’s new-ticket form.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-slate-700">Category name <span className="text-red-500">*</span>
            <input name="name" required maxLength={255} disabled={pending} placeholder="e.g. Network & connectivity" className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#2c2772]/20" />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span>
            <input name="description" maxLength={2000} disabled={pending} placeholder="What kinds of requests belong here?" className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#2c2772]/20" />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-[#2c2772] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#231f5c] disabled:opacity-50">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Add category</button>
          {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
          {state?.success && <p role="status" className="text-sm text-emerald-700">{state.success}</p>}
        </div>
      </form>
      <p className="text-sm font-medium text-slate-600">{categories.length} active {categories.length === 1 ? 'category' : 'categories'}</p>
      {categories.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map(category => <CategoryCard key={category.id} category={category} />)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No categories yet. Add your first category above.</div>
      )}
    </div>
  )
}
