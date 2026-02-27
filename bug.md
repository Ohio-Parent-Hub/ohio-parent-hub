# Bug Report

## Title
City filter on metro pages shows fewer results/markers than expected for some cities (example: Hilliard on Columbus Metro)

## Date Logged
2026-02-26

## Reported By
Tyler

## Summary
On the `Columbus Metro` city page, selecting city `Hilliard` in filters shows fewer total results and map markers than expected based on city-level totals.

## Reproduction Steps
1. Open `/daycares/columbus-metro`
2. In filters, set City = `Hilliard`
3. Compare:
   - Results count at top of page
   - Number of map markers
   - Hilliard total from city-level data/pages

## Actual Behavior
- Filtered count/markers on metro page are lower than expected for the city.
- Example discussed: expected ~53 (or full city total), but metro page shows ~50 range.

## Expected Behavior
- Filtering by city on a metro page should clearly match defined product behavior, and counts should not appear inconsistent.
- If scope is intentionally metro-bounded, UX should make that explicit.

## Current Findings / Notes
- Metro pages are currently built from metro polygon inclusion (`getDaycaresForMetroSlug`) rather than pure city-name matching.
- City filter is applied within the metro subset, not against all rows for that city globally.
- Rows without coordinates are excluded from polygon-based inclusion and therefore do not appear in metro-scope results/markers.

## Suspected Root Cause
Scope mismatch between:
- User expectation: "all rows for selected city"
- Current implementation: "rows inside selected metro polygon, then city-filtered"

## Impact
- User trust/confusion due to result-count inconsistency.
- Potential support burden and perceived data-quality issues.

## Proposed Next Steps
1. Product decision: define intended behavior for city filter on metro pages.
2. If intentional metro-bounded behavior, add clarifying copy in UI.
3. If city-complete behavior is desired, adjust filter/query logic to include non-coordinate city matches and document map/list differences.
4. Add regression test/QA checklist item for metro + city filtered counts.
