import { NextResponse } from 'next/server'
import { getSession, dashboardPathForRole } from '@/lib/auth/session'

export async function GET() {
  const session = await getSession()
  return NextResponse.json({
    signedIn: Boolean(session),
    dashboardHref: session ? dashboardPathForRole(session.role) : '/login',
  }, { headers: { 'Cache-Control': 'private, no-store, max-age=0', Vary: 'Cookie' } })
}
