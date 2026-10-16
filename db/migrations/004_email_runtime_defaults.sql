-- Restore required singleton rows on databases whose operational data was cleared.
-- Preserve configured notification timing and any active worker lease.
INSERT INTO email_notification_settings(id) VALUES (1) ON CONFLICT DO NOTHING;
INSERT INTO email_worker_lock(id, until_at) VALUES (1, now()) ON CONFLICT DO NOTHING;
