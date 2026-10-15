export type Role = 'client' | 'employee' | 'admin'
export type AccountStatus = 'active' | 'inactive' | 'suspended'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type TicketStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'waiting_for_client'
  | 'waiting_for_support'
  | 'resolved'
  | 'closed'
export type MessageType = 'client_message' | 'staff_message' | 'internal_note' | 'system_event'
export type NotificationType =
  | 'ticket_created'
  | 'ticket_assigned'
  | 'new_message'
  | 'file_shared'
  | 'status_changed'
  | 'ticket_resolved'
  | 'ticket_reopened'
  | 'ticket_closed'
  | 'rating_submitted'

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  role: Role
  account_status: AccountStatus
  created_at: string
  updated_at: string
}

export interface TicketCategory {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface Ticket {
  id: string
  ticket_number: string
  client_id: string
  title: string
  description: string
  category_id?: string
  priority: Priority
  status: TicketStatus
  affected_service?: string
  reference_url?: string
  preferred_contact?: string
  additional_info?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  closed_at?: string
  // Joined fields
  client?: Profile
  category?: TicketCategory
  assignments?: TicketAssignment[]
  rating?: TicketRating
}

export interface TicketAssignment {
  id: string
  ticket_id: string
  employee_id: string
  assigned_by: string
  is_primary: boolean
  assigned_at: string
  employee?: Profile
  assigner?: Profile
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  message_body: string
  message_type: MessageType
  created_at: string
  edited_at?: string
  sender?: Profile
  attachments?: TicketAttachment[]
}

export interface TicketAttachment {
  id: string
  ticket_id: string
  message_id?: string
  uploader_id: string
  storage_path: string
  original_filename: string
  mime_type: string
  file_size: number
  created_at: string
  uploader?: Profile
}

export interface TicketStatusHistory {
  id: string
  ticket_id: string
  previous_status?: TicketStatus
  new_status: TicketStatus
  changed_by: string
  change_note?: string
  created_at: string
  changer?: Profile
}

export interface TicketRating {
  id: string
  ticket_id: string
  client_id: string
  overall_rating: number
  feedback?: string
  created_at: string
  client?: Profile
}

export interface Notification {
  id: string
  recipient_id: string
  ticket_id?: string
  notification_type: NotificationType
  title: string
  body: string
  read_at?: string
  created_at: string
  ticket?: Pick<Ticket, 'ticket_number' | 'title'>
}

export interface AuditLog {
  id: string
  actor_id: string
  ticket_id?: string
  action: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface DashboardStats {
  total: number
  open: number
  in_progress: number
  waiting_for_client: number
  waiting_for_support: number
  resolved: number
  closed: number
  assigned: number
}
