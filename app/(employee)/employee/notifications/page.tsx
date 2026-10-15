import { Bell, CheckCheck, Ticket } from 'lucide-react'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { getNotifications } from '@/lib/data/tickets'
import { markNotificationsRead } from '@/app/actions/tickets'
import { formatRelativeTime } from '@/lib/utils'
import { EmptyState } from '@/components/common/empty-state'

export default async function EmployeeNotificationsPage() {
  const session = await getSession()
  if (!session) return null

  const notifications = await getNotifications(session.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Assigned Incident Notifications
          </h2>
          <p className="text-sm text-gray-500">
            Alerts for newly assigned tickets, client replies, and priority escalations
          </p>
        </div>

        {notifications.length > 0 && (
          <form action={markNotificationsRead}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Mark All as Read</span>
            </button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You have no unread notifications for your assigned incidents."
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                  !n.read_at ? 'bg-blue-50/40' : 'hover:bg-gray-50/60'
                }`}
              >
                <div
                  className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    !n.read_at
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Ticket className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900">{n.title}</h4>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{n.body}</p>

                  {n.ticket_id && (
                    <div className="mt-2">
                      <Link
                        href={`/employee/tickets/${n.ticket_id}`}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Inspect Incident →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
