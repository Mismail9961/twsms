import { emailConfigurationIssues } from './config.mjs'
import { emailQuery } from './store'
import { template } from './templates'
import { appLink, unseal, validEmail, challengeDigest } from './security'
import { DeliveryError, retryDelay, sendEmail } from './smtp'

type Job = { id: string; kind: string; recipient_id: string; ticket_id: string | null; payload: { secret?: string }; attempts: number; created_at: string }
type User = { id: string; email: string; full_name: string; role: string; created_at: string }
async function render(job: Job) {
  const [user] = await emailQuery<User>("SELECT id,email,full_name,role,created_at FROM profiles WHERE id=$1 AND account_status='active'", [job.recipient_id])
  if (!user || !validEmail(user.email)) return null
  let to = user.email, kind = job.kind
  let through: string | undefined
  let verification: { code: string; expiresAt: string } | undefined
  let details = `Account: ${user.full_name} (${user.email})\nDate: ${new Date(job.created_at).toISOString()}\n`
  let path = `/${user.role}`
  if (kind === 'registration' || kind === 'ticket') { to = process.env.ADMIN_NOTIFICATION_EMAIL || ''; path = '/admin' }
  if (kind === 'welcome') details += 'Your account has been created. Open your support dashboard and choose New Ticket to request assistance.'
  if (kind === 'employee') details += 'Welcome to the support team. Sign in to your employee dashboard using your administrator-provided onboarding process. Use Forgot Password to choose your own password. Your dashboard lists the tickets assigned to you; contact your administrator if you need access.'
  if (kind === 'login') details += 'A successful login occurred. If this was unexpected, reset your password and contact support.'
  if (kind === 'verify' || kind === 'reset') {
    const [challenge] = await emailQuery<{ digest: string; expires_at: string }>("SELECT digest,expires_at FROM auth_challenges WHERE user_id=$1 AND purpose=$2 AND consumed_at IS NULL AND expires_at>now()", [user.id, kind])
    if (!challenge || !job.payload.secret) return null
    const secret = unseal(job.payload.secret)
    const expires = new Date(challenge.expires_at).toISOString()
    if (challengeDigest(secret, kind, user.email) !== challenge.digest) return null
    if (kind === 'verify') { verification = { code: secret, expiresAt: expires }; details += `Your verification code is: ${secret}\nExpires at ${expires} (UTC). Enter it on the verification page.`; path = '/verify-email' }
    else { details += `Choose a new password using this single-use link. Expires at ${expires} (UTC).`; path = `/reset-password#email=${encodeURIComponent(user.email)}&token=${secret}` }
  }
  if (job.ticket_id) {
    const [ticket] = await emailQuery<{ ticket_number: string; title: string; description: string; priority: string; status: string; client_id: string; created_at: string; client_name: string; client_email: string }>(`SELECT t.*,p.full_name AS client_name,p.email AS client_email FROM tickets t JOIN profiles p ON p.id=t.client_id WHERE t.id=$1`, [job.ticket_id])
    if (!ticket || (kind === 'ticket' && ticket.client_id !== user.id)) return null
    if (!['ticket'].includes(kind)) {
      if (user.role === 'client' && ticket.client_id !== user.id) return null
      if (user.role === 'employee') {
        const assigned = await emailQuery('SELECT id FROM ticket_assignments WHERE ticket_id=$1 AND employee_id=$2', [job.ticket_id, user.id])
        if (!assigned.length) return null
      } else if (user.role !== 'client') return null
    }
    path = `/${kind === 'ticket' ? 'admin' : user.role}/tickets/${job.ticket_id}`
    details += `Ticket ID: ${job.ticket_id}\nTicket ${ticket.ticket_number}: ${ticket.title}\nPriority: ${ticket.priority}\nStatus: ${ticket.status}\nClient: ${ticket.client_name} (${ticket.client_email})\nCreated: ${new Date(ticket.created_at).toISOString()}\n`
    if (kind === 'chat') {
      const [summary] = await emailQuery<{ count: string; preview: string; through: string }>(`SELECT count(*)::text AS count, max(m.created_at)::text AS through, left((array_agg(m.message_body ORDER BY m.created_at DESC))[1],300) AS preview
   FROM ticket_messages m WHERE m.ticket_id=$1 AND m.sender_id<>$2
   AND m.message_type=$3 AND m.created_at>COALESCE((SELECT read_at FROM conversation_reads WHERE ticket_id=$1 AND user_id=$2),'-infinity'::timestamptz)
   AND m.created_at>COALESCE((SELECT max(chat_through_at) FROM email_outbox WHERE kind='chat' AND ticket_id=$1 AND recipient_id=$2 AND status='sent'),'-infinity'::timestamptz)`, [job.ticket_id, user.id, user.role === 'client' ? 'staff_message' : 'client_message'])
      if (!summary || Number(summary.count) === 0) return null
      const [recent] = await emailQuery(`SELECT user_id FROM conversation_reads WHERE ticket_id=$1 AND user_id=$2 AND read_at>now()-interval '2 minutes'`, [job.ticket_id, user.id])
      if (recent) return null
      const [cooldown] = await emailQuery(`SELECT id FROM email_outbox WHERE kind='chat' AND ticket_id=$1 AND recipient_id=$2 AND sent_at>now()-(SELECT chat_cooldown_seconds FROM email_notification_settings WHERE id=1)*interval '1 second'`, [job.ticket_id, user.id])
      if (cooldown) {
        const [settings] = await emailQuery<{ chat_cooldown_seconds: number }>('SELECT chat_cooldown_seconds FROM email_notification_settings WHERE id=1')
        throw new DeliveryError('chat_cooldown', true, false, settings.chat_cooldown_seconds)
      }
      through = summary.through
      details += `${summary.count} unread message(s). Latest preview: ${summary.preview}`
      if (user.role === 'client') { kind = 'reply'; details += '\nOur support team has responded and is handling your request.' }
    } else details += ticket.description
  }
  if (!validEmail(to)) throw new DeliveryError('invalid_recipient')
  return { to, through, mail: template(kind, user.full_name, details, appLink(path), verification) }
}
export async function runEmailWorker() {
  if (emailConfigurationIssues().length) throw new DeliveryError('email_configuration')
  const lease = await emailQuery(`UPDATE email_worker_lock SET until_at=now()+interval '5 minutes' WHERE id=1 AND until_at<now() RETURNING id`)
  if (!lease.length) return { processed: 0 }
  // A terminated process may already have submitted to SMTP: require operator reconciliation, never blindly resend.
  await emailQuery("UPDATE email_outbox SET status='uncertain',last_error='worker_interrupted' WHERE status='sending' AND locked_at<now()-interval '2 minutes'")
  let processed = 0
  const started = Date.now()
  try {
    await emailQuery(`DELETE FROM auth_request_limits WHERE reset_at<now()-interval '1 day'`)
    await emailQuery(`UPDATE email_outbox SET payload='{}' WHERE kind IN ('verify','reset') AND created_at<now()-interval '30 minutes'`)
    // Reconcile messages posted after a bucket job was sent, and delayed unread messages.
    await emailQuery(`WITH recipients AS (
    SELECT m.ticket_id,a.employee_id AS recipient_id,max(m.created_at) AS latest
    FROM ticket_messages m JOIN ticket_assignments a ON a.ticket_id=m.ticket_id
    WHERE m.message_type='client_message' AND m.created_at>now()-interval '7 days' GROUP BY m.ticket_id,a.employee_id
    UNION ALL
    SELECT m.ticket_id,t.client_id,max(m.created_at) FROM ticket_messages m JOIN tickets t ON t.id=m.ticket_id
    WHERE m.message_type='staff_message' AND m.created_at>now()-interval '7 days' GROUP BY m.ticket_id,t.client_id
  ) INSERT INTO email_outbox(event_key,kind,recipient_id,ticket_id)
    SELECT 'reminder:'||r.ticket_id||':'||r.recipient_id||':'||r.latest,'chat',r.recipient_id,r.ticket_id FROM recipients r
    WHERE r.latest<now()-(SELECT unread_grace_seconds FROM email_notification_settings WHERE id=1)*interval '1 second'
    AND NOT EXISTS (SELECT 1 FROM conversation_reads cr WHERE cr.ticket_id=r.ticket_id AND cr.user_id=r.recipient_id AND cr.read_at>=r.latest)
    AND NOT EXISTS (SELECT 1 FROM email_outbox e WHERE e.kind='chat' AND e.ticket_id=r.ticket_id AND e.recipient_id=r.recipient_id AND (e.status IN ('pending','sending','uncertain') OR e.chat_through_at>=r.latest))
    ON CONFLICT DO NOTHING`)
    while (processed < 10 && Date.now() - started < 18000) {
      const [job] = await emailQuery<Job>(`UPDATE email_outbox SET status='sending',locked_at=now(),attempts=attempts+1 WHERE id=(SELECT id FROM email_outbox WHERE status='pending' AND available_at<=now() ORDER BY CASE WHEN kind IN ('verify','reset') THEN 0 ELSE 1 END,available_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`)
      if (!job) break
      let submitted = false
      try {
        const message = await render(job)
        if (!message) await emailQuery("UPDATE email_outbox SET status='cancelled',payload='{}' WHERE id=$1", [job.id])
        else {
          const messageId = await sendEmail(message.to, message.mail, job.id)
          submitted = true
          await emailQuery("UPDATE email_outbox SET status='sent',sent_at=now(),gmail_id=$2,chat_through_at=$3,payload='{}',last_error=NULL WHERE id=$1", [job.id, messageId, message.through || null])
        }
      } catch (error) {
        const failure = submitted ? new DeliveryError('delivery_record_unknown', false, true) : error instanceof DeliveryError ? error : new DeliveryError('processing_failed')
        const status = failure.uncertain ? 'uncertain' : failure.retryable && job.attempts < 6 ? 'pending' : 'failed'
        await emailQuery("UPDATE email_outbox SET status=$2,last_error=$3,available_at=now()+$4*interval '1 second' WHERE id=$1", [job.id, status, failure.code, retryDelay(job.attempts, failure.retryAfter)])
        console.error('[Email delivery]', { id: job.id, status, code: failure.code })
      }
      processed++
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  } finally { await emailQuery('UPDATE email_worker_lock SET until_at=now() WHERE id=1') }
  return { processed }
}
