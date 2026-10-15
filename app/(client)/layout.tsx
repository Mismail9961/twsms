import Link from 'next/link'
import { isNeonConfigured } from '@/lib/db'
import { emailQuery } from '@/lib/email/store'
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

  const [profile] = isNeonConfigured() ? await emailQuery<{ requires_email_verification: boolean }>('SELECT requires_email_verification FROM profiles WHERE id=$1', [session.id]) : []
  const unreadCount = await getUnreadNotificationCount(session.id)

  return (
    <DashboardLayout user={session} title="Client Portal" unreadNotifications={unreadCount}>
      {profile?.requires_email_verification && <p className="mb-4 rounded bg-amber-50 p-4 text-amber-900">Your email is unverified. <Link className="underline" href="/verify-email">Verify your email</Link> to create support tickets.</p>}
      {children}
    </DashboardLayout>
  )
}
