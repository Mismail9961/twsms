-- =============================================================================
-- Technology World Support & Ticket Management System (TWSMS)
-- Neon Serverless PostgreSQL Database Schema
-- Compatible with Neon Postgres (neon.tech)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. PROFILES (Users: Clients, Employees, Admins)
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'employee', 'admin')),
  account_status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended')),
  avatar_url TEXT,
  phone VARCHAR(50),
  department VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- =============================================================================
-- 2. TICKET CATEGORIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. SEQUENCE & GENERATOR FOR HUMAN-READABLE TICKET NUMBERS (e.g. TW-2026-00001)
-- =============================================================================
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  seq_val BIGINT;
  year_val TEXT;
BEGIN
  seq_val := nextval('ticket_number_seq');
  year_val := to_char(NOW(), 'YYYY');
  RETURN 'TW-' || year_val || '-' || LPAD(seq_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 4. TICKETS
-- =============================================================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES ticket_categories(id) ON DELETE SET NULL,
  priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'waiting_for_client', 'waiting_for_support', 'resolved', 'closed')),
  affected_service VARCHAR(255),
  serial_number VARCHAR(255),
  reference_url TEXT,
  preferred_contact VARCHAR(255),
  additional_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS serial_number VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_tickets_client ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(ticket_number);

-- =============================================================================
-- 5. MULTI-EMPLOYEE TICKET ASSIGNMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS ticket_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_ticket_employee UNIQUE (ticket_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_ticket ON ticket_assignments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_assignments_employee ON ticket_assignments(employee_id);

-- =============================================================================
-- 6. TICKET MESSAGES (Client & Staff Conversation + Internal Notes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  message_body TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL DEFAULT 'client_message' CHECK (message_type IN ('client_message', 'staff_message', 'internal_note', 'system_event')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON ticket_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON ticket_messages(created_at ASC);

-- =============================================================================
-- 7. TICKET ATTACHMENTS (Secure Document Sharing)
-- =============================================================================
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ticket_messages(id) ON DELETE SET NULL,
  uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  storage_path TEXT NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  file_data BYTEA,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ticket_attachments ADD COLUMN IF NOT EXISTS file_data BYTEA;

CREATE INDEX IF NOT EXISTS idx_attachments_ticket ON ticket_attachments(ticket_id);

-- =============================================================================
-- 8. TICKET STATUS HISTORY
-- =============================================================================
CREATE TABLE IF NOT EXISTS ticket_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  change_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_ticket ON ticket_status_history(ticket_id);

-- =============================================================================
-- 9. TICKET RATINGS & FEEDBACK
-- =============================================================================
CREATE TABLE IF NOT EXISTS ticket_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID UNIQUE NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  resolution_method VARCHAR(50),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ticket_ratings ADD COLUMN IF NOT EXISTS resolution_method VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_ratings_ticket ON ticket_ratings(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ratings_client ON ticket_ratings(client_id);

-- =============================================================================
-- 10. IN-APP NOTIFICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id) WHERE read_at IS NULL;

-- =============================================================================
-- 11. AUDIT LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_ticket ON audit_logs(ticket_id);

-- =============================================================================
-- 12. SEED DEFAULT CATEGORIES
-- =============================================================================
INSERT INTO ticket_categories (name, description, is_active) VALUES
  ('Cloud Infrastructure & DevOps', 'Servers, cloud deployments, AWS, Azure, CI/CD pipeline issues', true),
  ('Software & Web Applications', 'Frontend bugs, API errors, database connectivity, and backend services', true),
  ('Network & VPN Connectivity', 'Firewall, corporate network, VPN tunnels, and DNS configuration', true),
  ('Account Security & Identity', 'SSO, credentials, 2FA, permissions, and security audit concerns', true),
  ('Hardware & Physical Systems', 'Workstations, dedicated servers, routers, and peripheral equipment', true),
  ('Database & Storage Services', 'PostgreSQL, query performance, backups, and storage quotas', true),
  ('Billing, Licences & SLA', 'Invoices, enterprise licenses, renewals, and SLA management', true),
  ('General IT Consultation', 'General technical inquiries, architectural guidance, and new requests', true)
ON CONFLICT DO NOTHING;
