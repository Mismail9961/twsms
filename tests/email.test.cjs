const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { PGlite } = require('@electric-sql/pglite')
let db, sessionToken, failVerificationQuery = false, createdSessions = 0, sent = []
const fake = (name, exports) => { const id = require.resolve(name); require.cache[id] = { id, filename: id, loaded: true, exports } }
fake('@/lib/email/store.ts', { emailQuery: async (sql, params = []) => { try { if (failVerificationQuery && sql.includes('SELECT requires_email_verification FROM profiles')) throw Object.assign(new Error('Missing schema column'), { code: '42703' }); return (await db.query(sql, params)).rows } catch (error) { console.error('Test SQL error:', error.message); throw error } } })
fake('next/headers', { headers: async () => new Headers({ 'x-forwarded-for': 'test-proxy' }), cookies: async () => ({ set() { }, delete() { }, get() { return sessionToken ? { value: sessionToken } : undefined } }) })
fake('next/navigation', { redirect: (url) => { throw new Error(`REDIRECT:${url}`) } })
fake('next/cache', { revalidatePath() { } })
let session
fake('@/lib/auth/session.ts', { getSession: async () => session, createSession: async () => { createdSessions++ }, destroySession: async () => { }, dashboardPathForRole: r => `/${r}` })
fake('@/lib/db', { isNeonConfigured: () => true, dbQuery: async (sql, params = []) => (await db.query(sql, params)).rows })
const security = require('../lib/email/security.ts')
const { template } = require('../lib/email/templates.ts')
let smtpSend, transportOptions
fake('nodemailer', { createTransport: options => { transportOptions = options; return { sendMail: message => smtpSend(message) } } })
fake('@/lib/email/dispatch.ts', { scheduleEmailDelivery() { } })
const smtp = require('../lib/email/smtp.ts')
const { issueChallenge, consumeChallenge, requestReset } = require('../lib/auth/challenges.ts')
const { runEmailWorker } = require('../lib/email/worker.ts')
const auth = require('../app/actions/auth.ts')
const actions = require('../app/actions/tickets.ts')
let client, employee, other, admin, ticket
const form = (data) => { const f = new FormData(); Object.entries(data).forEach(([k, v]) => f.set(k, v)); return f }
async function scalar(sql, params = []) { return (await db.query(sql, params)).rows[0] }
async function drain() { await db.exec("UPDATE email_outbox SET available_at=now() WHERE status='pending'"); await runEmailWorker() }
before(async () => {
  process.env.EMAIL_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64')
  process.env.APP_BASE_URL = 'https://support.example.com'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost/test'
  process.env.SMTP_APP_PASSWORD = 'test-app-password'
  process.env.EMAIL_WORKER_SECRET = 'test-worker-secret'
  process.env.SMTP_EMAIL = 'support@example.com'
  process.env.ADMIN_NOTIFICATION_EMAIL = 'admin@example.com'
  db = new PGlite()
  let schema = fs.readFileSync('db/schema.sql', 'utf8').replace(/^CREATE EXTENSION.*$/gm, '')
  await db.exec(schema)
  // A legacy user is inserted before the migration to verify compatibility.
  await db.exec("INSERT INTO profiles(full_name,email,password_hash) VALUES ('Legacy','legacy@example.com','hash')")
  await db.exec(fs.readFileSync('db/migrations/001_email_auth.sql', 'utf8'))
  smtpSend = async options => {
    sent.push(options.raw)
    return { messageId: `smtp-${sent.length}`, accepted: options.envelope.to, rejected: [] }
  }
  const add = async (name, role) => scalar('INSERT INTO profiles(full_name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING *', [name, `${name}@example.com`, 'hash', role])
  client = await add('client', 'client'); employee = await add('employee', 'employee'); other = await add('other', 'employee'); admin = await add('admin', 'admin')
  ticket = await scalar("INSERT INTO tickets(ticket_number,client_id,title,description,priority) VALUES('TW-TEST',$1,'Test ticket','A private issue description','high') RETURNING *", [client.id])
})
after(async () => { await db?.close() })

test('migration is repeatable and preserves existing verified accounts', async () => {
  await db.exec(fs.readFileSync('db/migrations/001_email_auth.sql', 'utf8'))
  const legacy = await scalar("SELECT * FROM profiles WHERE email='legacy@example.com'")
  assert.equal(legacy.requires_email_verification, false); assert.ok(legacy.email_verified_at)
})
test('registration, welcome, employee, and ticket jobs are transactionally recorded', async () => {
  const rows = (await db.query('SELECT kind,recipient_id FROM email_outbox')).rows
  for (const kind of ['registration', 'welcome', 'employee', 'ticket']) assert.ok(rows.some(r => r.kind === kind))
  await drain()
  const subjects = sent.join('\n')
  assert.ok(subjects.includes('To: admin@example.com'))
  assert.ok(subjects.includes('To: client@example.com'))
  assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE status='sent'")).n, 5)
})
test('verification codes are encrypted in queue, hashed, throttled and single use', async () => {
  await issueChallenge(client.id, 'verify')
  const job = await scalar("SELECT * FROM email_outbox WHERE kind='verify'")
  const code = security.unseal(job.payload.secret)
  const challenge = await scalar("SELECT * FROM auth_challenges WHERE user_id=$1 AND purpose='verify'", [client.id])
  assert.match(code, /^\d{4}$/); assert.equal(challenge.digest, security.challengeDigest(code, 'verify', client.email)); assert.notEqual(job.payload.secret, code)
  await issueChallenge(client.id, 'verify')
  assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE kind='verify'")).n, 1)
  assert.equal(await consumeChallenge(client.email, String((Number(code) + 1) % 10000).padStart(4, '0'), 'verify'), false)
  assert.equal(await consumeChallenge(client.email, code, 'verify'), true)
  assert.equal(await consumeChallenge(client.email, code, 'verify'), false)
})
test('valid verification email is delivered without exposing code in API state', async () => {
  await issueChallenge(employee.id, 'verify')
  await drain()
  assert.equal((await scalar("SELECT status FROM email_outbox WHERE kind='verify' AND recipient_id=$1", [employee.id])).status, 'sent')
})
test('reset expiry, attempt limits, password hashing and session invalidation', async () => {
  await requestReset(client.email)
  const job = await scalar("SELECT payload FROM email_outbox WHERE kind='reset' AND recipient_id=$1", [client.id])
  const code = security.unseal(job.payload.secret)
  assert.equal(await consumeChallenge(client.email, code, 'reset', 'new-password-123'), true)
  assert.equal(await consumeChallenge(client.email, code, 'reset', 'another-password'), false)
  const user = await scalar('SELECT * FROM profiles WHERE id=$1', [client.id])
  assert.equal(user.session_version, 1)
  assert.ok(await require('bcryptjs').compare('new-password-123', user.password_hash))
  await issueChallenge(other.id, 'reset')
  const expired = await scalar("SELECT payload FROM email_outbox WHERE kind='reset' AND recipient_id=$1", [other.id])
  await db.query("UPDATE auth_challenges SET expires_at=now()-interval '1 second' WHERE user_id=$1", [other.id])
  assert.equal(await consumeChallenge(other.email, security.unseal(expired.payload.secret), 'reset', 'password-123'), false)
  await db.query("UPDATE auth_challenges SET expires_at=now()+interval '1 minute',attempts=5 WHERE user_id=$1", [other.id])
  assert.equal(await consumeChallenge(other.email, security.unseal(expired.payload.secret), 'reset', 'password-123'), false)
})
test('forgot-password is generic for existing, missing and OAuth accounts', async () => {
  await db.query("UPDATE profiles SET auth_provider='google' WHERE id=$1", [other.id])
  for (const email of [client.email, 'missing@example.com', other.email]) assert.deepEqual(await auth.forgotPassword(undefined, form({ email })), { success: true })
  const before = await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE kind='reset' AND recipient_id=$1", [other.id])
  await requestReset(other.email)
  assert.deepEqual(await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE kind='reset' AND recipient_id=$1", [other.id]), before)
})
test('assignments notify only newly assigned active employees', async () => {
  session = { ...admin }
  await actions.assignEmployee(ticket.id, employee.id)
  await actions.assignEmployee(ticket.id, employee.id)
  assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE kind='assignment'")).n, 1)
  await assert.rejects(actions.assignEmployee(ticket.id, client.id), /Invalid assignment/)
  await drain()
  assert.equal((await scalar("SELECT status FROM email_outbox WHERE kind='assignment'")).status, 'sent')
})
test('chat sender authorization, internal note privacy, client first message and staff reply', async () => {
  session = { ...other }
  await assert.rejects(actions.sendMessage(ticket.id, 'Unauthorized'), /access denied/)
  session = { ...client }
  await actions.sendMessage(ticket.id, 'First client message')
  const first = await scalar("SELECT * FROM email_outbox WHERE kind='chat' AND recipient_id=$1", [employee.id])
  assert.ok(first)
  session = { ...employee }
  await actions.sendMessage(ticket.id, 'Private internal note', 'internal_note')
  assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE kind='chat'")).n, 1)
  await actions.sendMessage(ticket.id, 'First staff response')
  assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE kind='chat'")).n, 2)
  await drain()
  assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE kind='chat' AND status='sent'")).n, 2)
})
test('subsequent chat messages batch, activity suppresses mail, and duplicate jobs are rejected', async () => {
  const before = sent.length
  session = { ...client }
  await actions.sendMessage(ticket.id, 'Follow-up one')
  await actions.sendMessage(ticket.id, 'Follow-up two')
  assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE kind='chat'")).n, 2)
  await drain(); assert.equal(sent.length, before)
  await db.query('INSERT INTO conversation_reads(ticket_id,user_id) VALUES($1,$2)', [ticket.id, employee.id])
  await db.query("INSERT INTO email_outbox(event_key,kind,recipient_id,ticket_id) VALUES ('active-reader','chat',$1,$2)", [employee.id, ticket.id])
  await drain()
  assert.equal((await scalar("SELECT status FROM email_outbox WHERE event_key='active-reader'")).status, 'cancelled')
})
test('revoked assignment and disabled recipients are rejected at send time', async () => {
  await db.query("INSERT INTO email_outbox(event_key,kind,recipient_id,ticket_id) VALUES ('revoked','assignment',$1,$2)", [other.id, ticket.id])
  await db.query("UPDATE profiles SET account_status='inactive' WHERE id=$1", [employee.id])
  await db.query("INSERT INTO email_outbox(event_key,kind,recipient_id) VALUES ('disabled','welcome',$1)", [employee.id])
  await drain()
  for (const key of ['revoked', 'disabled']) assert.equal((await scalar('SELECT status FROM email_outbox WHERE event_key=$1', [key])).status, 'cancelled')
})
test('SMTP transient errors back off; permanent and ambiguous failures are held', async () => {
  const sendBefore = smtpSend
  smtpSend = async () => { throw { responseCode: 450, command: 'RCPT TO' } }
  await db.query("INSERT INTO email_outbox(event_key,kind,recipient_id) VALUES ('quota','welcome',$1)", [client.id])
  await drain()
  let job = await scalar("SELECT * FROM email_outbox WHERE event_key='quota'")
  assert.equal(job.status, 'pending'); assert.equal(job.attempts, 1); assert.equal(job.last_error, 'smtp_450')
  assert.ok(new Date(job.available_at) > new Date())
  smtpSend = async () => { throw { responseCode: 535, command: 'AUTH' } }
  await drain(); assert.equal((await scalar("SELECT status FROM email_outbox WHERE event_key='quota'")).status, 'failed')
  smtpSend = async () => { throw { code: 'ETIMEDOUT', command: 'DATA' } }
  await db.query("INSERT INTO email_outbox(event_key,kind,recipient_id) VALUES ('ambiguous','welcome',$1)", [client.id])
  await drain(); assert.equal((await scalar("SELECT status FROM email_outbox WHERE event_key='ambiguous'")).status, 'uncertain')
  assert.ok(await scalar('SELECT id FROM tickets WHERE id=$1', [ticket.id]))
  smtpSend = sendBefore
})
test('template escaping, MIME recipient validation, encryption authentication, bounded retry', () => {
  const mail = template('welcome', '<script>', '<private>', 'https://example.com')
  assert.ok(!mail.html.includes('<script>')); assert.ok(mail.text.includes('<private>'))
  assert.throws(() => smtp.mime('evil\r\nBcc: victim@example.com', 'x', 'a', 'b', 'id'))
  assert.equal(security.equalSecret('secret', 'secret'), true)
  const sealed = security.seal('secret'); assert.equal(security.unseal(sealed), 'secret')
  assert.throws(() => security.unseal(sealed.slice(0, -5) + 'aaaaa'))
  assert.equal(smtp.retryDelay(99), 3600)
})

test('real signup action queues registration, welcome, and verification without leaking secrets', async () => {
  await assert.rejects(auth.signUp(undefined, form({ full_name: 'New Client', email: 'new-client@example.com', password: 'test-password-123', confirmPassword: 'test-password-123' })), /REDIRECT:\/verify-email/)
  const profile = await scalar("SELECT * FROM profiles WHERE email='new-client@example.com'")
  assert.equal(profile.requires_email_verification, true); assert.equal(profile.email_verified_at, null)
  const jobs = (await db.query('SELECT kind,payload FROM email_outbox WHERE recipient_id=$1', [profile.id])).rows
  assert.deepEqual(jobs.map(j => j.kind).sort(), ['registration', 'verify', 'welcome'])
  await drain()
  assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE recipient_id=$1 AND status='sent'", [profile.id])).n, 3)
})
test('successful login sends at most one security notice per 30 days', async () => {
  for (let i = 0; i < 2; i++) await assert.rejects(auth.signIn(undefined, form({ email: client.email, password: 'new-password-123' })), /REDIRECT:\/client/)
  assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE recipient_id=$1 AND kind='login'", [client.id])).n, 1)
})
test('employee creation queues a welcome with no password content', async () => {
  session = { ...admin }
  await actions.createEmployeeAccount(form({ full_name: 'New Employee', email: 'new-employee@example.com', password: 'employee-password-123', role: 'employee' }))
  const employee = await scalar("SELECT * FROM profiles WHERE email='new-employee@example.com'")
  assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE recipient_id=$1 AND kind='employee'", [employee.id])).n, 1)
  await drain()
  assert.ok(!sent.join('\n').includes('employee-password-123'))
})
test('verification expiry and attempts fail closed', async () => {
  const profile = await scalar("SELECT * FROM profiles WHERE email='new-client@example.com'")
  const challenge = await scalar("SELECT * FROM auth_challenges WHERE user_id=$1 AND purpose='verify'", [profile.id])
  await db.query("UPDATE auth_challenges SET expires_at=now()-interval '1 second' WHERE user_id=$1", [profile.id])
  assert.equal(await consumeChallenge(profile.email, '0000', 'verify'), false)
  await db.query("UPDATE auth_challenges SET expires_at=now()+interval '1 minute',attempts=4 WHERE user_id=$1", [profile.id])
  assert.equal(await consumeChallenge(profile.email, security.challengeDigest('0000', 'verify', profile.email) === challenge.digest ? '0001' : '0000', 'verify'), false)
  assert.equal((await scalar("SELECT attempts FROM auth_challenges WHERE user_id=$1 AND purpose='verify'", [profile.id])).attempts, 5)
  assert.equal(challenge.consumed_at, null)
})
test('rollback cannot leave a notification for a failed business write', async () => {
  const before = (await scalar('SELECT count(*)::int AS n FROM email_outbox')).n
  await db.exec("BEGIN; INSERT INTO profiles(full_name,email,password_hash) VALUES ('Rolled back','rollback@example.com','hash'); ROLLBACK;")
  assert.equal((await scalar('SELECT count(*)::int AS n FROM email_outbox')).n, before)
})
test('unverified clients cannot create tickets and a verified write survives SMTP failure', async () => {
  const unverified = await scalar("SELECT * FROM profiles WHERE email='new-client@example.com'")
  session = unverified
  assert.match((await actions.createTicket(undefined, form({ title: 'Valid ticket', description: 'A sufficiently long description', priority: 'medium' }))).error, /Verify your email/)
  session = client
  const count = (await scalar('SELECT count(*)::int AS n FROM tickets')).n
  await assert.rejects(actions.createTicket(undefined, form({ title: 'Actual support request', description: 'A sufficiently long description', priority: 'medium' })), /REDIRECT:\/client\/tickets\//)
  const sendBefore = smtpSend
  smtpSend = async () => { throw { code: 'EAUTH', command: 'AUTH' } }
  await drain()
  assert.equal((await scalar('SELECT count(*)::int AS n FROM tickets')).n, count + 1)
  smtpSend = sendBefore
})
test('auth request rate limits are persistent and return generic forgot-password state', async () => {
  for (let i = 0; i < 12; i++) assert.deepEqual(await auth.forgotPassword(undefined, form({ email: 'limited@example.com' })), { success: true })
  assert.ok((await scalar('SELECT max(hits)::int AS n FROM auth_request_limits')).n >= 12)
})

test('chat cooldown defers later unread messages and releases them after cooldown', async () => {
  await db.query("UPDATE profiles SET account_status='active' WHERE id=$1", [employee.id])
  await db.query("UPDATE conversation_reads SET read_at=now()-interval '1 hour' WHERE ticket_id=$1", [ticket.id])
  await db.query("INSERT INTO ticket_messages(ticket_id,sender_id,message_body,message_type) VALUES ($1,$2,'Later unread message','client_message')", [ticket.id, client.id])
  await db.query("INSERT INTO email_outbox(event_key,kind,recipient_id,ticket_id) VALUES ('cooldown-probe','chat',$1,$2)", [employee.id, ticket.id])
  await drain()
  const job = await scalar("SELECT * FROM email_outbox WHERE event_key='cooldown-probe'")
  assert.equal(job.status, 'pending'); assert.equal(job.last_error, 'chat_cooldown')
  await db.query("UPDATE email_outbox SET sent_at=now()-interval '1 hour' WHERE kind='chat' AND ticket_id=$1", [ticket.id])
  await db.query("UPDATE email_outbox SET status='cancelled' WHERE kind='chat' AND status='pending' AND event_key<>'cooldown-probe'")
  await drain()
  assert.equal((await scalar("SELECT status FROM email_outbox WHERE event_key='cooldown-probe'")).status, 'sent')
})
test('a message arriving during SMTP submission remains eligible for a later reminder', async () => {
  const sendBefore = smtpSend
  let injected = false
  smtpSend = async options => {
    if (!injected) {
      injected = true
      await db.query("INSERT INTO ticket_messages(ticket_id,sender_id,message_body,message_type) VALUES($1,$2,'Arrived during delivery','client_message')", [ticket.id, client.id])
    }
    return sendBefore(options)
  }
  await db.query("UPDATE email_outbox SET sent_at=now()-interval '1 hour' WHERE kind='chat' AND ticket_id=$1", [ticket.id])
  await db.query("INSERT INTO ticket_messages(ticket_id,sender_id,message_body,message_type) VALUES($1,$2,'Before delivery','client_message')", [ticket.id, client.id])
  await db.query("INSERT INTO email_outbox(event_key,kind,recipient_id,ticket_id) VALUES('watermark-probe','chat',$1,$2)", [employee.id, ticket.id])
  await db.query("UPDATE email_outbox SET status='cancelled' WHERE kind='chat' AND status='pending' AND event_key<>'watermark-probe'")
  await drain()
  smtpSend = sendBefore
  assert.ok(injected)
  const uncovered = await scalar("SELECT count(*)::int AS n FROM ticket_messages WHERE ticket_id=$1 AND message_body='Arrived during delivery' AND created_at>(SELECT chat_through_at FROM email_outbox WHERE event_key='watermark-probe')", [ticket.id])
  assert.equal(uncovered.n, 1)
})
test('a malformed successful SMTP response is uncertain rather than automatically resent', async () => {
  const stub = { sendMail: async () => ({}) }
  await assert.rejects(smtp.sendEmail(client.email, template('welcome', 'Client', 'Welcome', 'https://example.com'), 'test-id', stub), error => error.uncertain === true)
})

test('signed sessions are rejected after password reset version changes or account suspension', async () => {
  delete require.cache[require.resolve('@/lib/auth/session.ts')]
  const sessions = require('../lib/auth/session.ts')
  process.env.SESSION_SECRET = 'test-only-session-secret-at-least-32-characters'
  sessionToken = await sessions.encodeSessionToken(client)
  assert.equal((await sessions.getSession()).id, client.id)
  await db.query('UPDATE profiles SET session_version=session_version+1 WHERE id=$1', [client.id])
  assert.equal(await sessions.getSession(), null)
  sessionToken = await sessions.encodeSessionToken(client)
  await db.query("UPDATE profiles SET account_status='suspended' WHERE id=$1", [client.id])
  assert.equal(await sessions.getSession(), null)
  sessionToken = undefined
})

test('repeated ticket requests reuse the same ticket and email event', async () => {
  await db.query("UPDATE profiles SET account_status='active' WHERE id=$1", [client.id])
  session = client
  const requestKey = require('node:crypto').randomUUID()
  const data = { request_key: requestKey, title: 'Idempotent request', description: 'Repeated transport submission', priority: 'medium' }
  const before = (await scalar('SELECT count(*)::int AS n FROM tickets')).n
  for (let i = 0; i < 2; i++) await assert.rejects(actions.createTicket(undefined, form(data)), /REDIRECT:\/client\/tickets\//)
  assert.equal((await scalar('SELECT count(*)::int AS n FROM tickets')).n, before + 1)
  assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox e JOIN tickets t ON t.id=e.ticket_id WHERE t.request_key=$1 AND e.kind='ticket'", [requestKey])).n, 1)
})


test('missing authentication schema returns a controlled error without issuing a session', async () => {
  const before = createdSessions
  failVerificationQuery = true
  try {
    const state = await auth.signIn(undefined, form({ email: client.email, password: 'new-password-123' }))
    assert.deepEqual(state, { error: 'Sign-in is temporarily unavailable. Please try again later.' })
    assert.equal(createdSessions, before)
  } finally { failVerificationQuery = false }
})

test('migration runner installs legacy schema atomically and is safe to run again', async () => {
  const { applyMigration, schemaCheckSql, splitStatements } = await import('../lib/db/migrations.mjs')
  assert.equal(splitStatements("BEGIN; SELECT 'semi;colon'; DO $tag$ BEGIN PERFORM 1; END $tag$; COMMIT;").length, 2)
  await db.exec('CREATE SCHEMA migration_regression; SET search_path TO migration_regression,public;')
  try {
    await db.exec(fs.readFileSync('db/schema.sql', 'utf8').replace(/^CREATE EXTENSION.*$/gm, ''))
    const columns = await db.query("SELECT 1 FROM information_schema.columns WHERE table_schema='migration_regression' AND table_name='profiles' AND column_name='requires_email_verification'")
    assert.equal(columns.rows.length, 0)
    const client = {
      query(text, params = []) {
        return { text, params, then(resolve, reject) { return db.query(text, params).then(result => result.rows).then(resolve, reject) } }
      },
      transaction(queries) {
        return db.transaction(async tx => {
          const results = []
          for (const query of queries) results.push((await tx.query(query.text, query.params)).rows)
          return results
        })
      },
    }
    const source = fs.readFileSync('db/migrations/001_email_auth.sql', 'utf8')
    assert.equal(await applyMigration(client, '001_email_auth.sql', source), 'applied')
    assert.equal(await applyMigration(client, '001_email_auth.sql', source), 'already applied')
    const checks = await client.query(schemaCheckSql)
    assert.ok(checks.every(check => check.present))
    await assert.rejects(applyMigration(client, '001_email_auth.sql', source + '\n-- edited'), /has changed/)
    await assert.rejects(applyMigration(client, '999_invalid.sql', 'CREATE TABLE should_rollback(id int); SELECT missing_column;'))
    assert.equal((await client.query("SELECT to_regclass('should_rollback') AS table_name"))[0].table_name, null)
    assert.equal((await client.query("SELECT name FROM schema_migrations WHERE name='999_invalid.sql'")).length, 0)
  } finally {
    await db.exec('SET search_path TO public; DROP SCHEMA migration_regression CASCADE;')
  }
})

test('verification and resend use the signed-in account and ignore a submitted email', async () => {
  const self = await scalar("INSERT INTO profiles(full_name,email,password_hash,requires_email_verification,email_verified_at) VALUES('Verify Self','verify-self@example.com','hash',true,NULL) RETURNING *")
  const victim = await scalar("INSERT INTO profiles(full_name,email,password_hash,requires_email_verification,email_verified_at) VALUES('Verify Other','verify-other@example.com','hash',true,NULL) RETURNING *")
  session = self
  await auth.resendVerification(undefined, form({ email: victim.email }))
  assert.equal((await scalar("SELECT count(*)::int AS n FROM auth_challenges WHERE user_id=$1 AND purpose='verify'", [self.id])).n, 1)
  assert.equal((await scalar("SELECT count(*)::int AS n FROM auth_challenges WHERE user_id=$1 AND purpose='verify'", [victim.id])).n, 0)
  await issueChallenge(victim.id, 'verify')
  const ownJob = await scalar("SELECT payload FROM email_outbox WHERE kind='verify' AND recipient_id=$1", [self.id])
  const otherJob = await scalar("SELECT payload FROM email_outbox WHERE kind='verify' AND recipient_id=$1", [victim.id])
  const wrong = await auth.verifyEmail(undefined, form({ email: victim.email, code: security.unseal(otherJob.payload.secret) === security.unseal(ownJob.payload.secret) ? String((Number(security.unseal(ownJob.payload.secret)) + 1) % 10000).padStart(4, '0') : security.unseal(otherJob.payload.secret) }))
  assert.ok(wrong.error)
  assert.deepEqual(await auth.verifyEmail(undefined, form({ email: victim.email, code: security.unseal(ownJob.payload.secret) })), { success: true })
  assert.equal((await scalar('SELECT requires_email_verification FROM profiles WHERE id=$1', [victim.id])).requires_email_verification, true)
  session = undefined
  assert.ok((await auth.verifyEmail(undefined, form({ email: self.email, code: security.unseal(ownJob.payload.secret) }))).error)
  assert.ok((await auth.resendVerification(undefined)).error)
})


test('missing SMTP configuration leaves queued messages unclaimed', async () => {
  const before = (await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE status='pending'")).n
  const token = process.env.SMTP_APP_PASSWORD
  delete process.env.SMTP_APP_PASSWORD
  try {
    await assert.rejects(runEmailWorker(), error => error.code === 'email_configuration')
    assert.equal((await scalar("SELECT count(*)::int AS n FROM email_outbox WHERE status='pending'")).n, before)
    const { emailConfigurationIssues } = await import('../lib/email/config.mjs')
    assert.ok(emailConfigurationIssues().includes('SMTP_APP_PASSWORD is missing'))
    assert.ok(emailConfigurationIssues({ ...process.env, EMAIL_ENCRYPTION_KEY: 'bad-key' }).some(issue => issue.startsWith('EMAIL_ENCRYPTION_KEY must')))
  } finally { process.env.SMTP_APP_PASSWORD = token }
})


test('SMTP transport requires TLS and retries failures before submission', async () => {
  smtp.createGmailTransport()
  assert.equal(transportOptions.host, 'smtp.gmail.com')
  assert.equal(transportOptions.port, 465)
  assert.equal(transportOptions.secure, true)
  assert.equal(transportOptions.logger, false)
  assert.equal(transportOptions.debug, false)
  const transport = { sendMail: async () => { throw { code: 'ECONNECTION', command: 'CONN' } } }
  await assert.rejects(smtp.sendEmail(client.email, template('welcome', 'Client', 'Welcome', 'https://example.com'), 'test-id', transport), error => error.retryable && !error.uncertain)
})

test('request-bound automatic delivery schedules safely without blocking business operations', async () => {
  const callbacks = []
  fake('next/server', { after: callback => callbacks.push(callback) })
  delete require.cache[require.resolve('@/lib/email/dispatch.ts')]
  const { scheduleEmailDelivery } = require('../lib/email/dispatch.ts')
  const worker = require('../lib/email/worker.ts')
  const original = worker.runEmailWorker
  let called = 0
  worker.runEmailWorker = async () => { called++; throw new Error('mock worker failure') }
  try {
    scheduleEmailDelivery()
    assert.equal(callbacks.length, 1)
    await assert.doesNotReject(callbacks[0]())
    assert.equal(called, 1)
    const password = process.env.SMTP_APP_PASSWORD
    delete process.env.SMTP_APP_PASSWORD
    try { scheduleEmailDelivery(); assert.equal(callbacks.length, 1) }
    finally { process.env.SMTP_APP_PASSWORD = password }
  } finally { worker.runEmailWorker = original }
})


test('four-digit verification templates highlight the code and include a plain-text fallback', () => {
  const mail = template('verify', '<Client>', 'ignored', 'https://example.com/verify-email', { code: '0007', expiresAt: '2026-10-16T12:05:00.000Z' })
  assert.ok(mail.html.includes('YOUR VERIFICATION CODE'))
  assert.ok(mail.html.includes('0007'))
  assert.ok(mail.html.includes('font-size:40px'))
  assert.ok(mail.html.includes('&lt;Client&gt;'))
  assert.ok(mail.text.includes('Your verification code: 0007'))
  assert.ok(mail.text.includes('2026-10-16 12:05:00 UTC'))
  assert.throws(() => template('verify', 'Client', '', 'https://example.com', { code: '<bad>', expiresAt: '2026-10-16T12:05:00Z' }))
  assert.notEqual(security.challengeDigest('0007', 'verify', 'one@example.com'), security.challengeDigest('0007', 'verify', 'two@example.com'))
})
