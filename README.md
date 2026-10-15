# TWSMS — Technology World Support Management System

## Overview

TWSMS (Technology World Support Management System) is a web-based support management application designed to streamline customer support operations, organize support requests, and improve communication between customers and support teams.

The application is built using Next.js and uses Neon PostgreSQL for database management. Ticket documents are stored in PostgreSQL and are only downloadable by users authorized to access that ticket. When running without Neon, the in-memory development fallback stores uploaded files only for the lifetime of the server process.

## Technology Stack

- **Next.js:** Full-stack React framework for application development.
- **React:** Component-based user interface development.
- **TypeScript:** Type-safe application development.
- **Neon PostgreSQL:** Managed PostgreSQL database platform.
- **Node.js:** JavaScript runtime environment.
- **Vercel:** Potential deployment platform for hosting the application.

## Features

The system is intended to support the following capabilities, depending on the current implementation:

- Support ticket creation and management.
- Customer information management.
- Ticket status and priority tracking.
- Support team and user management.
- Assignment and tracking of support requests.
- Secure document and file sharing on tickets (4 MB per file), with client deletion for files they uploaded.
- Centralized database management.
- Responsive user interface for desktop and mobile devices.
- Scalable architecture for future feature development.

## Prerequisites

Ensure the following tools and services are available before setting up the project:

- Node.js compatible with the project's Next.js version.
- npm, pnpm, or yarn.
- Git.
- A Neon account with a configured PostgreSQL database.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd twsms
```

Replace `<YOUR_REPOSITORY_URL>` with the actual repository URL.

### 2. Install Dependencies

Using npm:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root and configure the database connection and Google OAuth credentials:

```env
DATABASE_URL="your_neon_postgresql_connection_string"
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
# Optional when the app's public origin cannot be inferred from the request:
# GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

Create a **Web application** OAuth client in Google Cloud Console. Add
`http://localhost:3000/api/auth/google/callback` and your production
`https://your-domain/api/auth/google/callback` as authorized redirect URIs. Set
`GOOGLE_REDIRECT_URI` only when it differs from the callback URL inferred from the
request origin. Use the same exact URL in Google Cloud Console and this setting.

Do not commit environment files containing credentials or sensitive information to version control.

### 4. Configure the Database

Ensure the database schema is initialized and all required migrations have been applied.
For an existing database, reapply `db/schema.sql` after pulling schema updates; it
includes idempotent migrations for ticket fields and the binary data column used by
secure ticket file sharing. Each uploaded file is limited to 4 MB.

If the project uses Prisma, the following commands may be applicable:

```bash
npx prisma generate
npx prisma migrate deploy
```

If the project uses another database ORM or migration tool, follow its corresponding setup instructions.

### 5. Run the Development Server

```bash
npm run dev
```

Open the following URL in your browser:

```text
http://localhost:3000
```

## Project Structure

The project may follow a structure similar to the following, depending on its implementation:

```text
twsms/
├── public/              # Static assets
├── src/
│   ├── app/             # Application routes and layouts
│   ├── components/      # Reusable UI components
│   ├── lib/             # Database clients and utilities
│   └── types/           # TypeScript type definitions
├── .env.local           # Local environment configuration
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Database

TWSMS uses Neon PostgreSQL for persistent data storage.

The database schema should define the entities, relationships, constraints, and indexes required by the application. Depending on the implemented functionality, these may include users, customers, support tickets, ticket assignments, messages, and activity records.

Database access should be performed securely through server-side application logic.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connection string for the Neon PostgreSQL database |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID for Google sign-in |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret for the server-side authorization-code exchange |
| `GOOGLE_REDIRECT_URI` | Optional exact callback URL; defaults to `/api/auth/google/callback` on the request origin |

Additional environment variables may be required for authentication, email delivery, file storage, or other integrations.

## Production Build

To create and run a production build locally:

```bash
npm run build
npm run start
```

Before deployment, verify that all required environment variables are configured and database migrations have been applied.

## Deployment

The application can be deployed to a Next.js-compatible hosting platform, such as Vercel.

Deployment procedure:

1. Push the source code to the Git repository.
2. Import the repository into the hosting platform.
3. Configure the required environment variables.
4. Configure the production database and migrations.
5. Build and deploy the application.
6. Verify application functionality and database connectivity.

## Security Considerations

- Keep database credentials and secrets out of source control.
- Validate user input on the server.
- Enforce authentication and authorization for protected resources.
- Apply role-based access controls where required.
- Protect customer data and sensitive support information.
- Use secure session management.
- Restrict database access to authorized application environments.

## Future Improvements

Potential enhancements may include:

- Real-time communication between customers and support agents.
- Automated email notifications.
- Ticket prioritization and escalation.
- Service-level agreement tracking.
- Reporting and analytics dashboards.
- Advanced search, filtering, and pagination.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Submit a pull request with a clear description of the proposed changes.

## License

Specify the applicable license before distributing or reusing this project. If no license has been provided, the project remains subject to the copyright holder's rights.

---

**TWSMS — Technology World Support Management System**

Built with Next.js and Neon PostgreSQL.

## Email, verification and password recovery

Application email is delivered through Gmail SMTP with a Google App Password and a durable Postgres outbox. Apply [the migration](db/migrations/001_email_auth.sql) before deploying and follow [Gmail setup and operations](docs/email-setup.md) for App Password configuration, server-only environment variables, scheduling, notification policies, safe retries, and tests. Copy the placeholder-only `.env.example` to your local environment without overwriting existing credentials.

```bash
npm run db:migrate
npm run db:check
npm test
npm run typecheck
npm run lint
npm run build
```

Live email delivery requires a Gmail sender with a valid App Password; production retries require an authenticated scheduler. Live delivery is not exercised by the automated tests.

If email is not arriving, follow the [local Gmail quickstart](docs/email-local-quickstart.md). Real values belong in `.env.local`, not `.env.example`. Run `npm run email:check` to identify missing settings. Set `SMTP_EMAIL` and `SMTP_APP_PASSWORD`, then restart the app. New notifications process automatically after requests. Optional `npm run email:watch` in a second terminal processes retries and delayed chat reminders during development.
