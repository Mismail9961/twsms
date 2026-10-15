import Link from 'next/link'
import { Search, Download, ArrowRight } from 'lucide-react'
import { getAllTickets, getCategories } from '@/lib/data/tickets'
import { StatusBadge } from '@/components/tickets/status-badge'
import { PriorityBadge } from '@/components/tickets/priority-badge'
import { formatDate, getInitials } from '@/lib/utils'
import { EmptyState } from '@/components/common/empty-state'

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    priority?: string
    category_id?: string
    search?: string
    page?: string
  }>
}) {
  const resolvedParams = await searchParams
  const statusFilter = resolvedParams.status || 'all'
  const priorityFilter = resolvedParams.priority || 'all'
  const categoryFilter = resolvedParams.category_id || 'all'
  const searchQuery = resolvedParams.search || ''
  const page = parseInt(resolvedParams.page || '1', 10)

  const [{ tickets, total }, categories] = await Promise.all([
    getAllTickets({
      status: statusFilter,
      priority: priorityFilter,
      category_id: categoryFilter,
      search: searchQuery,
      page,
      pageSize: 25,
    }),
    getCategories(),
  ])

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg min-[360px]:text-xl sm:text-2xl font-bold tracking-tight text-[#2C2772]">
            All Support Tickets ({total})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Global ticket queue management, employee assignment, and tracking
          </p>
        </div>

        {/* CSV Export Link */}
        <a
          href="/api/export/tickets"
          download="technology-world-tickets.csv"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#2C2772]/20 bg-white px-3.5 py-2 text-xs font-semibold text-[#2C2772] shadow-sm hover:bg-[#2C2772]/5 transition-colors"
        >
          <Download className="h-4 w-4 text-[#2C2772]" />
          <span>Export Records (CSV)</span>
        </a>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-[#2C2772]/15 bg-white p-3 sm:p-4 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
          <div className="sm:col-span-4 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search by ticket #, subject..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2C2772] focus:outline-none focus:ring-1 focus:ring-[#2C2772]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-base sm:text-sm text-slate-900 focus:border-[#2C2772] focus:outline-none focus:ring-1 focus:ring-[#2C2772] bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_client">Waiting for Client</option>
              <option value="waiting_for_support">Waiting for Support</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              name="priority"
              defaultValue={priorityFilter}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-base sm:text-sm text-slate-900 focus:border-[#2C2772] focus:outline-none focus:ring-1 focus:ring-[#2C2772] bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex gap-2">
            <select
              name="category_id"
              defaultValue={categoryFilter}
              className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-base sm:text-sm text-slate-900 focus:border-[#2C2772] focus:outline-none focus:ring-1 focus:ring-[#2C2772] bg-white truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-[#2C2772] px-4 py-2 text-sm font-semibold text-white hover:bg-[#231f5c] transition-colors shrink-0"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tickets found"
              description="No tickets match the selected filters."
              action={{ label: 'Reset Filter', href: '/admin/tickets' }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-6">Ticket ID</th>
                  <th className="py-3 px-4 sm:px-6">Client</th>
                  <th className="py-3 px-4 sm:px-6">Subject</th>
                  <th className="py-3 px-4 sm:px-6">Category</th>
                  <th className="py-3 px-4 sm:px-6">Priority</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                  <th className="py-3 px-4 sm:px-6">Assigned Team</th>
                  <th className="py-3 px-4 sm:px-6">Created</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[#2C2772]/[0.02] transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-xs font-semibold text-[#2C2772]">
                      {ticket.ticket_number}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900 text-xs">
                      {ticket.client?.full_name || 'Client'}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 max-w-xs truncate text-slate-900 font-medium text-xs sm:text-sm" title={ticket.title}>
                      {ticket.title}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                      {ticket.category?.name || 'General'}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                      {ticket.assignments && ticket.assignments.length > 0 ? (
                        <div className="flex items-center -space-x-1.5">
                          {ticket.assignments.map((asg) => (
                            <div
                              key={asg.id}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2C2772] text-[10px] font-bold text-white ring-2 ring-white"
                              title={asg.employee?.full_name || 'Support Agent'}
                            >
                              {getInitials(asg.employee?.full_name || 'TW')}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-amber-600 italic font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#2C2772] hover:bg-[#2C2772]/10 transition-colors"
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
