# Project operations

This guide describes the implemented project and the environment confirmations recorded on **October 15, 2026**. Confirm the target again before remote changes. Repository checks cannot establish that a preview uses isolated backing services, that hosted Auth templates are correct, or that a Stripe account is the intended account.

## Accounts and environments

| Service | Confirmed identity / boundary |
| --- | --- |
| GitHub | `tyhuffman7` **only**; canonical `Ohio-Parent-Hub/ohio-parent-hub`; the personal fork is archived |
| Production app | `https://ohioparenthub.com`; `www.ohioparenthub.com` redirects to the canonical host |
| Vercel | Project `ohio-parent-hub`, ID `prj_t00k4sxo1ejCMXA8vfM48QeB2fjB`; team `team_9EFKgntZQleda2zC2OLtju1X` (`tyler-huffmans-projects-83cf5324`) |
| Production Supabase | `ohio-parent-hub`, project `aziibxfjoduwwkmcczrm`, `us-east-1`; [dashboard](https://supabase.com/dashboard/project/aziibxfjoduwwkmcczrm) |
| Local Supabase | `ohio-parent-hub-test`; API `127.0.0.1:55431`, database `55432`, captured email `55434`, application `3100` |
| Hosted staging | No separate Supabase staging/test project confirmed; do not assume Preview = staging |
| Stripe | Account ID, connected account selection, price/product and mode-specific hosted webhook configuration remain to be confirmed before live/test API mutations |
| Search Console | Domain property `sc-domain:ohioparenthub.com`; existing `gsc-reader@ohio-parent-hub.iam.gserviceaccount.com` service account; access verified earlier in this project work |

Check GitHub identity separately for each credential/tool (`gh api user --jq .login` for CLI). Stop if it is not `tyhuffman7`; do not switch to another account or change global authentication. Check `git remote -v` before authenticated fetch/push operations. A local Git author is separate from the authenticated account.

## Configuration

[.env.example](../.env.example) is a placeholder template for the local setup in [README.md](../README.md). `.env.local` and other real environment files, generated test credentials, `.vercel/`, and the root `gsc-service-account.json` stay ignored. Do not add a credential JSON under another tracked filename. Do not print, commit or attach private keys, service-role keys, webhook secrets, auth email tokens or customer payloads.

| Variable | Visibility / purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-visible API URL; local example uses `http://127.0.0.1:55431` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-visible anonymous key for that same project; authorization still relies on server checks and RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only**; privileged claims, billing and scoped provider reads/writes |
| `NEXT_PUBLIC_SITE_URL` | Public app origin, without a trailing slash; set explicitly for local/preview/production callback and billing destinations |
| `STRIPE_SECRET_KEY` | **Server only**; confirmed account/mode-specific API key; template/test wrappers use an unusable fixture value |
| `STRIPE_PRICE_ID` | Server configuration for the subscription price in that same Stripe account/mode |
| `STRIPE_WEBHOOK_SECRET` | **Server only**; signing secret for the exact endpoint/listener, separate from the API key |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional public GA4 ID; leave blank locally/in tests. Scripts load only when an ID exists and consent is `all` |
| `SITEMAP_LASTMOD` | Optional sitemap-wide last-modified override; validate the intended date before changing it |
| `GSC_KEY_FILE` | Optional standalone CLI credential path; defaults to root `gsc-service-account.json` |
| `GSC_SITE_URL` | Optional standalone CLI property; defaults to `sc-domain:ohioparenthub.com` |

`NEXT_PUBLIC_*` values are public and are embedded during the Next.js build. Never prefix private values that way. Changing hosted values requires rebuilding/redeploying the intended environment. Vercel-managed `VERCEL_URL` is only a fallback in some billing paths, not a replacement for an explicit `NEXT_PUBLIC_SITE_URL`. Some SEO canonicals deliberately use the production domain; selecting a preview site origin does not rewrite them.

Normal Next.js dev/build commands load local env files; inherited shell values can override them. The test wrapper replaces inherited application variables with guarded local values and disables analytics. It does not delete unrelated env files from disk. Do not keep production env files in a test checkout. Standalone Node scripts such as `scripts/gsc.mjs` do **not** automatically load `.env.local`; select their optional configuration explicitly in the shell without printing credentials.

Manage hosted variables only in the confirmed Vercel team/project and intended Development/Preview/Production scope. Verify identities before linking a local CLI or pulling env files. Avoid copying production credentials into local work; a pull may overwrite local overrides and may omit hosted Secret values. A configured variable does not prove that its service is reachable or correctly authorized.

## Architecture and directory refreshes

The base listing data is the state CSV plus separately saved geocoding and intentional additions, compiled into checked-in `data/daycares.json`. Display casing, city aliases, metro membership and slugs stay in the existing shared runtime utilities. Supabase supplies provider accounts, premium content, image storage and jobs keyed by string program number; refreshes never overwrite those overlays. Claims require a confirmed Auth email matching the authoritative directory email; user-editable metadata is only a lookup hint. `active` and `past_due` retain premium access; cancellation hides premium publication and paid writes while preserving saved owner content and cleanup rights.

Use [directory-data.md](directory-data.md) for the `data:refresh` → review report/candidate → `data:apply -- --report-sha256=<reviewed hash>` workflow. Dev/build/CI run only `data:validate`. Do not add a generator/geocoder to build hooks. Review normalization, record removals, coordinates, URL effects and any affected owner references before publishing a future dataset change.

## Database migrations

All checked-in migrations initialize/reset the **local** stack through `npm run test:setup` / `npm run test:reset`. Reset destroys only the dedicated local database and reseeds fixtures. Stop/setup of an existing volume does not apply newly added migrations; use the guarded reset when needed.

Hosted migration history differs from repository filenames. A read-only production check on October 15 confirmed these recorded entries:

| Hosted version / name | Related repository source |
| --- | --- |
| `20260504162054_jobs_hub` | Legacy jobs rollout; repository has `003_jobs_hub.sql` |
| `20261014204754_protect_profile_ownership` | `20261014194922_protect_profile_ownership.sql` |
| `20261014220134_enforce_premium_access` | `20261014205650_enforce_premium_access.sql` |
| `20261014220142_persist_billing_events` | `20261014205741_persist_billing_events.sql` |
| `20261015034650_restrict_rls_auto_enable` | `20261015034350_restrict_rls_auto_enable.sql` |

Initial schema/claim changes were present outside the corresponding legacy migration history. This table records rollout correspondence, not a fresh byte-for-byte schema comparison. **Do not blindly run `supabase db push --linked`, replay 001–003, repair history, or rerun the security migrations because their source timestamps differ.** Merging a PR does not itself migrate Supabase. OPH-6/7/8 require no additional production migration.

For a future schema change:

1. Inspect the intended project's actual schema/history read-only; record drift. Keep production identity separate from the unlinked local test configuration.
2. Create a new migration with the pinned CLI (`npx --no-install supabase migration new descriptive_name`; check `--help` first). Keep its SQL limited to the intended change and review any data/grant effects.
3. Apply it locally with `npm run test:reset`; run `verify`, integration and browser checks sequentially. Review effective grants/RLS/functions with real anon/authenticated/owner/service roles, not only a privileged client.
4. Prepare the compatible application/migration order, backup/recovery plan, rollback limits and exact target. Use the reviewed production migration mechanism for **only the intended migration**, after authorization for that concrete release. Record the hosted version and verify resulting schema/permissions and retained provider data.
5. Keep ownership protections, premium policies and the billing RPC compatible with both application versions during rollout. App rollback does not reverse grants, schema, provider content or Stripe state.

The original [ownership rollout](ownership-security.md) and [premium/billing rollout](premium-access.md) document behavior, tests and compatibility. Their initial findings/rollout sequences are historical; the table above records the applied production changes. Do not loosen policies to hide a failed test or make a rollback easier.

## Auth and email configuration

Local `supabase/config.toml` enables signup and email confirmation, disables anonymous sign-ins/external SMTP, and captures email on port 55434. It allows the exact localhost callback/confirmation origins used by the guide. Do not substitute `localhost`, port 3000 or a remote app without reviewing the Auth redirect allowlist and `NEXT_PUBLIC_SITE_URL` together. The local seed creates synthetic accounts; manual new claims still consult the real directory unless exercised through the automated synthetic claim tests.

For a confirmed hosted **nonproduction** environment, verify email confirmation remains enabled, SMTP delivery/rate limits, Site URL, redirect allowlist, templates and the sender identity. Hosted Auth settings/templates have not been inspected through the available connector; do not mark them verified based on local tests. Avoid broad production wildcards for arbitrary preview URLs.

The app supports two confirmation paths:

- `/auth/callback?code=...` exchanges the PKCE code using the signup browser's verifier cookies, then runs the trusted claim verifier. Recovery can use `next=/auth/reset-password`; external next destinations are rejected.
- `/auth/confirm?token_hash=...&type=signup` verifies a token hash, then runs the same claim verifier. A compatible recovery template must use `type=recovery`, which routes to `/auth/reset-password`. A token-hash template can use the pattern `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`; do not replace hosted templates until their existing flow and target origin are reviewed.

Verify signup confirmation, established-owner login, mismatched/forged claims, repeated/expired links, recovery and useful error messages in isolation. Confirmation is not permission to assign ownership solely from user metadata. Do not create real provider accounts or send real provider email as a smoke test. See [ownership-security.md](ownership-security.md) for the allowed/denied matrix and automated boundaries.

## Stripe and premium operations

Before enabling real checkout in any environment, confirm the Stripe account ID, test/live mode, subscription product/recurring price, customer portal configuration, API key and endpoint signing secret as one coherent setup. The repository uses the pinned Stripe SDK/API configuration in `lib/stripe.ts`. An inert fixture key allows local startup but cannot call Stripe checkout/portal APIs.

Configure an intended hosted endpoint at `https://<confirmed-app-origin>/api/stripe/webhook`, with these supported events:

- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.deleted`

The signing secret must belong to that exact endpoint/mode. A local Stripe listener has its own signing secret and would require separately confirmed Stripe test-account authorization; the normal test suite needs no listener or upstream API calls. Do not point fixtures at production.

The handler validates the raw-body signature, then calls the service-only transactional billing RPC. Missing/invalid signatures return 400; unrelated/non-subscription events are safely acknowledged. Persistence failures, missing/ambiguous customer bindings, invalid RPC outcomes and cache invalidation failures return 503 so Stripe can retry. A test event needs an appropriate **synthetic local** customer/profile binding to exercise persistence, not just a valid signature. Retry uses the same event ID so deduplication and cache retry behavior can be checked. See [premium-access.md](premium-access.md) for chronology, grace, cancellation and duplicate handling.

Investigate repeated failures using event ID/type, operation and safe error code, without dumping payloads or keys. Repair the verified binding/cause before replay; do not manually grant premium or acknowledge lost events to clear the queue. Existing public Storage URLs remain fetchable after cancellation because the bucket is public; premium pages/overlays stop publishing them. Saved content is retained. Manual subscription changes outside the webhook also need cache invalidation.

## CI, release and rollback

GitHub Actions runs **Regression suite** on PRs to main, main pushes and manual dispatch. It installs locked dependencies, starts only disposable local Supabase, validates directory data, runs lint/TypeScript/unit/build/integration/browser checks, retains browser failures and attempts teardown. Vercel's Git integration builds branch previews and deploys main; this workflow does not deploy its local test build.

The owner configured main protection requiring an up-to-date PR, passing **Regression suite** and **Vercel**, including for admins, without mandatory human approvals. GitHub's branch endpoint reports protection; the integration cannot read detailed settings (403), so the individual options remain owner-confirmed. Use the ordinary protected merge path; never bypass with an admin merge.

Follow [TESTING.md's release checklist](../TESTING.md#release-verification-and-rollback-preparation): inspect the exact head checks/preview, record the previous healthy production deployment/commit, merge only reviewed passing changes, verify the new merge commit's deployment is READY and owns the intended domain, then repeat public read-only checks and a deployment-scoped recent error scan. For SEO-sensitive releases, follow the SEO safety gate's GSC checks too. Hosted auth/payment write tests require a confirmed nonproduction service environment first.

Use the recorded compatible production deployment for an authorized rollback or a reviewed forward repair. Vercel rollback can suspend automatic domain assignment; verify and deliberately restore normal promotion afterward. Application rollback cannot reverse migrations, data edits or billing events. Do not roll back to code that trusts client ownership/billing fields or acknowledges failed billing writes.

Retain the historical `ui-redesign-draft` branch for the owner's deferred revamp; it has unmerged draft work. Historical jobs/share-link/SEO task branches may already be in main. Before any later branch cleanup, check ahead/behind and obtain any required deletion authorization; never equate an old branch name with disposable work. Current task status is Jira, not those names or old markdown checkboxes.

## Troubleshooting and known limits

| Symptom | Check / next action |
| --- | --- |
| Local test configuration missing/stale | Start Docker and run `test:setup`; rebuild with `test:build` after local credentials change |
| Port 3100 is occupied | Stop the existing dev/test server; Playwright launches its own built server on this port |
| New migration absent locally | Use `test:reset`; stop/setup preserves volumes and does not migrate them |
| Docker image pull quota / TLS errors | Follow TESTING.md's registry/proxy/CA guidance; keep the pinned versions and TLS verification |
| Google font fetch fails during build | Check trusted proxy/CA/network access; current Turbopack uses system TLS trust. Do not disable certificate verification |
| Directory validation fails | Stage/review inputs and report; never fix by automatically overwriting/dropping records during build |
| Claim confirmation fails | Check intended origin, redirect allowlist, template flow, verifier cookies and confirmed authoritative email; do not trust edited metadata |
| Billing repeatedly returns 503 | Check database/RPC availability, verified customer binding and safe event/operation codes; retry only after cause is repaired |
| Preview requires Vercel login | Use authenticated Vercel deployment access; keep Deployment Protection enabled |
| Analytics absent | Check environment ID and consent `all`; leave it disabled during local tests |

Full Google Cloud/SEO/indexing/analytics review remains explicitly deferred. `node scripts/gsc.mjs coverage` groups URLs with Search Analytics impressions by template; it is **not a complete indexed/excluded URL inventory**. `sitemaps` submission counts (including deprecated indexed counts) and individual URL inspections can lag a deployment. Use them as evidence with their limitations, not proof that a release changed indexing. Keep GSC credentials private and outside source; a full audit is separate work.

No separate hosted staging or confirmed Stripe account is available in the documented verification baseline. Local email delivery does not validate hosted templates/SMTP; simulated location lookup and blocked map tiles in browser tests do not prove the live upstream integrations. Existing reports and PRDs describe point-in-time evidence or product intent; recheck before turning them into new work. These limitations do not authorize infrastructure, billing-plan, Auth, or production configuration changes.

## Map tile provider

The shared Leaflet map uses `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with visible OpenStreetMap contributor attribution. This replaces the CARTO endpoint that returned HTTP 200 images reading “API KEY REQUIRED”; a successful HTTP status alone did not establish a working map. No map API key is required for the current endpoint. Browser requests retain normal Referer/User-Agent and HTTP caching behavior. Do not add no-cache headers, tile scraping, prefetch/offline-download features or restrictive referrer settings. The public service has best-effort availability; follow the [OSMF tile usage policy](https://operations.osmfoundation.org/policies/tiles/). If traffic requires a managed tile service later, review its credentials, terms and attribution together. Existing coordinates, geocoding and marker/filter behavior are independent of the basemap.
