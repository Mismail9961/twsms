import Link from 'next/link'
import { Plus, ArrowRight, ChevronRight } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { getClientTickets, getDashboardStats } from '@/lib/data/tickets'
import { StatusBadge } from '@/components/tickets/status-badge'
import { PriorityBadge } from '@/components/tickets/priority-badge'
import { EmptyState } from '@/components/common/empty-state'
import { formatDate, getInitials } from '@/lib/utils'

type Ticket = Awaited<ReturnType<typeof getClientTickets>>[number]

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4FD8]/50 focus-visible:ring-offset-2'

function Assignees({ assignments }: { assignments: Ticket['assignments'] }) {
  if (!assignments || assignments.length === 0) {
    return <span className="text-xs text-slate-400">Pending assignment</span>
  }

  const visible = assignments.slice(0, 3)
  const extra = assignments.length - visible.length

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((asg) => (
        <div
          key={asg.id}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F1B2D] text-[10px] font-semibold text-white ring-2 ring-white"
          title={asg.employee?.full_name || 'Support agent'}
        >
          {getInitials(asg.employee?.full_name || 'TW')}
        </div>
      ))}
      {extra > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 ring-2 ring-white">
          +{extra}
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  dot,
  className = '',
}: {
  label: string
  value: number
  dot: string
  className?: string
}) {
  return (
    <div className={`bg-white px-4 py-4 sm:px-5 sm:py-5 ${className}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
        <span className="text-[13px] leading-tight text-slate-500">{label}</span>
      </div>
      <p className="mt-2.5 text-[26px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums sm:text-3xl">
        {value}
      </p>
    </div>
  )
}

export default async function ClientDashboardPage() {
  const session = await getSession()
  if (!session) return null

  const [stats, tickets] = await Promise.all([
    getDashboardStats(session.id),
    getClientTickets(session.id),
  ])

  const recentTickets = tickets.slice(0, 6)
  const waiting = stats.waiting_for_client + stats.waiting_for_support
  const resolved = stats.resolved + stats.closed

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0F1B2D] text-white shadow-[0_10px_30px_-12px_rgba(15,27,45,0.5)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#1F4FD8]/30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-7 lg:p-8">
          <div className="min-w-0">
            <h1 className="break-words text-xl font-semibold leading-snug tracking-tight sm:text-2xl lg:text-3xl">
              Welcome back, {session.full_name}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
              Technology World client support portal
            </p>
          </div>

          <Link
            href="/client/tickets/new"
            className={`inline-flex min-h-[46px] w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[#0F1B2D] shadow-sm transition-colors hover:bg-slate-100 active:bg-slate-200 sm:w-auto ${focusRing} focus-visible:ring-offset-[#0F1B2D]`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Create new ticket</span>
          </Link>
        </div>
      </section>

      {/* Metrics */}
      <section aria-label="Ticket summary">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-sm sm:grid-cols-5">
          <Stat label="Total tickets" value={stats.total} dot="bg-[#0F1B2D]" className="col-span-2 sm:col-span-1" />
          <Stat label="Open" value={stats.open} dot="bg-sky-500" />
          <Stat label="In progress" value={stats.in_progress} dot="bg-amber-500" />
          <Stat label="Waiting response" value={waiting} dot="bg-orange-500" />
          <Stat label="Resolved" value={resolved} dot="bg-emerald-500" />
        </div>
      </section>

      {/* Recent tickets */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">Recent support requests</h2>
            <p className="mt-0.5 text-[13px] text-slate-500">Track the technical issues you have submitted</p>
          </div>
          <Link
            href="/client/tickets"
            className={`inline-flex min-h-[36px] items-center gap-1 rounded-md text-[13px] font-semibold text-[#1F4FD8] transition-colors hover:text-[#183CA8] ${focusRing}`}
          >
            <span>View all tickets</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            description="You have not submitted any technical support requests. Create your first ticket to get started."
            action={{
              label: 'Create your first ticket',
              href: '/client/tickets/new',
            }}
          />
        ) : (
          <>
            {/* Phone and small tablet: stacked list */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {recentTickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/client/tickets/${ticket.id}`}
                    className="block px-4 py-4 transition-colors active:bg-slate-50 focus:outline-none focus-visible:bg-slate-50 sm:px-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-mono text-xs font-semibold text-slate-500">{ticket.ticket_number}</span>
                      <StatusBadge status={ticket.status} />
                    </div>

                    <div className="mt-2 flex items-start justify-between gap-3">
                      <p className="line-clamp-2 min-w-0 break-words text-[15px] font-medium leading-snug text-slate-900">
                        {ticket.title}
                      </p>
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <PriorityBadge priority={ticket.priority} />
                      <span className="text-xs text-slate-500">{ticket.category?.name || 'Technical'}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Assignees assignments={ticket.assignments} />
                      <span className="whitespace-nowrap text-xs text-slate-400">
                        Updated {formatDate(ticket.updated_at)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Tablet and desktop: table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-medium text-slate-500">
                    <th scope="col" className="px-6 py-3 font-medium">Ticket</th>
                    <th scope="col" className="px-4 py-3 font-medium">Subject</th>
                    <th scope="col" className="hidden px-4 py-3 font-medium xl:table-cell">Category</th>
                    <th scope="col" className="px-4 py-3 font-medium">Priority</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Assigned team</th>
                    <th scope="col" className="px-6 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-slate-500">
                        {ticket.ticket_number}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/client/tickets/${ticket.id}`}
                          className={`block max-w-[16rem] truncate rounded font-medium text-slate-900 transition-colors hover:text-[#1F4FD8] lg:max-w-xs ${focusRing}`}
                          title={ticket.title}
                        >
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="hidden px-4 py-4 text-[13px] text-slate-600 xl:table-cell">
                        {ticket.category?.name || 'Technical'}
                      </td>
                      <td className="px-4 py-4">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="hidden px-4 py-4 lg:table-cell">
                        <Assignees assignments={ticket.assignments} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[13px] text-slate-500">
                        {formatDate(ticket.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}