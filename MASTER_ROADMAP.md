# Ohio Parent Hub — Master Roadmap

_Last updated: 2026-03-04_

This is the canonical roadmap for all site work.
Prioritization is indexing-first (where needed), but includes full product/UX/ops enhancements.

---

## A) ChatGPT Risk Review vs Current Code

### 1) Authority / backlinks / brand signals
- **Applies?** Yes (high)
- **Already done:** baseline brand + consistent metadata
- **Still needed:** off-site authority (backlinks, citations, mentions), stronger trust pages

### 2) Thin / low-value directory pages
- **Applies?** Yes (high)
- **Already done:** county hubs, improved linking architecture, city snippet/meta quality, ItemList on city pages
- **Still needed:** meaningful city editorial depth (context/guides/explainers), stronger differentiation from raw listings

### 3) Technical indexability blockers
- **Applies?** Partially (medium)
- **Already done:** canonicalization, slug consistency fix, sitemap coverage + stable `lastModified`, robots setup, schema improvements
- **Still needed:** full post-fix recrawl validation and continuous monitoring

### 4) Spam/trust perception
- **Applies?** Yes (medium-high)
- **Already done:** quality improvements in navigation and metadata
- **Still needed:** About/Contact/Privacy/Methodology pages + stronger trust/footer signals

### 5) Domain reputation risk
- **Applies?** Unknown (medium)
- **Already done:** none explicit
- **Still needed:** domain history/backlink toxicity check

### 6) JS rendering / crawlability concerns
- **Applies?** Partially (medium)
- **Already done:** server-rendered route shells and key metadata across templates
- **Still needed:** keep first-render crawlable links/content robust on high-scale listing experiences; refine static/ISR strategy for detail pages

---

## B) Prioritized Roadmap (with dependencies and impact)

Execution rule: work top-to-bottom; do not start lower-priority items unless higher-priority work is complete or blocked.
ID format legend: use `phase.item` references (example: `0.1`, `2.4`, `4.7`) for discussions and approvals.

## Priority 0 — Indexing-Critical Foundations (Now)

- [ ] **0.1 Post-deploy crawl/index validation loop**
	- **Why:** confirms fixes are actually honored by Google/crawlers
	- **Depends on:** recent SEO/internal-link changes already deployed
	- **Affects:** all indexable routes (`/`, `/daycares`, `/cities`, city, county, detail)
	- **Working doc:** `SEO_INDEXING_VALIDATION_LOOP.md`
	- **Progress:** Week 1 baseline captured in `reports/seo-indexing/2026-02-25/weekly-snapshot.md`
	- **Status checklist:**
		- [x] Week 1 baseline captured
		- [ ] Week-over-week comparison captured (next report cycle)
	- **Definition of done:**
		- GSC coverage exported for city/county/detail templates
		- New crawl run completed and compared to previous baseline
		- Issues triaged into: fixed / acceptable / follow-up roadmap item

- [x] **0.2 First-30-days indexing ops checklist** (GSC + Bing verification, sitemap fetch checks, discovered vs indexed trend)
	- **Working doc:** `SEO_INDEXING_VALIDATION_LOOP.md` (First 30 Days Checklist section)

- [x] **0.3 City normalization + alias map (human-in-the-loop)**
	- **Why:** prevents duplicate/competing city URL variants from misspellings and data inconsistencies
	- **Depends on:** source city values from `data/daycares.json`, review workflow for safe approvals
	- **Affects:** city slugs, internal links, canonical consistency, sitemap quality, detail URL city suffix consistency
	- **Working docs:** `CITY_NORMALIZATION_WORKFLOW.md`, `data/city-aliases.approved.json`, `data/city-aliases.blocked.json`
	- **Progress:** report workflow + approved alias map are live in runtime canonicalization (routes, links, sitemap, API filters, city aggregation) with alias redirects and impact snapshot at `reports/city-normalization/2026-02-25/apply-impact-summary.md`
	- **Definition of done:**
		- Canonical city alias map created (`raw_city` → `canonical_city`) with blocked-pair safeguards
		- Suggestion script outputs confidence tiers (high/medium/low) and review file before any merge
		- Only approved aliases are applied; no blind fuzzy merges in runtime logic
		- Legacy city variants 301 redirect to canonical city route where applicable
		- Sitemap/internal links emit canonical city slugs only
		- Before/after report recorded (city count delta, affected URLs, collision checks)

- [x] **0.4 City page editorial depth v1** (intro + “What is SUTQ?” + “How to choose daycare”)
	- **Why:** highest remaining “thin directory” risk reducer
	- **Depends on:** city templates and data summaries
	- **Affects:** `/daycares/[city]` quality, indexation, CTR, rankings
	- **Definition of done:**
		- Editorial blocks render server-side on city pages
		- Content is specific to city context (not generic boilerplate)
		- Metadata/H1/opening copy remain semantically aligned

- [x] **0.5 Trust pages + trust-linked footer** (`/about`, `/contact`, `/privacy`, `/methodology`)
	- **Why:** reduces spam/low-trust perception for directory model
	- **Depends on:** content copy + header/footer integration
	- **Affects:** sitewide trust signals + quality evaluation
	- **Definition of done:**
		- All four pages exist and are linked from global footer
		- Contact page has working contact method (email or form)
		- Methodology clearly explains data source/update process

- [x] **0.6 Detail page static generation strategy decision** (full set vs targeted ISR)
	- **Why:** current detail `generateStaticParams` is limited to priority-city subset
	- **Depends on:** build-time/perf constraints
	- **Affects:** crawl efficiency, TTFB, build duration, infrastructure cost
	- **Definition of done:**
		- Chosen strategy documented in this roadmap
		- Strategy implemented in `app/daycare/[slug]/page.tsx`
		- Build time + runtime impact measured and recorded

## Priority 1 — Crawl Efficiency + Ranking Leverage (Next)

- [x] **1.1 Stable sitemap `lastModified` strategy** (env/data-mtime fallback)
- [x] **1.2 Global links canonicalized to city-suffixed detail URLs**
- [x] **1.3 Slug mismatch/404 city issue fixed via shared normalization**
- [x] **1.4 ItemList schema on city pages**
- [x] **1.5 Reduce city HTML payload** (SSR valuable block, progressively enhance heavy listing/map)
	- **Depends on:** city template/content architecture
	- **Affects:** Core Web Vitals + crawl efficiency
	- **Implementation note:** This serves as the reference implementation pattern for 1.5b.
	- **UI guardrail:** No new visible sections/components; optimize existing rendering and data flow only.
	- **Definition of done:**
		- City page initial HTML size reduced with before/after numbers
		- Core content remains server-rendered and crawlable
		- UX behavior/functionality remains equivalent after hydration

- [x] **1.5b Reduce county HTML payload** (SSR valuable block, progressively enhance heavy listing/map)
	- **Depends on:** county template/content architecture
	- **Affects:** Core Web Vitals + crawl efficiency
	- **Implementation note:** Reuse the same SSR-first + progressive enhancement pattern selected for 1.5 to avoid duplicate architecture decisions.
	- **UI guardrail:** No new visible sections/components; optimize existing rendering and data flow only.
	- **Definition of done:**
		- County page initial HTML size reduced with before/after numbers
		- Core content remains server-rendered and crawlable
		- UX behavior/functionality remains equivalent after hydration

- [ ] **1.5c SEO safety contract for 1.5/1.5b** (required pre-launch gate)
	- **Purpose:** prevent accidental SEO regressions while reducing payload
	- **Scope guardrail:** preserve existing page UX; do not introduce new visible SEO-only blocks.
	- **Progress status:**
		- [x] Local first-render HTML checks completed for representative city + county URLs
		- [x] Local source checks confirm title/meta/canonical/H1/editorial content in server HTML
		- [x] Local source checks confirm crawlable daycare detail links in first-render HTML
		- [x] Local build + lint checks pass after 1.5/1.5b implementation
		- [ ] Rich Results/schema validation run captured for representative URLs (external tool)
		- [ ] GSC URL Inspection and post-release trend checks completed (external tool)
	- **Non-negotiable first-render (SSR) requirements:**
		- Canonical URL, title, meta description, robots directives, and H1 remain in initial HTML
		- City/county editorial intro + key explanatory copy remain in initial HTML
		- Existing daycare detail links remain crawlable in initial HTML where currently represented (not JS-only)
		- Structured data required for template (for example `ItemList` where used) remains in initial HTML
	- **Allowed to defer (client enhancement):**
		- Interactive map behavior, advanced filter state logic, larger data hydration, non-critical UI polish
	- **Verification gates before release:**
		- Before/after HTML snapshots for representative city + county pages reviewed and archived
		- No-JS/manual source check confirms required links/content exist in server HTML
		- Rich Results/schema validation passes for representative URLs
		- Lighthouse/PageSpeed comparison recorded (mobile + desktop) with no severe SEO-category regression
	- **Post-release guardrails (7–14 day check):**
		- GSC URL Inspection confirms rendered/crawled page contains required content
		- Coverage/Crawl Stats for city/county templates show no negative trend requiring rollback
		- If regressions appear, rollback to previous template behavior and open follow-up fix item before re-release

- [x] **1.6 `/daycares` first-render crawlability audit** (ensure crawlable links + high-value content in initial HTML)
	- **Depends on:** dashboard rendering pattern
	- **Affects:** long-tail discovery and orphan reduction
	- **Progress:** local first-render audit completed on built route output (`.next/server/app/daycares.html`)
	- **Status checklist:**
		- [x] First-render HTML includes crawlable daycare detail anchor links (SSR)
		- [x] First-render HTML includes H1 + editorial guidance content (SSR)
		- [x] First-render HTML includes canonical + meta description
		- [ ] Re-crawl/coverage evidence captured to confirm orphan-risk improvement (external)
	- **Definition of done:**
		- HTML snapshot review confirms crawlable listing links in first render
		- Any JS-only dependency gaps are documented and fixed
		- Re-crawl shows reduced orphan risk signals

- [ ] **1.7 Domain history / toxic backlink audit**
	- **Depends on:** external tooling (GSC/Ahrefs)
	- **Affects:** expectations for index/ranking recovery speed
	- **Definition of done:**
		- Referring domain profile reviewed
		- Any toxic/spam clusters identified and documented
		- Action decided (ignore / disavow / monitor)
- [ ] **1.8 404 and redirect-chain monitoring cadence** (weekly export/review of not-found URLs and chain cleanup)

## Priority 2 — Information Architecture, Measurement, and UX (Parallel)

- [x] **2.1 County hubs live + linked from detail/city + in sitemap**
- [x] **2.2 Listing → detail context contract (`context`, `returnTo`) wired**
- [x] **2.3 Uplink instrumentation added (`back_to_results`, `browse_more`)**
- [ ] **2.4 Validate uplink events in production analytics**
	- **Depends on:** GA/tag setup and deployment
	- **Affects:** decision quality for IA and UX iterations
	- **Definition of done:**
		- Event fires verified for both Back and Browse links
		- Key params validated (`link_type`, `target`, `context`)
		- Quick dashboard or saved GA report exists for weekly review
- [ ] **2.5 Conversion baseline tracking** (contact click, outbound website click, map interaction)

- [x] **2.6 Nearby/Similar detail modules (distance-based + attribute matching)**
- [ ] **2.7 Add explicit empty-state copy for Nearby/Similar**
	- **Definition of done:**
		- Empty state is user-friendly and concise
		- No empty boxes/awkward spacing when one section is hidden
		- Copy reviewed on desktop and mobile
- [ ] **2.8 Final responsive QA pass for detail layout variants**
	- **Definition of done:**
		- Verified on phone/tablet/desktop breakpoints
		- No overlap, clipping, or spacing regressions
		- Nearby/Similar containers remain visually consistent

## Priority 3 — Authority Growth & Content Expansion (After P0/P1)

- [ ] **3.1 Backlink/citation sprint** (Ohio parenting/local directories, niche resources)
	- **Definition of done:**
		- Outreach list created and prioritized
		- First batch of placements submitted/published
		- Acquired links tracked with source + status
- [ ] **3.2 Social + brand mention baseline plan**
	- **Definition of done:**
		- Minimum channel set decided (where you will actually post)
		- Reusable posting template created
		- First 4 weeks of light posting prompts drafted
- [ ] **3.3 Editorial expansion** (city guides, FAQ content, childcare explainers)
	- **Progress status:**
		- [x] `/faq` page live — 10 Q&As with real source links, collapsible accordions, FAQPage JSON-LD, stat cards in hero
		- [x] FAQ link in global nav (desktop + mobile) and footer
		- [x] FAQ section added to homepage with FAQPage schema (SSR)
		- [x] FAQ section added to `/daycares` page with FAQPage schema (SSR)
		- [x] City-specific FAQ section on all city pages (dynamic provider name in Q&A) with FAQPage schema (SSR)
		- [x] County-specific FAQ section on all county pages with FAQPage schema (SSR)
		- [x] Provider-specific FAQ section on all detail pages (SUTQ, license, PFCC, etc.) with FAQPage schema (SSR)
		- [ ] City/county guide pages (childcare explainers, how-to content)
		- [ ] First 3–5 long-form guide pages published
	- **Definition of done:**
		- Content template finalized
		- First 3–5 guide pages published
		- Internal links added from relevant city/county hubs
		- FAQ + editorial depth cross-linking plan added for global, city, county, and daycare pages
- [ ] **3.4 Email capture + retention placeholder plan** (owned audience before full blog/shop scale)
- [ ] **3.5 Thin-city redirect pilot design** (county redirect cohort, KPIs, rollback rules)
	- **Definition of done:**
		- Pilot cohort selected and documented
		- Success/failure metrics defined upfront
		- Rollback plan documented before launch
- [ ] **3.6 Add blog section** (content hub for guides, explainers, and updates)
- [ ] **3.7 Add shop section** (best products for parents, e.g. strollers/car seats)
- [ ] **3.8 Research CMS platforms for blog + shop publishing workflows**

## Priority 4 — Platform Hardening & Ops

- [ ] **4.1 Research subscription + account management platforms**
- [ ] **4.2 Terms page + affiliate disclosure page**
- [ ] **4.3 Sponsored/paid placement labeling standards** (Premium/Featured transparency requirements)
- [ ] **4.4 Build Premium Listing daycare page template** (photos, hours, amenities, pricing, services, website link, reviews)
- [ ] **4.5 Build Featured Listing card template**

- [x] **4.6 Stable CSV → JSON pipeline and pre-build generation**
- [ ] **4.7 Monthly data refresh runbook (owner, cadence, rollback)**
	- **Definition of done:**
		- Runbook exists as a markdown doc with exact commands
		- Validation checklist included (row count, missing fields, spot checks)
		- Rollback/recovery steps documented
- [ ] **4.8 Data quality gates (missing geo, county/city anomalies, duplicate slug checks)**
	- **Definition of done:**
		- Script produces pass/fail output and summary report
		- Thresholds defined for warnings vs blocking failures
		- Script is run as part of build or release checklist
- [ ] **4.9 KPI dashboard cadence (2/4/8-week snapshots)**
	- **Definition of done:**
		- Baseline metrics captured once
		- Repeat snapshot template created
		- Historical log updated at each checkpoint

---

## C) Current Status Snapshot (Corrected)

### Completed key items
- [x] Title duplication fix via metadata template discipline
- [x] City slug mismatch fix
- [x] Canonical internal linking improvements
- [x] Stable sitemap core coverage + stable last-mod behavior
- [x] Site-level `Organization` + `WebSite` schema
- [x] Daycare `aggregateRating` where valid
- [x] City `ItemList` schema
- [x] County hub architecture + major link pathways
- [x] `/faq` page with 10 Q&As, real source links, FAQPage JSON-LD, live stat cards
- [x] FAQ sections (SSR + FAQPage schema) on homepage, `/daycares`, city, county, and detail pages
- [x] FAQ nav link in global header (desktop + mobile) and footer

### Still highest-risk gaps
- [ ] City normalization/alias governance to prevent duplicate city variants
- [ ] City editorial differentiation depth (guide pages, explainers — FAQ cross-linking done)
- [ ] Trust/legal pages and explicit quality signals
- [ ] Full crawl/index validation loop post-fix
- [ ] Detail route static/ISR strategy at full scale

---

## D) Lightweight Testing Plan (for growth safety)

### 1) Build gates (every merge)
- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Block merges on either failure

### 2) Manual smoke checks (every deploy)
- [ ] Homepage loads and links to `/daycares`, `/cities`, `/counties`
- [ ] City route with punctuation slug resolves correctly (no 404)
- [ ] Detail canonical redirect works for non-canonical slug variant
- [ ] Back-to-results behavior works from state/county/city flows
- [ ] Nearby/Similar sections behave for both match and no-match cases

### 3) SEO/crawl checks (weekly)
- [ ] GSC: Coverage, Crawl Stats, and sitemap processing status
- [ ] Sample crawl diff: 4xx pages, orphan pages, duplicate titles, meta truncation outliers
- [ ] Verify indexed count trend for city/county/detail templates

### 4) Suggested future automation (light)
- [ ] Add Playwright smoke suite for critical navigation routes
- [ ] Add schema validation checks for city/detail JSON-LD presence
- [ ] Add sitemap integrity script (duplicates, non-200 URLs, lastmod sanity)

---

## E) Reference Docs

- [COUNTY_HUB_PLAN.md](COUNTY_HUB_PLAN.md) (county architecture reference)
- [UPLINK_MATRIX.md](UPLINK_MATRIX.md) (uplink behavior/spec reference)
- [SEO_FULL_SITE_AUDIT_2026-02-22.md](SEO_FULL_SITE_AUDIT_2026-02-22.md) (full audit context)
- [SEO_INDEXING_VALIDATION_LOOP.md](SEO_INDEXING_VALIDATION_LOOP.md) (post-deploy validation runbook + weekly snapshot template)
- [TODO.md](TODO.md) (legacy checklist archive)