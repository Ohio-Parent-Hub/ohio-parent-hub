## 0.3 Apply Impact Summary (2026-02-25)

### Scope Applied
- Approved aliases from `data/city-aliases.approved.json` are now used by shared canonical city resolution in runtime paths.
- Canonical behavior is applied to city routes, daycare detail slugs, sitemap city/detail URLs, API city filtering, and dashboard-generated links.
- Alias city slugs are redirected to canonical city slugs on city route pages.

### City Canonicalization Metrics
- Raw unique city values: 829
- Canonical unique city values: 733
- Net city variants collapsed: 96
- Alias entries configured: 95
- Raw city values canonicalized by alias/rules: 88

### Collision / Consistency Notes
- Raw city-slug duplicate count: 23
- Canonical city-slug duplicate count: 97
- Increase in canonical slug duplicates is expected and desired: multiple legacy variants now intentionally resolve to single canonical city slugs.
- Cincinnati cleanup verification: no remaining unmapped `CINC*` / `CLNC*` variants.

### Final Check
- Runtime build/lint validation completed successfully during apply work.
