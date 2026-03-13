# [P1] Query-String Duplicate URLs Still in Google's Index (268 URLs)

**Priority**: P1 — Ranking Killer
**Discovered**: 2026-03-12
**Status**: Open

## Summary

268 detail page URLs with query-string parameters (`?context=city&returnTo=...`) are appearing in Google search results alongside the clean canonical versions. Although the code fix was deployed March 9 (commit f1aa06a), Google's index still contains these duplicates, diluting ranking signals.

## Evidence

GSC performance data (28-day, 1000 page limit):
```
Total pages with impressions: 1000
Pages with ?context= query strings: 268 (26.8%)
```

Example duplicate URLs appearing in search:
- `/daycare/2250032736-poco-island-learning-center-garfield-heights?context=city&returnTo=%2Fdaycares%2Fgarfield-heights` — 3 clicks, 9 impressions
- `/daycare/205768-country-hills-montessori-west-chester-west-chester?context=county&returnTo=%2Fdaycares%2Fcounty%2Fbutler` — 2 clicks, 5 impressions
- `/daycare/2230028305-days-of-discovery-beavercreek-beavercreek-township?context=city&returnTo=%2Fdaycares%2Fbeavercreek-township` — 2 clicks, 9 impressions

### Current State

- The code fix (removing query strings from internal links) was deployed March 9 ✓
- Canonical tags on detail pages correctly point to the clean URL ✓
- But Google hasn't re-crawled most of these pages yet
- The `?context=` URLs were likely indexed during the Feb 26–Mar 5 high-crawl period

## Recommended Fix

The source code fix is already deployed. To accelerate cleanup:

1. **Wait for Google to re-crawl** — The canonical tags should eventually cause Google to consolidate these. This is a time-based resolution.

2. **Optional: Submit URL removal requests** for the worst offenders (the ones with clicks/impressions) via GSC's URL Removal tool. However, this is aggressive and should be used sparingly.

3. **Verify no remaining internal links** still use query-string parameters — spot-check city listing pages and county listing pages for any lingering `?context=` links.

4. **Consider adding a URL parameter rule** in GSC (Search Console → Settings → URL Parameters) to tell Google that `context` and `returnTo` parameters don't change page content.

## Expected Impact

As Google re-crawls and consolidates these URLs, ranking signals will stop being diluted across duplicate versions. This should help the clean canonical URLs rank better. Timeline: 2-4 weeks for most URLs to consolidate.

## Affected Files

- No code changes needed (fix already deployed in commit f1aa06a)
- Action items are in Google Search Console (URL parameter configuration)
