import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getUnreadNotificationCount } from '@/lib/data/tickets'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

// Authenticated dashboards must query live data only at request time.
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) redirect('/login')

  if (session.role !== 'admin') {
    redirect('/unauthorized')
  }

  const unreadCount = await getUnreadNotificationCount(session.id)

  return (
    <DashboardLayout user={session} title="Enterprise Administration" unreadNotifications={unreadCount}>
      {children}
    </DashboardLayout>
  )
}
