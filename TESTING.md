# Testing and build baseline

The development baseline is Node **24.19.0**, npm **11.9.0**, Next.js **16.1.6**, and the exact test dependency versions in `package-lock.json`. Use `.nvmrc` to select Node. Production hosting and deployment runtime settings are unchanged.

Use GitHub account **tyhuffman7** only for `Ohio-Parent-Hub/ohio-parent-hub`. Keep Vercel, Supabase, and Stripe. The owner confirmed production Supabase project `aziibxfjoduwwkmcczrm`; no hosted staging project is confirmed. Verify service identities and environments before remote work; this setup does not contact a hosted Supabase project.

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

CI sets `SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io` to use the pinned CLI's official Docker Hub image references. Public ECR returned `toomanyrequests: Data limit exceeded` before database startup on a main-branch verification run. This setting changes the image source, not the pinned image versions or test requirements. For the same ECR failure locally, set this variable consistently for the test setup, checks and teardown. Registry failures must not be treated as passing tests.

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

Run integration and browser suites sequentially: integration tests reseed accounts and change fixture passwords, which can invalidate browser sessions if run concurrently.

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

Current coverage verifies environment safety, seeded schema/content, real-role ownership protection, trusted claim completion with captured confirmation/recovery email, and public discovery/auth navigation in desktop/mobile Chromium. See [ownership-security.md](docs/ownership-security.md) for claim test boundaries and deployment requirements. Premium entitlement and signed billing-event regression coverage is documented in [premium-access.md](docs/premium-access.md). CI runs the available checks; required-check enforcement still needs a repository administrator. There is no arbitrary coverage-percentage gate.

The test database applies all checked-in migrations, including the ownership, entitlement and billing migrations. The confirmed hosted profile schema/grants/triggers were inspected read-only; see [ownership-security.md](docs/ownership-security.md) for findings and migration-history drift. Hosted Storage policies were inspected for OPH-4; see [premium-access.md](docs/premium-access.md). Hosted email templates have not been compared. The local image bucket is test-only setup, not a production migration. Record any additional hosted schema drift before release; do not adjust production or weaken policies simply to make tests pass.

Before releasing auth/schema/billing fixes, verify both allowed and rejected behavior in isolation, run the affected checks on the intended preview, and prepare a rollback. Running this baseline alone is not approval to deploy.

## Public discovery regression suite

Playwright runs the built production application in desktop Chromium and Pixel 7 emulation (393px wide). Coverage includes homepage location search and its empty-result message, statewide provider-name/rating filters, Columbus and Franklin County discovery, canonical detail links, contact content, back-to-results restoration, legacy URL redirects, missing routes, and production blocking of draft/design-preview routes. The About startup check remains.

The stable public record is program **400468**, A Better Choice Childcare in Columbus. Tests use the checked-in directory through the real directory API and filtering worker. Account fixtures remain synthetic. If a deliberate directory refresh changes this provider, review and update this reference. Browser requests outside the local app are blocked; `/api/geocode` alone returns fixed Columbus coordinates or an empty array. This simulates the upstream location service, not the directory results. The map check verifies Leaflet markers and the filtered result count while live tiles are unavailable in both viewports. Tests preselect necessary-only cookie consent to keep the banner from obscuring controls; consent behavior is outside this discovery suite.

Fatal browser errors and local HTTP 5xx fail tests, with concise attached diagnostics. Traces and screenshots are retained on failure. No retries hide intermittent failures. To inspect failures locally, run `npx playwright show-report` or `npx playwright show-trace <trace.zip>`.

## Pull request CI

`.github/workflows/regression.yml` runs on PRs targeting `main`, pushes to `main`, and manual dispatch. The **Regression suite** job installs locked dependencies with the pinned Node version, starts disposable local Supabase, runs `verify`, the current auth/database integration tests, and the desktop/mobile browser suite. It has a 30-minute limit, cancels superseded runs, uploads only browser failure reports/results for seven days, and attempts teardown on every outcome. Missing required services or failed commands fail the job. Existing lint warnings remain visible; lint errors fail.

The workflow requests only `contents: read`, does not persist checkout credentials, and references pinned action commits. It uses `pull_request`, never `pull_request_target`; no hosted Supabase, Stripe, Vercel or repository secrets are supplied to PR code. Local generated service credentials are disposable and must not be uploaded. The workflow does not deploy its local `.next` build. Vercel's existing Git integration still builds previews and deploys `main`.

The owner configured protection for `main` requiring pull requests, up-to-date branches, **Regression suite** and **Vercel**, with admin enforcement and no required human approvals. GitHub reports `main` as protected. The integration cannot read the detailed protection endpoint (HTTP 403), so the individual settings are owner-confirmed. Keep the check names stable and verify the active rules before changing release workflows. OPH-14 ownership/claim, OPH-15 premium/billing and OPH-6 failure/retry regressions run in this suite. The reviewed migrations must be present in the target environment for hosted enforcement.

## Release verification and rollback preparation

1. Confirm the PR's exact head commit passes **Regression suite** and the intended Vercel preview build. Review changes and migrations before merging. Do not release a different commit on the strength of an earlier result.
2. Open the preview for that commit using authenticated Vercel access when protected; keep protection enabled. Check homepage search with an actual city/ZIP, statewide name/rating filters, Columbus, Franklin County, provider detail/contact/back navigation, and the mobile layout. Confirm canonical links use the intended domain and draft routes return 404. The local suite deliberately simulates geocoding and blocks tiles, so this read-only preview check must also confirm the live geocoding/map integration. Our local Playwright harness must not be pointed at a remote deployment.
3. For auth/schema/billing changes, confirm the exact nonproduction Supabase project and Stripe test-mode account before running write scenarios. Check both permitted and rejected ownership/entitlement operations, email confirmation, cancellation visibility, signed webhook delivery and failed-persistence retries as applicable. Never use production billing or real users for smoke tests. Record any unavailable checks explicitly.
4. Record the previous healthy production Vercel deployment ID/URL and commit before release, and verify that it is retained and available for rollback. For database changes, prepare a reviewed backup/recovery and compatibility plan: an application rollback does not undo migrations, grants, data or Stripe state. Prefer changes compatible with both app versions and forward repairs; do not assume a destructive down migration is safe.
5. Merge through the protected PR path only after checks and review. Confirm the automatic production deployment matches the merge commit, is READY and owns the intended domain, then repeat the public read-only smoke check. If rollback is needed, target the recorded deployment in the confirmed team/project. Vercel rollback can suspend automatic production-domain assignment; verify it and deliberately restore normal promotion afterward. Reconcile database/billing state separately.

This adds release guidance and CI reporting without altering hosting, deployment credentials, or branch policies. Broad onboarding/operations cleanup remains OPH-8.
