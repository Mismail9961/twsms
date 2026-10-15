import { redirect } from 'next/navigation'
import { dashboardPathForRole, getSession } from '@/lib/auth/session'
import { VerificationForm } from './verification-form'

export default async function VerifyEmailPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return <VerificationForm email={session.email} dashboardHref={dashboardPathForRole(session.role)} />
}
