import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getAchievements } from '@/lib/data/achievements'
import { AchievementManager } from './achievement-manager'

export default async function AdminAchievementsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/unauthorized')
  const achievements = await getAchievements()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">Homepage achievements</h2>
        <p className="mt-1 text-sm text-gray-500">Publish up to five achievements. Changes appear on the homepage immediately. The first achievement is featured.</p>
      </div>
      <AchievementManager achievements={achievements} />
    </div>
  )
}
