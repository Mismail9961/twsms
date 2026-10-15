import Link from 'next/link'
import { Plus, Search, ArrowRight } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { getClientTickets } from '@/lib/data/tickets'
import { StatusBadge } from '@/components/tickets/status-badge'
import { PriorityBadge } from '@/components/tickets/priority-badge'
import { EmptyState } from '@/components/common/empty-state'
import { formatDate, getInitials } from '@/lib/utils'

export default async function ClientTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; priority?: string }>
}) {
  const session = await getSession()
  if (!session) return null

  const resolvedParams = await searchParams
  const statusFilter = resolvedParams.status || 'all'
  const priorityFilter = resolvedParams.priority || 'all'
  const searchQuery = resolvedParams.search || ''

  const allTickets = await getClientTickets(session.id)

  let filteredTickets = allTickets

  if (statusFilter !== 'all') {
    filteredTickets = filteredTickets.filter((t) => t.status === statusFilter)
  }
  if (priorityFilter !== 'all') {
    filteredTickets = filteredTickets.filter((t) => t.priority === priorityFilter)
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredTickets = filteredTickets.filter(
      (t) =>
        t.ticket_number.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            My Support Tickets
          </h2>
          <p className="text-sm text-gray-500">
            View, track, and follow up on all your support requests
          </p>
        </div>
        <Link
          href="/client/tickets/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Ticket</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search by ticket number or keywords..."
              className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_client">Waiting for Client</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex gap-2">
            <select
              name="priority"
              defaultValue={priorityFilter}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Tickets Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tickets match your criteria"
              description="Try adjusting your search keywords or filter settings."
              action={{
                label: 'Clear Filters',
                href: '/client/tickets',
              }}
            />
          </div>
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
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-blue-600">
                      {ticket.ticket_number}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 max-w-sm truncate" title={ticket.title}>
                        {ticket.title}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-600">
                      {ticket.category?.name || 'General Technical'}
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
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/client/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <span>View</span>
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
