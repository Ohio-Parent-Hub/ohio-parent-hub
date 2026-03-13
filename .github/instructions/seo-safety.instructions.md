---
applyTo: "app/layout.tsx,app/sitemap.ts,app/robots.ts,app/**/page.tsx"
---

# SEO Safety Gate

These files control SEO-critical metadata (titles, descriptions, canonicals, sitemap entries, robots rules). Changes here directly affect search engine indexing and rankings.

Before modifying these files:

1. **Check with the SEO Director agent** (`@seo-director`) to validate the change won't cause SEO regressions
2. **Preserve**: title tags, meta descriptions, canonical links, H1 structure, JSON-LD schema, Open Graph tags
3. **Never** remove or empty a `generateMetadata` export without replacing it
4. **Never** add `noindex` or `nofollow` without explicit intent
5. **Keep URLs stable** — changing a slug pattern breaks existing indexed URLs and requires redirect mapping
6. **After deploying changes**, run `node scripts/gsc.mjs coverage` and `node scripts/gsc.mjs sitemaps` to verify no regressions
