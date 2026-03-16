# TICKET-002: Horizontal Filter Bar Refactor

**Status:** Phase 1 COMPLETE (commit `1348cf6`) · Phase 2 ready to implement  
**Priority:** High  
**Type:** UI Overhaul  
**Risk:** Medium — touches both dashboards, map rendering, session persistence  
**Blocked by:** Nothing  
**Blocks:** Nothing (Phase 2 is additive)

---

## Goal

Replace the desktop sidebar and mobile sheet-drawer filter UIs with a single **horizontal filter chip bar** above the map — identical on mobile and desktop. Follows Zillow/Airbnb/Google Maps patterns. The sidebar is removed entirely, giving the map full width.

---

## Current State

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Filter UI | 320px left sidebar (`<aside>`) | Left sheet drawer |
| Map width | ~calc(100% - 320px - 32px gap) | Full width |
| Filter trigger | Always visible in sidebar | "Filters" button → opens Sheet |
| Code location | `FilterContent` function (duplicated in both dashboards) | Same `FilterContent` inside Sheet |

**Files involved:**
- `components/GlobalDashboard.tsx` — FilterContent (lines 107–435), sidebar (line 888), Sheet (lines 933–963)
- `components/CityDashboard.tsx` — FilterContent (lines 102–291), sidebar (line 774), Sheet (lines 803–825)
- `data/filterDefinitions.ts` — FILTER_DEFINITIONS constants

---

## Target State

### Layout (both mobile & desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│ [🔍 Search...] [SUTQ ▾] [Verified] [PFCC] [Type ▾] [More ▾]   │ ← chip bar
│                                                                 │ ← horizontally scrollable on mobile
├─────────────────────────────────────────────────────────────────┤
│ 43 Results in Map View  ·  Showing near 43026  Clear location  │ ← results header
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      MAP (full width)                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Result cards...]                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Chip Breakdown

| Chip | Type | Behavior | Active Visual |
|------|------|----------|---------------|
| Search Name | Expanding text input | Click to expand, type to filter, X to clear | Shows typed text |
| SUTQ Rating | Multi-select dropdown (Popover) | Checkboxes: Gold, Silver, Bronze, Not Rated | Filled chip + count: `SUTQ (2)` |
| Owner Verified | Toggle chip | Single click on/off | Teal-tinted fill |
| PFCC | Toggle chip | Single click on/off | Blue-tinted fill |
| Program Type | Multi-select dropdown (Popover) | Checkboxes for 7 types | Filled chip + count: `Type (3)` |
| More Filters | Popover | City combobox, County combobox (Global only), Clear All | Badge dot when active |

### Chip Styling

```
Default:       bg-white border border-neutral-200 rounded-full px-3 py-1.5 text-sm
Hover:         border-neutral-400
Active:        bg-[color]/10 border-[color] text-[color] font-medium
Active colors: SUTQ=amber, Verified=teal, PFCC=blue, Type=slate, More=neutral
```

---

## Implementation Plan

### Phase 1A: Extract shared FilterChipBar component

**New file:** `components/FilterChipBar.tsx`

```typescript
interface FilterChipBarProps {
  // Search
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  // Toggles
  pfccEnabled: boolean;
  setPfccEnabled: (v: boolean) => void;
  verifiedEnabled: boolean;
  setVerifiedEnabled: (v: boolean) => void;
  // Multi-select
  selectedRatings: string[];
  toggleRating: (v: string) => void;
  selectedProgramTypes: string[];
  toggleProgramType: (v: string) => void;
  // Location (More Filters)
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  selectedCounty?: string;          // Global only
  setSelectedCounty?: (v: string) => void;  // Global only
  cities: string[];
  counties?: string[];              // Global only
  enableCityFilter?: boolean;       // City dashboard conditional
  // Actions
  onClearAll: () => void;
  // Map context
  mapCenter: [number, number] | null;
}
```

**Sub-components (all inside FilterChipBar.tsx):**

1. **`SearchChip`** — expandable input with magnifying glass icon
2. **`ToggleChip`** — for Verified, PFCC (simple on/off)
3. **`MultiSelectChip`** — for SUTQ, Program Type (Popover with checkboxes)
4. **`MoreFiltersChip`** — Popover with City/County comboboxes + Clear All

### Phase 1B: Replace sidebar + Sheet in GlobalDashboard

1. Remove `<aside>` sidebar block (lines 888–915)
2. Remove Sheet/SheetTrigger mobile drawer (lines 933–963)
3. Remove the old `FilterContent` function definition (lines 107–435)
4. Add `<FilterChipBar>` above the results header
5. Change outer layout from `flex-row` with sidebar to single column
6. Update `id="daycare-dashboard"` placement
7. Keep LocationSearch where it is (above results header, desktop only)
8. Verify session storage persistence still works (same state variables)
9. Verify web worker filtering still works (no state variable name changes)

### Phase 1C: Replace sidebar + Sheet in CityDashboard

1. Same removals as GlobalDashboard (sidebar, Sheet, FilterContent)
2. Add `<FilterChipBar>` (without county props)
3. Same layout changes
4. Verify `useMemo` inline filtering still works

### Phase 1D: Cleanup

1. Delete old `FilterContent` from both files (now in FilterChipBar)
2. Move duplicated constants (RATINGS, PROGRAM_TYPES) to `data/filterDefinitions.ts` if not already there
3. Update any scroll targets or IDs affected

---

## Existing UI Components Available (shadcn/ui)

| Component | Available | Used For |
|-----------|-----------|----------|
| Popover + PopoverTrigger + PopoverContent | ✅ | Dropdown chips |
| Checkbox | ✅ | Multi-select options |
| Command + CommandInput + CommandList | ✅ | City/county combobox |
| Badge | ✅ | Active filter counts |
| Button | ✅ | Chip base |
| Input | ✅ | Search chip |
| Label | ✅ | Checkbox labels |
| Sheet (to be removed) | ✅ | Currently used, will remove |

No new shadcn components needed.

---

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Map re-renders on filter change | No change — filter state flows the same way to LeafletMap |
| Session storage breaks | State variable names unchanged — same keys, same persistence |
| Web worker filtering breaks | Worker receives same payload shape — no change needed |
| Mobile chip bar overflow | `overflow-x-auto` with `scrollbar-hide` utility |
| Popover positioning on mobile | shadcn Popover uses Radix which handles viewport collision |
| Losing "Clear Filters" | Moved into "More Filters" popover + shown inline when active |
| Detail page back-navigation context | `storeNavContext` unchanged — return URLs still work |
| City dashboard missing county | Optional props with `?` — county chips only render when props provided |

---

## Files Changed

| File | Action |
|------|--------|
| `components/FilterChipBar.tsx` | **NEW** — shared horizontal filter bar |
| `components/GlobalDashboard.tsx` | Remove FilterContent, sidebar, Sheet; add FilterChipBar |
| `components/CityDashboard.tsx` | Remove FilterContent, sidebar, Sheet; add FilterChipBar |
| `data/filterDefinitions.ts` | Add RATINGS + PROGRAM_TYPES constants if missing |

---

## NOT in Scope

- Filter URL serialization (query params for shareable filtered views)
- Analytics tracking on filter usage

---

## Acceptance Criteria (Phase 1) ✅ COMPLETE

- [x] Horizontal chip bar renders identically on mobile and desktop
- [x] All 7 existing filters work: search, SUTQ, verified, PFCC, program type, city, county
- [x] Active filters show visual feedback (tinted chip, count badge)
- [x] Mobile bar scrolls horizontally without page scroll interference
- [x] Map gets full width on desktop (no sidebar)
- [x] Session storage persistence works across page loads
- [x] Web worker filtering (GlobalDashboard) still functions
- [x] Inline memo filtering (CityDashboard) still functions
- [x] Clear All resets everything including map view
- [x] LocationSearch still works above the chip bar
- [x] Build passes with no errors
- [x] No regressions on daycare detail page back-navigation

---

## Phase 2: Premium Data Filters

### Goal

Add 5 new filter chips that leverage premium listing data (hours, pricing, amenities, photos). When **any** premium filter is active, non-verified providers are **hidden** from results (not shown as "unknown").

### Data Strategy

**New server action:** `loadPremiumFilterSummaries()` in `app/actions/premium.ts`

Returns `Record<string, PremiumFilterSummary>` (keyed by program_number):

```typescript
type PremiumFilterSummary = {
  ageRange: [number, number] | null;     // [min_months, max_months] across all tiers
  priceRange: [number, number] | null;   // [min_rate, max_rate] normalized to weekly
  pricePeriod: "weekly" | "daily" | "monthly"; // original period for display
  amenities: string[];                    // checked amenity codes
  hasPhotos: boolean;
};
```

One additional Supabase query at page load — selects `program_number, hours, pricing, amenities, photos` for published listings. Summary computed server-side to keep client payload small (~50–100 bytes per verified provider).

### Updated Chip Bar Layout

```
[🔍 Search] [✓ Owner Verified] [Rating ▾] [PFCC] [Type ▾] [Age ▾] [Price ▾] [Schedule ▾] [Amenities ▾] [📷 Photos] [⚙ More]
```

11 chips total — consistent with Airbnb/Zillow patterns, scrollable on mobile.

### New Chip Breakdown

| Chip | Type | Popover Contents | Matching Logic |
|------|------|------------------|----------------|
| **Age Group** | Bracket selector | 4 buttons: Infant (0–12mo), Toddler (1–3yr), Preschool (3–5yr), School-age (5–12yr) | Provider's `ageRange` overlaps selected bracket |
| **Price** | Frequency picker + brackets | Pill toggle: Daily \| Weekly \| Monthly → preset bracket buttons ($150, $200, $250, $300, $400+) with optional "Custom" text input | User selects frequency + max amount. Normalized to weekly behind the scenes (daily ×5, monthly ÷4.33). Provider's cheapest tier ≤ selected max |
| **Schedule** | Multi-select (7 toggles) | Before-School Care, After-School Care, Weekend Hours, Evening Care, Drop-In Care, Overnight Care, Summer Care | Uses actual amenity codes (`before_school_care`, `after_school_care`, `weekend_hours`, `evening_care`, `drop_in_care`, `overnight_care`, `summer_care`). Provider must have ALL selected codes |
| **Amenities** | Multi-select grouped | 5 collapsible sections with checkboxes — see amenity breakdown below | Provider must have ALL selected amenity codes |
| **Photos** | Toggle chip | Simple on/off (like PFCC) | Provider has `hasPhotos === true` |

### Schedule Chip — Uses Amenity Codes Directly

The Schedule chip reads from the provider's `amenities.checked[]` array, not derived from hours data. These 7 amenity codes already exist in the data model:

| Code | Label in Chip |
|------|---------------|
| `before_school_care` | Before-School Care |
| `after_school_care` | After-School Care |
| `weekend_hours` | Weekend Hours |
| `evening_care` | Evening Care |
| `drop_in_care` | Drop-In Care |
| `overnight_care` | Overnight Care |
| `summer_care` | Summer Care |

### Amenities Chip — Grouped Sections (22 non-schedule codes)

| Section | Amenity Codes |
|---------|---------------|
| **Daily Essentials** (4) | `diapers_provided`, `wipes_provided`, `crib_sheets_provided`, `car_seat_storage` |
| **Meals & Feeding** (6) | `breakfast`, `lunch`, `morning_snack`, `afternoon_snack`, `baby_food_provided`, `formula_provided` |
| **Facilities & Safety** (5) | `outdoor_playground`, `fenced_playground`, `indoor_play_area`, `security_cameras`, `keypad_entry` |
| **Communication** (2) | `parent_communication_app`, `live_parent_camera` |
| **Programs & Learning** (5) | `structured_curriculum`, `stem_activities`, `arts_and_crafts`, `music_and_movement`, `field_trips` |

Sections are collapsible inside the popover. Separate from the Schedule chip to avoid a single overwhelming list.

### Price Chip — UX Detail

```
┌─────────────────────────────────┐
│  [Daily] [Weekly] [Monthly]     │  ← pill switcher
│                                 │
│  Max price:                     │
│  [$150] [$200] [$250] [$300]    │  ← bracket buttons
│  [$400+] [Custom: $___]        │
│                                 │
│  Clear                          │
└─────────────────────────────────┘
```

- User picks frequency, then picks a max price bracket
- Behind the scenes: all prices normalized to weekly (daily ×5, monthly ÷4.33)
- Bracket buttons are mobile-friendly (no fiddly slider)
- "Custom" reveals a text input for specific max amount
- Chip label when active: `≤ $250/wk` (always shows normalized weekly)

### Implementation Steps

#### Phase 2A: Data Layer (blocks all filter UI)

1. Add `PremiumFilterSummary` type to `lib/premiumTypes.ts`
2. Add `loadPremiumFilterSummaries()` server action in `app/actions/premium.ts`:
   - Query `premium_listings` where `published = true`
   - Select `program_number, pricing, amenities, photos`
   - Compute summary server-side: extract age range, normalize price to weekly, collect amenity codes, check photos array length
3. Pass `premiumSummaries` through the prop chain:
   - **Pages:** `app/daycares/page.tsx`, `app/daycares/[city]/page.tsx`, `app/daycares/county/[county]/page.tsx`
   - **Client wrappers:** `DraftDaycaresPageClient.tsx`, `DraftCityDaycaresPageClient.tsx`, `CountyDaycaresPageClient.tsx`
   - **Dashboards:** `GlobalDashboard.tsx`, `CityDashboard.tsx`
   - **FilterChipBar:** new `premiumSummaries` prop

#### Phase 2B: Filter State + Logic

4. Add filter state to both dashboards:
   ```typescript
   const [ageBracket, setAgeBracket] = useState<string | null>(null);           // "infant"|"toddler"|"preschool"|"school-age"
   const [maxWeeklyPrice, setMaxWeeklyPrice] = useState<number | null>(null);
   const [pricePeriod, setPricePeriod] = useState<"daily"|"weekly"|"monthly">("weekly");
   const [scheduleFilters, setScheduleFilters] = useState<string[]>([]);        // amenity codes
   const [amenityFilters, setAmenityFilters] = useState<string[]>([]);          // amenity codes
   const [hasPhotosFilter, setHasPhotosFilter] = useState(false);
   ```
5. Add premium filtering logic:
   - If NO premium filter active → show all providers as before
   - If ANY premium filter active → hide providers NOT in `premiumSummaries`
   - For providers IN `premiumSummaries`: check each active filter against summary fields
   - GlobalDashboard: filter post-worker (simplest — avoids changing worker payload)
   - CityDashboard: add to `useMemo` inline filter

#### Phase 2C: Chip UI (parallel with 2B)

6. **AgeGroupChip** — Popover with 4 bracket buttons, single-select
7. **PriceChip** — Popover with frequency pill toggle + bracket buttons + custom input
8. **ScheduleChip** — MultiSelectChip variant with 7 schedule amenity codes
9. **AmenitiesChip** — Popover with 5 collapsible grouped sections of checkboxes
10. **HasPhotosChip** — ToggleChip (reuse existing component)

#### Phase 2D: Integration

11. Insert new chips into FilterChipBar render order (after Type, before More)
12. Update `onClearAll` to reset all premium filter state
13. Add per-filter "Clear" CTA in each premium chip popover
14. Build & test

### Age Bracket Definitions

| Bracket | Label | Month Range |
|---------|-------|-------------|
| `infant` | Infant | 0–12 months |
| `toddler` | Toddler | 12–36 months |
| `preschool` | Preschool | 36–60 months |
| `school-age` | School-age | 60–144 months |

Matching: provider's `ageRange` overlaps bracket (not exact match). A provider with `[1.5, 60]` matches Infant, Toddler, and Preschool.

### Files Changed (Phase 2)

| File | Action |
|------|--------|
| `lib/premiumTypes.ts` | Add `PremiumFilterSummary` type |
| `app/actions/premium.ts` | Add `loadPremiumFilterSummaries()` server action |
| `app/daycares/page.tsx` | Call new action, pass `premiumSummaries` to client wrapper |
| `app/daycares/[city]/page.tsx` | Same |
| `app/daycares/county/[county]/page.tsx` | Same |
| `components/DraftDaycaresPageClient.tsx` | Accept + forward `premiumSummaries` prop |
| `components/DraftCityDaycaresPageClient.tsx` | Same |
| `components/CountyDaycaresPageClient.tsx` | Same |
| `components/GlobalDashboard.tsx` | New filter state, premium filtering logic, pass to FilterChipBar |
| `components/CityDashboard.tsx` | Same |
| `components/FilterChipBar.tsx` | 5 new chip sub-components (AgeGroupChip, PriceChip, ScheduleChip, AmenitiesChip, HasPhotosChip) |

### Risk Mitigations (Phase 2)

| Risk | Mitigation |
|------|------------|
| Premium filters hide most results | Clear warning: "Showing only verified providers" when premium filter active |
| Price normalization inaccuracy | Round to nearest dollar; show "≈" prefix for converted amounts |
| Amenities popover too tall on mobile | Collapsible sections, max-height with scroll |
| Too many chips for mobile | Already handled — `overflow-x-auto scrollbar-hide` from Phase 1 |
| Extra Supabase query slows page load | Single query, small payload (~100 bytes per verified provider) |
| No verified providers have data yet | Chips still render but produce 0 results — same as any strict filter |

### Acceptance Criteria (Phase 2)

- [ ] 5 new chips render in filter bar: Age, Price, Schedule, Amenities, Photos
- [ ] With no premium filters active, dashboard behaves identically to Phase 1
- [ ] Activating any premium filter hides all non-verified providers
- [ ] Age bracket filter correctly matches overlapping provider age ranges
- [ ] Price filter normalizes across daily/weekly/monthly frequencies
- [ ] Schedule filter uses actual amenity codes (not derived from hours)
- [ ] Amenities chip shows grouped collapsible sections
- [ ] Each premium chip has per-filter "Clear" CTA
- [ ] "Clear All" resets all filters including premium
- [ ] Mobile chip bar still scrolls cleanly with 11 chips
- [ ] Build passes with no errors
- [ ] No regression on existing Phase 1 filters
