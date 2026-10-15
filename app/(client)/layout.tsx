import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getUnreadNotificationCount } from '@/lib/data/tickets'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (session.role !== 'client') {
    if (session.role === 'admin') redirect('/admin')
    if (session.role === 'employee') redirect('/employee')
    redirect('/unauthorized')
  }

  const unreadCount = await getUnreadNotificationCount(session.id)

  return (
    <DashboardLayout user={session} title="Client Portal" unreadNotifications={unreadCount}>
      {children}
    </DashboardLayout>
  )
}
