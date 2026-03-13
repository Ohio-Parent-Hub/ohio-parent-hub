# [P0] Fix Query-Param Redirect Loop on Detail Pages

**Priority**: P0 — Indexing Blocker
**Discovered**: 2026-03-12
**Status**: Open

## Summary

Legacy detail URLs with `?context=` and/or `?returnTo=` are stuck in an infinite `308` self-redirect loop instead of resolving to the clean canonical detail URL. Google is still indexing some of these dirty URLs, while the clean counterparts are unknown to Google, which blocks canonical consolidation and keeps ranking signals fragmented.

## Evidence

### Search Console URL Inspection

Example 1:

- Dirty URL: `https://ohioparenthub.com/daycare/2250032736-poco-island-learning-center-garfield-heights?context=city&returnTo=%2Fdaycares%2Fgarfield-heights`
  - Index status: Submitted and indexed
  - Google canonical: dirty query-string URL
  - User canonical: clean URL
- Clean URL: `https://ohioparenthub.com/daycare/2250032736-poco-island-learning-center-garfield-heights`
  - Index status: URL is unknown to Google

Example 2:

- Dirty URL: `https://ohioparenthub.com/daycare/205768-country-hills-montessori-west-chester-west-chester?context=county&returnTo=%2Fdaycares%2Fcounty%2Fbutler`
  - Index status: Submitted and indexed
  - Google canonical: dirty query-string URL
  - User canonical: clean URL
- Clean URL: `https://ohioparenthub.com/daycare/205768-country-hills-montessori-west-chester-west-chester`
  - Index status: URL is unknown to Google

### Live HTTP Behavior

`curl -I 'https://ohioparenthub.com/daycare/2250032736-poco-island-learning-center-garfield-heights?context=city&returnTo=%2Fdaycares%2Fgarfield-heights'`

Returns:

```text
HTTP/2 308
location: /daycare/2250032736-poco-island-learning-center-garfield-heights?context=city&returnTo=%2Fdaycares%2Fgarfield-heights
```

The `Location` header points back to the exact same URL, creating an infinite redirect loop.

The clean URL returns `HTTP/2 200` normally.

### Root Cause in Code

In `next.config.ts`, the March 9 redirect rules are:

```ts
{
  source: "/daycare/:slug",
  has: [{ type: "query", key: "context" }],
  destination: "/daycare/:slug",
  permanent: true,
},
{
  source: "/daycare/:slug",
  has: [{ type: "query", key: "returnTo" }],
  destination: "/daycare/:slug",
  permanent: true,
},
```

Next/Vercel preserves unmatched query parameters when redirecting to the same pathname, so these rules keep redirecting the request back to itself instead of stripping the parameters.

### Supporting Context

- `f1aa06a` intended to remove query-string detail URLs from internal linking and add redirect cleanup
- Sitemap output contains clean detail URLs only
- GSC still shows query-string detail URLs receiving impressions and being chosen as canonical

## Recommended Fix

1. Replace the current `next.config.ts` redirect rules with a parameter-stripping implementation that actually removes `context` and `returnTo` from detail URLs.
2. Verify the legacy dirty URLs return exactly one redirect to the clean URL, or a direct `200` with the clean canonical if redirects are not used.
3. Re-run URL Inspection on a sample of dirty/clean pairs after deploy to confirm:
   - dirty URL is no longer indexed
   - clean URL becomes the Google-selected canonical
4. Keep the sitemap clean and resubmit if needed after the redirect fix is live.

## Expected Impact

Fixing the loop removes a crawler trap and allows Google to consolidate duplicate detail URLs into the clean canonical set. This should stop ranking signals from being split across dirty URLs and improve the chances of clean detail pages being indexed and ranked correctly.

## Affected Files

- `next.config.ts`
- Potentially `app/daycare/[slug]/page.tsx` if a server-side canonicalization redirect is used instead of config redirects
*** End Patch