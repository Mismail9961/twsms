import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getTicketById, getTicketMessages } from '@/lib/data/tickets'
import { getSession } from '@/lib/auth/session'
import { emailQuery } from '@/lib/email/store'
import { isNeonConfigured } from '@/lib/db'
import type { Role } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const ticket = await getTicketById(id, session)
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { searchParams } = new URL(request.url)
    const after = searchParams.get('after') || undefined
    const before = searchParams.get('before') || undefined
    const limitParam = searchParams.get('limit')
    const parsedLimit = limitParam === null ? undefined : Number(limitParam)
    if ((after && !Number.isFinite(Date.parse(after))) || (before && !Number.isFinite(Date.parse(before))) ||
      (parsedLimit !== undefined && (!Number.isInteger(parsedLimit) || parsedLimit < 1))) {
      return NextResponse.json({ error: 'Invalid message query.' }, { status: 400 })
    }
    const limit = parsedLimit === undefined ? undefined : Math.min(parsedLimit, 100)

    // Security: always enforce user's actual session role
    const safeRole: Role = session.role === 'admin' ? 'admin' : session.role

    const readThrough = new Date().toISOString()
    const messages = await getTicketMessages(id, safeRole, { after, before, limit })
    if (isNeonConfigured() && !before) await emailQuery('INSERT INTO conversation_reads(ticket_id,user_id,read_at) VALUES($1,$2,$3) ON CONFLICT(ticket_id,user_id) DO UPDATE SET read_at=GREATEST(conversation_reads.read_at,EXCLUDED.read_at)', [id, session.id, readThrough])
    return NextResponse.json(messages, { headers: { 'Cache-Control': 'private, no-store, max-age=0', 'X-Ticket-Status': ticket.status } })
  } catch {
    return NextResponse.json({ error: 'Conversation is temporarily unavailable. Retrying shortly.' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store', 'Retry-After': '2' },
    })
  }
}
