import { getCategories } from '@/lib/data/tickets'
import { CategoryManager } from './category-manager'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function AdminCategoriesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/unauthorized')
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Ticket Categories & Service Classifications
        </h2>
        <p className="text-sm text-gray-500">
          Configure technical domains used for routing client requests to appropriate teams
        </p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  )
}
