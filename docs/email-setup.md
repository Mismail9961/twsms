# Email setup: Gmail SMTP

All client, employee and administrator emails use **Gmail SMTP with a Google App Password**. Email delivery does not use OAuth, refresh tokens, Google Cloud API configuration, or redirect URIs. Google sign-in remains a separate, optional authentication feature using `GOOGLE_*` variables.

## Setup

1. Enable **2-Step Verification** on the sender's Google account.
2. Open [Google App Passwords](https://myaccount.google.com/apppasswords) and create an App Password for this app. If Google does not offer App Passwords, check account eligibility or administrator policy; a regular Google password will not work. See [Google's App Password instructions](https://support.google.com/accounts/answer/185833).
3. Save the following in the ignored `.env.local` file, not `.env.example`:

   ```env
   SMTP_EMAIL=your-sender@gmail.com
   SMTP_APP_PASSWORD=your-16-character-app-password
   ADMIN_NOTIFICATION_EMAIL=your-admin@example.com
   APP_BASE_URL=http://localhost:3000
   ```

   Keep existing `DATABASE_URL`, `SESSION_SECRET`, `EMAIL_ENCRYPTION_KEY`, and `EMAIL_WORKER_SECRET`. The encryption key must be a base64-encoded 32-byte random key. Neither these secrets nor the App Password should be shared in chat, committed, or prefixed with `NEXT_PUBLIC_`. Spaces in the displayed App Password are removed by the sender.
4. Run `npm run email:check`, restart the application, and click **Resend verification code** if needed. Codes requested before configuration was complete or expired codes must be reissued.

SMTP uses `smtp.gmail.com`, port **465**, with TLS and certificate verification enabled. The From address and envelope sender are always `SMTP_EMAIL`. Nodemailer sends the multipart MIME message; no OAuth grant is required. [SMTP transport documentation](https://nodemailer.com/smtp).

## Automatic delivery and retries

Successful signup, login notifications, password recovery, verification resend, ticket creation/assignment, employee creation and chat messages schedule a queue-processing pass using Next.js `after`. Delivery does not block the user's response. All jobs are persisted in Postgres before delivery, so an interrupted request cannot erase the queue. Failures cannot roll back successful business operations.

Keep the scheduled worker enabled for retries, unread chat reminders and pending jobs beyond the automatic batch. During development, optionally run `npm run email:watch` in a second terminal, or `npm run email:work` for one queue pass. Production must schedule an authenticated **POST** to `/api/internal/email` each minute with `Authorization: Bearer <EMAIL_WORKER_SECRET>`. Do not put the secret in a query string. Configure sufficient request duration (up to 60 seconds); an automatic `after` pass inherits its calling route's duration. Use HTTPS for production `APP_BASE_URL`. Restart/redeploy after changing environment values.

`npm run email:check -- --queue` prints sanitized queue counts without addresses, bodies or secrets. `/admin/email` allows administrators to inspect jobs and retry failures after correcting configuration. Missing settings leave jobs unclaimed. SMTP authentication errors such as 535 require fixing the App Password; 4xx SMTP responses retry with bounded exponential backoff. Connection failures before submission retry; ambiguous disconnects during DATA are marked `uncertain` to avoid duplicates. Raw SMTP errors, credentials and message bodies are never logged.

SMTP cannot guarantee exactly-once delivery. Each event has a unique key and each message a stable Message-ID. Check the sender's Sent folder before manually rescheduling an uncertain job. The `gmail_id` database column is retained for migration compatibility; it now stores the SMTP Message-ID. No schema migration is necessary for the SMTP switch. Do not blindly retry uncertain jobs. Inbox receipt must be checked separately from SMTP acceptance.

## Database and authentication

For a new database, first apply `db/schema.sql`. Run `npm run db:migrate` and `npm run db:check` before deployment. Migration files and their ledger rows commit atomically; applied files are checksum checked and must not be edited. The schema check includes authentication, ticket serial numbers, attachment storage, and rating resolution methods. Existing users remain grandfathered; new credential clients must verify before creating tickets. Sessions retain role checks and version-based revocation after password reset.

Verification displays the signed-in account's email and accepts only its emailed code. Resend resolves the recipient from that session. Verification uses a cryptographically random four-digit code (including leading zeros), keyed HMAC-SHA256 storage bound to the account email, a five-minute expiry, five attempts and a 60-second issuance cooldown. The server-held digest key is derived from the email encryption key to prevent offline guessing from a leaked database. Password resets retain 256-bit tokens with SHA-256 digests and a configurable 15-minute default expiry (`AUTH_CHALLENGE_TTL_MINUTES`, constrained to 5–30). Delivery payloads remain encrypted. After updating from the previous long verification format, request a new code; old pending verification messages are cancelled. Persistent per-email/proxy-IP rate limits apply. Configure trusted ingress to overwrite forwarding headers. Forgot-password responses remain generic; Google-only users should sign in with Google. Legacy Google-only accounts created before provider metadata existed need classification using authoritative account records before enabling their recovery.

Password reset links carry the single-use token in the URL fragment, which the page removes. Reset invalidates existing sessions. Passwords use bcrypt; new passwords require at least eight characters and no more than 72 UTF-8 bytes. No passwords are emailed. Login notices occur on the first successful login and at most once per 30 days, without device/location tracking.

Profile, ticket, assignment and public-message inserts record outbox jobs transactionally. Current ownership, active status and assignments are checked again before sending. Internal notes and self-messages do not generate email. Ticket request UUIDs and unique event keys prevent duplicate notifications. Chat batches unread messages, suppresses active readers and uses persistent cooldown/read tracking. Configure timing with `UPDATE email_notification_settings SET chat_cooldown_seconds=900, unread_grace_seconds=120 WHERE id=1`. Scheduled processing is needed for delayed unread reminders. Keep event keys long enough for deduplication when archiving old completed jobs.

## Troubleshooting and validation

- `SMTP_APP_PASSWORD is missing`: add a Google App Password in `.env.local`; `.env.example` is only a template.
- `smtp_535`/`smtp_authentication`: check the sender/App Password pairing, 2-Step Verification and account policy. Changing the Google account password revokes App Passwords; create a new one.
- `smtp_4xx`: temporary rejection or quota; let bounded retries run and reduce volume if necessary.
- `smtp_connection`: check outbound TCP 465 access on the deployment host, DNS and network policy. TLS verification is never disabled.
- `smtp_delivery_unknown`/`uncertain`: reconcile against Sent before retrying.
- No verification code: restart after configuration, click Resend, and inspect `/admin/email`. Previous attempts made without an encryption key did not enqueue a code.
- Missing columns/tables: run `npm run db:migrate`, then `npm run db:check` against the app's environment.

Run `npm test`, `npm run lint`, `npm run typecheck` and the production build. Tests use an isolated PGlite database and mock SMTP completely; no live mail is sent. Live SMTP authentication and actual inbox receipt require a valid App Password and are separate from automated tests. Development's memory mode cannot provide durable mail or recovery. Production requires Postgres and a strong session secret.
