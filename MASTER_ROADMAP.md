# Ohio Parent Hub — Master Roadmap

_Last updated: 2026-02-25_

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

## Priority 0 — Indexing-Critical Foundations (Now)

- [ ] **Post-deploy crawl/index validation loop**
	- **Why:** confirms fixes are actually honored by Google/crawlers
	- **Depends on:** recent SEO/internal-link changes already deployed
	- **Affects:** all indexable routes (`/`, `/daycares`, `/cities`, city, county, detail)
	- **Definition of done:**
		- GSC coverage exported for city/county/detail templates
		- New crawl run completed and compared to previous baseline
		- Issues triaged into: fixed / acceptable / follow-up roadmap item

- [ ] **City page editorial depth v1** (intro + “What is SUTQ?” + “How to choose daycare”)
	- **Why:** highest remaining “thin directory” risk reducer
	- **Depends on:** city templates and data summaries
	- **Affects:** `/daycares/[city]` quality, indexation, CTR, rankings
	- **Definition of done:**
		- Editorial blocks render server-side on city pages
		- Content is specific to city context (not generic boilerplate)
		- Metadata/H1/opening copy remain semantically aligned

- [ ] **Trust pages + trust-linked footer** (`/about`, `/contact`, `/privacy`, `/methodology`)
	- **Why:** reduces spam/low-trust perception for directory model
	- **Depends on:** content copy + header/footer integration
	- **Affects:** sitewide trust signals + quality evaluation
	- **Definition of done:**
		- All four pages exist and are linked from global footer
		- Contact page has working contact method (email or form)
		- Methodology clearly explains data source/update process

- [ ] **Detail page static generation strategy decision** (full set vs targeted ISR)
	- **Why:** current detail `generateStaticParams` is limited to priority-city subset
	- **Depends on:** build-time/perf constraints
	- **Affects:** crawl efficiency, TTFB, build duration, infrastructure cost
	- **Definition of done:**
		- Chosen strategy documented in this roadmap
		- Strategy implemented in `app/daycare/[slug]/page.tsx`
		- Build time + runtime impact measured and recorded

## Priority 1 — Crawl Efficiency + Ranking Leverage (Next)

- [x] **Stable sitemap `lastModified` strategy** (env/data-mtime fallback)
- [x] **Global links canonicalized to city-suffixed detail URLs**
- [x] **Slug mismatch/404 city issue fixed via shared normalization**
- [x] **ItemList schema on city pages**
- [ ] **Reduce city HTML payload** (SSR valuable block, progressively enhance heavy listing/map)
	- **Depends on:** city template/content architecture
	- **Affects:** Core Web Vitals + crawl efficiency
	- **Definition of done:**
		- City page initial HTML size reduced with before/after numbers
		- Core content remains server-rendered and crawlable
		- UX behavior/functionality remains equivalent after hydration

- [ ] **`/daycares` first-render crawlability audit** (ensure crawlable links + high-value content in initial HTML)
	- **Depends on:** dashboard rendering pattern
	- **Affects:** long-tail discovery and orphan reduction
	- **Definition of done:**
		- HTML snapshot review confirms crawlable listing links in first render
		- Any JS-only dependency gaps are documented and fixed
		- Re-crawl shows reduced orphan risk signals

- [ ] **Domain history / toxic backlink audit**
	- **Depends on:** external tooling (GSC/Ahrefs)
	- **Affects:** expectations for index/ranking recovery speed
	- **Definition of done:**
		- Referring domain profile reviewed
		- Any toxic/spam clusters identified and documented
		- Action decided (ignore / disavow / monitor)

## Priority 2 — Information Architecture, Measurement, and UX (Parallel)

- [x] County hubs live + linked from detail/city + in sitemap
- [x] Listing → detail context contract (`context`, `returnTo`) wired
- [x] Uplink instrumentation added (`back_to_results`, `browse_more`)
- [ ] **Validate uplink events in production analytics**
	- **Depends on:** GA/tag setup and deployment
	- **Affects:** decision quality for IA and UX iterations
	- **Definition of done:**
		- Event fires verified for both Back and Browse links
		- Key params validated (`link_type`, `target`, `context`)
		- Quick dashboard or saved GA report exists for weekly review

- [x] Nearby/Similar detail modules (distance-based + attribute matching)
- [ ] **Add explicit empty-state copy for Nearby/Similar**
	- **Definition of done:**
		- Empty state is user-friendly and concise
		- No empty boxes/awkward spacing when one section is hidden
		- Copy reviewed on desktop and mobile
- [ ] **Final responsive QA pass for detail layout variants**
	- **Definition of done:**
		- Verified on phone/tablet/desktop breakpoints
		- No overlap, clipping, or spacing regressions
		- Nearby/Similar containers remain visually consistent

## Priority 3 — Authority Growth & Content Expansion (After P0/P1)

- [ ] **Backlink/citation sprint** (Ohio parenting/local directories, niche resources)
	- **Definition of done:**
		- Outreach list created and prioritized
		- First batch of placements submitted/published
		- Acquired links tracked with source + status
- [ ] **Social + brand mention baseline plan**
	- **Definition of done:**
		- Minimum channel set decided (where you will actually post)
		- Reusable posting template created
		- First 4 weeks of light posting prompts drafted
- [ ] **Editorial expansion** (city guides, FAQ content, childcare explainers)
	- **Definition of done:**
		- Content template finalized
		- First 3–5 guide pages published
		- Internal links added from relevant city/county hubs
- [ ] **Thin-city redirect pilot design** (county redirect cohort, KPIs, rollback rules)
	- **Definition of done:**
		- Pilot cohort selected and documented
		- Success/failure metrics defined upfront
		- Rollback plan documented before launch

## Priority 4 — Platform Hardening & Ops

- [x] Stable CSV → JSON pipeline and pre-build generation
- [ ] Monthly data refresh runbook (owner, cadence, rollback)
	- **Definition of done:**
		- Runbook exists as a markdown doc with exact commands
		- Validation checklist included (row count, missing fields, spot checks)
		- Rollback/recovery steps documented
- [ ] Data quality gates (missing geo, county/city anomalies, duplicate slug checks)
	- **Definition of done:**
		- Script produces pass/fail output and summary report
		- Thresholds defined for warnings vs blocking failures
		- Script is run as part of build or release checklist
- [ ] KPI dashboard cadence (2/4/8-week snapshots)
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

### Still highest-risk gaps
- [ ] City editorial differentiation depth
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
- [TODO.md](TODO.md) (legacy checklist archive)