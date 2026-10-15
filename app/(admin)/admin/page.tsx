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
    <div className="space-y-6 sm:space-y-8">
      {/* Executive Welcome Banner */}
      <div className="rounded-2xl bg-[#2C2772] p-5 sm:p-8 text-white shadow-xl shadow-[#2C2772]/15">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-white border border-white/20 uppercase tracking-wider mb-2">
              Technology World Command Center
            </span>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight">
              Operations & Support Overview
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/80">
              Live monitoring of technical tickets, multi-agent workload, and client satisfaction.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/tickets"
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#2C2772] shadow-sm hover:bg-white/90 transition-colors"
            >
              <span>Manage Tickets</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 min-[340px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        <div className="rounded-2xl border border-[#2C2772]/15 bg-white p-3.5 sm:p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Tickets
          </span>
          <div className="mt-1.5 text-xl sm:text-3xl font-bold text-slate-900">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-[#2C2772]/20 bg-[#2C2772]/[0.03] p-3.5 sm:p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2C2772]">
            New Today
          </span>
          <div className="mt-1.5 text-xl sm:text-3xl font-bold text-[#2C2772]">{stats.newToday}</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 sm:p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            In Progress
          </span>
          <div className="mt-1.5 text-xl sm:text-3xl font-bold text-amber-900">{stats.in_progress}</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 sm:p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Resolved / Closed
          </span>
          <div className="mt-1.5 text-xl sm:text-3xl font-bold text-emerald-900">
            {stats.resolved + stats.closed}
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-3.5 sm:p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
            Avg Resolution
          </span>
          <div className="mt-1.5 text-xl sm:text-3xl font-bold text-purple-900">
            {stats.avgResolutionHours}h
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 sm:p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            Client Rating
          </span>
          <div className="mt-1.5 text-xl sm:text-3xl font-bold text-amber-900 flex items-center gap-1">
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
      <div className="rounded-2xl border border-[#2C2772]/15 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Latest Support Requests</h3>
            <p className="text-xs text-slate-500">Live feed of incoming issues</p>
          </div>
          <Link
            href="/admin/tickets"
            className="text-xs font-semibold text-[#2C2772] hover:text-[#231f5c] flex items-center gap-1"
          >
            <span>All Tickets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 sm:px-6">Ticket ID</th>
                <th className="py-3 px-4 sm:px-6">Client</th>
                <th className="py-3 px-4 sm:px-6">Subject</th>
                <th className="py-3 px-4 sm:px-6">Priority</th>
                <th className="py-3 px-4 sm:px-6">Status</th>
                <th className="py-3 px-4 sm:px-6">Assigned Team</th>
                <th className="py-3 px-4 sm:px-6">Created</th>
                <th className="py-3 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentTicketsData.tickets.map((ticket) => (
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
                  <td className="py-3.5 px-4 sm:px-6">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-500">
                    {ticket.assignments?.length ? (
                      <span className="font-semibold text-slate-800">
                        {ticket.assignments.length} assigned
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold italic">Unassigned</span>
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
      </div>
    </div>
  )
}
