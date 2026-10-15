# Gmail delivery and authentication

## Deployment order

1. Back up Postgres. For a new database, apply `db/schema.sql`. Apply `db/migrations/001_email_auth.sql` to both new and existing databases **before deploying this application**. Use the Neon SQL editor or `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_email_auth.sql`. The migration is repeatable and adds indexes; it does not send historical notifications. Plan the brief table locks during deployment.
2. Set the server-only variables from `.env.example` in the host's secret store. Do not prefix secrets with `NEXT_PUBLIC_`. Generate `EMAIL_ENCRYPTION_KEY` with `openssl rand -base64 32` and `EMAIL_WORKER_SECRET` with `openssl rand -hex 32`. Keep the encryption key stable while pending challenge jobs exist. Set a strong, stable `SESSION_SECRET` using the existing session configuration.
3. Configure `APP_BASE_URL` to the canonical HTTPS production origin. Email links never use the request Host header. Local development permits `http://localhost:3000`.
4. Schedule an authenticated **POST** to `/api/internal/email` every minute with `Authorization: Bearer <EMAIL_WORKER_SECRET>`. Use an external scheduler able to set headers and POST; a deployment alone does not schedule this route. Allow a 60-second request duration. Do not expose the secret in URL parameters. One database lease serializes workers, and each invocation handles up to ten jobs with a 250ms gap. Monitor queue age and provision capacity before increasing throughput.
5. Test against a staging database and dedicated sender, then authorize production. Inspect `/admin/email` (also linked in the sidebar) for failures. Do not deploy without the migration, Gmail authorization, and scheduler.

Production requires Postgres. When a configured database fails, writes fail rather than silently entering the demo memory database. Development without `DATABASE_URL` retains the existing demo experience, but **durable emails and recovery are unavailable in memory mode**. Recovery still returns the same generic response. Tests use their own isolated Postgres engine and never load `.env.local`.

## Authorize the dedicated Gmail sender

Sending and Google sign-in are independent integrations. Use a separate Gmail OAuth client with `GMAIL_*` credentials; the existing `GOOGLE_*` client continues to handle sign-in.

1. In Google Cloud Console, create/select the sender's project and enable **Gmail API**.
2. Configure Google Auth Platform branding, audience/consent, support contacts, authorized domains, and data access. For a Workspace-only deployment, choose Internal when eligible. For External production use, complete Google's applicable verification requirements. Testing mode refresh tokens for Gmail scopes generally expire after seven days; do not leave a production sender in Testing.
3. Create an OAuth 2.0 Web application client. Add the exact HTTPS redirect URI used by your secure, operator-only authorization tool. The application does **not** provide a public sender-authorization endpoint.
4. Authorize the dedicated mailbox using Google's web-server OAuth authorization-code flow with `scope=https://www.googleapis.com/auth/gmail.send`, `access_type=offline`, and, when necessary to obtain a new refresh token, `prompt=consent`. Use and verify OAuth `state`. Exchange the code at `https://oauth2.googleapis.com/token` using the same redirect URI. Store the resulting refresh token only in `GMAIL_REFRESH_TOKEN`. Never paste tokens into issue trackers, source files, browser application code, or logs. A vetted local operator tool or OAuth Playground with your own client may be used for setup; remove any temporary redirect URI afterward.
5. Set `GMAIL_SENDER_EMAIL` to the authorized mailbox's primary address or an already verified Gmail “Send mail as” alias. Confirm the alias in the mailbox's Gmail settings. A client ID does not prove ownership of a sender address.
6. Set `ADMIN_NOTIFICATION_EMAIL` to your trusted support administrator mailbox. All other recipients are resolved from active database profiles, ownership, and assignments. No frontend recipient address controls support notifications.

This implementation uses Google's documented OAuth HTTPS token endpoint and Gmail REST `users.messages.send`, exclusively. It builds base64url MIME multipart messages with HTML and plain text. No SMTP fallback or third-party delivery provider is present. Service-account impersonation is not implemented; use the supported mailbox OAuth setup above.

Official references: [send mail](https://developers.google.com/workspace/gmail/api/guides/sending), [messages.send](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send), [web-server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server), [refresh-token expiration](https://developers.google.com/identity/protocols/oauth2).

## Authentication behavior

New credential clients receive welcome/admin notifications and a verification email. They may sign in and view the dashboard; creating a ticket requires verification. `/verify-email` accepts the registered email and the emailed 256-bit code, and provides resend. Codes expire in 15 minutes by default (`AUTH_CHALLENGE_TTL_MINUTES`, constrained to 5–30), permit five attempts, and have a 60-second issuance cooldown. Codes are SHA-256 digests in the challenge table, with AES-256-GCM encryption only for the short-lived delivery payload. Existing users remain verified/grandfathered. Google-verified users do not require a second email verification.

Forgot-password responses are identical for missing, inactive, credential, and Google-only accounts. The public UI always explains that Google users should use Google sign-in. Reset links use a URL fragment so the secret is not sent in HTTP requests or Referer headers; the page removes the fragment after loading. Successful reset consumes the challenge and increments the session version, invalidating existing sessions on the server and proxy. Passwords use bcrypt (12 rounds), 8 characters minimum and 72 UTF-8 bytes maximum. No password is emailed. Resetting never converts an OAuth-only profile to credentials.

Google-created accounts from **before** this migration cannot be distinguished reliably: the previous implementation stored a random bcrypt password without provider metadata. Before enabling recovery, classify known legacy Google-only accounts using authoritative account records and `UPDATE profiles SET auth_provider='google' WHERE id=...`. Do not guess from avatar/name fields. New Google-only accounts are marked automatically; existing credential accounts linked through Google retain their credential reset capability.

Login notifications follow a low-frequency security policy: the first successful sign-in and then at most once per 30 days. They do not claim new-device detection and collect no device/location history. Auth request rate limits persist in Postgres (10 per operation/email and proxy IP per hour). Configure the trusted ingress to overwrite `x-forwarded-for`; otherwise do not trust client-supplied forwarding headers. Verification/reset requests fail closed if their database is unavailable.

## Notification semantics and operations

Postgres AFTER INSERT triggers create outbox jobs in the same transaction as new profiles, tickets, assignments, and public chat messages. Ticket forms retain a request UUID across retries, and a per-client unique database key reuses the existing ticket and email event for repeated submissions. Transport-level database retries are restricted to SELECT queries, since replaying ambiguous writes can duplicate business operations. Assignment updates do not repeat mail; remove/re-add creates a new assignment event. Internal notes never generate email. Gmail errors occur only in the worker, outside the core write transaction, so delivery failures cannot roll back business operations. If the database cannot persist the business write and outbox together, the write fails atomically.

Chat checks recipient ownership/current assignment again at delivery. Initial messages have a two-minute unread grace period. Subsequent messages summarize the latest unread preview/count, use 15-minute recipient/conversation cooldowns, suppress active readers, and avoid self-notification. Polling the existing chat endpoint records reads. An outbox reconciliation scan catches follow-ups arriving after an earlier bucket was sent (last seven days). Chat cooldown retries and send retries are bounded. These are eventual email reminders; the existing chat polling remains the immediate update channel. Configure chat timing persistently without redeploying using `UPDATE email_notification_settings SET chat_cooldown_seconds=900, unread_grace_seconds=120 WHERE id=1`; trigger buckets and worker cooldowns both read that row. The reminder scan horizon is seven days. The active-reader window is two minutes.

Worker failures record only safe codes and job IDs, never Google's response bodies or message contents. OAuth is refreshed for each send. 429, quota-related 403, network errors before submission, and 5xx failures use bounded exponential backoff (six attempts, Retry-After respected). Permanent configuration/auth/address errors require fixing configuration and manually retrying through `/admin/email`. Successful jobs retain Gmail's message ID. A provider acceptance is not proof of inbox delivery; monitor bounces in the sender mailbox.

**Exactly-once Gmail delivery cannot be guaranteed:** Gmail send offers no application idempotency key. Unique event keys prevent duplicate enqueue, and database claims prevent concurrent processing. If submission times out or a worker dies after claiming a job, it becomes `uncertain` and is never automatically retried. Check the sender's Sent folder using its stable Message-ID (`<outbox-job-id@sender-domain>`). After confirming it was not sent, an authorized database operator can reschedule that exact job:

```sql
UPDATE email_outbox SET status='pending', attempts=0, available_at=now(), last_error=NULL
WHERE id='<reviewed-job-uuid>' AND status='uncertain';
```

If it was sent, record the Gmail message ID and mark sent instead. Automatic resend of ambiguous jobs risks duplicates. Uncertain jobs intentionally suppress further chat reminders until reconciled. The `/admin/email` retry action only accepts failed jobs. Keep inspection and retries restricted to administrators.

Worker maintenance removes old rate-limit entries and clears encrypted challenge payloads after the maximum 30-minute expiry; sent/cancelled payloads are cleared immediately. Apply a retention policy for outbox metadata (for example, archive completed jobs after 90 days while retaining event keys as needed for deduplication). Back up encryption keys securely; rotating them invalidates pending encrypted messages, so expire/reissue challenges deliberately.

## Validation and troubleshooting

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. Tests mock all Gmail HTTP requests and use PGlite's isolated Postgres engine to execute the schema, repeatable migration, triggers, challenge SQL, and worker. They do not send live mail. Before production, use a staging database, an authorized dedicated mailbox, and an inbox you control. Create a client, verify, reset, add an employee, assign a ticket, and exchange unread chat messages. Confirm correct recipient/destination, cancellation after read/unassignment, and correct status in `/admin/email`. Never use production users for this smoke test without authorization.

- `oauth_400`/`oauth_401`: reauthorize the sender; check client/refresh token pairing, consent publishing status, revocation, or expired testing grants.
- `gmail_403`: verify the Gmail API is enabled, the grant includes gmail.send, and the sender/alias is authorized. Quota reasons retry; permission failures require intervention.
- `gmail_429` or quota errors: allow the scheduled retry; reduce volume and inspect Google quotas. Do not substitute SMTP.
- `processing_failed`: check canonical URL, encryption key, migration, database permissions, and worker server configuration. Error bodies/secrets are intentionally not logged.
- Queued indefinitely: check the scheduler is POSTing with the correct header, lease expiry, deployment timeout and database availability.
- Invalid/expired link: request a fresh challenge after the cooldown; only the latest code is valid, and consumed codes cannot be reused.
- No worker tables: apply the migration first. Do not point automated tests at your application database.

Live sender authorization, domain/consent configuration, scheduler execution, Neon deployment migration and actual inbox receipt require operator setup and are not established by automated tests.

## Changes and review map

- `lib/email/`: Gmail MIME/HTTP delivery, templates, crypto, durable storage, and the worker.
- `lib/auth/challenges.ts`, `lib/auth/rate-limit.ts`: single-use challenges and persistent abuse limits.
- `app/actions/auth.ts`, `lib/auth/session.ts`, `lib/auth/cookies.ts`, `proxy.ts`: recovery, verification, login notices, and session revocation.
- `app/actions/tickets.ts`, chat GET route and Google callback: authorization and integration with existing flows.
- Auth pages, client verification banner, `/admin/email`, and sidebar: user and operator controls.
- `db/migrations/001_email_auth.sql`: additive profile columns, challenges, outbox, worker lease, read tracking, settings, rate limits, indexes, and transactional triggers.
- `tests/`: Node test runner with an isolated PGlite Postgres database and mocked Gmail. PGlite is a development-only dependency; no production mail library is required.

Existing user work in landing/contact files is outside this feature. The implementation does not apply migrations to the configured database or send live emails during verification.

### Build environment note

The default `npm run build` uses Turbopack and the project's existing `@tailwindcss/turbopack` CSS pipeline. In restricted environments that prevent its helper process from binding a local port, the build may stop with `Operation not permitted`. `npx next build --webpack` can validate application compilation as a fallback, but this repository's Tailwind transform is configured specifically for Turbopack, so validate the default build and rendered styling on the deployment host. Do not treat the fallback compilation as live deployment verification.
