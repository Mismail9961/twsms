import { getSession } from '@/lib/auth/session'
import { getInitials } from '@/lib/utils'

export default async function AdminProfilePage() {
  const session = await getSession()
  if (!session) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Administrator Settings & Identity
        </h2>
        <p className="text-sm text-gray-500">
          Manage system administration credentials and configuration
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-900 text-xl font-bold text-white shadow-md">
            {getInitials(session.full_name)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{session.full_name}</h3>
            <p className="text-xs text-gray-500">{session.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">
              System Administrator
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Admin Name
            </label>
            <input
              type="text"
              readOnly
              value={session.full_name}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              readOnly
              value={session.email}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 font-medium"
            />
          </div>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 text-xs text-purple-900">
          <strong>Administrator privileges active:</strong> You have full governance over all ticket categories, multi-agent assignments, client accounts, and database reporting.
        </div>
      </div>
    </div>
  )
}
