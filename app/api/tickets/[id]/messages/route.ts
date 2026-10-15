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
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!await getTicketById(id, session)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { searchParams } = new URL(request.url)
  const after = searchParams.get('after') || undefined
  const before = searchParams.get('before') || undefined
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : undefined

  // Security: always enforce user's actual session role
  const safeRole: Role = session.role === 'admin' ? 'admin' : session.role

  const readThrough = new Date().toISOString()
  const messages = await getTicketMessages(id, safeRole, { after, before, limit })
  if (isNeonConfigured() && !before) await emailQuery('INSERT INTO conversation_reads(ticket_id,user_id,read_at) VALUES($1,$2,$3) ON CONFLICT(ticket_id,user_id) DO UPDATE SET read_at=GREATEST(conversation_reads.read_at,EXCLUDED.read_at)', [id, session.id, readThrough])
  return NextResponse.json(messages)
}
