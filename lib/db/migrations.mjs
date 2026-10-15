import { createHash } from 'node:crypto'

// Keep PL/pgSQL bodies, quoted strings and comments intact when batching SQL over Neon HTTP.
export function splitStatements(source) {
  const statements = []
  let start = 0
  let quote = null
  let dollar = null
  let lineComment = false
  let blockDepth = 0
  for (let i = 0; i < source.length; i++) {
    const c = source[i]
    const next = source[i + 1]
    if (lineComment) { if (c === '\n') lineComment = false; continue }
    if (blockDepth) {
      if (c === '/' && next === '*') { blockDepth++; i++ }
      else if (c === '*' && next === '/') { blockDepth--; i++ }
      continue
    }
    if (dollar) {
      if (source.startsWith(dollar, i)) { i += dollar.length - 1; dollar = null }
      continue
    }
    if (quote) {
      if (c === quote) {
        if (next === quote) i++
        else quote = null
      }
      continue
    }
    if (c === '-' && next === '-') { lineComment = true; i++; continue }
    if (c === '/' && next === '*') { blockDepth = 1; i++; continue }
    if (c === "'" || c === '"') { quote = c; continue }
    if (c === '$') {
      const match = source.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)
      if (match) { dollar = match[0]; i += dollar.length - 1; continue }
    }
    if (c === ';') {
      statements.push(source.slice(start, i).trim())
      start = i + 1
    }
  }
  if (quote || dollar || blockDepth) throw new Error('Unterminated SQL statement in migration')
  statements.push(source.slice(start).trim())
  return statements.filter(statement => {
    const executable = statement.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim()
    return executable && !/^(BEGIN|COMMIT)$/i.test(executable)
  })
}

export async function applyMigration(client, name, source) {
  const checksum = createHash('sha256').update(source).digest('hex')
  await client.transaction([
    client.query('SELECT pg_advisory_xact_lock(847231901)'),
    client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
    )`),
  ])
  const applied = await client.query('SELECT checksum FROM schema_migrations WHERE name=$1', [name])
  if (applied[0]) {
    if (applied[0].checksum !== checksum) throw new Error('Applied migration has changed; add a new migration instead')
    return 'already applied'
  }
  await client.transaction([
    client.query('SELECT pg_advisory_xact_lock(847231901)'),
    // A concurrent runner must agree on the checksum; a mismatch aborts the entire transaction.
    client.query(`INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)
      ON CONFLICT(name) DO UPDATE SET checksum=CASE
      WHEN schema_migrations.checksum=EXCLUDED.checksum THEN schema_migrations.checksum ELSE NULL END`, [name, checksum]),
    ...splitStatements(source).map(statement => client.query(statement)),
  ])
  return 'applied'
}

export const schemaCheckSql = `WITH required_columns(table_name,column_name) AS (
 VALUES ('profiles','email_verified_at'),('profiles','requires_email_verification'),
 ('profiles','auth_provider'),('profiles','session_version'),('profiles','last_login_notice_at'),
 ('tickets','request_key'),('email_outbox','chat_through_at')
), required_tables(name) AS (
 VALUES ('auth_challenges'),('email_outbox'),('conversation_reads'),
 ('email_notification_settings'),('email_worker_lock'),('auth_request_limits')
), required_triggers(name) AS (
 VALUES ('email_profile'),('email_ticket'),('email_assignment'),('email_message')
), required_indexes(name) AS (
 VALUES ('idx_profiles_email_normalized'),('idx_tickets_request_key'),('email_outbox_ready'),
 ('email_outbox_conversation'),('idx_messages_ticket_created')
)
 SELECT 'column' AS kind, r.table_name||'.'||r.column_name AS name,
 EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_schema=current_schema()
 AND c.table_name=r.table_name AND c.column_name=r.column_name) AS present FROM required_columns r
 UNION ALL SELECT 'table',r.name,to_regclass(r.name) IS NOT NULL FROM required_tables r
 UNION ALL SELECT 'trigger',r.name,EXISTS(SELECT 1 FROM information_schema.triggers t
 WHERE t.trigger_schema=current_schema() AND t.trigger_name=r.name) FROM required_triggers r
 UNION ALL SELECT 'index',r.name,to_regclass(r.name) IS NOT NULL FROM required_indexes r`
