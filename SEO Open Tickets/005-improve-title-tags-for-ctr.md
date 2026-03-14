# [P2] Improve Title Tags for Higher CTR

**Priority**: P2 — Growth Opportunity
**Discovered**: 2026-03-12
**Status**: Open

## Summary

During the honeymoon period, detail pages averaged 0.7–1.4% CTR at positions 10–14. Expected CTR at those positions is 5–10%. Low CTR was a major signal telling Google the results weren't relevant, accelerating the ranking drop. Title tag improvements are the highest-leverage fix for CTR.

## Evidence

GSC performance data during peak period:
```
Date        CTR    Avg Position
2026-02-27  0.8%   11.5
2026-03-02  0.7%   11.2
2026-03-05  1.4%   13.0
```

Current title pattern: `{Name} in {City}, OH | Daycare Profile`
- Example: "Kims Kiddie Care in Cincinnati, OH | Daycare Profile"

### Why CTR Is Low

1. "Daycare Profile" is not an action-oriented suffix — users don't search for "profiles"
2. No SUTQ/quality differentiator visible in the title
3. No action words (Find, Compare, Reviews, Details, Hours, Costs)
4. Competes poorly against Yelp/Google Maps/Care.com titles which include ratings and review counts

## Recommended Fix

Update the title template in `generateMetadata()` to include more compelling, differentiated information:

**Current:** `{Name} in {City}, OH | Daycare Profile`

**Proposed options** (test which performs best):
- `{Name} — {City}, OH Licensed Daycare | Hours, Cost & SUTQ Info`
- `{Name} in {City}, OH | Licensed Daycare Details & Contact`
- `{Name} — {SutqLabel} Rated Daycare in {City}, Ohio`

For city pages, similar improvements:
**Current:** (check current template)
**Proposed:** `{Count} Licensed Daycares in {City}, OH — Compare & Contact`

### Key Principles

- Lead with the daycare name (matches branded queries)
- Include geo-modifier (city + state)
- Add a value proposition or action word
- Include quality signal (SUTQ rating) where applicable
- Stay under 60 characters to avoid truncation

## Expected Impact

Title tag optimization is the single highest-leverage SEO change for CTR. Even a 1-2% CTR improvement across thousands of pages significantly changes Google's engagement signal assessment. If CTR improves from 1% to 3-4%, it changes the signal from "users aren't finding this relevant" to "users are clicking through."

## Affected Files

- `app/daycare/[slug]/page.tsx` — `generateMetadata()` function
- `app/daycares/[city]/page.tsx` — city page metadata
- `app/daycares/county/[county]/page.tsx` — county page metadata
