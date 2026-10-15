import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getAllTickets } from '@/lib/data/tickets'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { tickets } = await getAllTickets({ pageSize: 1000 })

  const headers = [
    'Ticket Number',
    'Title',
    'Client Name',
    'Category',
    'Priority',
    'Status',
    'Created At',
    'Updated At',
    'Resolved At',
  ]

  const csvRows = [headers.join(',')]

  for (const t of tickets) {
    const row = [
      `"${t.ticket_number}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.client?.full_name || '').replace(/"/g, '""')}"`,
      `"${t.category?.name || 'General'}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.created_at}"`,
      `"${t.updated_at}"`,
      `"${t.resolved_at || ''}"`,
    ]
    csvRows.push(row.join(','))
  }

  const csvContent = csvRows.join('\n')

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="technology-world-tickets-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
