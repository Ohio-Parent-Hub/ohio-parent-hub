# Ohio Parent Hub agent instructions

These instructions apply to the entire repository.

## Project identity and accounts

- GitHub account: **`tyhuffman7` only**. NEVER use a different GitHub account for this project. ALWAYS use `tyhuffman7` for authenticated GitHub operations.
- Repository: **`Ohio-Parent-Hub/ohio-parent-hub`**.
- Canonical remote: `https://github.com/Ohio-Parent-Hub/ohio-parent-hub.git`.
- Production site: `https://ohioparenthub.com`.
- Before authenticated GitHub operations, verify the identity for the exact tool or credential being used. For the GitHub connector, check its authenticated login; for the CLI, verify `gh api user --jq .login`. Verification in one tool does not establish the identity of another.
- If authentication fails, the account differs, or the identity cannot be verified, stop the affected authenticated operation and report the issue. Never fall back to another account, replace credentials, or change global authentication settings.
- Check `git remote -v` before fetching or pushing. Keep this repository separate from the user's other projects.
- GitHub account identity is separate from Git commit author identity. Do not invent an author email or change global Git configuration.
- Supabase production project: **`aziibxfjoduwwkmcczrm`** (`ohio-parent-hub`), confirmed by the owner. No separate hosted staging project is confirmed. Verify the intended environment before remote changes; tests use only the dedicated local stack. Stripe identity still needs confirmation. Verify Vercel team/project/commit against this repository before releases.

## Product and architecture

Ohio Parent Hub helps Ohio parents find licensed childcare by location, program type, SUTQ rating, and PFCC participation. Providers can claim listings, purchase premium features, edit listing content, and publish jobs.

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, and shadcn/Radix UI.
- Leaflet/OpenStreetMap provide maps; Nominatim supports location lookup.
- `data/daycares.json` is the checked-in directory dataset. `data/ohio_daycares.csv` is its source input; geocoding and city alias processing also affect the data.
- Supabase provides authentication, provider profiles, premium listings, jobs, and image storage. Schema history lives in `supabase/migrations/`.
- Stripe provides subscription checkout, the billing portal, and webhook updates.
- `app/` contains pages, server actions, and API routes; `components/` contains UI; `lib/` contains shared utilities and service clients.
- Provider claims, listing changes, and job mutations live in `app/actions/`; billing routes live in `app/api/stripe/`. `lib/claims/verification.ts` is the shared server-only claim verifier. See `docs/ownership-security.md` for ownership rollout and `docs/premium-access.md` for paid access, billing ordering and migration rollout.
- `proxy.ts` refreshes auth sessions, captures promo codes, normalizes legacy detail query parameters, and blocks draft/preview pages in production.

## Local development and verification

- Start with `README.md` for setup and `docs/operations.md` for environment identities, configuration, migrations, auth/email, billing and release procedures. Older plans/PRDs are historical references; Jira OPH tracks current work.
- Use npm and preserve `package-lock.json`.
- `npm ci`: install the locked dependencies.
- `npm run dev`: start the development server.
- `npm run lint`: run ESLint.
- `npx tsc --noEmit --incremental false`: check TypeScript without updating the incremental cache.
- `npm run build`: verify the production build.
- `npm run city:normalize:report`: generate city normalization reports; inspect any generated changes.
- Use `TESTING.md` for the isolated Supabase fixtures, Vitest, Playwright, and guarded test commands. `npm run test:setup` prepares the local stack; `npm run verify`, `npm run test:integration`, and `npm run test:e2e` verify the baseline. The GitHub Actions Regression suite runs these checks on PRs to main; see TESTING.md for release verification and branch-protection guidance. For auth, billing, ownership, or data changes, add focused regression coverage and report unavailable integration checks.
- Directory dev/build/CI checks validate data read-only. Use `npm run data:refresh` to stage a candidate/report, review it, and `npm run data:apply -- --report-sha256=<reviewed hash>` to accept it explicitly. Preserve the saved geocoding input, intentional additions/test markers, approved/blocked city aliases, runtime normalization, and Supabase identities/overlays. See `docs/directory-data.md`; never regenerate or geocode published data during a build.

## Configuration

Configuration referenced by the app includes:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (server only)
- `NEXT_PUBLIC_SITE_URL` (set explicitly for the intended environment)
- Optional: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `SITEMAP_LASTMOD`
- Search Console scripts: `GSC_KEY_FILE`, `GSC_SITE_URL`

Never print or commit secrets. Never expose service-role or Stripe secret keys through `NEXT_PUBLIC_` variables. Missing credentials or blocked networking must be reported as verification limits, not treated as successful integration checks.

## Change guidelines

- Preserve indexed URL patterns: `/daycares/[city]`, `/daycares/county/[county]`, `/daycare/[program-number]-[name]-[city]`, and daycare job detail URLs.
- Use `lib/metroAreas.ts` for canonical city resolution and `lib/utils.ts` for shared slug utilities. Preserve approved and blocked city aliases.
- Follow `.github/instructions/seo-safety.instructions.md` for SEO-sensitive changes and `.github/agents/seo-director.agent.md` for the SEO Director's remit. Preserve metadata, canonicals, H1 structure, structured data, and redirects.
- Keep draft and design-preview routes inaccessible in production and out of indexing.
- Read `DESIGN.md` for brand intent, while checking current components and `app/globals.css` for the implemented design. Prefer existing UI primitives and accessible controls.
- Treat `features/monetization/PRD-claim-and-premium-listings.md` and `features/jobs-hub/PRD-jobs-hub.md` as feature context. Roadmaps and older plans can be stale; verify claims against current code.
- Enforce ownership and paid-feature access in server mutations and database policies, not only dashboard navigation. User-editable auth metadata must not establish ownership or entitlement.
- Keep service-role access on the server and explicitly scope privileged reads and writes. Public reads must respect publication status.
- Check database errors in billing webhooks; failed persistence must not be acknowledged as successful processing. Preserve Stripe signature verification.
- Limit changes to the requested scope and explain what was checked, what failed, and any remaining risk.
