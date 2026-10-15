import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { getEmployeeTickets } from '@/lib/data/tickets'
import { StatusBadge } from '@/components/tickets/status-badge'
import { PriorityBadge } from '@/components/tickets/priority-badge'
import { EmptyState } from '@/components/common/empty-state'
import { formatDate } from '@/lib/utils'

export default async function EmployeeTicketsPage() {
  const session = await getSession()
  if (!session) return null

  const tickets = await getEmployeeTickets(session.id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          My Assigned Incidents
        </h2>
        <p className="text-sm text-gray-500">
          All client support tickets assigned to you by administrators
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-6 sm:p-8">
            <EmptyState
              title="No tickets assigned"
              description="You have no tickets in your queue at this moment."
            />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[620px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-3 sm:px-6">Ticket ID</th>
                  <th className="py-3.5 px-3 sm:px-6">Client</th>
                  <th className="py-3.5 px-3 sm:px-6">Subject</th>
                  <th className="py-3.5 px-3 sm:px-6">Priority</th>
                  <th className="py-3.5 px-3 sm:px-6">Status</th>
                  <th className="py-3.5 px-3 sm:px-6">Assigned Team</th>
                  <th className="py-3.5 px-3 sm:px-6">Updated</th>
                  <th className="py-3.5 px-3 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs font-semibold text-[#2c2772]">
                      {ticket.ticket_number}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 font-medium text-gray-900 text-xs">
                      {ticket.client?.full_name || 'Client'}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 max-w-sm truncate text-gray-900 font-medium text-xs sm:text-sm" title={ticket.title}>
                      {ticket.title}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs text-gray-500">
                      {ticket.assignments?.length || 1} Engineer(s)
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(ticket.updated_at)}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-right">
                      <Link
                        href={`/employee/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#2c2772] hover:bg-[#2c2772]/10 transition-colors"
                      >
                        <span>Manage</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
