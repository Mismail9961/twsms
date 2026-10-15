'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

interface DashboardChartsProps {
  ticketsPerDay: { date: string; count: number }[]
  byStatus: { status: string; count: number }[]
  byPriority: { priority: string; count: number }[]
  employeeWorkload: { name: string; tickets: number }[]
}

export function DashboardCharts({
  ticketsPerDay,
  byStatus,
  byPriority,
  employeeWorkload,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Chart 1: Ticket Volume Over Time */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Ticket Volume Trend (Last 30 Days)</h3>
          <p className="text-xs text-gray-500">Incident creation rate over time</p>
        </div>
        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ticketsPerDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2c2772',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2c2772"
                strokeWidth={3}
                dot={{ r: 3, fill: '#2c2772' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Tickets by Status */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Incidents by Status</h3>
          <p className="text-xs text-gray-500">Current operational lifecycle distribution</p>
        </div>
        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byStatus}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2c2772',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#2c2772" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Incidents by Priority */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Tickets by Priority</h3>
          <p className="text-xs text-gray-500">Severity breakdown across all client tickets</p>
        </div>
        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPriority}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="priority" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2c2772',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                {byPriority.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.priority === 'critical'
                        ? '#ef4444'
                        : entry.priority === 'high'
                        ? '#f97316'
                        : entry.priority === 'medium'
                        ? '#eab308'
                        : '#2c2772'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Staff Workload Distribution */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 text-sm">Support Staff Workload</h3>
          <p className="text-xs text-gray-500">Active tickets handled per engineer</p>
        </div>
        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employeeWorkload} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2c2772',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="tickets" fill="#2c2772" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
