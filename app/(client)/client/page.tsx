import Link from 'next/link'
import { Plus, Ticket as TicketIcon, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { getClientTickets, getDashboardStats } from '@/lib/data/tickets'
import { StatusBadge } from '@/components/tickets/status-badge'
import { PriorityBadge } from '@/components/tickets/priority-badge'
import { EmptyState } from '@/components/common/empty-state'
import { formatDate, getInitials } from '@/lib/utils'

export default async function ClientDashboardPage() {
  const session = await getSession()
  if (!session) return null

  const [stats, tickets] = await Promise.all([
    getDashboardStats(session.id),
    getClientTickets(session.id),
  ])

  const recentTickets = tickets.slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {session.full_name}
            </h2>
            <p className="mt-1 text-sm text-blue-200">
              Technology World Client Technical Support Portal
            </p>
          </div>
          <Link
            href="/client/tickets/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Ticket</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tickets</span>
            <TicketIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Open</span>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-blue-900">{stats.open}</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-amber-900">{stats.in_progress}</div>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-orange-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Waiting Response</span>
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-orange-900">
            {stats.waiting_for_client + stats.waiting_for_support}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-emerald-900">
            {stats.resolved + stats.closed}
          </div>
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="font-semibold text-gray-900">Recent Support Requests</h3>
            <p className="text-xs text-gray-500">Track and manage your submitted technical issues</p>
          </div>
          <Link
            href="/client/tickets"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            description="You have not submitted any technical support requests. Click below to submit your first issue."
            action={{
              label: 'Create Your First Ticket',
              href: '/client/tickets/new',
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-6">Ticket ID</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Assigned Team</th>
                  <th className="py-3.5 px-6">Updated</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/75 transition-colors group">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-blue-600">
                      {ticket.ticket_number}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 max-w-xs truncate" title={ticket.title}>
                        {ticket.title}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-600">
                      {ticket.category?.name || 'Technical'}
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-4 px-6">
                      {ticket.assignments && ticket.assignments.length > 0 ? (
                        <div className="flex items-center -space-x-1.5">
                          {ticket.assignments.map((asg) => (
                            <div
                              key={asg.id}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white"
                              title={asg.employee?.full_name || 'Support Agent'}
                            >
                              {getInitials(asg.employee?.full_name || 'TW')}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Pending Assignment</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(ticket.updated_at)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/client/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <span>Details</span>
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
