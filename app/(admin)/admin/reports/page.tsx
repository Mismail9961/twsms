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
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Analytics (CSV)</span>
        </a>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Resolution Rate
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
            {stats.total > 0
              ? `${Math.round(((stats.resolved + stats.closed) / stats.total) * 100)}%`
              : '100%'}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Mean Time to Resolve
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-blue-900">
            {stats.avgResolutionHours}h
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">
            Total Reviews
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-purple-900">
            {reportData.totalRatings}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
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
