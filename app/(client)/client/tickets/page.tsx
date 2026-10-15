import Link from 'next/link'
import { Plus, Search, ArrowRight } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { getClientTickets } from '@/lib/data/tickets'
import { StatusBadge } from '@/components/tickets/status-badge'
import { PriorityBadge } from '@/components/tickets/priority-badge'
import { EmptyState } from '@/components/common/empty-state'
import { formatDate, getInitials } from '@/lib/utils'

// 16px text on mobile stops iPhone Safari from zooming in when a field is focused
const fieldClass =
  'block w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-[16px] sm:text-sm text-slate-900 ' +
  'placeholder:text-slate-400 transition-colors hover:border-slate-400 ' +
  'focus:border-[#2C2772] focus:outline-none focus:ring-2 focus:ring-[#2C2772]/20'

const viewLinkClass =
  'inline-flex min-h-[36px] items-center gap-1 rounded-lg px-3 text-xs font-semibold text-[#2C2772] transition-colors hover:bg-[#2C2772]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2772]/40'

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
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-[#2C2772] sm:text-2xl">My support tickets</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            View, track, and follow up on all your support requests.
          </p>
        </div>
        <Link
          href="/client/tickets/new"
          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#2C2772] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(44,39,114,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors duration-150 hover:bg-[#241F5E] active:bg-[#1B1747] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2772] focus-visible:ring-offset-2 sm:shrink-0"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>New ticket</span>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border border-[#2C2772]/10 bg-white p-3 sm:p-4">
        <form method="GET" className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="relative sm:col-span-6">
            <label htmlFor="search" className="sr-only">
              Search tickets
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="search"
              type="search"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search by ticket number or keyword"
              className={`${fieldClass} pl-10`}
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="status" className="sr-only">
              Status
            </label>
            <select id="status" name="status" defaultValue={statusFilter} className={fieldClass}>
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In progress</option>
              <option value="waiting_for_client">Waiting for client</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex gap-2 sm:col-span-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="priority" className="sr-only">
                Priority
              </label>
              <select id="priority" name="priority" defaultValue={priorityFilter} className={fieldClass}>
                <option value="all">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <button
              type="submit"
              className="min-h-[44px] shrink-0 rounded-lg bg-[#2C2772] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#241F5E] active:bg-[#1B1747] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2772] focus-visible:ring-offset-2"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Tickets */}
      <div className="overflow-hidden rounded-xl border border-[#2C2772]/10 bg-white">
        {filteredTickets.length === 0 ? (
          <div className="p-6 sm:p-8">
            <EmptyState
              title="No tickets match your criteria"
              description="Try adjusting your search keywords or filter settings."
              action={{
                label: 'Clear filters',
                href: '/client/tickets',
              }}
            />
          </div>
        ) : (
          <>
            {/* Phones: card list (an 8-column table does not fit in 320px) */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {filteredTickets.map((ticket) => (
                <li key={ticket.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-mono text-xs font-semibold text-[#2C2772]">{ticket.ticket_number}</p>
                    <p className="shrink-0 text-xs text-slate-500">{formatDate(ticket.created_at)}</p>
                  </div>

                  <p className="mt-1.5 break-words text-sm font-medium leading-snug text-slate-900">{ticket.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{ticket.category?.name || 'General Technical'}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
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
                      <span className="text-xs italic text-slate-400">Unassigned</span>
                    )}
                    <Link href={`/client/tickets/${ticket.id}`} className={`${viewLinkClass} -mr-3`}>
                      <span>View</span>
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            {/* Tablets and up: table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#2C2772]/[0.04] text-[11px] font-semibold uppercase tracking-wider text-[#2C2772]/70">
                    <th scope="col" className="px-6 py-3.5">Ticket ID</th>
                    <th scope="col" className="px-6 py-3.5">Subject</th>
                    <th scope="col" className="px-6 py-3.5">Category</th>
                    <th scope="col" className="px-6 py-3.5">Priority</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Assigned team</th>
                    <th scope="col" className="px-6 py-3.5">Created</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="transition-colors hover:bg-[#2C2772]/[0.03]">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-[#2C2772]">
                        {ticket.ticket_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-sm truncate font-medium text-slate-900" title={ticket.title}>
                          {ticket.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {ticket.category?.name || 'General Technical'}
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4">
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
                          <span className="text-xs italic text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/client/tickets/${ticket.id}`} className={viewLinkClass}>
                          <span>View</span>
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}