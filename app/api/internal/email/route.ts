import { NextResponse } from 'next/server'
import { equalSecret } from '@/lib/email/security'
import { runEmailWorker } from '@/lib/email/worker'
import { emailQuery } from '@/lib/email/store'
import { getSession } from '@/lib/auth/session'
export const runtime = 'nodejs'
export const maxDuration = 60
export async function POST(request: Request) {
  const secret = process.env.EMAIL_WORKER_SECRET
  if (!secret || !equalSecret(request.headers.get('authorization') || '', `Bearer ${secret}`)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { return NextResponse.json(await runEmailWorker()) }
  catch { return NextResponse.json({ error: 'Email worker unavailable' }, { status: 503 }) }
}
export async function GET() {
  const session = await getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await emailQuery(`SELECT id,kind,status,attempts,created_at,sent_at,last_error FROM email_outbox ORDER BY created_at DESC LIMIT 100`)
  return NextResponse.json(rows)
}
