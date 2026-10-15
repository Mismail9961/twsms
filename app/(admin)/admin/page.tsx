import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'
import { getAdminDashboardStats, getAdminReportData, getAllTickets } from '@/lib/data/tickets'
import { DashboardCharts } from './dashboard-charts'
import { StatusBadge } from '@/components/tickets/status-badge'
import { PriorityBadge } from '@/components/tickets/priority-badge'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const [stats, reportData, recentTicketsData] = await Promise.all([
    getAdminDashboardStats(),
    getAdminReportData(),
    getAllTickets({ pageSize: 5 }),
  ])

  return (
    <div className="space-y-8">
      {/* Executive Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider mb-2">
              Technology World Command Center
            </span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Operations & Support Overview
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Live monitoring of technical tickets, multi-agent workload, and client satisfaction.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/tickets"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <span>Manage Tickets</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Total Tickets
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            New Today
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-blue-900">{stats.newToday}</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            In Progress
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-900">{stats.in_progress}</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Resolved / Closed
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-900">
            {stats.resolved + stats.closed}
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
            Avg Resolution
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-purple-900">
            {stats.avgResolutionHours}h
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            Client Rating
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-900 flex items-center gap-1">
            <span>{stats.avgRating}</span>
            <Star className="h-4 w-4 fill-amber-400 text-amber-400 inline" />
          </div>
        </div>
      </div>

      {/* Recharts Data Visualizations */}
      <DashboardCharts
        ticketsPerDay={reportData.ticketsPerDay}
        byStatus={reportData.byStatus}
        byPriority={reportData.byPriority}
        employeeWorkload={reportData.employeeWorkload}
      />

      {/* Recent Tickets Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Latest Support Requests</h3>
            <p className="text-xs text-gray-500">Live feed of incoming issues</p>
          </div>
          <Link
            href="/admin/tickets"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>All Tickets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-6">Ticket ID</th>
                <th className="py-3.5 px-6">Client</th>
                <th className="py-3.5 px-6">Subject</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Assigned Team</th>
                <th className="py-3.5 px-6">Created</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recentTicketsData.tickets.map((ticket) => (
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
                  <td className="py-4 px-6 text-xs text-gray-500">
                    {ticket.assignments?.length ? (
                      <span className="font-semibold text-gray-800">
                        {ticket.assignments.length} assigned
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(ticket.created_at)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/admin/tickets/${ticket.id}`}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
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
      </div>
    </div>
  )
}
