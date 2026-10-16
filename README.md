# Ohio Parent Hub

[Ohio Parent Hub](https://ohioparenthub.com) helps parents find licensed Ohio childcare by location, program type, SUTQ rating and PFCC participation. Verified providers can manage premium listings and jobs. The app uses **Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase and Stripe**, hosted on Vercel. Fonts are DM Serif Display and Inter; maps use Leaflet/OpenStreetMap and location lookup uses Nominatim.

## Repository and environments

Use GitHub account **`tyhuffman7` only**, including when accessing the organization repository:

```bash
gh api user --jq .login
# Must return tyhuffman7. Stop if it returns anything else.
git clone https://github.com/Ohio-Parent-Hub/ohio-parent-hub.git
cd ohio-parent-hub
git remote -v
```

The canonical repository is [Ohio-Parent-Hub/ohio-parent-hub](https://github.com/Ohio-Parent-Hub/ohio-parent-hub). The owner's personal fork is archived. Production Supabase is `aziibxfjoduwwkmcczrm`; local work uses **`ohio-parent-hub-test`**, never a linked production database. A separate hosted staging project and the Stripe account identity remain unconfirmed. See [environment identities and operations](docs/operations.md) before any remote operation; a Vercel preview is not proof that its backing services are nonproduction.

## Install and check

Use Node **24.19.0** (`.nvmrc`) and npm **11.9.0** (`package.json`). Use npm and the committed `package-lock.json`.

```bash
nvm install
nvm use
npm ci
npm run data:validate
npm run lint
npm run typecheck
npm run test:unit
```

`nvm` is a version manager prerequisite; if you use another version manager, select the exact versions above. Lint currently reports 53 existing warnings; errors fail. Unit tests and data validation require no Docker or hosted credentials.

For the complete isolated build/database/browser checks, start Docker Engine/Desktop first:

```bash
npm run test:setup
npm run verify
npm run test:integration
npx --no-install playwright install chromium
npm run test:e2e
npm run test:teardown
```

`verify` runs directory validation, lint, TypeScript, unit tests and the production build against the local test configuration. Run integration and browser suites sequentially because fixtures are reseeded. Linux may require `npx --no-install playwright install --with-deps chromium`. The current suite has **190 recurring tests** (80 unit, 74 integration, 36 desktop/mobile browser); see [TESTING.md](TESTING.md) for coverage, fixture boundaries, registry/proxy troubleshooting and diagnostics. Test commands inject their own isolated configuration; they do not need a populated `.env.local`. Keep unrelated `.env.production*` files out of this checkout so Next.js cannot load extra settings from disk.

`test:teardown` removes only the disposable local stack, data volumes and generated test credentials. `test:stop` preserves its database volumes for a later session. Never use either as a production command.

## Run the app locally

For a built test server, run `npm run test:setup`, `npm run test:build`, then `npm run test:start`. Open **http://127.0.0.1:3100**. Stop the server before `npm run test:teardown`. Test builds and starts verify the local project/configuration; a rebuild is required after its generated credentials change.

For hot-reload development against that same disposable database:

1. Run `npm run test:setup` with Docker running.
2. Copy the placeholder template with `cp .env.example .env.local`.
3. Run `npx --no-install supabase status -o env` locally. Copy **only that local stack's** `ANON_KEY` into `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SERVICE_ROLE_KEY` into `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`; its `API_URL` must be `http://127.0.0.1:55431`. Keep credential output private. The template's localhost site URL and inert Stripe placeholders are intentional. Do not copy production keys or source arbitrary env output as shell code.
4. Start the dev server on the origin already allowed by local Auth:

   ```bash
   npm run dev -- --hostname 127.0.0.1 --port 3100
   ```

5. Open **http://127.0.0.1:3100**. Use the captured email inbox at **http://127.0.0.1:55434** for local confirmation/recovery. The inert Stripe placeholders cannot create checkout/portal sessions or payments; use the signed local fixture tests for billing behavior. The base directory remains real checked-in state data, so use synthetic local accounts/fixtures rather than sending mail to providers. Automated claim tests substitute a synthetic directory boundary; ordinary manual claims still require the directory email.
6. Stop the dev server before running browser tests or a built test server on port 3100. Use `test:stop`/`test:teardown` when finished, remove any copied local credentials when discarding the setup, and never commit `.env.local` or `tests/.runtime/`.

`npm run build` and `npm run start` are the normal deployment build/server commands using the selected app environment; they are different from the guarded `test:*` wrappers. Run `npm run build` only after selecting the intended local environment. `npm run dev` and `npm run build` validate directory inputs without regenerating data. Production builds download Google fonts through the normal trusted network connection; keep TLS verification enabled.

## Code and operational guides

| Area | Source / guide |
| --- | --- |
| Pages, APIs and mutations | `app/`, `app/api/`, `app/actions/`; cookies/session refresh and URL handling in `proxy.ts` |
| Directory source and saved enrichment | `data/`; [safe refresh workflow](docs/directory-data.md) |
| City/display normalization | `lib/metroAreas.ts`, `lib/utils.ts`; [city governance](CITY_NORMALIZATION_WORKFLOW.md) |
| Provider ownership and claims | `lib/claims/verification.ts`; [ownership rules and tests](docs/ownership-security.md) |
| Premium listings, jobs, images and billing | `app/actions/`, `app/api/stripe/`; [entitlement and webhook behavior](docs/premium-access.md) |
| Schema history | `supabase/migrations/`; [migration-history caveat](docs/operations.md#database-migrations) |
| Configuration, auth/email, billing, deployment and troubleshooting | [Operations guide](docs/operations.md) |
| Agent account restrictions and engineering rules | [AGENTS.md](AGENTS.md) |

Public routes include `/daycares`, `/daycares/[city]`, `/daycares/county/[county]`, `/daycare/[program-number]-[name]-[city]`, `/jobs`, and `/daycare/[daycare-slug]/jobs/[jobSlug]`. Preserve indexed patterns, canonical URLs, metadata and redirects. Follow the [SEO safety gate](.github/instructions/seo-safety.instructions.md) and [SEO Director remit](.github/agents/seo-director.agent.md) before SEO-sensitive changes. Draft/design-preview routes stay blocked in production.

Current engineering work is tracked in [Jira OPH](https://tylersworkspace-24596598.atlassian.net/issues/?jql=project%20%3D%20OPH). `PROJECT_PLAN.md`, `MASTER_ROADMAP.md`, `TODO.md`, older PRDs and dated SEO reports preserve historical intent/findings; their status checkboxes, SQL examples and rollout instructions are not the current implementation or task list. Start with this README, the current code and the guides above. The broader Google Cloud/SEO/indexing/analytics audit is deferred by the owner.
