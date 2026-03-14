# [P1] Remove FAQPage Schema from All 8,000+ Detail Pages

**Priority**: P1 — Ranking Killer
**Discovered**: 2026-03-12
**Status**: Open

## Summary

Every detail page has FAQPage structured data with 5 templated questions (name/city swapped). Google deprecated FAQ rich results for non-authoritative sites in August 2023. Mass-deploying FAQPage schema across 8,000+ pages on a brand new site can be interpreted as structured data manipulation, contributing to the ranking demotion.

## Evidence

- Each detail page emits a `FAQPage` JSON-LD block with 5 questions (identical template, only daycare name/city substituted)
- Every detail page has **5 JSON-LD blocks total** (Organization, WebSite, ChildCare, FAQPage, BreadcrumbList) — excessive for a new directory site
- FAQ content was deployed March 4, ranking drop started March 6
- Live crawl verified: `curl -sL "https://ohioparenthub.com/daycare/..." | grep -o 'application/ld+json' | wc -l` → 5

### Google's FAQ Schema Policy (Aug 2023)

Google restricted FAQPage rich results to "well-known, authoritative government and health websites." For non-authoritative directory sites, deploying FAQPage schema at scale has no ranking benefit and can be viewed as schema abuse.

## Recommended Fix

1. **Remove the FAQPage JSON-LD schema** from detail pages (`app/daycare/[slug]/page.tsx`)
2. **Keep the FAQ content section** — the visible Q&A content adds value for users, just remove the structured data markup
3. **Keep the ChildCare and BreadcrumbList schemas** — these are appropriate and useful
4. Consider removing FAQPage schema from city/county pages too (same concern at scale)

### Code Changes

In `app/daycare/[slug]/page.tsx`, remove the `faqSchema` JSON-LD `<script>` block that injects `FAQPage` structured data. Keep the visual FAQ accordion.

Also evaluate the same change in:
- `app/daycares/[city]/page.tsx`
- `app/daycares/county/[county]/page.tsx`
- `app/daycares/page.tsx`
- `app/page.tsx`

The standalone `/faq` page can keep its FAQPage schema — that's a single authoritative FAQ page, which is appropriate.

## Expected Impact

Removes a potential spam signal that may be contributing to the ranking demotion. Won't cause an immediate bounce-back, but eliminates a negative factor. Schema simplification signals to Google that the site isn't trying to manipulate structured data at scale.

## Affected Files

- `app/daycare/[slug]/page.tsx`
- `app/daycares/[city]/page.tsx`
- `app/daycares/county/[county]/page.tsx`
- `app/daycares/page.tsx`
- `app/page.tsx`
