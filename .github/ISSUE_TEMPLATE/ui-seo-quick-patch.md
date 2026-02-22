---
name: UI + SEO Quick Patch
about: Lightweight checklist for small UI/copy/meta updates.
title: "[Quick Patch] <page-or-component>"
labels: ["quick-patch", "ui-refresh", "seo"]
assignees: []
---

## Scope

- **Page/Route:**
- **Change summary (1-2 lines):**
- **Risk level:**
  - [ ] Low
  - [ ] Medium

---

## Required Checks

- [ ] H1 still accurate and unique.
- [ ] Title + description still match page intent.
- [ ] Canonical unchanged/correct.
- [ ] Internal links still work.
- [ ] Noindex/robots behavior unchanged for internal pages.

---

## Validate Before Merge

- [ ] `npm run build` passes.
- [ ] Route opens without error in local dev.
- [ ] If route is public, confirm no obvious layout/content regression.

---

## Post-Deploy (5-minute check)

- [ ] Production route returns 200 (or expected status).
- [ ] Page source includes expected title/canonical.

---

## Go / No-Go

- [ ] **GO**
- [ ] **NO-GO** (add blocker below)

Blocker (if any):

---

## References

- Full checklist: [SEO_UI_REFRESH_CHECKLIST.md](SEO_UI_REFRESH_CHECKLIST.md)
- Keyword map: [SEO_NO_DATA_KEYWORD_MAP.md](SEO_NO_DATA_KEYWORD_MAP.md)
