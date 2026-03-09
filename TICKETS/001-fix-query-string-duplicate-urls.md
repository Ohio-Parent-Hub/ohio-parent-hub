# TICKET-001: Fix Query-String Duplicate URLs Causing Indexing Problems

_Created: 2026-03-09_
_Status: IN PROGRESS_
_Priority: Critical (SEO)_
_Relates to: Roadmap items 0.1, 1.5c_

---

## Problem Summary

Google is indexing detail page URLs **with query parameters** (`?context=...&returnTo=...`) as separate pages, creating ~960 duplicate entries. This is the primary driver of the impression drop from ~2,000/day to ~76/day between March 5–7.

## Evidence

### GSC "Why pages aren't indexed" report:
| Reason | Count | Severity |
|---|---|---|
| Discovered - currently not indexed | 4,658 | Expected (new site, processing) |
| **Alternate page with proper canonical tag** | **960** | **Root cause — duplicates** |
| Page with redirect | 51 | Expected (city normalization) |
| Crawled - currently not indexed | 33 | Monitor |
| Not found (404) | 2 | Minor |
| Soft 404 | 1 | Minor |

### URL Inspection proof:
- `?context=county&returnTo=...` version → **Indexed by Google** (Google chose query-string URL as canonical, ignoring our canonical tag)
- Clean URL (same page, no query string) → **"Unknown to Google"** (Google hasn't even seen the clean version)
- Google is discovering detail pages through client-rendered listing links that include query parameters

### Performance impact:
- March 2–5: ~1,800–3,300 impressions/day, avg position ~11
- March 6: 497 impressions, avg position 22
- March 7: 76 impressions, avg position 38.6

## Root Cause

The `context` and `returnTo` query parameters are appended to every detail-page link inside two client components. Both are `"use client"` components — no SSR-rendered `<a>` tags point to detail pages.

### Where query-string links are generated:

| Component | Helper function | Usage locations |
|---|---|---|
| `components/CityDashboard.tsx` | `withListingContext()` (line 88) | Map markers (line 688), list card `<Link>` (line 880) |
| `components/GlobalDashboard.tsx` | `withListingContext()` (line 97) | Map markers (line 770), list card `<Link>` (line 993) |

`CountyDaycaresPageClient` delegates to `CityDashboard` (inherits same behavior).

### How these values flow:

1. **Listing pages** (`CityDashboard` / `GlobalDashboard`):
   - `returnTo` = `usePathname()` (e.g. `/daycares/columbus`, `/daycares/county/butler`, `/daycares`)
   - `linkContext` = `"county"` if `countySlug` prop is set, else `"city"` (CityDashboard) or `"state"` (GlobalDashboard)
   - Both map marker URLs and `<Link href>` use `withListingContext()` to append `?context=...&returnTo=...`

2. **Detail page** (`app/daycare/[slug]/page.tsx`):
   - Server component reads `searchParams.context` and `searchParams.returnTo` (lines 491–492)
   - `context` is validated via `normalizeContext()` → `"state" | "county" | "city" | "unknown"`
   - `returnTo` is validated via `sanitizeReturnToPath()` (must start with `/`, not `//`)
   - Computes `backHref = returnTo || contextFallbackHref` where fallback is city or county href
   - Passes `backHref` and `uplinkContext` to `DaycareDetailPageShell`

3. **DaycareDetailPageShell** (client component):
   - Renders `BackToResultsButton` with `fallbackHref={backHref}` and `trackingContext={uplinkContext}`
   - Renders `TrackedUplinkLink` browse links with `context={uplinkContext}` (for analytics)
   - `uplinkContext` is used **only for analytics** (`trackUplinkClick` pushes to `dataLayer`/`gtag`)

4. **BackToResultsButton** (client component):
   - Calls `router.push(fallbackHref)` on click — this is a **forward navigation**, not browser-back
   - Also fires `trackUplinkClick` analytics event

### What already uses clean URLs (no changes needed):
- **Nearby/Similar daycare cards** on detail pages — built server-side with clean `/daycare/slug` hrefs ✅
- **Browse links** on detail pages (Ohio, county, city) — clean hrefs ✅
- **Sitemap** — uses `resolveCanonicalCitySlugFromName()`, no query params ✅
- **JSON-LD ItemList schema** on city pages — clean hrefs ✅
- **Canonical tags** on detail pages — already set to clean `/daycare/slug` ✅

### Why Google ignores the canonical:
1. Google discovers detail pages **only** through client-rendered links with query strings
2. Google's renderer executes JavaScript, follows the hydrated links, and indexes the query-string URLs
3. Google sometimes overrides user-declared canonicals when the discovered URL differs from the canonical

## Proposed Fix

### Change 1: Store nav context in sessionStorage on link click

**Files:** `components/CityDashboard.tsx`, `components/GlobalDashboard.tsx`

Replace `withListingContext()` with a shared helper that stores context in sessionStorage on click, and use clean hrefs.

**Before:**
```tsx
function withListingContext(daycarePath: string, context: "city" | "county", returnTo: string) {
  const query = new URLSearchParams({ context, returnTo });
  return `${daycarePath}?${query.toString()}`;
}

// List card link (CityDashboard line 880):
const detailHref = withListingContext(`${basePath}/daycare/${slug}`, linkContext, returnTo);
<Link href={detailHref} className="hover:underline">

// Map marker URL (CityDashboard line 688):
const url = withListingContext(`${basePath}/daycare/${id}-${slugify(name)}-${citySlug}`, linkContext, returnTo);
```

**After:**
```tsx
// Replace withListingContext with a function that stores in sessionStorage:
function storeNavContext(context: string, returnTo: string) {
  try {
    sessionStorage.setItem("ohph_nav_context", JSON.stringify({ context, returnTo }));
  } catch {
    // sessionStorage unavailable — back button will use server-computed fallback
  }
}

// List card links use clean hrefs + onClick:
const detailHref = `${basePath}/daycare/${slug}`;
<Link
  href={detailHref}
  className="hover:underline"
  onClick={() => storeNavContext(linkContext, returnTo)}
>

// "View Details" button links also get onClick:
<Link href={detailHref} onClick={() => storeNavContext(linkContext, returnTo)}>
  <Button variant="outline" size="sm">View Details</Button>
</Link>

// Map marker URLs use clean paths (no onClick possible — raw HTML popups):
const url = `${basePath}/daycare/${id}-${slugify(name)}-${citySlug}`;
```

**Note on map markers:** Map popup "View Details" links are raw HTML strings rendered by Leaflet (see `LeafletMap.tsx` line 260+). We **cannot** attach React onClick handlers to them. These links will use clean URLs but won't store sessionStorage context. This is acceptable — when a user clicks through a map popup, the detail page will fall back to the server-computed city/county back href.

### Change 2: Update BackToResultsButton to read from sessionStorage

**File:** `components/BackToResultsButton.tsx`

**Before:**
```tsx
export default function BackToResultsButton({ fallbackHref, label, trackingContext = "unknown" }) {
  const router = useRouter();
  function handleClick() {
    trackUplinkClick({ linkType: "back_to_results", target: fallbackHref, context: trackingContext });
    router.push(fallbackHref);
  }
  // ...
}
```

**After:**
```tsx
export default function BackToResultsButton({ fallbackHref, label, trackingContext = "unknown" }) {
  const router = useRouter();
  const [resolvedHref, setResolvedHref] = useState(fallbackHref);
  const [resolvedContext, setResolvedContext] = useState(trackingContext);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("ohph_nav_context");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.returnTo && parsed.returnTo.startsWith("/") && !parsed.returnTo.startsWith("//")) {
          setResolvedHref(parsed.returnTo);
        }
        if (["state", "county", "city"].includes(parsed.context)) {
          setResolvedContext(parsed.context);
        }
      }
    } catch {}
  }, []);

  function handleClick() {
    trackUplinkClick({ linkType: "back_to_results", target: resolvedHref, context: resolvedContext });
    router.push(resolvedHref);
  }
  // ...button renders with resolvedHref
}
```

### Change 3: Simplify detail page server component

**File:** `app/daycare/[slug]/page.tsx`

**Before (lines 10–13):**
```tsx
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ context?: string | string[]; returnTo?: string | string[] }>;
};
```

**After:**
```tsx
type Props = {
  params: Promise<{ slug: string }>;
};
```

**Also remove (lines 448, 491–499):**
- `const query = await searchParams;`
- `const context = normalizeContext(firstQueryValue(query.context));`
- `const returnTo = sanitizeReturnToPath(firstQueryValue(query.returnTo));`
- `const backHref = returnTo || contextFallbackHref;`

**Replace with:**
```tsx
const contextFallbackHref = cityHref; // always default to city listing
const backHref = contextFallbackHref;
const context: "state" | "county" | "city" | "unknown" = "unknown";
```

The `uplinkContext` passed to shells/tracking will be `"unknown"` server-side; `BackToResultsButton` resolves the real context client-side from sessionStorage.

**Cleanup:** `firstQueryValue()`, `normalizeContext()`, `sanitizeReturnToPath()` functions can be removed since nothing calls them anymore.

### Change 5: Add 301 redirects for existing cached query-string URLs

**File:** `next.config.ts`

This is the most important change for recovery speed. Google has ~960 cached query-string URLs. Without a redirect, we rely on Google passively noticing that canonical tags now match clean URLs. With a 301, every re-crawl of an old URL actively consolidates it.

**Before:**
```ts
async redirects() {
  return [
    { source: "/:path*", has: [{ type: "host", value: "www.ohioparenthub.com" }], destination: "https://ohioparenthub.com/:path*", permanent: true },
  ];
}
```

**After:**
```ts
async redirects() {
  return [
    { source: "/:path*", has: [{ type: "host", value: "www.ohioparenthub.com" }], destination: "https://ohioparenthub.com/:path*", permanent: true },
    { source: "/daycare/:slug", has: [{ type: "query", key: "context" }], destination: "/daycare/:slug", permanent: true },
    { source: "/daycare/:slug", has: [{ type: "query", key: "returnTo" }], destination: "/daycare/:slug", permanent: true },
  ];
}
```

This is fully server-side — no client JS involved. When Google re-crawls those ~960 cached URLs, it gets a 301 to the clean URL.

### Change 6: No changes needed to these files

| File | Why no changes needed |
|---|---|
| `components/DaycareDetailPageShell.tsx` | Already receives `backHref` and `uplinkContext` as props — no query-param awareness. Props keep same types. |
| `components/TrackedUplinkLink.tsx` | Already receives `context` as a prop — unchanged. |
| `lib/trackUplink.ts` | Pure event helper — unchanged. |
| `components/CountyDaycaresPageClient.tsx` | Delegates to `CityDashboard` — no direct link building. |
| `components/DraftCityDaycaresPageClient.tsx` | Wrapper around `CityDashboard` — no direct link building. |
| `components/DraftDaycaresPageClient.tsx` | Wrapper around `GlobalDashboard` — no direct link building. |
| `app/sitemap.ts` | Already uses clean URLs. |
| `components/LeafletMap.tsx` | Already receives marker data including `url` — no change to this file; the `url` value passed in will be clean. |

## Files Changed (Summary)

| File | Change |
|---|---|
| `components/CityDashboard.tsx` | Remove `withListingContext()`, use clean hrefs, add `onClick` → `storeNavContext()` to `<Link>` elements |
| `components/GlobalDashboard.tsx` | Same as above |
| `components/BackToResultsButton.tsx` | Add `useState` + `useEffect` to read from sessionStorage, falling back to `fallbackHref` prop |
| `app/daycare/[slug]/page.tsx` | Remove `searchParams` from Props, remove query parsing, use static city fallback for `backHref`, remove unused helper functions |
| `next.config.ts` | Add 301 redirects to strip `context` and `returnTo` query params from `/daycare/:slug` URLs |

## What This Does NOT Change

- **City normalization redirects (51 "Page with redirect")** — These are working correctly. Misspelled city URLs 301-redirect to canonical cities. Google will clean these up naturally.
- **4,658 "Discovered - currently not indexed"** — Normal for a new site. Google is still processing. No action needed.
- **Sitemap** — Already emits clean canonical URLs. No change needed.
- **JSON-LD schema** — Already uses clean canonical URLs. No change needed.
- **Nearby/Similar cards** — Already use clean canonical URLs server-side. No change needed.
- **Browse links** on detail page — Already use clean canonical URLs. No change needed.

## UX Impact

- **No visible change** for users navigating normally. Back-to-results still works for the common flow (click listing → view detail → click back).
- **Map popup clicks:** Users clicking "View Details" from a map popup will land on the detail page with the default city fallback for back-navigation (instead of the exact listing context). This is a minor degradation — most users clicking a map popup are exploring, not following a strict browse flow.
- **Shared/bookmarked URLs:** Recipients of shared detail page URLs will see a clean URL and get the default city back-link. This is actually **better** than the current behavior (sharing `?context=county&returnTo=/daycares/county/butler` bakes in navigation state that doesn't belong in a shareable URL).
- **Analytics:** `trackUplinkClick` will still fire with context from sessionStorage. Map popup clicks that don't go through sessionStorage will report `"unknown"` context — same as the current fallback when no query params are present.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Back button shows wrong return path | Low — only if sessionStorage is unavailable or cleared | Low — falls back to city listing page (sensible default) | `fallbackHref` prop always provides a valid city/county path |
| Analytics tracking loses context | Low — only map popup clicks affected | Low — already has "unknown" fallback | No action needed |
| Google doesn't re-crawl quickly | Medium — depends on crawl schedule | Low — 301 redirects actively consolidate on every re-crawl | 301 redirects + canonical tags + clean sitemap — three signals pointing the same way |
| Breaking other code that reads searchParams | None — full codebase grep confirms only `app/daycare/[slug]/page.tsx` reads `context`/`returnTo` from searchParams | N/A | N/A |

## Verification Plan

### Before deploying:
1. Build locally (`npm run build`) — must pass
2. Run `npm run lint` — must pass
3. Start dev server, navigate city → detail → back — confirm back-to-results works
4. Start dev server, navigate county → detail → back — confirm back-to-results works
5. Start dev server, click map popup → detail — confirm page loads (back falls to city default)
6. View source on a city page — confirm no `?context=` in any rendered HTML

### After deploying:
1. Run `node scripts/gsc.mjs performance --dimension date --days 7` daily to watch impression recovery
2. Inspect 3–5 previously affected URLs via `node scripts/gsc.mjs inspect <url>` to confirm Google re-crawls with clean canonical
3. Monitor "Alternate page with proper canonical tag" count in GSC — should decrease over 2–4 weeks as Google re-crawls
4. Check that `uplink_click` events with `link_type: "back_to_results"` still fire in GA

### Rollback plan:
Revert the 5 files if impressions don't stabilize within 14 days. Given that this change aligns with what Google already expects (canonical tags point to clean URLs), and adds 301 redirects as the strongest consolidation signal, regression is unlikely.

## Estimated Scope

- 5 files modified
- 0 new files
- ~70 lines changed total
- No new dependencies
