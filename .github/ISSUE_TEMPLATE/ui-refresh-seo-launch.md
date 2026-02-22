---
name: UI Refresh + SEO Launch Checklist
about: Use this checklist for every UI refresh before release.
title: "[UI+SEO] <page-or-feature> launch checklist"
labels: ["ui-refresh", "seo"]
assignees: []
---

## Scope

- **Pages/Routes in scope:**
  - 
- **Type of change:**
  - [ ] UI-only
  - [ ] UI + copy
  - [ ] UI + metadata
  - [ ] URL/routing change
- **Target release date:**
- **Owner:**

---

## 1) Intent + Keyword Alignment

- [ ] Primary page intent confirmed from SEO map.
- [ ] Primary keyword pattern selected (one per page type).
- [ ] No competing page created for the same exact intent.
- [ ] H1 matches page intent naturally (not stuffed).

Notes:

---

## 2) Metadata Integrity

- [ ] Unique `title` per page.
- [ ] Unique `description` per page.
- [ ] `alternates.canonical` present and correct.
- [ ] Open Graph title/description/url updated.
- [ ] Robots directives correct for public vs internal pages.

Notes:

---

## 3) Content + Structure

- [ ] One clear H1 on each page.
- [ ] Logical H2/H3 hierarchy.
- [ ] Intro copy reflects location/entity intent where relevant.
- [ ] Important text is HTML text (not image-only).

Notes:

---

## 4) Internal Linking

- [ ] Homepage links to search and city discovery paths.
- [ ] City pages link to detail pages.
- [ ] Detail pages link back to city/search pages.
- [ ] Anchor text is descriptive.

Notes:

---

## 5) Technical SEO Safeguards

- [ ] Invalid city/provider routes return real 404.
- [ ] Canonical redirects for slug variants still work.
- [ ] `robots.txt` is reachable and correct.
- [ ] `sitemap.xml` is reachable and correct.
- [ ] Draft/preview routes are blocked/noindexed in production.

Notes:

---

## 6) Structured Data + Accessibility

- [ ] Existing JSON-LD remains valid (where present).
- [ ] Alt text and labels preserved.
- [ ] Mobile readability/tap targets still good.

Notes:

---

## 7) Validation (Required Before Deploy)

- [ ] Local build passes: `npm run build`
- [ ] Smoke routes checked locally:
  - [ ] `/`
  - [ ] `/daycares`
  - [ ] `/cities`
  - [ ] one `/daycares/[city]`
  - [ ] one `/daycare/[slug]`
  - [ ] `/robots.txt`
  - [ ] `/sitemap.xml`

Evidence (paste logs/screenshots/notes):

---

## 8) Post-Deploy Checks (Required)

- [ ] Production status codes correct on key routes.
- [ ] Canonical tag renders correctly in page source.
- [ ] Robots and sitemap outputs verified in production.
- [ ] URL Inspection request submitted for major changed pages.

Production URLs checked:

---

## Go / No-Go

- [ ] **GO** — all required checks complete.
- [ ] **NO-GO** — blockers remain (list below).

Blockers:

---

## References

- SEO map: [SEO_NO_DATA_KEYWORD_MAP.md](SEO_NO_DATA_KEYWORD_MAP.md)
- SEO refresh checklist: [SEO_UI_REFRESH_CHECKLIST.md](SEO_UI_REFRESH_CHECKLIST.md)
