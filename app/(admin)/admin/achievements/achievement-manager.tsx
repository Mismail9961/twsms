'use client'

import { useActionState, useState } from 'react'
import { saveAchievement, deleteAchievement } from '@/app/actions/achievements'
import { MAX_ACHIEVEMENTS, type Achievement } from '@/lib/data/achievement-defaults'

const inputClass = 'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#2c2772]/30 disabled:opacity-50'
const buttonClass = 'min-h-11 rounded-lg bg-[#2c2772] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2c2772]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c2772] disabled:opacity-50'

function AchievementForm({ achievement, disabled = false }: { achievement?: Achievement; disabled?: boolean }) {
  const [state, action, pending] = useActionState(saveAchievement, undefined)
  return (
    <form action={action} className="space-y-4">
      {achievement && <input type="hidden" name="slot" value={achievement.slot} />}
      <fieldset disabled={disabled || pending} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Date
          <input className={inputClass} type="date" name="date" required defaultValue={achievement?.date} />
        </label>
        <label className="text-sm font-medium text-slate-700">Category
          <input className={inputClass} name="category" required maxLength={80} defaultValue={achievement?.category} placeholder="e.g. Security" />
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Title
          <input className={inputClass} name="title" required maxLength={200} defaultValue={achievement?.title} />
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Description
          <textarea className={inputClass} name="description" required maxLength={2000} rows={3} defaultValue={achievement?.description} />
        </label>
      </fieldset>
      <button className={buttonClass} disabled={disabled || pending}>{pending ? 'Saving…' : achievement ? 'Save changes' : 'Publish achievement'}</button>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state?.success && <p role="status" className="text-sm text-emerald-700">{state.success}</p>}
    </form>
  )
}

function AchievementCard({ achievement, featured }: { achievement: Achievement; featured: boolean }) {
  const [confirming, setConfirming] = useState(false)
  const [state, action, pending] = useActionState(deleteAchievement, undefined)
  return (
    <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{achievement.title}</h3>
        {featured && <span className="rounded-full bg-[#2c2772]/10 px-3 py-1 text-xs font-medium text-[#2c2772]">Featured on homepage</span>}
      </div>
      <details>
        <summary className="cursor-pointer text-sm font-semibold text-[#2c2772]">Edit achievement</summary>
        <div className="pt-4"><AchievementForm achievement={achievement} /></div>
      </details>
      <form action={action} className="border-t border-slate-100 pt-4">
        <input type="hidden" name="slot" value={achievement.slot} />
        {confirming ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Delete this achievement from the homepage?</p>
            <div className="flex gap-3">
              <button disabled={pending} className="min-h-11 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{pending ? 'Deleting…' : 'Confirm delete'}</button>
              <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="min-h-11 px-3 text-sm text-slate-600">Cancel</button>
            </div>
          </div>
        ) : <button type="button" onClick={() => setConfirming(true)} className="min-h-11 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50">Delete achievement</button>}
        {state?.error && <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>}
      </form>
    </article>
  )
}

export function AchievementManager({ achievements }: { achievements: Achievement[] }) {
  const full = achievements.length >= MAX_ACHIEVEMENTS
  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900">Add an achievement</h3>
          <p className="text-sm font-medium text-[#2c2772]">{achievements.length} / {MAX_ACHIEVEMENTS} published</p>
        </div>
        {full ? <p className="rounded-lg bg-[#2c2772]/5 p-4 text-sm text-[#2c2772]">All five spaces are filled. Delete an achievement to add a new one, or edit an existing achievement below.</p> : <AchievementForm />}
      </section>
      {!achievements.length && <p className="text-sm text-slate-500">No achievements published. The homepage section is hidden until you add one.</p>}
      {achievements.map((achievement, index) => <AchievementCard key={`${achievement.slot}-${achievement.date}-${achievement.title}-${achievement.category}-${achievement.description}`} achievement={achievement} featured={index === 0} />)}
    </div>
  )
}
