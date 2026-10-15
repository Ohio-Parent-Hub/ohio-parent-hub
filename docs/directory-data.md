# Directory data refresh

The deployed directory is `data/daycares.json`. Refreshes are explicit, offline and reviewable. Dev, production builds and CI validate the checked-in file; they never regenerate it. No refresh command connects to Supabase or Stripe. Provider-owned descriptions, photos, jobs, account ownership and billing remain in Supabase and join by the unchanged string `PROGRAM NUMBER`.

## Inputs and preservation rules

| Input | Role |
| --- | --- |
| `data/ohio_daycares.csv` | Authoritative state export, including raw names, cities, addresses and contact/licensing fields |
| `data/daycare-geocoding.json` | Saved coordinate pairs keyed by program number, each tied to a SHA256 of its exact source street/city/state/ZIP |
| `data/directory-additions.json` | Explicit non-CSV records with a reason, full record and any coordinates/test marker |
| `data/city-aliases.approved.json` / `data/city-aliases.blocked.json` | Existing human-reviewed city governance; refreshes never edit or infer aliases |

OPH-7 reconciled **8,074 CSV programs + 2 hidden internal test fixtures = 8,076 records**, with **7,639 source coordinate pairs + 2 fixture pairs = 7,641**. Both additions retain the string `_test: "true"`, which the existing application uses to hide them publicly. The initial coordinate cache and additions were extracted from the published JSON without changing it. The new inputs reproduce the original file byte-for-byte. The cache intentionally repeats the coordinates in the generated JSON so they cannot disappear silently when the file is regenerated.

The parser uses `csv-parse/sync` with BOM, CRLF, quoted commas, escaped quotes and multiline-cell support. It trims headers/cells as the previous builder did. It rejects malformed quotes/column counts, changed/duplicate headers, missing/duplicate/non-digit program numbers, empty essential identity/location fields, non-OH records, invalid coordinate pairs, unsupported addition fields and source/addition collisions. Optional empty contacts/administrator/license-end fields remain allowed. There is no silent row rejection or numeric conversion of IDs/ZIPs. A format/schema change requires an explicit reviewed update to the preservation rules.

Source field values stay raw. The existing `lib/metroAreas.ts` resolver still applies approved city aliases, directional/township shorthand and canonical city slugs at runtime. `lib/utils.ts` still controls slugging, test-record filtering and display title casing. County values (including multi-county values) and phone/email values are not rewritten. Fuzzy suggestions from the city report remain suggestions only. See [city normalization governance](../CITY_NORMALIZATION_WORKFLOW.md).

A changed street/city/state/ZIP invalidates the old coordinate pair for that ID. The candidate omits the stale pair and the report lists the program under `invalidatedCoordinates` and `needsGeocoding`; it never attaches a previous location to a moved provider. Other source updates retain coordinates. Removed programs appear in the report; their unused cache entries remain available for review without reintroducing them into the directory. If an addition appears in a later state export, reconcile its addition entry explicitly; collisions fail rather than silently choosing one record.

## Stage, review, apply

1. Work on a branch. Replace the state CSV only with the intended export, preserving the current JSON for comparison. Inspect unexpected schema changes instead of renaming fields to force acceptance.
2. Run `npm run data:refresh`. This writes **only** `.directory-refresh/candidate.json` and `report.json`; it also prints a report SHA256. The ignored folder contains unpublished review artifacts. Running `node scripts/buildDaycaresJson.mjs` directly has the same safe staging behavior.
3. Review counts, `added`, `removed`, `changed` field names, ordering, coordinate totals, `invalidatedCoordinates`, `needsGeocoding` and unused cache entries. Inspect candidate records against the original source. `urlReviewRequired` flags name/city changes conservatively: verify actual detail/canonical city URLs with the shared runtime resolver. Review county membership changes and any removed claimed/premium program against the intended Supabase environment read-only before publication; this pipeline cannot establish whether a source deletion is legitimate or whether an account references it. Preserve stable IDs and prepare redirects separately for intentional URL changes.
4. If more geocoding is needed, follow the optional workflow below, then stage again and review the new report. Never let a geocoding job silently publish its result.
5. Apply the exact reviewed report using the command printed by staging:

   ```bash
   npm run data:apply -- --report-sha256=<SHA256 printed by staging>
   ```

   Apply checks that the report, candidate and all recorded input bytes still match, then atomically replaces `data/daycares.json`. CSV/cache/addition edits, alias/runtime normalization edits, changed generation logic, or modified staged artifacts require a fresh stage/review. The hash ties acceptance to an exact report; it is not an independent human approval or a substitute for PR review. Apply does not commit, push, deploy or modify any database.
6. Run `npm run data:validate`, `npm run test:unit` and the normal regression/release checks in [TESTING.md](../TESTING.md). The full-data regression records the initial reviewed counts and hidden fixture IDs; update those expectations only for a deliberate, reconciled data refresh. Review the Git diff, including source/cache/additions and generated JSON, in a PR before merging. Keep prior inputs and generated data together for rollback.

`npm run data:validate` independently rebuilds from the CSV/cache/additions **in memory** and requires exact generated bytes to match the checked-in JSON. It catches stale or accidentally stripped generated data and makes no writes or network requests. It runs before `npm run dev`, before `npm run build`, and in `npm run verify` (the required Regression suite). Determinism covers identical input bytes; CSV order is deliberately preserved and reported when changed, since it can affect list ordering. Supabase contents do not affect generation.

## Optional geocoding

`npm run data:geocode` explicitly sends missing/invalidated source addresses in Census batches of up to 1,000, using the existing `Public_AR_Current` benchmark and a two-second pause between batches. This network command is **never** run by dev/build/CI/refresh/validation. It derives pending addresses from the current source inputs, not a potentially stale published JSON. Existing valid pairs and intentional additions are retained.

The command writes `.directory-refresh/geocoding-candidate.json`, never the authoritative cache or published JSON. Requests properly escape quotes, commas and line breaks. Complete batch responses are parsed before accepting matches; unknown/duplicate/missing IDs and malformed coordinates fail rather than disappearing silently. Variable-width Census `No_Match` rows are allowed. `Match`/`Tie` results preserve the previous script's acceptance rules; review tie locations carefully. Valid completed batches remain in the candidate if a later batch fails; rerunning starts from the authoritative cache, so review/save useful candidates first.

Review the coordinate candidate and its addresses against the source, then explicitly replace `data/daycare-geocoding.json` with the reviewed cache. Run `data:refresh` again to inspect the resulting directory diff and coordinate totals before applying. The geocoder was verified with offline Census request/response fixtures for OPH-7; no live geocoding refresh was performed. Coordinate validity checks do not prove an address match is geographically correct.

## Failure and recovery

Parsing/validation failures exit nonzero and never overwrite published data. Older stage artifacts may still exist after a failed stage; apply recomputes current inputs and rejects a stale report. Correct the input and stage again. A failed build is not permission to auto-regenerate or drop troublesome rows.

A bad refresh must be corrected or reverted with its CSV/cache/additions/generated JSON together through a reviewed PR. Reverting application data does not undo provider account or billing changes; refresh commands make none. Keep new/changed geocodes and city aliases reviewable as their own input diffs.
