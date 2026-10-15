import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getTicketMessages } from '@/lib/data/tickets'
import { getSession } from '@/lib/auth/session'
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
  const { searchParams } = new URL(request.url)
  const after = searchParams.get('after') || undefined
  const before = searchParams.get('before') || undefined
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : undefined

  // Security: always enforce user's actual session role
  const safeRole: Role = session.role === 'admin' ? 'admin' : session.role

  const messages = await getTicketMessages(id, safeRole, { after, before, limit })
  return NextResponse.json(messages)
}
