import { getSession } from '@/lib/auth/session'
import { emailQuery } from '@/lib/email/store'
import { retryFailedEmail } from '@/app/actions/email'
import { formatDate } from '@/lib/utils'
import { Mail, RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic'

type EmailJob = { id: string; kind: string; status: string; attempts: number; last_error: string; created_at: string }

export default async function EmailDeliveryPage() {
  const user = await getSession()
  if (user?.role !== 'admin') return null

  let rows: EmailJob[] = []
  let unavailable = false
  try {
    rows = await emailQuery<EmailJob>(
      'SELECT id,kind,status,attempts,last_error,created_at FROM email_outbox ORDER BY created_at DESC LIMIT 100'
    )
  } catch {
    unavailable = true
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Email Outbox & Delivery Logs
        </h2>
        <p className="text-sm text-gray-500">
          Recent 100 dispatched notification jobs and retry queues
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[580px] text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-3 sm:px-6">Event Type</th>
                <th className="py-3.5 px-3 sm:px-6">Status</th>
                <th className="py-3.5 px-3 sm:px-6">Attempts</th>
                <th className="py-3.5 px-3 sm:px-6">Error Detail</th>
                <th className="py-3.5 px-3 sm:px-6">Dispatched</th>
                <th className="py-3.5 px-3 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-xs text-gray-400">
                    {unavailable
                      ? 'Email delivery logs are unavailable. Check your database connection and email setup, then refresh this page.'
                      : 'No email events currently in the outbox queue.'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="py-3 sm:py-4 px-3 sm:px-6">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#2c2772] shrink-0" />
                        <span className="font-semibold text-gray-900 text-xs">{row.kind}</span>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold border text-[11px] ${
                          row.status === 'delivered' || row.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : row.status === 'failed'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-[#2c2772]/10 text-[#2c2772] border-[#2c2772]/20'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs font-mono text-gray-600">
                      {row.attempts}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs text-gray-500 max-w-xs truncate font-mono">
                      {row.last_error || '—'}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-right">
                      {row.status === 'failed' && (
                        <form action={retryFailedEmail}>
                          <input type="hidden" name="id" value={row.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2c2772] hover:underline"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Retry
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
