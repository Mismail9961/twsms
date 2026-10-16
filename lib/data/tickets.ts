import { cache } from 'react'
import { isNeonConfigured, dbQuery, dbQueryRequired, memoryDb } from '@/lib/db'
import { randomUUID } from 'node:crypto'
import type {
  Ticket,
  TicketMessage,
  TicketStatusHistory,
  TicketCategory,
  TicketAssignment,
  TicketAttachment,
  Notification,
  Profile,
  DashboardStats,
  Role,
} from '@/lib/types'

function publicProfileJson(alias: string, as = 'profile') {
  return `json_build_object(
    'id', ${alias}.id,
    'full_name', ${alias}.full_name,
    'email', ${alias}.email,
    'role', ${alias}.role,
    'account_status', ${alias}.account_status,
    'avatar_url', ${alias}.avatar_url,
    'created_at', ${alias}.created_at,
    'updated_at', ${alias}.updated_at
  ) AS ${as}`
}

async function attachAssignments(tickets: Ticket[]): Promise<Ticket[]> {
  if (tickets.length === 0) return tickets

  const assignments = await dbQuery<TicketAssignment>(
    `SELECT a.*, ${publicProfileJson('p', 'employee')}
     FROM ticket_assignments a
     JOIN profiles p ON a.employee_id = p.id
     WHERE a.ticket_id = ANY($1::uuid[])`,
    [tickets.map((ticket) => ticket.id)]
  )

  const byTicket = new Map<string, TicketAssignment[]>()
  for (const assignment of assignments) {
    const list = byTicket.get(assignment.ticket_id) ?? []
    list.push(assignment)
    byTicket.set(assignment.ticket_id, list)
  }

  for (const ticket of tickets) {
    ticket.assignments = byTicket.get(ticket.id) ?? []
  }

  return tickets
}

// ─────────────────────────────────────────────────────────────────────────────
// TICKETS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all tickets submitted by a specific client.
 */
export async function getClientTickets(clientId: string): Promise<Ticket[]> {
  if (isNeonConfigured()) {
    const tickets = await dbQuery<Ticket>(
      `SELECT t.*, 
              row_to_json(c.*) as category,
              (SELECT row_to_json(r.*) FROM ticket_ratings r WHERE r.ticket_id = t.id) as rating
       FROM tickets t
       LEFT JOIN ticket_categories c ON t.category_id = c.id
       WHERE t.client_id = $1
       ORDER BY t.updated_at DESC`,
      [clientId]
    )
    return attachAssignments(tickets)
  }

  // Memory fallback
  const tickets = memoryDb.tickets
    .filter((t) => t.client_id === clientId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  return tickets.map((t) => {
    const category = memoryDb.categories.find((c) => c.id === t.category_id)
    const assignments = memoryDb.assignments
      .filter((a) => a.ticket_id === t.id)
      .map((a) => ({
        ...a,
        employee: memoryDb.profiles.find((p) => p.id === a.employee_id),
      }))
    const rating = memoryDb.ratings.find((r) => r.ticket_id === t.id)
    return { ...t, category, assignments, rating }
  })
}

/** Minimal permission check for frequent chat polling; avoids fetching profiles and ratings. */
export async function getTicketAccess(ticketId: string, user: { id: string; role: Role }): Promise<Pick<Ticket, 'id' | 'status' | 'client_id'> | null> {
  if (isNeonConfigured()) {
    const [ticket] = await dbQuery<Pick<Ticket, 'id' | 'status' | 'client_id'>>(
      `SELECT t.id, t.status, t.client_id FROM tickets t
       WHERE t.id = $1 AND (
         $3 = 'admin' OR ($3 = 'client' AND t.client_id = $2) OR
         ($3 = 'employee' AND EXISTS (
           SELECT 1 FROM ticket_assignments a WHERE a.ticket_id = t.id AND a.employee_id = $2
         ))
       )`, [ticketId, user.id, user.role]
    )
    return ticket ?? null
  }
  const ticket = memoryDb.tickets.find(item => item.id === ticketId)
  if (!ticket) return null
  if (user.role === 'client' && ticket.client_id !== user.id) return null
  if (user.role === 'employee' && !memoryDb.assignments.some(item => item.ticket_id === ticketId && item.employee_id === user.id)) return null
  return { id: ticket.id, status: ticket.status, client_id: ticket.client_id }
}

/**
 * Returns a single ticket by ID with complete relationships, enforcing security rules.
 */
export async function getTicketById(
  ticketId: string,
  user?: { id: string; role: Role }
): Promise<Ticket | null> {
  let ticket: Ticket | null = null

  if (isNeonConfigured()) {
    const rows = await dbQuery<Ticket>(
      `SELECT t.*, 
              ${publicProfileJson('p', 'client')},
              row_to_json(c.*) as category,
              (SELECT row_to_json(r.*) FROM ticket_ratings r WHERE r.ticket_id = t.id) as rating
       FROM tickets t
       JOIN profiles p ON t.client_id = p.id
       LEFT JOIN ticket_categories c ON t.category_id = c.id
       WHERE t.id = $1`,
      [ticketId]
    )
    if (rows.length > 0) {
      ticket = rows[0]
      ticket.assignments = await dbQuery<TicketAssignment>(
        `SELECT a.*, ${publicProfileJson('p', 'employee')}
         FROM ticket_assignments a
         JOIN profiles p ON a.employee_id = p.id
         WHERE a.ticket_id = $1`,
        [ticketId]
      )
    }
  } else {
    const found = memoryDb.tickets.find((t) => t.id === ticketId)
    if (found) {
      const client = memoryDb.profiles.find((p) => p.id === found.client_id)
      const category = memoryDb.categories.find((c) => c.id === found.category_id)
      const assignments = memoryDb.assignments
        .filter((a) => a.ticket_id === found.id)
        .map((a) => ({
          ...a,
          employee: memoryDb.profiles.find((p) => p.id === a.employee_id),
        }))
      const rating = memoryDb.ratings.find((r) => r.ticket_id === found.id)
      ticket = { ...found, client, category, assignments, rating }
    }
  }

  if (!ticket) return null

  // Authorization check if user is supplied
  if (user) {
    if (user.role === 'client' && ticket.client_id !== user.id) {
      return null // Security: clients can only view their own tickets
    }
    if (user.role === 'employee') {
      const isAssigned = ticket.assignments?.some((a) => a.employee_id === user.id)
      if (!isAssigned) {
        return null // Security: employees can only view assigned tickets
      }
    }
  }

  return ticket
}

/**
 * Returns tickets assigned to an employee.
 */
export async function getEmployeeTickets(employeeId: string): Promise<Ticket[]> {
  if (isNeonConfigured()) {
    const tickets = await dbQuery<Ticket>(
      `SELECT t.*, 
              ${publicProfileJson('p', 'client')},
              row_to_json(c.*) as category
       FROM tickets t
       JOIN ticket_assignments a ON t.id = a.ticket_id
       JOIN profiles p ON t.client_id = p.id
       LEFT JOIN ticket_categories c ON t.category_id = c.id
       WHERE a.employee_id = $1
       ORDER BY t.updated_at DESC`,
      [employeeId]
    )
    return attachAssignments(tickets)
  }

  // Memory fallback
  const assignedTicketIds = memoryDb.assignments
    .filter((a) => a.employee_id === employeeId)
    .map((a) => a.ticket_id)

  return memoryDb.tickets
    .filter((t) => assignedTicketIds.includes(t.id))
    .map((t) => {
      const client = memoryDb.profiles.find((p) => p.id === t.client_id)
      const category = memoryDb.categories.find((c) => c.id === t.category_id)
      const assignments = memoryDb.assignments
        .filter((a) => a.ticket_id === t.id)
        .map((a) => ({
          ...a,
          employee: memoryDb.profiles.find((p) => p.id === a.employee_id),
        }))
      return { ...t, client, category, assignments }
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
}

/**
 * Returns all tickets with filtering, searching, and pagination (for Admin).
 */
export async function getAllTickets(filters?: {
  status?: string
  priority?: string
  category_id?: string
  search?: string
  page?: number
  pageSize?: number
  includeAssignments?: boolean
}): Promise<{ tickets: Ticket[]; total: number }> {
  const page = Math.max(1, Math.trunc(Number(filters?.page) || 1))
  const pageSize = Math.max(1, Math.min(1000, Math.trunc(Number(filters?.pageSize) || 20)))

  if (isNeonConfigured()) {
    {
      const conditions: string[] = []
      const params: unknown[] = []

      if (filters?.status && filters.status !== 'all') {
        params.push(filters.status)
        conditions.push(`t.status = $${params.length}`)
      }
      if (filters?.priority && filters.priority !== 'all') {
        params.push(filters.priority)
        conditions.push(`t.priority = $${params.length}`)
      }
      if (filters?.category_id && filters.category_id !== 'all') {
        params.push(filters.category_id)
        conditions.push(`t.category_id = $${params.length}`)
      }
      if (filters?.search) {
        params.push(`%${filters.search}%`)
        conditions.push(
          `(t.ticket_number ILIKE $${params.length} OR t.title ILIKE $${params.length} OR p.full_name ILIKE $${params.length})`
        )
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      const countParams = [...params]

      params.push(pageSize)
      params.push((page - 1) * pageSize)
      const queryStr = `
        SELECT t.*, 
               ${publicProfileJson('p', 'client')},
               row_to_json(c.*) as category
        FROM tickets t
        JOIN profiles p ON t.client_id = p.id
        LEFT JOIN ticket_categories c ON t.category_id = c.id
        ${whereClause}
        ORDER BY t.created_at DESC, t.id DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `
      const [countResult, tickets] = await Promise.all([
        dbQuery<{ count: string }>(
          `SELECT COUNT(*) as count FROM tickets t JOIN profiles p ON t.client_id = p.id ${whereClause}`,
          countParams
        ),
        dbQuery<Ticket>(queryStr, params).then(tickets => filters?.includeAssignments === false ? tickets : attachAssignments(tickets)),
      ])
      return { tickets, total: Number(countResult[0]?.count || 0) }
    }
  }

  // Memory fallback
  let list = memoryDb.tickets.map((t) => {
    const client = memoryDb.profiles.find((p) => p.id === t.client_id)
    const category = memoryDb.categories.find((c) => c.id === t.category_id)
    const assignments = memoryDb.assignments
      .filter((a) => a.ticket_id === t.id)
      .map((a) => ({
        ...a,
        employee: memoryDb.profiles.find((p) => p.id === a.employee_id),
      }))
    return { ...t, client, category, assignments }
  })

  if (filters?.status && filters.status !== 'all') {
    list = list.filter((t) => t.status === filters.status)
  }
  if (filters?.priority && filters.priority !== 'all') {
    list = list.filter((t) => t.priority === filters.priority)
  }
  if (filters?.category_id && filters.category_id !== 'all') {
    list = list.filter((t) => t.category_id === filters.category_id)
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase()
    list = list.filter(
      (t) =>
        t.ticket_number.toLowerCase().includes(s) ||
        t.title.toLowerCase().includes(s) ||
        t.client?.full_name.toLowerCase().includes(s)
    )
  }

  const total = list.length
  const paginated = list
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice((page - 1) * pageSize, page * pageSize)

  return { tickets: paginated, total }
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD METRICS
// ─────────────────────────────────────────────────────────────────────────────

export async function getDashboardStats(clientId?: string): Promise<DashboardStats> {
  if (isNeonConfigured()) {
    const rows = await dbQuery<{
      total: number
      open: number
      in_progress: number
      waiting_for_client: number
      waiting_for_support: number
      resolved: number
      closed: number
      assigned: number
    }>(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'open')::int AS open,
         COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
         COUNT(*) FILTER (WHERE status = 'waiting_for_client')::int AS waiting_for_client,
         COUNT(*) FILTER (WHERE status = 'waiting_for_support')::int AS waiting_for_support,
         COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
         COUNT(*) FILTER (WHERE status = 'closed')::int AS closed,
         COUNT(*) FILTER (WHERE status = 'assigned')::int AS assigned
       FROM tickets
       WHERE $1::uuid IS NULL OR client_id = $1`,
      [clientId ?? null]
    )
    return rows[0] ?? {
      total: 0,
      open: 0,
      in_progress: 0,
      waiting_for_client: 0,
      waiting_for_support: 0,
      resolved: 0,
      closed: 0,
      assigned: 0,
    }
  }

  const tickets = memoryDb.tickets.filter(ticket => !clientId || ticket.client_id === clientId)

  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    waiting_for_client: tickets.filter((t) => t.status === 'waiting_for_client').length,
    waiting_for_support: tickets.filter((t) => t.status === 'waiting_for_support').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
    assigned: tickets.filter((t) => t.status === 'assigned').length,
  }
}

const getRatingSummary = cache(() => dbQuery<{ avg: string; total: number }>(
  `SELECT COALESCE(ROUND(AVG(overall_rating)::numeric, 1), 5.0)::text AS avg,
          COUNT(*)::int AS total FROM ticket_ratings`
))

export async function getAdminDashboardStats() {
  if (isNeonConfigured()) {
    const [stats, todayRows, resolutionRows, ratingRows] = await Promise.all([
      getDashboardStats(),
      dbQuery<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM tickets WHERE created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + interval '1 day'`
      ),
      dbQuery<{ avg_hours: number | null }>(
        `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600))::int AS avg_hours
         FROM tickets
         WHERE resolved_at IS NOT NULL`
      ),
      getRatingSummary(),
    ])

    return {
      ...stats,
      newToday: todayRows[0]?.count ?? 0,
      avgResolutionHours: resolutionRows[0]?.avg_hours ?? 0,
      avgRating: ratingRows[0]?.avg ?? '5.0',
      totalReviews: ratingRows[0]?.total ?? 0,
    }
  }

  const stats = await getDashboardStats()
  const today = new Date().toISOString().slice(0, 10)
  const allTickets = (await getAllTickets({ pageSize: Math.max(memoryDb.tickets.length, 1) })).tickets
  const newToday = allTickets.filter((t) => {
    const raw = t.created_at as unknown
    const dStr = raw instanceof Date ? raw.toISOString() : String(t.created_at || '')
    return dStr.startsWith(today)
  }).length

  const resolvedTickets = allTickets.filter((t) => t.resolved_at)
  let avgResolutionHours = 0
  if (resolvedTickets.length > 0) {
    const totalHours = resolvedTickets.reduce((sum, t) => {
      const created = new Date(t.created_at).getTime()
      const resolved = new Date(t.resolved_at!).getTime()
      return sum + (resolved - created) / 3600000
    }, 0)
    avgResolutionHours = Math.round(totalHours / resolvedTickets.length)
  }

  const ratings = memoryDb.ratings
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((s, r) => s + r.overall_rating, 0) / ratings.length).toFixed(1)
      : '5.0'

  return {
    ...stats,
    newToday,
    avgResolutionHours,
    avgRating,
    totalReviews: ratings.length,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES & CONVERSATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns messages for a ticket.
 * SECURITY: If user is client, 'internal_note' messages are completely excluded!
 */
export async function getTicketMessages(
  ticketId: string,
  userRole: Role = 'client',
  options?: { after?: string; before?: string; limit?: number }
): Promise<TicketMessage[]> {
  if (isNeonConfigured()) {
    const internalFilter = userRole === 'client' ? "AND m.message_type != 'internal_note'" : ''
    const params: unknown[] = [ticketId]
    let afterFilter = ''
    if (options?.after) {
      params.push(options.after)
      afterFilter = `AND m.created_at > $${params.length}`
    }

    let beforeFilter = ''
    if (options?.before) {
      params.push(options.before)
      beforeFilter = `AND m.created_at < $${params.length}`
    }

    let limitClause = ''
    if (options?.limit && options.limit > 0) {
      params.push(options.limit)
      limitClause = `LIMIT $${params.length}`
    }

    const messages = await dbQuery<TicketMessage>(
      `SELECT m.id, m.ticket_id, m.sender_id, m.message_body, m.message_type,
              m.created_at, m.edited_at,
              ${publicProfileJson('p', 'sender')},
              COALESCE(att.attachments, '[]'::json) AS attachments
       FROM ticket_messages m
       JOIN profiles p ON m.sender_id = p.id
       LEFT JOIN LATERAL (
         SELECT json_agg(json_build_object(
           'id', a.id,
           'ticket_id', a.ticket_id,
           'message_id', a.message_id,
           'uploader_id', a.uploader_id,
           'storage_path', a.storage_path,
           'original_filename', a.original_filename,
           'mime_type', a.mime_type,
           'file_size', a.file_size,
           'created_at', a.created_at
         ) ORDER BY a.created_at) AS attachments
         FROM ticket_attachments a
         WHERE a.message_id = m.id
       ) att ON true
       WHERE m.ticket_id = $1 ${internalFilter} ${afterFilter} ${beforeFilter}
       ORDER BY m.created_at ASC
       ${limitClause}`,
      params
    )

    return messages.map((message) => ({
      ...message,
      attachments: Array.isArray(message.attachments) ? message.attachments : [],
    }))
  }

  // Memory fallback
  const afterTime = options?.after ? new Date(options.after).getTime() : null
  const beforeTime = options?.before ? new Date(options.before).getTime() : null
  let filtered = memoryDb.messages.filter((m) => {
    if (m.ticket_id !== ticketId) return false
    if (userRole === 'client' && m.message_type === 'internal_note') return false
    if (afterTime && new Date(m.created_at).getTime() <= afterTime) return false
    if (beforeTime && new Date(m.created_at).getTime() >= beforeTime) return false
    return true
  })

  if (options?.limit && options.limit > 0) {
    filtered = filtered.slice(0, options.limit)
  }

  return filtered
    .map((m) => {
      const sender = memoryDb.profiles.find((p) => p.id === m.sender_id)
      const attachments = memoryDb.attachments.filter((a) => a.message_id === m.id)
      return { ...m, sender, attachments }
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS HISTORY & TIMELINE
// ─────────────────────────────────────────────────────────────────────────────

export async function getTicketStatusHistory(ticketId: string): Promise<TicketStatusHistory[]> {
  if (isNeonConfigured()) {
    return dbQuery<TicketStatusHistory>(
      `SELECT h.*, ${publicProfileJson('p', 'changer')}
       FROM ticket_status_history h
       JOIN profiles p ON h.changed_by = p.id
       WHERE h.ticket_id = $1
       ORDER BY h.created_at ASC`,
      [ticketId]
    )
  }

  return memoryDb.statusHistory
    .filter((h) => h.ticket_id === ticketId)
    .map((h) => ({
      ...h,
      changer: memoryDb.profiles.find((p) => p.id === h.changed_by),
    }))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTACHMENTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getTicketAttachments(ticketId: string): Promise<TicketAttachment[]> {
  if (isNeonConfigured()) {
    try {
      return await dbQueryRequired<TicketAttachment>(
        `SELECT a.id, a.ticket_id, a.message_id, a.uploader_id, a.storage_path,
                a.original_filename, a.mime_type, a.file_size, a.created_at,
                json_build_object(
                  'id', p.id,
                  'full_name', p.full_name,
                  'avatar_url', p.avatar_url
                ) as uploader
         FROM ticket_attachments a
         JOIN profiles p ON a.uploader_id = p.id
         WHERE a.ticket_id = $1
         ORDER BY a.created_at DESC`,
        [ticketId]
      )
    } catch (err) {
      console.error('[getTicketAttachments Neon Error]:', err)
      throw err
    }
  }

  return memoryDb.attachments
    .filter((a) => a.ticket_id === ticketId)
    .map((a) => ({
      ...a,
      uploader: memoryDb.profiles.find((p) => p.id === a.uploader_id),
    }))
}

export async function createTicketAttachment(input: {
  ticketId: string
  uploaderId: string
  filename: string
  mimeType: string
  bytes: Uint8Array
}): Promise<TicketAttachment> {
  const id = randomUUID()
  const storagePath = `tickets/${input.ticketId}/${id}`
  const createdAt = new Date().toISOString()

  if (isNeonConfigured()) {
    const rows = await dbQueryRequired<TicketAttachment>(
      `INSERT INTO ticket_attachments (
         id, ticket_id, uploader_id, storage_path, original_filename,
         mime_type, file_size, file_data
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, ticket_id, message_id, uploader_id, storage_path,
                 original_filename, mime_type, file_size, created_at`,
      [
        id,
        input.ticketId,
        input.uploaderId,
        storagePath,
        input.filename,
        input.mimeType,
        input.bytes.byteLength,
        Buffer.from(input.bytes),
      ]
    )

    if (!rows[0]) {
      throw new Error('The uploaded file could not be saved.')
    }

    return rows[0]
  }

  const attachment: TicketAttachment = {
    id,
    ticket_id: input.ticketId,
    uploader_id: input.uploaderId,
    storage_path: storagePath,
    original_filename: input.filename,
    mime_type: input.mimeType,
    file_size: input.bytes.byteLength,
    created_at: createdAt,
  }
  memoryDb.attachments.unshift(attachment)
  memoryDb.attachmentFiles.set(id, Uint8Array.from(input.bytes))
  return attachment
}

export async function getTicketAttachmentContent(attachmentId: string): Promise<{
  ticketId: string
  filename: string
  mimeType: string
  bytes: Uint8Array
} | null> {
  if (isNeonConfigured()) {
    const rows = await dbQueryRequired<{
      ticket_id: string
      original_filename: string
      mime_type: string
      encoded_data: string | null
    }>(
      `SELECT ticket_id, original_filename, mime_type,
              encode(file_data, 'base64') AS encoded_data
       FROM ticket_attachments
       WHERE id = $1`,
      [attachmentId]
    )
    const row = rows[0]
    if (!row?.encoded_data) return null

    return {
      ticketId: row.ticket_id,
      filename: row.original_filename,
      mimeType: row.mime_type,
      bytes: Uint8Array.from(Buffer.from(row.encoded_data, 'base64')),
    }
  }

  const attachment = memoryDb.attachments.find((item) => item.id === attachmentId)
  const bytes = memoryDb.attachmentFiles.get(attachmentId)
  if (!attachment || !bytes) return null

  return {
    ticketId: attachment.ticket_id,
    filename: attachment.original_filename,
    mimeType: attachment.mime_type,
    bytes,
  }
}

export async function deleteClientTicketAttachment(
  attachmentId: string,
  clientId: string
): Promise<{ id: string; ticketId: string } | null> {
  if (isNeonConfigured()) {
    const rows = await dbQueryRequired<{ id: string; ticket_id: string }>(
      `DELETE FROM ticket_attachments a
       USING tickets t
       WHERE a.ticket_id = t.id
         AND a.id = $1
         AND a.uploader_id = $2
         AND t.client_id = $2
       RETURNING a.id, a.ticket_id`,
      [attachmentId, clientId]
    )

    const deleted = rows[0]
    return deleted ? { id: deleted.id, ticketId: deleted.ticket_id } : null
  }

  const attachmentIndex = memoryDb.attachments.findIndex(
    (attachment) =>
      attachment.id === attachmentId &&
      attachment.uploader_id === clientId &&
      memoryDb.tickets.some(
        (ticket) => ticket.id === attachment.ticket_id && ticket.client_id === clientId
      )
  )
  if (attachmentIndex < 0) return null

  const [deleted] = memoryDb.attachments.splice(attachmentIndex, 1)
  memoryDb.attachmentFiles.delete(deleted.id)
  return { id: deleted.id, ticketId: deleted.ticket_id }
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (isNeonConfigured()) {
    const res = await dbQuery<{ count: string }>(
      'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = $1 AND read_at IS NULL',
      [userId]
    )
    return parseInt(res[0]?.count || '0', 10)
  }

  return memoryDb.notifications.filter((n) => n.recipient_id === userId && !n.read_at).length
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (isNeonConfigured()) {
    return dbQuery<Notification>(
      `SELECT n.*,
              CASE WHEN t.id IS NULL THEN NULL
                   ELSE json_build_object('ticket_number', t.ticket_number, 'title', t.title)
              END as ticket
       FROM notifications n
       LEFT JOIN tickets t ON n.ticket_id = t.id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    )
  }

  return memoryDb.notifications
    .filter((n) => n.recipient_id === userId)
    .map((n) => {
      const ticket = memoryDb.tickets.find((t) => t.id === n.ticket_id)
      return { ...n, ticket }
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILES & PEOPLE
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllClients(): Promise<Profile[]> {
  if (isNeonConfigured()) {
    return dbQuery<Profile>(
      'SELECT id, full_name, email, role, account_status, avatar_url, created_at, updated_at FROM profiles WHERE role = $1 ORDER BY created_at DESC',
      ['client']
    )
  }

  return memoryDb.profiles.filter((p) => p.role === 'client')
}

export async function getAllEmployees(): Promise<Profile[]> {
  if (isNeonConfigured()) {
    return dbQuery<Profile>(
      `SELECT id, full_name, email, role, account_status, avatar_url, created_at, updated_at 
       FROM profiles 
       WHERE role IN ('employee', 'admin') 
       ORDER BY full_name ASC`,
      []
    )
  }

  return memoryDb.profiles.filter((p) => p.role === 'employee' || p.role === 'admin')
}

export async function getCategories(): Promise<TicketCategory[]> {
  if (isNeonConfigured()) {
    return dbQuery<TicketCategory>(
      'SELECT * FROM ticket_categories WHERE is_active = true ORDER BY name ASC',
      []
    )
  }

  return memoryDb.categories.filter((c) => c.is_active)
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

export async function getAssignmentCountsByEmployee(): Promise<Record<string, number>> {
  if (isNeonConfigured()) {
    const rows = await dbQuery<{ employee_id: string; count: number }>(
      `SELECT employee_id, COUNT(*)::int AS count
       FROM ticket_assignments
       GROUP BY employee_id`
    )
    return Object.fromEntries(rows.map((row) => [row.employee_id, row.count]))
  }

  const counts: Record<string, number> = {}
  for (const assignment of memoryDb.assignments) {
    counts[assignment.employee_id] = (counts[assignment.employee_id] || 0) + 1
  }
  return counts
}

export async function getAdminReportData() {
  if (isNeonConfigured()) {
    const [dayRows, statusRows, priorityRows, categoryRows, workloadRows, ratingRows] =
      await Promise.all([
        dbQuery<{ date: string; count: number }>(
          `SELECT to_char(d.day, 'MM-DD') AS date, COUNT(t.id)::int AS count
           FROM generate_series(CURRENT_DATE - 29, CURRENT_DATE, interval '1 day') AS d(day)
           LEFT JOIN tickets t ON t.created_at >= d.day AND t.created_at < d.day + interval '1 day'
           GROUP BY d.day
           ORDER BY d.day`
        ),
        dbQuery<{ status: string; count: number }>(
          `SELECT status, COUNT(*)::int AS count FROM tickets GROUP BY status`
        ),
        dbQuery<{ priority: string; count: number }>(
          `SELECT priority, COUNT(*)::int AS count FROM tickets GROUP BY priority`
        ),
        dbQuery<{ category: string; count: number }>(
          `SELECT COALESCE(c.name, 'General') AS category, COUNT(*)::int AS count
           FROM tickets t
           LEFT JOIN ticket_categories c ON t.category_id = c.id
           GROUP BY COALESCE(c.name, 'General')`
        ),
        dbQuery<{ name: string; tickets: number }>(
          `SELECT split_part(p.full_name, ' ', 1) AS name, COUNT(a.id)::int AS tickets
           FROM profiles p
           LEFT JOIN ticket_assignments a ON a.employee_id = p.id
           WHERE p.role IN ('employee', 'admin')
           GROUP BY p.id, p.full_name
           ORDER BY p.full_name`
        ),
        getRatingSummary(),
      ])

    return {
      ticketsPerDay: dayRows,
      byStatus: statusRows,
      byPriority: priorityRows,
      byCategory: categoryRows,
      employeeWorkload: workloadRows,
      avgRating: ratingRows[0]?.avg ?? '5.0',
      totalRatings: ratingRows[0]?.total ?? 0,
    }
  }

  const { tickets } = await getAllTickets({ pageSize: 500 })

  // Daily tickets (last 30 days)
  const dayMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    dayMap[key] = 0
  }

  for (const t of tickets) {
    const raw = t.created_at as unknown
    const dStr = raw instanceof Date ? raw.toISOString() : String(t.created_at || '')
    const key = dStr.slice(0, 10)
    if (dayMap[key] !== undefined) {
      dayMap[key]++
    }
  }

  const ticketsPerDay = Object.entries(dayMap).map(([date, count]) => ({
    date: date.slice(5),
    count,
  }))

  // Status breakdown
  const statusCounts: Record<string, number> = {}
  for (const t of tickets) {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1
  }
  const byStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  // Priority breakdown
  const priorityCounts: Record<string, number> = {}
  for (const t of tickets) {
    priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1
  }
  const byPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
    priority,
    count,
  }))

  // Category breakdown
  const categoryCounts: Record<string, number> = {}
  for (const t of tickets) {
    const catName = t.category?.name || 'General'
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1
  }
  const byCategory = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
  }))

  const employees = await getAllEmployees()
  const assignmentCounts = await getAssignmentCountsByEmployee()
  const employeeWorkload = employees.map((emp) => ({
    name: emp.full_name.split(' ')[0],
    tickets: assignmentCounts[emp.id] || 0,
  }))

  // Ratings
  const ratings = memoryDb.ratings
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((s, r) => s + r.overall_rating, 0) / ratings.length).toFixed(1)
      : '5.0'

  return {
    ticketsPerDay,
    byStatus,
    byPriority,
    byCategory,
    employeeWorkload,
    avgRating,
    totalRatings: ratings.length,
  }
}
