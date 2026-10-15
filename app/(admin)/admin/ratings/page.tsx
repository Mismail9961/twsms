import Link from 'next/link'
import { Star, MessageSquare } from 'lucide-react'
import { dbQuery, isNeonConfigured, memoryDb } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { TICKET_RESOLUTION_METHOD_LABELS } from '@/lib/types'
import type { Profile, Ticket, TicketRating } from '@/lib/types'

export default async function AdminRatingsPage() {
  const ratings = isNeonConfigured()
    ? await dbQuery<TicketRating & { client: Profile; ticket: Ticket }>(
        `SELECT r.*, row_to_json(p.*) AS client, row_to_json(t.*) AS ticket
         FROM ticket_ratings r
         JOIN profiles p ON p.id = r.client_id
         JOIN tickets t ON t.id = r.ticket_id
         ORDER BY r.created_at DESC`
      )
    : memoryDb.ratings.map((r) => {
        const client = memoryDb.profiles.find((p) => p.id === r.client_id)
        const ticket = memoryDb.tickets.find((t) => t.id === r.ticket_id)
        return { ...r, client, ticket }
      })

  const total = ratings.length
  const avg =
    total > 0
      ? (ratings.reduce((s, r) => s + r.overall_rating, 0) / total).toFixed(1)
      : '5.0'

  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of ratings) {
    counts[r.overall_rating] = (counts[r.overall_rating] || 0) + 1
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Client Satisfaction & Ratings
        </h2>
        <p className="text-sm text-gray-500">
          Evaluations submitted by clients following confirmed issue resolutions
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <Star className="h-7 w-7 fill-amber-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">{avg}</div>
            <div className="text-xs text-gray-500 font-medium">Average Rating (Out of 5.0)</div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500 font-medium">Total Reviews Submitted</div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-center space-y-1.5">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Star Distribution
          </div>
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs">
              <span className="w-4 font-mono font-bold text-gray-500">{s}★</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${total ? (counts[s] / total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-5 text-right font-mono text-gray-400">{counts[s]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-6">Ticket</th>
                <th className="py-3.5 px-6">Client</th>
                <th className="py-3.5 px-6">Rating</th>
                <th className="py-3.5 px-6">Resolution Method</th>
                <th className="py-3.5 px-6">Feedback Comments</th>
                <th className="py-3.5 px-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {ratings.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/75 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs font-semibold text-blue-600">
                    <Link href={`/admin/tickets/${r.ticket_id}`} className="hover:underline">
                      {r.ticket?.ticket_number || 'Ticket'}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-xs font-medium text-gray-900">
                    {r.client?.full_name || 'Client'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= r.overall_rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-600">
                    {r.resolution_method
                      ? TICKET_RESOLUTION_METHOD_LABELS[r.resolution_method] || r.resolution_method
                      : <span className="text-gray-400 italic">Not provided</span>}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-600 max-w-md">
                    {r.feedback ? `"${r.feedback}"` : <span className="text-gray-400 italic">No written comment</span>}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-400 text-right whitespace-nowrap">
                    {formatDate(r.created_at)}
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
