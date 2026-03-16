# TICKET-003: Split-Panel Map + Results Layout

**Status:** Ready to implement  
**Priority:** High  
**Type:** UI Overhaul  
**Risk:** Medium — changes core page layout, touches map sizing and scroll behavior  
**Blocked by:** TICKET-002 (Horizontal Filter Bar)  
**Blocks:** Map ↔ card hover interactions (future enhancement)

---

## Goal

Replace the stacked map-then-cards layout with a **split-panel** design: map on the left, scrollable results panel on the right (desktop). On mobile, use a **map/list toggle** so users pick their view mode. Eliminates scrolling past the map to discover results.

---

## Current State

```
Desktop (after Ticket 002):
┌──────────────────────────────────────────────┐
│ [Filter Chip Bar]                            │
├──────────────────────────────────────────────┤
│             MAP (full width)                 │
│             500px tall                       │
├──────────────────────────────────────────────┤
│ Card 1                                       │
│ Card 2                                       │
│ Card 3    ← must scroll past map to see      │
│ ...                                          │
└──────────────────────────────────────────────┘

Mobile:
┌──────────────────┐
│ [Filter chips →] │
├──────────────────┤
│    MAP           │
│    400px tall    │
├──────────────────┤
│ Card 1           │
│ Card 2           │ ← must scroll past map
│ ...              │
└──────────────────┘
```

## Target State

### Desktop (lg: 1024px+)

```
┌──────────────────────────────────────────────────────────┐
│ [Filter Chip Bar]                                        │
├───────────────────────────────┬──────────────────────────┤
│                               │ 43 Results in Map View   │
│                               │                          │
│           MAP                 │ ┌──────────────────────┐ │
│         (55% width)           │ │ Card 1               │ │
│                               │ └──────────────────────┘ │
│      fills viewport height    │ ┌──────────────────────┐ │
│      below filter bar         │ │ Card 2               │ │
│                               │ └──────────────────────┘ │
│                               │ ┌──────────────────────┐ │
│                               │ │ Card 3               │ │
│                               │ └──────────────────────┘ │
│                               │         ...              │
│                               │  (scrollable panel)      │
├───────────────────────────────┴──────────────────────────┤
│ [Footer]                                                 │
└──────────────────────────────────────────────────────────┘
```

**Key behaviors:**
- Map + results panel fill the viewport height below the filter bar (`calc(100vh - header - chipbar)`)
- Map is sticky/fixed — doesn't scroll with page
- Results panel scrolls independently
- Split ratio: ~55% map / 45% results (adjustable)

### Mobile (< lg)

```
┌──────────────────┐
│ [Filter chips →] │
├──────────────────┤
│                  │
│ Card 1           │  ← LIST VIEW (default)
│ Card 2           │
│ Card 3           │
│ ...              │
│                  │
│    [🗺 Map]      │  ← floating toggle button (bottom-right)
└──────────────────┘

        ↕ tap toggle

┌──────────────────┐
│ [Filter chips →] │
├──────────────────┤
│                  │
│                  │
│      MAP         │  ← MAP VIEW (full screen below chips)
│   (fills viewport)│
│                  │
│                  │
│    [📋 List]     │  ← floating toggle button (bottom-right)
└──────────────────┘
```

**Key behaviors:**
- Default to List view (results are what parents want first)
- Floating FAB-style toggle button: map icon when in list, list icon when in map
- Map fills available viewport when active
- Preserve scroll position when toggling back to list

---

## Implementation Plan

### Phase 3A: Desktop split-panel layout

**In GlobalDashboard + CityDashboard:**

1. Wrap map + results in a flex container:
   ```tsx
   <div className="hidden lg:flex" style={{ height: "calc(100vh - 160px)" }}>
     <div className="w-[55%] sticky top-0">
       <LeafletMap ... height="100%" />
     </div>
     <div className="w-[45%] overflow-y-auto border-l px-4 py-4 space-y-3">
       <h2>43 Results in Map View</h2>
       {cards...}
     </div>
   </div>
   ```

2. Map height changes from fixed `500px` to `100%` (fills panel)

3. Result cards need a **compact variant** for the narrower panel:
   - Single column layout (no side-by-side with View Details)
   - SUTQ badge inline with name instead of separate column
   - Tighter padding

4. LocationSearch moves into the filter chip bar or above it

5. Remove the old stacked layout on desktop (keep for mobile)

### Phase 3B: Mobile map/list toggle

1. Add state: `const [mobileView, setMobileView] = useState<"list" | "map">("list")`

2. Conditionally render map OR cards (not both):
   ```tsx
   <div className="lg:hidden">
     {mobileView === "map" ? (
       <div style={{ height: "calc(100vh - 160px)" }}>
         <LeafletMap ... height="100%" />
       </div>
     ) : (
       <div className="space-y-3">
         {cards...}
       </div>
     )}
     <button
       className="fixed bottom-6 right-6 z-40 rounded-full bg-primary text-white shadow-lg px-4 py-3"
       onClick={() => setMobileView(v => v === "list" ? "map" : "list")}
     >
       {mobileView === "list" ? "🗺 Map" : "📋 List"}
     </button>
   </div>
   ```

3. Preserve list scroll position in a ref when switching to map

4. Results count header stays visible in both modes

### Phase 3C: Card compact variant

Current card layout (wide):
```
[Logo] Name ···· [SUTQ badge]
       City • Street     [View Details]
       2.7mi  Type PFCC
```

Compact card layout (narrow panel):
```
[SUTQ] [Verified]
[Logo] Name
       City • Street
       2.7mi  Type
                    [View Details →]
```

- Reuse existing card JSX with responsive classes
- `lg:` classes switch to compact layout inside the results panel
- Or: extract a `<DaycareCard>` component with a `compact` prop

### Phase 3D: Map ↔ card interactions (optional, future)

- Hover card → highlight corresponding map pin (change icon color/size)
- Click map pin → scroll results panel to that card
- These are nice-to-have but not required for initial launch

---

## Height Calculation

```
Viewport height:          100vh
- Site header:            80px (h-20)
- Filter chip bar:        ~56px
- Padding/gaps:           ~24px
= Available panel height: calc(100vh - 160px)
```

On smaller desktop screens (1024–1280px), this gives ~500–600px of panel height — enough for 3-4 visible cards and a usable map.

---

## Mobile Toggle Button Design

```
Default (List mode):
┌─────────────────┐
│ 🗺  Map View    │  bg-primary text-white rounded-full shadow-xl
└─────────────────┘

Active (Map mode):
┌─────────────────┐
│ 📋  List View   │  bg-white text-primary border rounded-full shadow-xl
└─────────────────┘

Position: fixed bottom-6 right-6 z-40
```

---

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Map doesn't resize properly in flex container | LeafletMap already accepts `height` prop — pass `"100%"` with container having explicit height |
| Leaflet `invalidateSize()` needed after panel resize | Call `map.invalidateSize()` in a `useEffect` or ResizeObserver |
| Scroll position lost on mobile toggle | Store `scrollTop` in ref before switching, restore on return |
| Cards too cramped in 45% panel | Min-width on panel (360px), cards stack cleanly at narrow widths |
| Footer unreachable on desktop | Panel scrolls independently; footer sits below the split panel section |
| Session storage breaks | No state variable changes — same persistence layer |
| Filter chip bar width changes | Chip bar sits above split panel at full width — unaffected |
| SEO — content below fold | Cards are still SSR-rendered in DOM, just visually in a scroll panel |

---

## Files Changed

| File | Action |
|------|--------|
| `components/GlobalDashboard.tsx` | Split-panel layout, mobile toggle, compact cards |
| `components/CityDashboard.tsx` | Same changes |
| `components/LeafletMap.tsx` | Accept `height="100%"`, invalidateSize on container resize |
| `components/DaycareCard.tsx` | **NEW** (optional) — extracted card component with compact mode |

---

## Dependencies

- **TICKET-002 must be complete first** — The filter chip bar needs to be in place before changing the below-bar layout. Otherwise we're rebuilding sidebar + split panel simultaneously.

---

## NOT in Scope

- Drag-to-resize split panel (not worth the complexity)
- Map ↔ card hover interactions (future enhancement)
- Bottom sheet / half-sheet map on mobile (iOS Maps style — too complex for now)
- Infinite scroll or virtualized list (not needed at current data size)

---

## Acceptance Criteria

- [ ] Desktop: map and results panel side by side, filling viewport below filter bar
- [ ] Desktop: results panel scrolls independently, map stays in place
- [ ] Desktop: cards render in compact layout within the panel
- [ ] Mobile: default to List view showing cards
- [ ] Mobile: floating toggle button switches between Map and List
- [ ] Mobile: map fills viewport when in Map mode
- [ ] Mobile: scroll position preserved when toggling back to List
- [ ] Results count header visible in both views
- [ ] Map resizes correctly (no gray tiles, no misaligned markers)
- [ ] Filter chip bar unaffected (full width above split panel)
- [ ] Session storage persistence works
- [ ] Build passes with no errors
- [ ] No regressions on detail page navigation
