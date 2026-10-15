'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth/session'
import { isNeonConfigured, dbQuery, memoryDb } from '@/lib/db'
import {
  isTicketResolutionMethod,
  type Ticket,
  type TicketStatus,
  type Priority,
  type MessageType,
  type Role,
} from '@/lib/types'

const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category_id: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  affected_service: z.string().optional(),
  serial_number: z.string().max(255, 'Serial number must be 255 characters or fewer').optional(),
  additional_info: z.string().optional(),
})

export type TicketActionState =
  | {
      error?: string
      errors?: Record<string, string[]>
      success?: boolean
      ticketId?: string
    }
  | undefined

export async function createTicket(
  prevState: TicketActionState,
  formData: FormData
): Promise<TicketActionState> {
  const session = await getSession()
  if (!session) return { error: 'You must be logged in to create a ticket.' }

  if (session.role !== 'client') {
    return { error: 'Only clients can submit technical support tickets.' }
  }

  const raw = {
    title: (formData.get('title') as string)?.trim(),
    description: (formData.get('description') as string)?.trim(),
    category_id: (formData.get('category_id') as string) || undefined,
    priority: (formData.get('priority') as string) as Priority,
    affected_service: (formData.get('affected_service') as string)?.trim() || undefined,
    serial_number: (formData.get('serial_number') as string)?.trim() || undefined,
    additional_info: (formData.get('additional_info') as string)?.trim() || undefined,
  }

  const result = createTicketSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  let ticketId = ''

  if (isNeonConfigured()) {
    try {
      const ticketNumResult = await dbQuery<{ generate_ticket_number: string }>(
        'SELECT generate_ticket_number()'
      )
      let ticketNumber = ticketNumResult[0]?.generate_ticket_number
      if (!ticketNumber) {
        ticketNumber = `TW-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`
      }

      let rows = await dbQuery<Ticket>(
        `INSERT INTO tickets (
          ticket_number, client_id, title, description, category_id,
          priority, status, affected_service, serial_number, additional_info
        ) VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, $8, $9)
        RETURNING id`,
        [
          ticketNumber,
          session.id,
          result.data.title,
          result.data.description,
          result.data.category_id || null,
          result.data.priority,
          result.data.affected_service || null,
          result.data.serial_number || null,
          result.data.additional_info || null,
        ]
      )

      if (!rows || rows.length === 0) {
        // Fallback with timestamp-based unique ticket number
        const fallbackNum = `TW-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
        rows = await dbQuery<Ticket>(
          `INSERT INTO tickets (
            ticket_number, client_id, title, description, category_id,
            priority, status, affected_service, serial_number, additional_info
          ) VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, $8, $9)
          RETURNING id`,
          [
            fallbackNum,
            session.id,
            result.data.title,
            result.data.description,
            result.data.category_id || null,
            result.data.priority,
            result.data.affected_service || null,
            result.data.serial_number || null,
            result.data.additional_info || null,
          ]
        )
      }

      if (!rows || rows.length === 0) {
        return { error: 'Failed to record ticket in database.' }
      }

      ticketId = rows[0].id

      // Status history
      await dbQuery(
        `INSERT INTO ticket_status_history (ticket_id, new_status, changed_by, change_note)
         VALUES ($1, 'open', $2, 'Ticket submitted by client')`,
        [ticketId, session.id]
      )

      // Notify Admins
      await dbQuery(
        `INSERT INTO notifications (recipient_id, ticket_id, notification_type, title, body)
         SELECT id, $1, 'ticket_created', 'New Ticket Submitted', $2
         FROM profiles WHERE role = 'admin'`,
        [ticketId, `Ticket #${ticketNumber}: "${result.data.title}" submitted.`]
      )
    } catch (err) {
      console.error('[Create Ticket Neon Error]:', err)
      return { error: 'Failed to create ticket in database.' }
    }
  } else {
    // Memory fallback
    ticketId = `t-${Date.now()}`
    const ticketNumber = memoryDb.generateTicketNumber()

    const newTicket: Ticket = {
      id: ticketId,
      ticket_number: ticketNumber,
      client_id: session.id,
      title: result.data.title,
      description: result.data.description,
      category_id: result.data.category_id,
      priority: result.data.priority,
      status: 'open',
      affected_service: result.data.affected_service,
      serial_number: result.data.serial_number,
      additional_info: result.data.additional_info,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    memoryDb.tickets.unshift(newTicket)

    memoryDb.statusHistory.push({
      id: `hist-${Date.now()}`,
      ticket_id: ticketId,
      new_status: 'open',
      changed_by: session.id,
      change_note: 'Ticket submitted by client',
      created_at: new Date().toISOString(),
    })

    // Notify Admins
    const admins = memoryDb.profiles.filter((p) => p.role === 'admin')
    for (const a of admins) {
      memoryDb.notifications.push({
        id: `notif-${Date.now()}-${a.id}`,
        recipient_id: a.id,
        ticket_id: ticketId,
        notification_type: 'ticket_created',
        title: 'New Ticket Submitted',
        body: `Ticket #${ticketNumber}: "${result.data.title}" submitted.`,
        created_at: new Date().toISOString(),
      })
    }
  }

  revalidatePath('/client')
  revalidatePath('/client/tickets')
  revalidatePath('/admin')
  revalidatePath('/admin/tickets')
  redirect(`/client/tickets/${ticketId}`)
}

export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  note?: string
) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const isResolved = newStatus === 'resolved'
  const isClosed = newStatus === 'closed'
  const now = new Date().toISOString()

  if (isNeonConfigured()) {
    try {
      await dbQuery(
        `UPDATE tickets 
         SET status = $1, 
             updated_at = NOW(),
             resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END,
             closed_at = CASE WHEN $1 = 'closed' THEN NOW() ELSE closed_at END
         WHERE id = $2`,
        [newStatus, ticketId]
      )

      await dbQuery(
        `INSERT INTO ticket_status_history (ticket_id, new_status, changed_by, change_note)
         VALUES ($1, $2, $3, $4)`,
        [ticketId, newStatus, session.id, note || `Status changed to ${newStatus}`]
      )
    } catch (err) {
      console.error('[updateTicketStatus Neon Error]:', err)
    }
  } else {
    const ticket = memoryDb.tickets.find((t) => t.id === ticketId)
    if (ticket) {
      const prev = ticket.status
      ticket.status = newStatus
      ticket.updated_at = now
      if (isResolved) ticket.resolved_at = now
      if (isClosed) ticket.closed_at = now

      memoryDb.statusHistory.push({
        id: `hist-${Date.now()}`,
        ticket_id: ticketId,
        previous_status: prev,
        new_status: newStatus,
        changed_by: session.id,
        change_note: note || `Status updated to ${newStatus}`,
        created_at: now,
      })

      // Notify client
      memoryDb.notifications.push({
        id: `notif-${Date.now()}`,
        recipient_id: ticket.client_id,
        ticket_id: ticketId,
        notification_type: 'status_changed',
        title: `Ticket Status Updated`,
        body: `Your ticket #${ticket.ticket_number} status is now ${newStatus}.`,
        created_at: now,
      })
    }
  }

  revalidatePath(`/client/tickets/${ticketId}`)
  revalidatePath(`/admin/tickets/${ticketId}`)
  revalidatePath(`/employee/tickets/${ticketId}`)
  revalidatePath('/admin/tickets')
}

export async function assignEmployee(
  ticketId: string,
  employeeId: string,
  isPrimary: boolean = false
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    throw new Error('Only administrators can assign employees.')
  }

  const now = new Date().toISOString()

  if (isNeonConfigured()) {
    try {
      await dbQuery(
        `INSERT INTO ticket_assignments (ticket_id, employee_id, assigned_by, is_primary)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (ticket_id, employee_id) DO UPDATE SET is_primary = $4`,
        [ticketId, employeeId, session.id, isPrimary]
      )

      // Move ticket to 'assigned' if currently 'open'
      await dbQuery(
        `UPDATE tickets SET status = 'assigned', updated_at = NOW() WHERE id = $1 AND status = 'open'`,
        [ticketId]
      )

      // Notify the assigned employee
      await dbQuery(
        `INSERT INTO notifications (recipient_id, ticket_id, notification_type, title, body)
         VALUES ($1, $2, 'ticket_assigned', 'Ticket Assigned', 'You have been assigned to handle a ticket.')`,
        [employeeId, ticketId]
      )
    } catch (err) {
      console.error('[assignEmployee Neon Error]:', err)
    }
  } else {
    const existing = memoryDb.assignments.find(
      (a) => a.ticket_id === ticketId && a.employee_id === employeeId
    )
    if (!existing) {
      memoryDb.assignments.push({
        id: `asg-${Date.now()}`,
        ticket_id: ticketId,
        employee_id: employeeId,
        assigned_by: session.id,
        is_primary: isPrimary,
        assigned_at: now,
      })
    }

    const ticket = memoryDb.tickets.find((t) => t.id === ticketId)
    if (ticket && ticket.status === 'open') {
      ticket.status = 'assigned'
      ticket.updated_at = now
    }

    // Notify employee
    memoryDb.notifications.push({
      id: `notif-${Date.now()}`,
      recipient_id: employeeId,
      ticket_id: ticketId,
      notification_type: 'ticket_assigned',
      title: 'Ticket Assigned to You',
      body: `You have been assigned to ticket #${ticket?.ticket_number}.`,
      created_at: now,
    })
  }

  revalidatePath(`/admin/tickets/${ticketId}`)
  revalidatePath('/employee')
}

export async function unassignEmployee(ticketId: string, employeeId: string) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    throw new Error('Only administrators can unassign staff.')
  }

  if (isNeonConfigured()) {
    try {
      await dbQuery(
        'DELETE FROM ticket_assignments WHERE ticket_id = $1 AND employee_id = $2',
        [ticketId, employeeId]
      )
    } catch (err) {
      console.error('[unassignEmployee Neon Error]:', err)
    }
  } else {
    memoryDb.assignments = memoryDb.assignments.filter(
      (a) => !(a.ticket_id === ticketId && a.employee_id === employeeId)
    )
  }

  revalidatePath(`/admin/tickets/${ticketId}`)
}

export async function sendMessage(
  ticketId: string,
  messageBody: string,
  messageType: MessageType = 'client_message'
) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const trimmed = messageBody.trim()
  if (!trimmed) throw new Error('Message body cannot be empty')

  // Security enforcement: clients can NEVER send internal notes
  let safeType = messageType
  if (session.role === 'client') {
    safeType = 'client_message'
  } else if (session.role === 'admin' || session.role === 'employee') {
    if (safeType !== 'internal_note') {
      safeType = 'staff_message'
    }
  }

  const now = new Date().toISOString()

  if (isNeonConfigured()) {
    try {
      await dbQuery(
        `INSERT INTO ticket_messages (ticket_id, sender_id, message_body, message_type)
         VALUES ($1, $2, $3, $4)`,
        [ticketId, session.id, trimmed, safeType]
      )

      await dbQuery('UPDATE tickets SET updated_at = NOW() WHERE id = $1', [ticketId])
    } catch (err) {
      console.error('[sendMessage Neon Error]:', err)
    }
  } else {
    memoryDb.messages.push({
      id: `msg-${Date.now()}`,
      ticket_id: ticketId,
      sender_id: session.id,
      message_body: trimmed,
      message_type: safeType,
      created_at: now,
    })

    const ticket = memoryDb.tickets.find((t) => t.id === ticketId)
    if (ticket) ticket.updated_at = now
  }

  revalidatePath(`/client/tickets/${ticketId}`)
  revalidatePath(`/admin/tickets/${ticketId}`)
  revalidatePath(`/employee/tickets/${ticketId}`)
}

export async function confirmResolution(ticketId: string, confirmed: boolean) {
  const session = await getSession()
  if (!session || session.role !== 'client') {
    throw new Error('Only the client can confirm resolution.')
  }

  const newStatus: TicketStatus = confirmed ? 'closed' : 'in_progress'
  const note = confirmed
    ? 'Resolution confirmed and closed by client.'
    : 'Client reported the issue remains unresolved; reopened for investigation.'

  await updateTicketStatus(ticketId, newStatus, note)
}

export async function submitRating(
  ticketId: string,
  rating: number,
  resolutionMethod: string,
  feedback?: string
) {
  const session = await getSession()
  if (!session || session.role !== 'client') {
    throw new Error('Only clients can rate tickets.')
  }

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5.')
  }

  if (!isTicketResolutionMethod(resolutionMethod)) {
    throw new Error('Please select how the problem was resolved.')
  }

  const now = new Date().toISOString()

  if (isNeonConfigured()) {
    try {
      await dbQuery(
        `INSERT INTO ticket_ratings (
           ticket_id, client_id, overall_rating, resolution_method, feedback
         )
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (ticket_id) DO NOTHING`,
        [ticketId, session.id, rating, resolutionMethod, feedback || null]
      )
    } catch (err) {
      console.error('[submitRating Neon Error]:', err)
      throw new Error('Failed to save your rating. Please try again.')
    }
  } else {
    const existing = memoryDb.ratings.find((r) => r.ticket_id === ticketId)
    if (!existing) {
      memoryDb.ratings.push({
        id: `rate-${Date.now()}`,
        ticket_id: ticketId,
        client_id: session.id,
        overall_rating: rating,
        resolution_method: resolutionMethod,
        feedback: feedback || '',
        created_at: now,
      })
    }
  }

  revalidatePath(`/client/tickets/${ticketId}`)
  revalidatePath('/admin/ratings')
}

export async function markNotificationsRead() {
  const session = await getSession()
  if (!session) return

  const now = new Date().toISOString()

  if (isNeonConfigured()) {
    try {
      await dbQuery('UPDATE notifications SET read_at = NOW() WHERE recipient_id = $1', [session.id])
    } catch (err) {
      console.error('[markNotificationsRead Neon Error]:', err)
    }
  } else {
    for (const n of memoryDb.notifications) {
      if (n.recipient_id === session.id) {
        n.read_at = now
      }
    }
  }

  revalidatePath('/client/notifications')
  revalidatePath('/admin/notifications')
  revalidatePath('/employee/notifications')
}

export async function createEmployeeAccount(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    throw new Error('Only administrators can add employees.')
  }

  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'employee'
  const department = (formData.get('department') as string)?.trim() || 'Technical Support'

  if (!fullName || !email || !password || password.length < 8) {
    throw new Error('All fields are required. Password must be at least 8 characters.')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const now = new Date().toISOString()

  if (isNeonConfigured()) {
    try {
      await dbQuery(
        `INSERT INTO profiles (full_name, email, password_hash, role, account_status, department)
         VALUES ($1, $2, $3, $4, 'active', $5)`,
        [fullName, email, passwordHash, role, department]
      )
    } catch (err) {
      console.error('[createEmployeeAccount Neon Error]:', err)
      throw new Error('Failed to create account. Email may already be in use.')
    }
  } else {
    const existing = memoryDb.profiles.find((p) => p.email === email)
    if (existing) throw new Error('Email is already registered.')

    memoryDb.profiles.push({
      id: `emp-${Date.now()}`,
      full_name: fullName,
      email,
      role: role as Role,
      account_status: 'active',
      created_at: now,
      updated_at: now,
    })
    memoryDb.passwords[email] = passwordHash
  }

  revalidatePath('/admin/employees')
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

  if (isNeonConfigured()) {
    try {
      await dbQuery('UPDATE profiles SET account_status = $1, updated_at = NOW() WHERE id = $2', [
        newStatus,
        userId,
      ])
    } catch (err) {
      console.error('[toggleUserStatus Neon Error]:', err)
    }
  } else {
    const user = memoryDb.profiles.find((p) => p.id === userId)
    if (user) {
      user.account_status = newStatus as 'active' | 'inactive'
      user.updated_at = new Date().toISOString()
    }
  }

  revalidatePath('/admin/clients')
  revalidatePath('/admin/employees')
}
