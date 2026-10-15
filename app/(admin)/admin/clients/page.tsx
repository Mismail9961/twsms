import { CheckCircle, Ban } from 'lucide-react'
import { getAllClients } from '@/lib/data/tickets'
import { toggleUserStatus } from '@/app/actions/tickets'
import { formatDate, getInitials } from '@/lib/utils'

export default async function AdminClientsPage() {
  const clients = await getAllClients()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Client Account Management
        </h2>
        <p className="text-sm text-gray-500">
          Monitor registered client organizations, inspect account states, and toggle access
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-6">Client Name</th>
                <th className="py-3.5 px-6">Work Email</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Account Status</th>
                <th className="py-3.5 px-6">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50/75 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow">
                        {getInitials(client.full_name)}
                      </div>
                      <span className="font-semibold text-gray-900">{client.full_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-600 font-mono">{client.email}</td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      Client
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs">
                    {client.account_status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                        <Ban className="h-3.5 w-3.5 text-red-600" />
                        <span>Deactivated</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <form action={toggleUserStatus.bind(null, client.id, client.account_status)}>
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                          client.account_status === 'active'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {client.account_status === 'active' ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
