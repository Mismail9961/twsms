import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getUnreadNotificationCount } from '@/lib/data/tickets'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) redirect('/login')

  if (session.role !== 'employee' && session.role !== 'admin') {
    redirect('/unauthorized')
  }

  const unreadCount = await getUnreadNotificationCount(session.id)

  return (
    <DashboardLayout user={session} title="Support Staff Workspace" unreadNotifications={unreadCount}>
      {children}
    </DashboardLayout>
  )
}
