import type {
  Profile,
  Ticket,
  TicketAssignment,
  TicketMessage,
  TicketAttachment,
  TicketStatusHistory,
  TicketRating,
  TicketCategory,
  Notification,
  AuditLog,
} from '@/lib/types'

// In-memory data structures initialized with production-like seed data
class MemoryDb {
  profiles: Profile[] = [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      full_name: 'Alexander Vance (System Admin)',
      email: 'admin@technologyworld.com',
      role: 'admin',
      account_status: 'active',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      full_name: 'John Mitchell (Senior Engineer)',
      email: 'john.dev@technologyworld.com',
      role: 'employee',
      account_status: 'active',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'e0000000-0000-0000-0000-000000000002',
      full_name: 'Sarah Jenkins (DevOps Lead)',
      email: 'sarah.ops@technologyworld.com',
      role: 'employee',
      account_status: 'active',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      full_name: 'Robert Chen (Acme Corp)',
      email: 'client@acmecorp.com',
      role: 'client',
      account_status: 'active',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  // Password hashes (bcrypt for 'Admin@12345', 'Employee@12345', 'Client@12345')
  passwords: Record<string, string> = {
    'admin@technologyworld.com': '$2b$10$WUo/sx18oZPrjzmPfCJ6tOdOEN7Ft//Qb1q2OjhpFYZ5/a7i8jqlK',
    'john.dev@technologyworld.com': '$2b$10$qRcGjtfpZNPzGPrYH.u.fOQXRfMgYjwtb5M8uSTF33/0sG9N9UlBO',
    'sarah.ops@technologyworld.com': '$2b$10$qRcGjtfpZNPzGPrYH.u.fOQXRfMgYjwtb5M8uSTF33/0sG9N9UlBO',
    'client@acmecorp.com': '$2b$10$YcrFiYC5By7eoThhlWNcMuo3By6DQwAU2TqvFGK8yV7nVkakSvNMa',
  }

  categories: TicketCategory[] = [
    {
      id: 'cat-1',
      name: 'Cloud Infrastructure & DevOps',
      description: 'Servers, cloud deployments, AWS, Azure, CI/CD pipeline issues',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cat-2',
      name: 'Software & Web Applications',
      description: 'Frontend bugs, API errors, database connectivity, and backend services',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cat-3',
      name: 'Network & VPN Connectivity',
      description: 'Firewall, corporate network, VPN tunnels, and DNS configuration',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cat-4',
      name: 'Account Security & Identity',
      description: 'SSO, credentials, 2FA, permissions, and security audit concerns',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'cat-5',
      name: 'Database & Storage Services',
      description: 'PostgreSQL, query performance, backups, and storage quotas',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ]

  tickets: Ticket[] = [
    {
      id: 't0000000-0000-0000-0000-000000000001',
      ticket_number: 'TW-2026-00001',
      client_id: 'c0000000-0000-0000-0000-000000000001',
      title: 'Production Kubernetes cluster node degradation in us-east region',
      description:
        'Our primary EKS worker pool has reported high latency and 504 gateway timeout errors on ingress endpoints since 14:00 UTC. Need urgent cluster health inspection.',
      category_id: 'cat-1',
      priority: 'critical',
      status: 'in_progress',
      affected_service: 'Kubernetes EKS Production Cluster',
      reference_url: 'https://status.acmecorp.com',
      preferred_contact: 'Slack & Email',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 't0000000-0000-0000-0000-000000000002',
      ticket_number: 'TW-2026-00002',
      client_id: 'c0000000-0000-0000-0000-000000000001',
      title: 'SSL Certificate renewal failed on customer portal domain',
      description:
        "Automated Let's Encrypt renewal failed due to DNS verification challenge failure. Domain renewal required before upcoming expiration in 3 days.",
      category_id: 'cat-3',
      priority: 'high',
      status: 'assigned',
      affected_service: 'Customer Portal Web App',
      reference_url: 'https://portal.acmecorp.com',
      preferred_contact: 'Email',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 't0000000-0000-0000-0000-000000000003',
      ticket_number: 'TW-2026-00003',
      client_id: 'c0000000-0000-0000-0000-000000000001',
      title: 'Database connection pool exhaustion during peak hourly sync',
      description:
        'PostgreSQL connection pool maxes out at 100 sessions during our 6 PM ETL pipeline run. We need recommendations for pgBouncer pooling or instance scaling.',
      category_id: 'cat-5',
      priority: 'medium',
      status: 'resolved',
      affected_service: 'PostgreSQL Analytics DB',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString(),
      resolved_at: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: 't0000000-0000-0000-0000-000000000004',
      ticket_number: 'TW-2026-00004',
      client_id: 'c0000000-0000-0000-0000-000000000001',
      title: 'Request for SSO SAML configuration with Okta directory',
      description:
        'We are rolling out corporate single sign-on across all partner applications and need metadata integration for our enterprise tenant.',
      category_id: 'cat-4',
      priority: 'low',
      status: 'closed',
      affected_service: 'Enterprise SSO / Okta Integration',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      resolved_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      closed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ]

  assignments: TicketAssignment[] = [
    {
      id: 'asg-1',
      ticket_id: 't0000000-0000-0000-0000-000000000001',
      employee_id: 'e0000000-0000-0000-0000-000000000001',
      assigned_by: 'a0000000-0000-0000-0000-000000000001',
      is_primary: true,
      assigned_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'asg-2',
      ticket_id: 't0000000-0000-0000-0000-000000000001',
      employee_id: 'e0000000-0000-0000-0000-000000000002',
      assigned_by: 'a0000000-0000-0000-0000-000000000001',
      is_primary: false,
      assigned_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'asg-3',
      ticket_id: 't0000000-0000-0000-0000-000000000002',
      employee_id: 'e0000000-0000-0000-0000-000000000002',
      assigned_by: 'a0000000-0000-0000-0000-000000000001',
      is_primary: true,
      assigned_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]

  messages: TicketMessage[] = [
    {
      id: 'msg-1',
      ticket_id: 't0000000-0000-0000-0000-000000000001',
      sender_id: 'c0000000-0000-0000-0000-000000000001',
      message_body:
        'Hello Technology World team, we are observing severe throttling on worker nodes 4 and 7 in the us-east region. Ingress health checks are failing intermittently.',
      message_type: 'client_message',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'msg-2',
      ticket_id: 't0000000-0000-0000-0000-000000000001',
      sender_id: 'e0000000-0000-0000-0000-000000000001',
      message_body:
        'Investigating ingress controller logs and kube-system metrics now. We see memory pressure on node pool 2.',
      message_type: 'staff_message',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'msg-3',
      ticket_id: 't0000000-0000-0000-0000-000000000001',
      sender_id: 'e0000000-0000-0000-0000-000000000002',
      message_body:
        'Internal Note: Sarah and I are reallocating daemonset limits to stabilize worker nodes before performing rolling reboot.',
      message_type: 'internal_note',
      created_at: new Date(Date.now() - 64800000).toISOString(),
    },
    {
      id: 'msg-4',
      ticket_id: 't0000000-0000-0000-0000-000000000001',
      sender_id: 'e0000000-0000-0000-0000-000000000001',
      message_body:
        'Nodes 4 and 7 have been drained and cordoned. Clean replacement instances are currently joining the cluster. Health status is stabilizing.',
      message_type: 'staff_message',
      created_at: new Date(Date.now() - 43200000).toISOString(),
    },
  ]

  attachments: TicketAttachment[] = []
  attachmentFiles = new Map<string, Uint8Array>()

  statusHistory: TicketStatusHistory[] = [
    {
      id: 'hist-1',
      ticket_id: 't0000000-0000-0000-0000-000000000001',
      previous_status: 'open',
      new_status: 'assigned',
      changed_by: 'a0000000-0000-0000-0000-000000000001',
      change_note: 'Assigned John Mitchell & Sarah Jenkins to incident',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'hist-2',
      ticket_id: 't0000000-0000-0000-0000-000000000001',
      previous_status: 'assigned',
      new_status: 'in_progress',
      changed_by: 'e0000000-0000-0000-0000-000000000001',
      change_note: 'Investigation started on node memory pressure',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]

  ratings: TicketRating[] = [
    {
      id: 'rate-1',
      ticket_id: 't0000000-0000-0000-0000-000000000004',
      client_id: 'c0000000-0000-0000-0000-000000000001',
      overall_rating: 5,
      feedback:
        'Superb assistance by Technology World team. Okta SSO was integrated seamlessly within 24 hours.',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ]

  notifications: Notification[] = [
    {
      id: 'notif-1',
      recipient_id: 'c0000000-0000-0000-0000-000000000001',
      ticket_id: 't0000000-0000-0000-0000-000000000001',
      notification_type: 'new_message',
      title: 'New Response on TW-2026-00001',
      body: 'John Mitchell has responded to your ticket.',
      created_at: new Date(Date.now() - 43200000).toISOString(),
    },
  ]

  auditLogs: AuditLog[] = []

  private seqNumber = 5

  generateTicketNumber(): string {
    const num = String(this.seqNumber++).padStart(5, '0')
    const year = new Date().getFullYear()
    return `TW-${year}-${num}`
  }

  // Fallback query interface
  async query<T = unknown>(_text: string, _params: unknown[] = []): Promise<T[]> {
    return [] as T[]
  }
}

export const memoryDb = new MemoryDb()
