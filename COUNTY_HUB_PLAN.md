# County Hub Plan (MVP-First)

_Last updated: 2026-02-25_

## Objective
Build county hub pages as the middle layer in navigation and SEO architecture:

- Statewide discovery → County hub → City page → Daycare detail

This improves user navigation (especially near city boundaries), strengthens internal linking, and creates better destinations for thin-city pages.

---

## Why County Hubs

1. **Better user flow**
   - Users near city borders are not forced into a single city scope.
   - County provides a broader, intuitive local context.

2. **Better SEO architecture**
   - Creates strong intermediate pages with enough content and internal links.
   - Improves authority flow from daycare detail pages upward.

3. **Safer thin-page strategy**
   - Thin city pages can eventually redirect to county hubs (after pilot validation).

---

## Non-Goals (MVP)

- No immediate site-wide city redirect rollout.
- No complete content rewrite of all city pages in phase 1.
- No large design overhaul.

---

## Route & URL Structure

- County hub page route:
  - `/daycares/county/[county-slug]`

- Examples:
  - `/daycares/county/franklin`
  - `/daycares/county/cuyahoga`

---

## Data Requirements

Each daycare record should provide (or be mapped to):

- `countyName`
- `city`
- `programName`
- `programNumber`
- `sutqRating` (if available)

If county data quality has gaps:

- Add safe fallbacks for unknown county records
- Keep city/state links available so no dead ends occur

---

## County Hub Page MVP Content

1. **Header block**
   - H1: `Licensed Daycares in [County] County, Ohio`
   - Short intro paragraph (2–3 sentences)

2. **Summary stats**
   - Total licensed programs in county
   - Number of cities covered
   - Optional: count of SUTQ-rated programs

3. **Top cities section**
   - City links with daycare counts

4. **Program listing preview**
   - First N daycare links to detail pages
   - Keep page lightweight (can progressively enhance later)

5. **Upward/downward links**
   - Link to statewide daycares page
   - Link to city pages

---

## Internal Linking Changes (County-First)

1. **Daycare detail pages**
   - Add county link (`View all [County] County daycares`)
   - Keep city link (`View all [City] daycares`)
   - Keep context-aware back-to-results as primary CTA when available

2. **City pages**
   - Add county hub link near top content

3. **County pages**
   - Link to state daycares and city pages

4. **Sitemap**
   - Include county hub URLs

---

## Phased Rollout

## Phase 1 — Foundation (safe, no redirects)

- Create county route and page template
- Generate county slugs
- Add county pages to sitemap
- Add county links on detail/city templates

**Exit criteria:**
- Build passes
- County pages render and are crawlable
- No broken links

## Phase 2 — Context-aware uplinks

- Apply `returnTo/context` contract from `UPLINK_MATRIX.md`
- Ensure detail page primary CTA respects origin context

**Exit criteria:**
- State-origin visits return to state results
- County/city fallbacks display correctly

## Phase 3 — Pilot thin-city redirects

- Select small pilot set of thin city pages (e.g., 20–50)
- 301 redirect to matching county hub
- Monitor performance for 2–6 weeks

**Exit criteria:**
- No adverse traffic collapse on pilot URLs
- Improved engagement/navigation signals
- Stable indexation and crawl behavior

## Phase 4 — Scale decision

- Expand redirect strategy only if pilot metrics are positive
- Keep strong city pages live

---

## Pilot Scope Recommendation

- Start with 5–10 counties
- Include a mix of:
  - high-volume county
  - medium-volume county
  - low-volume county

This prevents overfitting to one market type.

---

## KPIs (2–8 week window)

1. **Search Console**
   - County page impressions
   - County page clicks
   - Average position for county queries

2. **Navigation behavior**
   - Uplink click distribution (state/county/city)
   - Back-navigation friction (proxy via return path usage)

3. **Index/crawl health**
   - County URL indexation rate
   - Crawl errors / 404s

4. **Engagement proxies**
   - Time on county page
   - Detail-page progression from county hubs

---

## Go / No-Go Thresholds

Proceed with broader rollout when:

- County pages get stable indexation
- No increase in 404s or crawl anomalies
- Uplink usage shows meaningful county/state returns
- Pilot redirect set does not materially harm traffic

Pause and adjust if:

- Indexation stalls
- Bounce/back friction worsens
- Redirected URLs lose visibility without county compensation

---

## Risks & Mitigations

1. **Risk: County data quality gaps**
   - Mitigation: strict fallback links and validation checks

2. **Risk: Over-redirecting city pages too early**
   - Mitigation: pilot-first rollout and measured expansion

3. **Risk: Added complexity without UX payoff**
   - Mitigation: instrument uplink click paths and review quickly

---

## Related Docs

- `UPLINK_MATRIX.md`
- `SEO_FULL_SITE_AUDIT_2026-02-22.md`

---

## Next Implementation Step

Implement **Phase 1 only**:

- county route/page template
- county links on detail + city pages
- sitemap inclusion

No redirects yet.
