-- Apply after schema.sql, before deploying the new application. Existing users are grandfathered.
BEGIN;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified_at timestamptz DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS requires_email_verification boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_provider text NOT NULL DEFAULT 'credentials';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS session_version integer NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_notice_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_profiles_email_normalized ON profiles(lower(email));
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS request_key uuid;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_request_key ON tickets(client_id,request_key);
CREATE TABLE IF NOT EXISTS auth_challenges (
 user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
 purpose text CHECK (purpose IN ('verify','reset')), digest text NOT NULL,
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 attempts integer NOT NULL DEFAULT 0, consumed_at timestamptz,
 PRIMARY KEY(user_id,purpose)
);
CREATE TABLE IF NOT EXISTS email_outbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_key text UNIQUE NOT NULL,
 kind text NOT NULL, recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
 ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
 payload jsonb NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'pending'
 CHECK(status IN ('pending','sending','sent','failed','cancelled','uncertain')),
 attempts integer NOT NULL DEFAULT 0, available_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(), locked_at timestamptz, sent_at timestamptz,
 last_error text, gmail_id text, chat_through_at timestamptz
);
ALTER TABLE email_outbox ADD COLUMN IF NOT EXISTS chat_through_at timestamptz;
CREATE INDEX IF NOT EXISTS email_outbox_ready ON email_outbox(available_at) WHERE status='pending';
CREATE INDEX IF NOT EXISTS email_outbox_conversation ON email_outbox(ticket_id,recipient_id,sent_at DESC) WHERE kind='chat';
CREATE INDEX IF NOT EXISTS idx_messages_ticket_created ON ticket_messages(ticket_id,created_at);
CREATE TABLE IF NOT EXISTS conversation_reads (
 ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
 user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
 read_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(ticket_id,user_id)
);
CREATE TABLE IF NOT EXISTS email_notification_settings (
 id integer PRIMARY KEY CHECK(id=1),
 chat_cooldown_seconds integer NOT NULL DEFAULT 900 CHECK(chat_cooldown_seconds BETWEEN 60 AND 86400),
 unread_grace_seconds integer NOT NULL DEFAULT 120 CHECK(unread_grace_seconds BETWEEN 0 AND 3600)
);
INSERT INTO email_notification_settings(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS email_worker_lock (id integer PRIMARY KEY, until_at timestamptz NOT NULL);
INSERT INTO email_worker_lock VALUES (1,now()) ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION queue_support_email() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE r record; k text; cooldown integer; grace integer;
BEGIN
 IF TG_TABLE_NAME='profiles' THEN
  IF NEW.role='client' THEN
   INSERT INTO email_outbox(event_key,kind,recipient_id) VALUES
   ('welcome:'||NEW.id,'welcome',NEW.id),('registration:'||NEW.id,'registration',NEW.id) ON CONFLICT DO NOTHING;
  ELSIF NEW.role='employee' THEN
   INSERT INTO email_outbox(event_key,kind,recipient_id) VALUES ('employee:'||NEW.id,'employee',NEW.id) ON CONFLICT DO NOTHING;
  END IF;
 ELSIF TG_TABLE_NAME='tickets' THEN
  INSERT INTO email_outbox(event_key,kind,recipient_id,ticket_id) VALUES ('ticket:'||NEW.id,'ticket',NEW.client_id,NEW.id) ON CONFLICT DO NOTHING;
 ELSIF TG_TABLE_NAME='ticket_assignments' THEN
  INSERT INTO email_outbox(event_key,kind,recipient_id,ticket_id) VALUES ('assignment:'||NEW.id,'assignment',NEW.employee_id,NEW.ticket_id) ON CONFLICT DO NOTHING;
 ELSIF TG_TABLE_NAME='ticket_messages' AND NEW.message_type IN ('client_message','staff_message') THEN
  SELECT chat_cooldown_seconds,unread_grace_seconds INTO cooldown,grace FROM email_notification_settings WHERE id=1;
  FOR r IN
   SELECT employee_id AS id FROM ticket_assignments WHERE ticket_id=NEW.ticket_id AND NEW.message_type='client_message'
   UNION SELECT client_id AS id FROM tickets WHERE id=NEW.ticket_id AND NEW.message_type='staff_message'
  LOOP
   IF r.id<>NEW.sender_id THEN
    -- One durable reminder per recipient per cooldown bucket; unread messages are summarized at delivery.
    k := 'chat:'||NEW.ticket_id||':'||r.id||':'||floor(extract(epoch FROM NEW.created_at)/cooldown)::text;
    INSERT INTO email_outbox(event_key,kind,recipient_id,ticket_id,payload,available_at)
    VALUES(k,'chat',r.id,NEW.ticket_id,jsonb_build_object('message_id',NEW.id),now()+grace*interval '1 second') ON CONFLICT DO NOTHING;
   END IF;
  END LOOP;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS email_profile ON profiles;
CREATE TRIGGER email_profile AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION queue_support_email();
DROP TRIGGER IF EXISTS email_ticket ON tickets;
CREATE TRIGGER email_ticket AFTER INSERT ON tickets FOR EACH ROW EXECUTE FUNCTION queue_support_email();
DROP TRIGGER IF EXISTS email_assignment ON ticket_assignments;
CREATE TRIGGER email_assignment AFTER INSERT ON ticket_assignments FOR EACH ROW EXECUTE FUNCTION queue_support_email();
DROP TRIGGER IF EXISTS email_message ON ticket_messages;
CREATE TRIGGER email_message AFTER INSERT ON ticket_messages FOR EACH ROW EXECUTE FUNCTION queue_support_email();
CREATE TABLE IF NOT EXISTS auth_request_limits (
 key text PRIMARY KEY, hits integer NOT NULL DEFAULT 1, reset_at timestamptz NOT NULL
);
COMMIT;
