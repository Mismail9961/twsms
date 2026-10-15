import Link from 'next/link'
import { Ticket as TicketIcon, Clock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { getEmployeeTickets } from '@/lib/data/tickets'
import { StatusBadge } from '@/components/tickets/status-badge'
import { PriorityBadge } from '@/components/tickets/priority-badge'
import { EmptyState } from '@/components/common/empty-state'
import { formatDate } from '@/lib/utils'

export default async function EmployeeDashboardPage() {
  const session = await getSession()
  if (!session) return null

  const assignedTickets = await getEmployeeTickets(session.id)

  const activeTickets = assignedTickets.filter(
    (t) => t.status !== 'closed' && t.status !== 'resolved'
  )
  const criticalTickets = activeTickets.filter((t) => t.priority === 'critical' || t.priority === 'high')
  const inProgressCount = assignedTickets.filter((t) => t.status === 'in_progress').length
  const resolvedCount = assignedTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length

  return (
    <div className="space-y-8">
      {/* Employee Workspace Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider mb-2">
              Staff Incident Console
            </span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Hello, {session.full_name}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              You currently have {activeTickets.length} active incidents assigned to your workload.
            </p>
          </div>
          <Link
            href="/employee/tickets"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            <span>View All Assigned</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Workload Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Queue</span>
            <TicketIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-gray-900">{activeTickets.length}</div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-xs font-semibold uppercase tracking-wider">High / Critical</span>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-red-900">{criticalTickets.length}</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-amber-900">{inProgressCount}</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-900">{resolvedCount}</div>
        </div>
      </div>

      {/* Assigned Incidents Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Your Assigned Incident Queue</h3>
            <p className="text-xs text-gray-500">Tickets you are authorized to investigate and resolve</p>
          </div>
        </div>

        {assignedTickets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tickets assigned"
              description="Your queue is currently clear. When an administrator assigns a ticket to you, it will appear here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-6">Ticket ID</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Updated</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {assignedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-blue-600">
                      {ticket.ticket_number}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900 text-xs">
                      {ticket.client?.full_name || 'Client'}
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate text-gray-900 font-medium" title={ticket.title}>
                      {ticket.title}
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(ticket.updated_at)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/employee/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <span>Open Incident</span>
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
