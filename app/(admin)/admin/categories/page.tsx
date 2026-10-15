import { getCategories } from '@/lib/data/tickets'
import { Tag, CheckCircle2 } from 'lucide-react'

export default async function AdminCategoriesPage() {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <Tag className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Active Domain</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{c.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{c.description || 'Standard technical domain'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
