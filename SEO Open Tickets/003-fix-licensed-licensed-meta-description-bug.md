# [P1] Fix "Licensed Licensed" Duplicate Word in Meta Descriptions & Schema

**Priority**: P1 — Ranking Killer
**Discovered**: 2026-03-12
**Status**: Open

## Summary

Meta descriptions and ChildCare JSON-LD schema have a template bug producing "a licensed licensed type b family child care home" — the word "licensed" appears twice. This affects thousands of detail pages and makes descriptions look auto-generated, which hurts quality perception.

## Evidence

Live crawl of `https://ohioparenthub.com/daycare/2200021687-kims-kiddie-care-cincinnati` shows:

**Meta description:**
> Kims Kiddie Care is a licensed licensed type b family child care home in Cincinnati, Ohio. SUTQ: 3. View licensing, address, and contact details.

**ChildCare JSON-LD:**
> "description": "Kims Kiddie Care is a licensed licensed type b family child care home in Cincinnati, Ohio."

### Root Cause

In `app/daycare/[slug]/page.tsx`:

1. `normalizeProgramType("Licensed Type B Family Child Care Home")` → returns `"licensed type b family child care home"` (lowercased, keeps "licensed" prefix)
2. `buildDaycareDescription()` template: `"${name} is a licensed ${normalizedType} in ${location}"` → prepends "a licensed " to the already-licensed type

Same bug in the ChildCare schema description template.

## Recommended Fix

Two approaches (pick one):

**Option A:** Strip "Licensed" prefix in `normalizeProgramType()`:
```ts
function normalizeProgramType(programType: string) {
  const cleanType = toTitleCaseIfAllCaps(programType || "").trim();
  if (!cleanType || cleanType.toLowerCase() === "not specified") {
    return "daycare program";
  }
  // Remove leading "Licensed " to avoid "licensed licensed..." in templates
  return cleanType.toLowerCase().replace(/^licensed\s+/, "");
}
```

**Option B:** Remove "a licensed " from the description templates so it just uses the program type as-is.

Option A is cleaner since the word "Licensed" is already in the template.

Also fix the ChildCare schema description which has the same bug (search for `is a licensed` in the schema construction code).

## Expected Impact

Fixes a quality signal issue across ~8,000 meta descriptions. Clean, grammatically correct descriptions improve Google's content quality assessment and can improve CTR (which was a weakness during the honeymoon period).

## Affected Files

- `app/daycare/[slug]/page.tsx` — `normalizeProgramType()` function (~line 268) and/or `buildDaycareDescription()` (~line 288), plus ChildCare schema description
