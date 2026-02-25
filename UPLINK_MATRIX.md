# Uplink Matrix & County Hub Notes

_Last updated: 2026-02-25_

## Purpose
This document defines how "up" navigation should work from daycare detail pages so users are not forced into the wrong scope (for example, city-only when they came from statewide search).

It also captures a county-hub-first approach so implementation can be phased and measurable.

---

## Uplink Priority Matrix (v1)

| Entry context into daycare detail | Primary uplink (top CTA) | Secondary uplink | Tertiary uplink |
|---|---|---|---|
| Came from statewide search results | Back to statewide results (restore filters/map position) | View [County] County daycares | View [City] daycares |
| Came from county hub | Back to [County] County daycares | View [City] daycares | Explore all Ohio daycares |
| Came from city page | Back to [City] daycares | View [County] County daycares | Explore all Ohio daycares |
| Came from homepage/cities index | View [County] County daycares | View [City] daycares | Explore all Ohio daycares |
| Direct Google/social landing (no referrer context) | View [County] County daycares | View [City] daycares | Explore all Ohio daycares |
| County unknown in data | View [City] daycares | Explore all Ohio daycares | — |
| City unknown in data | View [County] County daycares | Explore all Ohio daycares | — |
| County + city both unknown | Explore all Ohio daycares | — | — |

---

## Decision Rules

1. Determine user context in this order:
   - explicit return params
   - session memory of last listing page
   - referrer heuristic
   - direct fallback
2. If the top destination is missing/invalid, promote the next available option.
3. Keep breadcrumbs SEO-structured (`Home → Daycares → County/City → Daycare`), but CTA behavior follows user context.
4. Never force statewide users into city-only as the primary return path.

---

## URL/State Contract (MVP)

Pass context when linking into daycare detail pages:

- `context=state|county|city`
- `returnTo=<encoded path + query>`

Behavior on detail page:

- Show **Back to results** only when `returnTo` is present and valid.
- Always show county/city fallback links if data exists.
- Restore prior query/filter/map state when returning to statewide results.

---

## UX Labels (Recommended)

- `Back to results`
- `View Franklin County daycares`
- `View Columbus daycares`
- `Explore all Ohio daycares`

---

## County Hub First Notes

### Why county first
- Gives a strong middle layer between statewide discovery and city/daycare pages.
- Reduces "city-boundary" friction for users near neighboring cities.
- Provides a better destination for thin-city redirects.

### Build order (phased)
1. Create county routes (`/daycares/county/[county-slug]`) with basic stats + listings.
2. Add county links from daycare detail pages and city pages.
3. Add context-aware uplink behavior on daycare detail pages.
4. Pilot redirects only for very thin city pages (small controlled set first).
5. Measure impact before full rollout.

### Suggested pilot KPIs (first 2–6 weeks)
- County page impressions and clicks in Search Console.
- Detail-page return-path usage (state vs county vs city uplink clicks).
- Thin-city bounce/back behavior.
- Crawl/index coverage for county pages.

---

## Guardrails

- Do not remove city pages globally on day one.
- Do not apply site-wide thin-city redirects until pilot data is positive.
- Keep county and city both available where useful; choose primary uplink by user context.
