import { isNeonConfigured, dbQuery, memoryDb } from '@/lib/db'
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

// ─────────────────────────────────────────────────────────────────────────────
// TICKETS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all tickets submitted by a specific client.
 */
export async function getClientTickets(clientId: string): Promise<Ticket[]> {
  if (isNeonConfigured()) {
    try {
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

      // Fetch assignments for these tickets
      for (const t of tickets) {
        t.assignments = await dbQuery<TicketAssignment>(
          `SELECT a.*, row_to_json(p.*) as employee
           FROM ticket_assignments a
           JOIN profiles p ON a.employee_id = p.id
           WHERE a.ticket_id = $1`,
          [t.id]
        )
      }
      return tickets
    } catch (err) {
      console.error('[getClientTickets Neon Error]:', err)
    }
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

/**
 * Returns a single ticket by ID with complete relationships, enforcing security rules.
 */
export async function getTicketById(
  ticketId: string,
  user?: { id: string; role: Role }
): Promise<Ticket | null> {
  let ticket: Ticket | null = null

  if (isNeonConfigured()) {
    try {
      const rows = await dbQuery<Ticket>(
        `SELECT t.*, 
                row_to_json(p.*) as client,
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
          `SELECT a.*, row_to_json(p.*) as employee
           FROM ticket_assignments a
           JOIN profiles p ON a.employee_id = p.id
           WHERE a.ticket_id = $1`,
          [ticketId]
        )
      }
    } catch (err) {
      console.error('[getTicketById Neon Error]:', err)
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
    try {
      const tickets = await dbQuery<Ticket>(
        `SELECT t.*, 
                row_to_json(p.*) as client,
                row_to_json(c.*) as category
         FROM tickets t
         JOIN ticket_assignments a ON t.id = a.ticket_id
         JOIN profiles p ON t.client_id = p.id
         LEFT JOIN ticket_categories c ON t.category_id = c.id
         WHERE a.employee_id = $1
         ORDER BY t.updated_at DESC`,
        [employeeId]
      )
      for (const t of tickets) {
        t.assignments = await dbQuery<TicketAssignment>(
          `SELECT a.*, row_to_json(p.*) as employee
           FROM ticket_assignments a
           JOIN profiles p ON a.employee_id = p.id
           WHERE a.ticket_id = $1`,
          [t.id]
        )
      }
      return tickets
    } catch (err) {
      console.error('[getEmployeeTickets Neon Error]:', err)
    }
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
}): Promise<{ tickets: Ticket[]; total: number }> {
  const page = filters?.page || 1
  const pageSize = filters?.pageSize || 20

  if (isNeonConfigured()) {
    try {
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

      const countResult = await dbQuery<{ count: string }>(
        `SELECT COUNT(*) as count FROM tickets t JOIN profiles p ON t.client_id = p.id ${whereClause}`,
        params
      )
      const total = parseInt(countResult[0]?.count || '0', 10)

      params.push(pageSize)
      params.push((page - 1) * pageSize)
      const queryStr = `
        SELECT t.*, 
               row_to_json(p.*) as client,
               row_to_json(c.*) as category
        FROM tickets t
        JOIN profiles p ON t.client_id = p.id
        LEFT JOIN ticket_categories c ON t.category_id = c.id
        ${whereClause}
        ORDER BY t.created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `
      const tickets = await dbQuery<Ticket>(queryStr, params)

      for (const t of tickets) {
        t.assignments = await dbQuery<TicketAssignment>(
          `SELECT a.*, row_to_json(p.*) as employee
           FROM ticket_assignments a
           JOIN profiles p ON a.employee_id = p.id
           WHERE a.ticket_id = $1`,
          [t.id]
        )
      }

      return { tickets, total }
    } catch (err) {
      console.error('[getAllTickets Neon Error]:', err)
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
  const tickets = clientId ? await getClientTickets(clientId) : (await getAllTickets()).tickets

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

export async function getAdminDashboardStats() {
  const stats = await getDashboardStats()
  const today = new Date().toISOString().slice(0, 10)
  const allTickets = (await getAllTickets()).tickets
  const newToday = allTickets.filter((t) => {
    const raw = t.created_at as unknown
    const dStr = raw instanceof Date ? raw.toISOString() : String(t.created_at || '')
    return dStr.startsWith(today)
  }).length

  // Calculate Average Resolution Time
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

  // Client satisfaction
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
  userRole: Role = 'client'
): Promise<TicketMessage[]> {
  if (isNeonConfigured()) {
    try {
      const internalFilter = userRole === 'client' ? "AND m.message_type != 'internal_note'" : ''
      const messages = await dbQuery<TicketMessage>(
        `SELECT m.*, row_to_json(p.*) as sender
         FROM ticket_messages m
         JOIN profiles p ON m.sender_id = p.id
         WHERE m.ticket_id = $1 ${internalFilter}
         ORDER BY m.created_at ASC`,
        [ticketId]
      )

      for (const msg of messages) {
        msg.attachments = await dbQuery<TicketAttachment>(
          `SELECT id, ticket_id, message_id, uploader_id, storage_path, original_filename,
                  mime_type, file_size, created_at
           FROM ticket_attachments
           WHERE message_id = $1`,
          [msg.id]
        )
      }
      return messages
    } catch (err) {
      console.error('[getTicketMessages Neon Error]:', err)
    }
  }

  // Memory fallback
  return memoryDb.messages
    .filter((m) => {
      if (m.ticket_id !== ticketId) return false
      if (userRole === 'client' && m.message_type === 'internal_note') return false
      return true
    })
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
    try {
      return await dbQuery<TicketStatusHistory>(
        `SELECT h.*, row_to_json(p.*) as changer
         FROM ticket_status_history h
         JOIN profiles p ON h.changed_by = p.id
         WHERE h.ticket_id = $1
         ORDER BY h.created_at ASC`,
        [ticketId]
      )
    } catch (err) {
      console.error('[getTicketStatusHistory Neon Error]:', err)
    }
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
      return await dbQuery<TicketAttachment>(
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
    const rows = await dbQuery<TicketAttachment>(
      `INSERT INTO ticket_attachments (
         id, ticket_id, uploader_id, storage_path, original_filename,
         mime_type, file_size, file_data
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, decode($8, 'base64'))
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
        Buffer.from(input.bytes).toString('base64'),
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
    const rows = await dbQuery<{
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

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (isNeonConfigured()) {
    try {
      const res = await dbQuery<{ count: string }>(
        'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = $1 AND read_at IS NULL',
        [userId]
      )
      return parseInt(res[0]?.count || '0', 10)
    } catch (err) {
      console.error('[getUnreadNotificationCount Neon Error]:', err)
    }
  }

  return memoryDb.notifications.filter((n) => n.recipient_id === userId && !n.read_at).length
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (isNeonConfigured()) {
    try {
      return await dbQuery<Notification>(
        `SELECT n.*, row_to_json(t.*) as ticket
         FROM notifications n
         LEFT JOIN tickets t ON n.ticket_id = t.id
         WHERE n.recipient_id = $1
         ORDER BY n.created_at DESC
         LIMIT 50`,
        [userId]
      )
    } catch (err) {
      console.error('[getNotifications Neon Error]:', err)
    }
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
    try {
      return await dbQuery<Profile>(
        'SELECT id, full_name, email, role, account_status, avatar_url, created_at, updated_at FROM profiles WHERE role = $1 ORDER BY created_at DESC',
        ['client']
      )
    } catch (err) {
      console.error('[getAllClients Neon Error]:', err)
    }
  }

  return memoryDb.profiles.filter((p) => p.role === 'client')
}

export async function getAllEmployees(): Promise<Profile[]> {
  if (isNeonConfigured()) {
    try {
      return await dbQuery<Profile>(
        `SELECT id, full_name, email, role, account_status, avatar_url, created_at, updated_at 
         FROM profiles 
         WHERE role IN ('employee', 'admin') 
         ORDER BY full_name ASC`,
        []
      )
    } catch (err) {
      console.error('[getAllEmployees Neon Error]:', err)
    }
  }

  return memoryDb.profiles.filter((p) => p.role === 'employee' || p.role === 'admin')
}

export async function getCategories(): Promise<TicketCategory[]> {
  if (isNeonConfigured()) {
    try {
      return await dbQuery<TicketCategory>(
        'SELECT * FROM ticket_categories WHERE is_active = true ORDER BY name ASC',
        []
      )
    } catch (err) {
      console.error('[getCategories Neon Error]:', err)
    }
  }

  return memoryDb.categories.filter((c) => c.is_active)
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdminReportData() {
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

  // Employee workload
  const employees = await getAllEmployees()
  const employeeWorkload = employees.map((emp) => {
    const assignedCount = memoryDb.assignments.filter((a) => a.employee_id === emp.id).length
    return {
      name: emp.full_name.split(' ')[0],
      tickets: assignedCount,
    }
  })

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
