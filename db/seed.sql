-- =============================================================================
-- Technology World Support & Ticket Management System (TWSMS)
-- Neon PostgreSQL Seed Data
-- =============================================================================

-- Seed Users:
-- Admin: admin@technologyworld.com / Admin@12345
-- Employee 1: john.dev@technologyworld.com / Employee@12345
-- Employee 2: sarah.ops@technologyworld.com / Employee@12345
-- Client: client@acmecorp.com / Client@12345

INSERT INTO profiles (id, full_name, email, password_hash, role, account_status, department) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Alexander Vance (System Admin)', 'admin@technologyworld.com', '$2b$10$WUo/sx18oZPrjzmPfCJ6tOdOEN7Ft//Qb1q2OjhpFYZ5/a7i8jqlK', 'admin', 'active', 'Operations & IT Leadership'),
  ('e0000000-0000-0000-0000-000000000001', 'John Mitchell (Senior Engineer)', 'john.dev@technologyworld.com', '$2b$10$qRcGjtfpZNPzGPrYH.u.fOQXRfMgYjwtb5M8uSTF33/0sG9N9UlBO', 'employee', 'active', 'Cloud & Architecture'),
  ('e0000000-0000-0000-0000-000000000002', 'Sarah Jenkins (DevOps Lead)', 'sarah.ops@technologyworld.com', '$2b$10$qRcGjtfpZNPzGPrYH.u.fOQXRfMgYjwtb5M8uSTF33/0sG9N9UlBO', 'employee', 'active', 'Infrastructure & SRE'),
  ('c0000000-0000-0000-0000-000000000001', 'Robert Chen (Acme Corp)', 'client@acmecorp.com', '$2b$10$YcrFiYC5By7eoThhlWNcMuo3By6DQwAU2TqvFGK8yV7nVkakSvNMa', 'client', 'active', 'Client Management')
ON CONFLICT (email) DO NOTHING;

-- Seed Tickets
INSERT INTO tickets (id, ticket_number, client_id, title, description, priority, status, affected_service, reference_url, created_at, updated_at) VALUES
  (
    't0000000-0000-0000-0000-000000000001',
    'TW-2026-00001',
    'c0000000-0000-0000-0000-000000000001',
    'Production Kubernetes cluster node degradation in us-east region',
    'Our primary EKS worker pool has reported high latency and 504 gateway timeout errors on ingress endpoints since 14:00 UTC. Need urgent cluster health inspection.',
    'critical',
    'in_progress',
    'Kubernetes EKS Production Cluster',
    'https://status.acmecorp.com',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 hour'
  ),
  (
    't0000000-0000-0000-0000-000000000002',
    'TW-2026-00002',
    'c0000000-0000-0000-0000-000000000001',
    'SSL Certificate renewal failed on customer portal domain',
    'Automated Let''s Encrypt renewal failed due to DNS verification challenge failure. Domain renewal required before upcoming expiration in 3 days.',
    'high',
    'assigned',
    'Customer Portal Web App',
    'https://portal.acmecorp.com',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '4 hours'
  ),
  (
    't0000000-0000-0000-0000-000000000003',
    'TW-2026-00003',
    'c0000000-0000-0000-0000-000000000001',
    'Database connection pool exhaustion during peak hourly sync',
    'PostgreSQL connection pool maxes out at 100 sessions during our 6 PM ETL pipeline run. We need recommendations for pgBouncer pooling or instance scaling.',
    'medium',
    'resolved',
    'PostgreSQL Analytics DB',
    '',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '12 hours'
  ),
  (
    't0000000-0000-0000-0000-000000000004',
    'TW-2026-00004',
    'c0000000-0000-0000-0000-000000000001',
    'Request for SSO SAML configuration with Okta directory',
    'We are rolling out corporate single sign-on across all partner applications and need metadata integration for our enterprise tenant.',
    'low',
    'closed',
    'Enterprise SSO / Okta Integration',
    '',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (ticket_number) DO NOTHING;

-- Seed Multi-Employee Assignments
INSERT INTO ticket_assignments (ticket_id, employee_id, assigned_by, is_primary) VALUES
  ('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', true),
  ('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', false),
  ('t0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', true)
ON CONFLICT (ticket_id, employee_id) DO NOTHING;

-- Seed Ticket Messages
INSERT INTO ticket_messages (ticket_id, sender_id, message_body, message_type, created_at) VALUES
  ('t0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Hello Technology World team, we are observing severe throttling on worker nodes 4 and 7 in the us-east region. Ingress health checks are failing intermittently.', 'client_message', NOW() - INTERVAL '2 days'),
  ('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Investigating ingress controller logs and kube-system metrics now. We see memory pressure on node pool 2.', 'staff_message', NOW() - INTERVAL '1 day'),
  ('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'Internal Note: Sarah and I are reallocating daemonset limits to stabilize worker nodes before performing rolling reboot.', 'internal_note', NOW() - INTERVAL '18 hours'),
  ('t0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Nodes 4 and 7 have been drained and cordoned. Clean replacement instances are currently joining the cluster.', 'staff_message', NOW() - INTERVAL '12 hours')
ON CONFLICT DO NOTHING;

-- Seed Status History
INSERT INTO ticket_status_history (ticket_id, previous_status, new_status, changed_by, change_note) VALUES
  ('t0000000-0000-0000-0000-000000000001', 'open', 'assigned', 'a0000000-0000-0000-0000-000000000001', 'Assigned John Mitchell & Sarah Jenkins to incident'),
  ('t0000000-0000-0000-0000-000000000001', 'assigned', 'in_progress', 'e0000000-0000-0000-0000-000000000001', 'Investigation started on node memory pressure')
ON CONFLICT DO NOTHING;

-- Seed Ticket Rating on Closed Ticket
INSERT INTO ticket_ratings (ticket_id, client_id, overall_rating, feedback) VALUES
  ('t0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 5, 'Superb assistance by Technology World team. Okta SSO was integrated seamlessly within 24 hours.')
ON CONFLICT (ticket_id) DO NOTHING;
