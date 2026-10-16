# Vercel authentication setup

Email/password and Google authentication share Neon profiles and signed HTTP-only
cookies. Local demo accounts exist only in memory and are not production accounts.
Never deploy without a persistent database or use demo credentials in production.

## Production settings

Set these in Vercel Project Settings → Environment Variables, scoped to Production:

- `DATABASE_URL`: the Neon connection string for the production database.
- `SESSION_SECRET`: a stable random secret of at least 32 characters (generate with
  `openssl rand -hex 32`). Changing it signs everyone out.
- `APP_BASE_URL`: `https://twsms.vercel.app` (or your canonical custom domain).
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: credentials for a Google **Web application** OAuth client.
- `GOOGLE_REDIRECT_URI`: `https://twsms.vercel.app/api/auth/google/callback`.
  Register this exact URL under authorized redirect URIs in Google Cloud Console.
  Never copy a localhost callback into Production. When omitted, the app uses the
  request origin, which must also be registered with Google.
- Email verification requires `SMTP_EMAIL`, `SMTP_APP_PASSWORD`,
  `ADMIN_NOTIFICATION_EMAIL`, `EMAIL_ENCRYPTION_KEY` (32 random bytes, base64),
  and `EMAIL_WORKER_SECRET`. See [email setup](email-setup.md).

Use separate Preview settings and a registered stable preview domain when testing
with a separate database. An explicit production Google callback sends the entire
Google flow to production, including account creation and the session cookie.

## Database and deployment

For a fresh database, apply `db/schema.sql` with your database SQL console first.
For an existing database, preserve accounts and apply the migrations:

```sh
npm run auth:check
npm run db:migrate
npm run db:check
npm test
npm run typecheck
npm run lint
npm run build
```

Run the configuration and database commands with the actual Production variables
injected into a trusted terminal. `.env.local` values do not prove Vercel is configured.
Migration 002 rejects duplicate case-insensitive emails; resolve those accounts
manually before retrying rather than deleting accounts automatically.

Redeploy after updating Vercel variables; existing deployments keep their old values.
See [Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables)
and [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect).

## Verify after deploying

1. Register a new client with email/password, receive and submit the verification
   code, then confirm access to `/client`.
2. Sign out, sign in again, and refresh the dashboard to confirm session persistence.
3. Try an incorrect password and an existing email; both must show controlled errors.
4. Use Google from both login and signup; confirm the callback returns to the same
   host where OAuth began and that a secure `twsms_session` cookie is issued.
5. Test password recovery, then confirm an old session no longer works.

Vercel logs tagged `[Auth:configuration]` indicate environment or schema problems.
`[Auth:google-token_exchange]` points to Google credentials/code exchange;
`[Auth:google-token_validation]` to token verification;
`[Auth:google-database]` or `[Auth:google-session]` to persistence/session setup.
Logs omit raw provider errors and credentials. An HTTP 200 on a Server Action can
still contain a form error: it is not evidence of a successful login.
