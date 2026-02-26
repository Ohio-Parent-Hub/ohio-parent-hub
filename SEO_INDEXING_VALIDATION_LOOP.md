# SEO Indexing Validation Loop (Post-Deploy)

Use this after significant SEO/internal-linking releases.
Goal: confirm search engines can crawl, discover, and index templates correctly.

## Where to save weekly report files

- Save all raw exports in: `reports/seo-indexing/`
- Create one subfolder per report week using `YYYY-MM-DD` format.
- Example: `reports/seo-indexing/2026-02-25/`

Recommended files inside each weekly folder:
- `gsc-pages.csv`
- `gsc-sitemaps.csv`
- `bing-index-coverage.csv`
- `crawl-summary.csv` (Ahrefs/Screaming Frog export)
- `notes.md` (anything you want Copilot to know)

## Weekly pull instructions (what to export)

### 1) Google Search Console
1. Open **Search results** → set Date to last 7 days.
2. Export **Pages** report as CSV and save as `gsc-pages.csv`.
3. Open **Indexing → Pages** and capture totals shown (indexed, not indexed reasons) in `notes.md`.
4. Open **Sitemaps** and export/status capture for your sitemap as `gsc-sitemaps.csv` (or write status in `notes.md` if export is limited).

### 2) Bing Webmaster Tools
1. Open **Indexing** / **Site Explorer** coverage views.
2. Export available index coverage/crawl status CSV.
3. Save as `bing-index-coverage.csv`.
4. If no export button is available for a screen, copy key totals into `notes.md`.

### 3) Crawl tool (Ahrefs or Screaming Frog)
1. Run a crawl sample of key templates and hubs.
2. Export summary including 4xx, redirects, orphan-like findings, and duplicate title/meta signals.
3. Save as `crawl-summary.csv`.

### 4) Hand-off to Copilot
1. Confirm files are in `reports/seo-indexing/YYYY-MM-DD/`.
2. Tell Copilot: “Use this week’s folder in `reports/seo-indexing/YYYY-MM-DD` and generate the weekly snapshot summary.”

## Scope
- Homepage: `/`
- Hubs: `/daycares`, `/cities`, `/counties`
- City pages: `/daycares/[city]`
- County pages: `/daycares/county/[county]`
- Detail pages: `/daycare/[slug]`

## Cadence
- Week 1–4 after launch or major SEO release: run weekly
- After stability: run every 2 weeks

## First 30 Days Checklist (Launch Window)

### Week 1
- Confirm Google Search Console and Bing Webmaster Tools verification.
- Submit sitemap and confirm fetch success in both tools.
- Save baseline discovered/indexed/excluded/error counts.

### Week 2
- Re-check sitemap processing status.
- Run one crawl sample and log 4xx, redirects, and orphan clusters.
- Validate a 20-URL sample per template type (city/county/detail).

### Week 3
- Compare discovered vs indexed trend to baseline.
- Re-test top internal-link hubs (`/daycares`, `/cities`, `/counties`) for crawlable links.
- Triage unresolved issues into now/later buckets.

### Week 4
- Run second crawl comparison vs Week 2.
- Confirm error trends are stable or improving.
- Convert any repeating issue into a specific roadmap task.

## Step 1: Search Console + Bing checks
- Confirm property verification is active in Google Search Console and Bing Webmaster Tools.
- Confirm sitemap is submitted and fetch status is successful.
- Record totals for:
  - Discovered URLs
  - Indexed URLs
  - Excluded URLs
  - Error URLs

## Step 2: Template-level index health sample
For each template type (city, county, detail):
- Sample 20 URLs from sitemap.
- Check index status in URL Inspection / site query.
- Log status as:
  - Indexed
  - Crawled, not indexed
  - Discovered, not indexed
  - Excluded/canonicalized

## Step 3: Crawl-quality checks
Run a crawl sample (Ahrefs/Screaming Frog or equivalent) and log:
- 4xx URLs (especially internal-link targets)
- Redirect chains
- Orphan URLs
- Duplicate title/meta clusters
- Non-canonical internal links

## Step 4: Sitemap integrity checks
- Verify key hub pages are present.
- Verify no obvious duplicate entries for same canonical target.
- Verify URLs in sitemap return 200 or valid redirect to canonical destination.

## Step 5: Triage
Tag findings as:
- Fixed now
- Acceptable for now
- New roadmap item

## Exit criteria for this loop item
- One full weekly cycle completed with recorded baseline metrics.
- At least one recrawl comparison against prior baseline.
- Open issues converted into explicit roadmap items.

## Weekly Snapshot Template

Use this block each week and append to a running log.

```md
## Week of YYYY-MM-DD

### Coverage Snapshot
- Discovered URLs:
- Indexed URLs:
- Excluded URLs:
- Error URLs:

### Template Sampling (20 each)
- City pages: indexed __ / 20
- County pages: indexed __ / 20
- Detail pages: indexed __ / 20

### Crawl Findings
- 4xx count:
- Redirect chain count:
- Orphan count:
- Duplicate title/meta notes:
- Canonical mismatch notes:

### Trend vs Last Week
- Net indexed change:
- Net error change:
- Net excluded change:

### Actions
- Fixed now:
- Acceptable for now:
- Added to roadmap:
```
