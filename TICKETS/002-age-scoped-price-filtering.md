# 002 — Age-Scoped Price Filtering

## Problem

When a parent sets a price filter (e.g. max $300/wk), the filter checks against the provider's **overall** price range across ALL age tiers. A provider might show up because their school-age tier is $175/wk, but the infant tier the parent actually needs is $325/wk — a false positive.

## Solution

Make the price filter automatically scope to the selected age bracket(s) when age groups are active.

### Data layer

1. **Add `priceTiers` to `PremiumFilterSummary`** — an array of `{ ageStart, ageEnd, minWeekly, maxWeekly }` per pricing tier. This keeps per-tier pricing available on the client without sending full `PremiumPricingTier` objects.
2. **Update `loadPremiumFilterSummaries()`** in `app/actions/premium.ts` — build `priceTiers[]` from the existing `pricing.tiers` data during the same loop that computes `priceRange`.

### Filtering logic (GlobalDashboard + CityDashboard)

When **both** age brackets and price filters are active:
- For each selected age bracket, find all `priceTiers` that overlap that bracket's range
- Check the user's min/max price against only those overlapping tiers' prices
- If no tiers overlap the bracket → provider doesn't match (already handled by age filter)

When **only** price is active (no age brackets selected):
- Fall back to `summary.priceRange` (current behavior — overall min/max)

### UI hint (PriceSlider)

- Pass `ageBrackets` into `PriceSlider` component
- When age brackets are selected, show: _"Pricing for: Infant, Toddler"_ below the inputs
- When no age brackets are selected, show: _"Select an age group for more accurate pricing"_
- Same hint appears in both PriceChip popover and MobileFilterSheet

## Files to modify

- `lib/premiumTypes.ts` — add `PremiumPriceTier` type and `priceTiers` field
- `app/actions/premium.ts` — build `priceTiers[]` in `loadPremiumFilterSummaries()`
- `components/GlobalDashboard.tsx` — age-scoped price filtering logic
- `components/CityDashboard.tsx` — same
- `components/FilterChipBar.tsx` — pass `ageBrackets` to `PriceSlider`, add hint text
