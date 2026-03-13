# Design Memo: "For Providers" Conversion Landing Page

**Route:** `/for-providers`  
**Status:** On hold — waiting for UI tweaks to finalize before building  
**Goal:** High-conversion marketing page that sells daycare owners on claiming + upgrading their listing.

---

## Page Sections

### 1. Hero
- Headline: "Own a daycare? Make your listing work for you."
- Subtext emphasizing free visibility boost + premium features
- Primary CTA → `/daycares` ("Find Your Listing")

### 2. Before / After Comparison
- Side-by-side Standard vs Premium listing mockup cards (built in JSX, not screenshots)
- Standard card: plain text, no logo, no photos, no hours
- Premium card: logo, photo carousel, hours, pricing, amenities, verified badge, description
- Visual callouts highlighting each upgrade

### 3. Feature Grid
10 features in a responsive grid (icons + short descriptions):
1. Logo upload
2. Photo gallery (up to 5)
3. Hours of operation
4. Pricing / tuition info
5. Amenities list
6. Custom FAQs
7. Business description
8. Website link
9. Verified Provider badge
10. Appear in "Verified" filter results

### 4. How It Works
3-step process:
1. **Find** — Search for your daycare on Ohio Parent Hub
2. **Verify** — Confirm ownership via email verification
3. **Customize** — Add photos, hours, pricing, and more from your dashboard

### 5. Dashboard Preview
- Styled mockup of the owner dashboard (JSX, not a screenshot)
- Shows editor form, published listing preview, account management

### 6. Final CTA
- Full-width colored section
- "Find Your Listing" button → `/daycares`
- Reinforcement copy: "Join hundreds of Ohio providers already on the platform"

---

## Design Constraints

- **"Playful Retro"** design language — flat design, no gradients
- **Color palette:** teal `#7EA8A4`, dark `#4A6B67`, cream `#F5EDE4`, gold `#DCB346`, pink `#E8A0AC`, sage `#B8C5B2`, lightTeal `#D5E5E3`
- **Typography:** DM Serif Display (headings), Inter (body)
- **No pricing on this page** — revealed at Stripe checkout
- **CTA destination:** `/daycares` (user finds their listing, then clicks Claim)
- **Mockup cards in JSX** — no image maintenance burden, stays in sync with real UI

---

## Key Decisions

| Decision | Rationale |
|---|---|
| Route `/for-providers` | Clear, SEO-friendly, separates from parent-facing content |
| CTA → `/daycares` not `/auth/login` | User needs to find their listing first, then claim from the detail page |
| No pricing shown | Reduces friction; price revealed at Stripe checkout after claim |
| JSX mockups over screenshots | Zero maintenance, always matches current design |
| Server component | SEO-friendly, no client JS needed |

---

## Files to Create / Modify

| File | Action |
|---|---|
| `app/for-providers/page.tsx` | Create — full page with metadata + all 6 sections |
| `components/SiteHeader.tsx` | Modify — add "For Providers" nav link (desktop + mobile) |
| `components/SiteFooter.tsx` | Modify — add "For Providers" link |
| `app/sitemap.ts` | Modify — add `/for-providers` entry |

## Reference Files
- `app/page.tsx` — Hero, WaveDivider, SparkleDecor patterns
- `components/premium/VerifiedProviderBadge.tsx` — Reuse in before/after section
- `DESIGN.md` — Brand guidelines
- `.github/instructions/seo-safety.instructions.md` — SEO rules

---

## Verification Checklist
- [ ] Renders at `/for-providers`, fully responsive
- [ ] Header + footer links present and working
- [ ] Metadata: title, description, canonical, OG tags
- [ ] `npx next build` passes
- [ ] Matches final UI design language (build after UI tweaks are done)
