import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getAllTickets } from '@/lib/data/tickets'
import { csvCell } from '@/lib/export/csv'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const csvRows = [[
    'Ticket Number', 'Title', 'Client Name', 'Category', 'Priority',
    'Status', 'Created At', 'Updated At', 'Resolved At',
  ].map(csvCell).join(',')]

  // Fetch bounded batches so exports do not silently stop at the first 1,000 tickets.
  let page = 1
  let exported = 0
  let total = 0
  do {
    const result = await getAllTickets({ page, pageSize: 1000, includeAssignments: false })
    total = result.total
    if (!result.tickets.length) break
    for (const ticket of result.tickets) {
      csvRows.push([
        ticket.ticket_number, ticket.title, ticket.client?.full_name,
        ticket.category?.name || 'General', ticket.priority, ticket.status,
        ticket.created_at, ticket.updated_at, ticket.resolved_at,
      ].map(csvCell).join(','))
    }
    exported += result.tickets.length
    page++
  } while (exported < total)

  return new NextResponse(csvRows.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="technology-world-tickets-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
