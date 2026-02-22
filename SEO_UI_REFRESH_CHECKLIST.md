# SEO UI Refresh Checklist (Google-First, Multi-Engine Safe)

Use this checklist every time you redesign or refactor a page.

## 1) Before You Touch UI

- Confirm target page type and primary keyword intent from [SEO_NO_DATA_KEYWORD_MAP.md](SEO_NO_DATA_KEYWORD_MAP.md).
- Keep URL path unchanged unless absolutely necessary.
- If URL must change, plan a 301 redirect.
- Define success criteria:
  - title still matches intent
  - H1 still matches intent
  - internal links still exist

## 2) During UI Changes (Must Keep)

### Metadata
- Keep unique page `title` and `description`.
- Keep canonical URL (`alternates.canonical`).
- Keep Open Graph title/description/url.
- Keep noindex behavior on non-public pages.

### Content Structure
- Keep exactly one clear H1.
- Keep logical H2/H3 hierarchy.
- Keep the city/provider context in intro copy for local pages.
- Avoid keyword stuffing and repetitive exact-match phrases.

### Internal Linking
- Homepage links to global search + cities.
- City pages link to daycare detail pages.
- Daycare detail pages link back to city results.
- Keep anchor text descriptive (not generic “click here”).

### Structured Data
- Preserve JSON-LD on daycare detail pages.
- Ensure required fields stay valid after UI refactors.

## 3) Technical Safeguards

- Return real 404 for invalid city/provider pages.
- Keep canonical redirect behavior for slug variants.
- Keep robots and sitemap routes available.
- Ensure draft/preview routes remain blocked or noindexed in production.

## 4) Performance + UX Baseline

- Keep primary content visible without heavy interaction.
- Avoid replacing text with image-only headings.
- Preserve image alt text and meaningful labels.
- Keep mobile readability and tappable controls.

## 5) Pre-Deploy Validation (Required)

- Run build: `npm run build`
- Confirm no TypeScript/route errors.
- Smoke-check key routes:
  - `/`
  - `/daycares`
  - `/cities`
  - one city page
  - one daycare detail page
  - `/robots.txt`
  - `/sitemap.xml`

## 6) Post-Deploy Validation (Required)

- Confirm production status codes are correct.
- Confirm robots output still disallows internal-only routes.
- Confirm canonical links render correctly in page source.
- Request indexing for major changed pages in GSC URL Inspection.

## 7) Weekly SEO Ops (No GSC Data Yet)

- Re-run smoke test after each major UI release.
- Keep adding quality internal links between related pages.
- Avoid creating thin pages for keyword variants.
- Document any title/H1 changes in changelog notes.

## 8) Weekly SEO Ops (After GSC Data Starts)

- Check top pages by impressions.
- Find high-impression, low-CTR pages.
- Update title/meta only where query intent mismatch exists.
- Track changes for 2-4 weeks before further edits.

---

## Fast Go/No-Go Gate (use before every deploy)

- ✅ Build passes
- ✅ H1/title/canonical intact
- ✅ Internal links intact
- ✅ Structured data intact
- ✅ 404 and redirect behavior intact
- ✅ Robots/sitemap intact

If any item is ❌, do not deploy until fixed.
