# City Normalization Workflow (0.3)

Goal: fix misspellings/variants **without accidentally merging real distinct cities**.

## Safety Rules
- Never auto-apply city merges from fuzzy matching.
- Only apply aliases that are explicitly approved in `data/city-aliases.approved.json`.
- Keep known false matches in `data/city-aliases.blocked.json`.
- Treat report output as suggestions only.
- County logic uses overlap, not exact equality (multi-county values like `BUTLER|FRANKLIN|LICKING` are handled as overlap sets).
- Known shorthand tokens (currently `COL`, `CIN`) can map to canonical full city names when county overlap supports the match.

## Run the report

```bash
npm run city:normalize:report -- --date=YYYY-MM-DD
```

Output folder:
- `reports/city-normalization/YYYY-MM-DD/`

Generated files:
- `city-inventory.csv`: every raw city with counts/counties/slugs
- `slug-collisions.csv`: cities currently sharing a slug
- `city-alias-suggestions.csv`: primary review file (`city_in_question` -> `suggested_canonical_city`)
- `city-ambiguous-review.csv`: rows that need manual decision before any alias suggestion
- `city-candidate-review.csv`: detailed pairwise file (optional deep dive)
- `summary.json`: top-level metrics

## How to review safely
1. Start with `city-alias-suggestions.csv` (one-way format).
2. Review `high` confidence rows first.
3. Use `city-ambiguous-review.csv` only when needed.
4. Require county overlap before considering approval.
5. Reject any pair where both names are known valid Ohio cities.
6. Add unsafe lookalikes to `data/city-aliases.blocked.json`.
7. Add only confirmed mappings to `data/city-aliases.approved.json`.

## Approval checklist for each alias
- Is this clearly the same city spelling variant?
- Does county context support the merge?
- Will this create an unwanted slug collision?
- Is this pair absent from `blocked` list?

If any answer is uncertain, do not approve the alias.

## Current status
- Reporting workflow exists.
- No aliases applied yet.
- Next step is manual review + approved alias list population.
