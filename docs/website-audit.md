# Website audit — 16 October 2026

The fixes are implemented in this checkout. They have not been deployed to Vercel. Production observations below describe the existing hosted version; local results describe the updated code.

## Verification

| Check | Result |
| --- | --- |
| Standard `npm run build` with Turbopack | Passed; public pages are prerendered and Tailwind utilities are compiled |
| ESLint and TypeScript | Passed |
| Automated regression tests | 57 cases across 5 files; passed |
| Anonymous HTTP route checks, updated production build | 36/36 passed |
| Anonymous HTTP route checks, existing Vercel deployment | 35/36 passed; malformed contact JSON returns 500 in the existing deployment |
| Configured database schema, read-only | 28/28 checks passed; no migrations or business records changed |
| Production dependency audit | 0 reported vulnerabilities |
| Development dependency audit | 5 high-severity findings in the ESLint/fast-glob/micromatch/braces chain; audit recommends a breaking Next ESLint downgrade, which was not applied |

The route checks cover public pages, auth pages, all dashboard entry routes, signed-out redirects, contact validation, attachment/download protection and CSV export protection. Run them with `node scripts/smoke-check.mjs <base-url>`.

Browser checks covered public/auth screens at desktop and 320 × 568, plus admin, client and employee screens at 320 × 568. No page-level horizontal overflow was observed; wide data tables retain their own horizontal scrolling. This checks viewport layout, not compatibility with the historical Safari version on physical iPhone 5s hardware.

An isolated development copy with outbound email disabled was used for administrator/client/employee sign-in, ticket creation, chat sending, mobile navigation, and ticket-detail layouts. The email-log fallback was separately verified over HTTP with a demo session. Automated tests cover ownership/assignment rules, internal-note privacy, email verification/reset flows, email queue behavior, upload/download/delete permissions and size limits, encrypted contact delivery, and CSV escaping/pagination.

## Fixes

- Contact submissions now enter the existing durable email queue, with encrypted enquiry details, before returning success. The existing worker delivers them to the configured admin recipient. Malformed JSON, invalid fields, rate limits and queue failures return controlled responses. Personal enquiry details are no longer logged.
- Homepage navigation now reaches real Features and How It Works sections. The homepage has a single primary heading.
- CSV exports include records beyond the first 1,000 tickets, quote every field, neutralise formula interpretation and use private/no-store headers.
- Invalid/negative admin page numbers are normalised.
- Email delivery logs show an unavailable state instead of throwing when the database is unavailable.
- Development bundles share demo state, fixing newly created tickets opening a 404 in the demo environment.
- The official Tailwind PostCSS integration works across both Next.js build engines. Type checking uses the compiler API supported by the installed TypeScript version. Build-time checking remains enabled.

## Performance changes

- `/`, `/contact`, `/privacy` and `/terms` no longer read cookies or query sessions during HTML rendering. The production build confirms static prerendering, allowing public HTML to be served from Vercel's CDN. The navbar loads only a minimal, private session response after hydration.
- Public documents bypass unnecessary authentication queries in the proxy. Protected routes still validate sessions and roles.
- React request memoisation deduplicates session lookups across server layouts and pages, and shared rating summaries across dashboard/report rendering. Private records are not cached between users or requests.
- Ticket list counts and records load concurrently. Dashboard statistics no longer wait on unrelated queries. Date filters use timestamp ranges so existing creation-time indexes can be used.
- Chat polling uses a minimal permission query instead of loading ticket profiles, ratings and assignments. Message retrieval and read receipts run concurrently after access is checked.
- Admin/client/employee routes have lightweight loading boundaries for responsive navigation.
- Exports skip assignment enrichment, which the exported fields do not use.

No production speed multiplier or Lighthouse score is claimed: local-server timings and live network timings are not directly comparable, and the updated code has not been deployed. Verify cache hits and field Core Web Vitals after deployment. Vercel recommends placing functions near the database: https://vercel.com/docs/functions/configuring-functions/region.

## Deployment follow-through

1. Deploy this checkout through the existing Vercel project.
2. Run `node scripts/smoke-check.mjs https://twsms.vercel.app`; expect 36/36.
3. Verify the public routes report CDN caching after warm-up and that signed-in navigation still resolves correctly.
4. Verify a deliberately approved real enquiry reaches the configured admin mailbox, and verify the existing scheduled email worker is running for retries.

Live mailbox delivery, Google account consent/callback completion, production authenticated writes and post-deployment Web Vitals were not exercised. Local `.env.local` uses an HTTP application URL, so the production-readiness script rejects that local URL; verify HTTPS `APP_BASE_URL` and the exact Google callback URL in Vercel's environment settings. Secrets were not changed or printed.
