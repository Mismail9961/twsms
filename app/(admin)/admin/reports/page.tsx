import { Download } from 'lucide-react'
import { getAdminReportData, getAdminDashboardStats } from '@/lib/data/tickets'
import { DashboardCharts } from '../dashboard-charts'

export default async function AdminReportsPage() {
  const [reportData, stats] = await Promise.all([
    getAdminReportData(),
    getAdminDashboardStats(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Operations & Analytics Reports
          </h2>
          <p className="text-sm text-gray-500">
            Comprehensive resolution performance, volume trends, and SLA tracking
          </p>
        </div>

        <a
          href="/api/export/tickets"
          download="technology-world-full-report.csv"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2c2772] px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-[#2c2772]/90 transition-colors w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export Analytics (CSV)</span>
        </a>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Resolution Rate
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            {stats.total > 0
              ? `${Math.round(((stats.resolved + stats.closed) / stats.total) * 100)}%`
              : '100%'}
          </div>
        </div>

        <div className="rounded-2xl border border-[#2c2772]/20 bg-[#2c2772]/5 p-3.5 sm:p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2c2772]">
            Mean Time to Resolve
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#2c2772]">
            {stats.avgResolutionHours}h
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Reviews
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            {reportData.totalRatings}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 sm:p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Satisfaction Index
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-900">
            {reportData.avgRating} / 5.0
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <DashboardCharts
        ticketsPerDay={reportData.ticketsPerDay}
        byStatus={reportData.byStatus}
        byPriority={reportData.byPriority}
        employeeWorkload={reportData.employeeWorkload}
      />
    </div>
  )
}
