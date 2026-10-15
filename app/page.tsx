import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export default async function Home() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (session.role === 'admin') {
    redirect('/admin')
  } else if (session.role === 'employee') {
    redirect('/employee')
  } else {
    redirect('/client')
  }
}
