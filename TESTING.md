# Testing and build baseline

The development baseline is Node **24.19.0**, npm **11.9.0**, Next.js **16.1.6**, and the exact test dependency versions in `package-lock.json`. Use `.nvmrc` to select Node. Production hosting and deployment runtime settings are unchanged.

Use GitHub account **tyhuffman7** only for `Ohio-Parent-Hub/ohio-parent-hub`. Keep Vercel, Supabase, and Stripe. Hosted project IDs still need confirmation before remote work; this setup does not contact a hosted Supabase project.

## Clean checkout

```bash
nvm install
nvm use
npm ci
npm run test:unit
npm run test:setup
npm run verify
npm run test:integration
npx playwright install chromium
npm run test:e2e
```

Docker Engine/Docker Desktop must be running. The wrapper uses the local Docker socket; use Linux, macOS with the standard Docker socket, or WSL2 with Docker integration. The first setup downloads Supabase images and can take several minutes. Installing Chromium may require Playwright's OS dependencies (`npx playwright install --with-deps chromium`) on a fresh Linux machine.

In a restricted workspace, select writable caches without changing your home directory, for example `npm ci --cache /workspace/.npm` and `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright install chromium`. Preserve that browser-path variable when running browser tests. Keep the configured proxy and trusted CA settings; do not disable TLS verification.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint; existing warnings remain visible |
| `npm run typecheck` | TypeScript without changing the incremental cache |
| `npm run test:unit` | Vitest unit tests with inert, local application configuration; Docker is not required |
| `npm run test:setup` | Start only `ohio-parent-hub-test`, apply checked-in migrations on first initialization, and seed fixtures |
| `npm run test:reset` | Rebuild only that local database from repository migrations and reseed; all data in this dedicated test project is disposable |
| `npm run test:integration` | Reseed fixtures and exercise real local Auth/Data API roles and the email inbox |
| `npm run test:build` | Production Next.js build using the isolated configuration |
| `npm run test:start` | Start that build on `127.0.0.1:3100`; refuses a missing or mismatched test build |
| `npm run test:e2e` | Playwright launches its own built test server and saves failures' traces/screenshots |
| `npm run verify` | Lint, TypeScript, unit tests, and isolated production build; requires `test:setup` first |
| `npm run test:stop` | Stop only this test project and remove generated application credentials; local data volumes are preserved |
| `npm run test:teardown` | Stop only this test project and delete its disposable data volumes and generated application credentials |

`npm run build` / `npm run start` remain the normal deployment commands. Local test builds use the same production compiler and routes, but overwrite `.next` with local configuration. Never deploy a test build; build again using the intended deployment configuration. The wrapper records the build ID and environment fingerprint and refuses to use other build artifacts for tests.

Use `test:reset` after changing migrations or when you need a fully clean database. Stop/setup verifies restart behavior; it does not apply new migrations to existing persisted volumes. Do not pass `--linked`, `--db-url`, `--all`, remote Docker selectors, or raw remote credentials to test lifecycle commands. The wrapper exposes no passthrough flags and clears inherited remote Docker selectors.

Use `test:teardown` when finished with disposable test data; `test:setup` creates it again. Supabase's local ports bind to all network interfaces by default, so run the stack on a protected development machine, not a public server.

## Isolation and configuration

The CLI project is `ohio-parent-hub-test` in `supabase/config.toml`. Its reserved ports are:

- App: `http://127.0.0.1:3100`
- Supabase API: `http://127.0.0.1:55431`
- Postgres: `127.0.0.1:55432`
- Mailpit inbox: `http://127.0.0.1:55434`

Setup obtains credentials from the local CLI's status and writes `tests/.runtime/local.json` with restrictive permissions. This file is ignored by Git and must not be shared. The wrapper validates exact local endpoints, compares saved credentials with the running stack, disables analytics, and strips inherited Supabase/Stripe/Vercel/Next public configuration before launching tests or the application. Hosted URLs, other projects/ports, and usable Stripe secret keys are rejected. The standard browser check aborts third-party requests.

Stripe uses the deliberately unusable `sk_test_oph_inert_placeholder`, `price_oph_fixture`, and `whsec_oph_fixture`. This permits SDK initialization and future locally signed event fixtures, but cannot exercise checkout or create payments. OPH-15 should mock the Stripe API boundary explicitly when testing code that calls Stripe. Do not substitute live keys or real test-account keys into this harness.

The application's normal configuration names are `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_SITE_URL`. Optional variables include `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `SITEMAP_LASTMOD`. Service-role and Stripe secrets are server-only. Do not commit or print credential values. Test setup supplies these values automatically; it does not need a production `.env` file.

## Fixtures and email

`tests/fixtures/providers.mjs` defines eight synthetic accounts: two distinct owners for each status (`none`, `active`, `past_due`, `cancelled`). User/job IDs, emails, program numbers, and creation dates are fixed. Each has a premium listing and a job. The local `listings` image bucket is created during seeding. Idempotent seeding restores the intended fixture content; database-managed update timestamps reflect the run.

Emails end in `@example.test`. Program IDs begin with `oph-test-`; they are synthetic and are not inserted into the public directory JSON or used to claim real providers. Future claim-flow tests must supply controlled authoritative listing data rather than editing the real directory. Future browser discovery tests may use stable directory records or explicit response fixtures; document which boundary is simulated.

`localClient()` creates an actual anonymous Data API client; `ownerClient(provider)` signs in with the fixture password and uses a real authenticated JWT. `localClient("service")` is only for fixture setup or explicit admin assertions. These helpers reject nonlocal requests and redirects. Permission coverage must use anonymous/authenticated clients, not service-role access alone.

SMTP is disabled; local Auth sends confirmation/recovery messages to Mailpit. `inboxMessages(email)` and `inboxMessage(id)` expose the local inbox and message body for assertions. The harness tests confirm that fresh messages arrive and that signup does not automatically create a confirmed session. Do not configure an external SMTP server for these tests.

## Build diagnosis and coverage limits

The initial build failure was reproduced with Turbopack diagnostics identifying TLS trust errors while fetching DM Serif Display and Inter. Enabling `experimental.turbopackUseSystemTlsCerts` fixed compilation using the existing system CA store, with certificate verification enabled. Fonts, metadata, routes, and production page behavior were preserved. An offline or unreachable proxy still prevents downloading uncached fonts; that is an environment failure, not a passing build.

In the managed verification environment, Docker's `vfs` driver exhausted disk while copying the official Postgres image's layers. Verification used a locally flattened filesystem of that same `17.6.1.106` image, with its original runtime configuration preserved. This was an environment-only workaround; no database image/version or storage-driver change is part of this repository. Ordinary Docker installations do not need this workaround.

Current coverage verifies the environment safety boundaries, seeded schema/content, authenticated/anonymous profile reads, captured recovery/confirmation messages, and built-app startup through the About page. It does **not** establish that the ownership and entitlement vulnerabilities are fixed. OPH-13 adds discovery smoke coverage; OPH-14/15 add the security/billing regression suites; OPH-16 adds CI and release enforcement. There is no arbitrary coverage-percentage gate.

The test database uses the three checked-in migrations, without changing their existing policies. Production schema/grants/triggers, Postgres version, email templates, and Storage policies have not been compared because the intended hosted project is unconfirmed. The local image bucket is test-only setup, not a production migration. Record any discovered drift when the hosted project is confirmed; do not adjust production or weaken policies simply to make tests pass.

Before releasing auth/schema/billing fixes, verify both allowed and rejected behavior in isolation, run the affected checks on the intended preview, and prepare a rollback. Running this baseline alone is not approval to deploy.
