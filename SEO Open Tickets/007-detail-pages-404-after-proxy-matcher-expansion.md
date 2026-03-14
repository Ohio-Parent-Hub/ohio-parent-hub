# [P0] Detail Pages 404 After Proxy Matcher Expansion

**Priority**: P0 — Indexing Blocker
**Discovered**: 2026-03-12
**Status**: Open

## Summary

All production detail pages under `/daycare/[slug]` return `404` after the request-layer SEO change in commit `5e07325`. The new `proxy.ts` matcher now includes `/daycare/:path*`, but the proxy still contains the prior production guard that returns `404` for matched routes unless it redirects earlier.

## Evidence

### Live Production HTTP Checks

Clean detail URL:

- `https://ohioparenthub.com/daycare/2190020840-becoming-me-social-and-emotional-learning-enrichment-after-school-program-cincinnati`
- Result: `HTTP/2 404`

Dirty detail URL:

- `https://ohioparenthub.com/daycare/2190020840-becoming-me-social-and-emotional-learning-enrichment-after-school-program-cincinnati?context=city&returnTo=%2Fdaycares%2Fcincinnati`
- Result: `HTTP/2 308` to the clean URL, then final `HTTP/2 404`

This proves the new legacy-query redirect runs first, but the clean detail page request is then blocked by the proxy itself.

### Root Cause in Code

Shipped `proxy.ts` from commit `5e07325`:

```ts
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/daycare/")) {
    // strip context + returnTo and redirect
  }

  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/daycare/:path*", "/draft/:path*", "/design-preview/:path*"],
};
```

Before this change, the production `404` branch only applied to `/draft/*` and `/design-preview/*`. Expanding the matcher to `/daycare/:path*` caused every clean detail page request to hit the same production `404` branch.

## Recommended Fix

1. Remove `/daycare/:path*` from `proxy.ts` immediately unless the proxy is restructured to explicitly pass clean detail requests through with `NextResponse.next()`.
2. If request-layer stripping is still desired, add route-specific logic so only dirty detail URLs are redirected and clean detail URLs continue normally.
3. Re-test both clean and dirty detail URLs on production after deploy.
4. Re-run URL Inspection on sample detail URLs once production is stable.

## Expected Impact

Fixing this restores all daycare detail pages to crawlable `200` responses and removes a sitewide indexing blocker that currently prevents detail pages from ranking at all.

## Affected Files

- `proxy.ts`
- Potentially `SEO Open Tickets/006-fix-query-param-redirect-loop-on-detail-pages.md`
