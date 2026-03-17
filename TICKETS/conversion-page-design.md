# Design Memo: "For Providers" Conversion Landing Page

**Route:** `/for-providers`  
**Status:** Building  
**Goal:** High-conversion marketing page that sells daycare owners on claiming + upgrading their listing.

---

## Key Decisions

| Decision | Rationale |
|---|---|
| Route `/for-providers` | Clear, SEO-friendly, separates from parent-facing content |
| CTA → `/daycares` not `/auth/login` | User needs to find their listing first, then claim from the detail page |
| Soft pricing mention | "Low monthly fee · Cancel anytime" — no dollar amount, revealed at Stripe checkout |
| JSX mockups over screenshots | Zero maintenance, always matches current design |
| Client component | Live autocomplete search requires client interactivity |
| Live provider search | Autocomplete search on page using actual daycare data via API route |

## Design Constraints

- **"Playful Retro"** design language — flat design, no gradients
- **Color palette:** teal `#7EA8A4`, dark `#4A6B67`, cream `#F5EDE4`, gold `#DCB346`, pink `#E8A0AC`, sage `#B8C5B2`, lightTeal `#D5E5E3`
- **Typography:** DM Serif Display (headings), Inter (body)
- **Mockup cards in JSX** — reuse actual components (DaycareCard, PremiumOwnerDescription, etc.)
- **WaveDivider + SparkleDecor** — section transitions and ambient decoration matching homepage

---

## Page Sections (9 total)

### 1. Hero (light teal background)
- Headline: "Own a daycare? Make your listing work for you."
- Subtext: Pain point — parents want details (hours, photos, pricing) but most listings only show a name and address
- **Live autocomplete search** — provider types their daycare name, sees matching results, clicks to go to their detail page where they can claim
- SparkleDecor accents matching homepage style

### 2. Pain Point / Trust Statement (cream)
- "Parents choose providers they can trust"
- Stats: 5,000+ daycares in Ohio, parents check 3-5 listings before calling
- Verified badge = instant trust signal from the parent perspective

### 3. Before/After — Search Results Card (white)
- Side-by-side (desktop) / stacked (mobile) rendering of the actual `DaycareCard` component:
  - **Standard**: Plain card — no logo, no verified badge, white background
  - **Premium**: Card with logo, verified badge, teal accent background
- Callout labels pointing to specific upgrades (logo, badge, styling)

### 4. Before/After — Detail Page (cream)
- Condensed side-by-side mockup showing standard vs premium detail page
- **Standard**: Just name, address, phone, license info (basic state data)
- **Premium**: Logo, "From the Owner" description, photo gallery, hours, pricing, amenities, FAQs, website link
- Uses actual premium components with mock data

### 5. Feature Spotlights — Zoomed Elements (white)
Grid of highlighted feature cards, each with a mini JSX mockup:
1. **Verified Provider Badge** — renders actual `VerifiedProviderBadge` + tooltip explanation
2. **"From the Owner" Section** — renders `PremiumOwnerDescription` snippet
3. **Photo Gallery** — small mockup grid showing photo thumbnails
4. **Hours & Pricing** — renders `PremiumHoursTable` + `PremiumPricingTable` snippets
5. **Amenities Grid** — renders `PremiumAmenities` with sample checked items
6. **Premium Filters** — mockup of filter chips showing "Only verified providers appear in these results"
7. **Custom FAQs** — "Answer parents' questions before they even ask"
8. **Your Own Website** — "Use your listing URL on social media, email signatures, Google Business Profile"

### 6. Full Benefits Grid (cream)
12 feature cards in responsive grid (icon + title + short description):
1. Logo upload
2. Photo gallery (up to 6)
3. Hours of operation
4. Pricing / tuition info
5. Amenities & services list
6. Custom FAQs
7. "From the Owner" description
8. Website link
9. Verified Provider badge
10. Appear in premium filter results (price, age, amenities, schedule)
11. Use listing as your website URL
12. Feature input + updates as new features launch

### 7. How It Works (white)
3-step process with numbered circles:
1. **Find** — Search for your daycare on Ohio Parent Hub
2. **Claim** — Verify ownership with your email on file with the state
3. **Customize** — Add photos, hours, pricing, and more from your dashboard

### 8. Coming Soon / Community (light teal)
- "Shape the future of Ohio Parent Hub"
- Give input on requested features
- Get updates as new features launch
- "Proud member" badge widget for your own website (coming soon)
- Soft pricing: "Low monthly fee · Cancel anytime · Free to claim"

### 9. Final CTA (dark teal)
- "Ready to make your listing stand out?"
- "Find Your Listing" button → scrolls to hero search or links to `/daycares`
- Reinforcement: "Join Ohio providers already on the platform"

---

## Benefits List (complete — for copy reference)

1. Verified Provider badge (trust signal)
2. Premium search card (logo, badge, teal background)
3. Premium detail page (photos, hours, pricing, amenities, FAQs, description)
4. Show up in premium filters (price, age group, amenities, schedule)
5. "From the Owner" personal description
6. Custom FAQs — answer questions before parents even ask
7. Website link on listing
8. Photo gallery (up to 6 photos with lightbox)
9. Use listing URL as your website on social media, email signatures
10. Input on upcoming features
11. Feature updates as they launch
12. "Proud Member" promote widget (coming soon)
13. Stand out from 5,000+ Ohio daycares
14. Parents trust verified listings more (trust factor)
15. Hours of operation removes the #1 reason parents call before visiting
16. Pricing transparency — parents trust providers who share pricing up front

---

## Files to Create / Modify

| File | Action |
|---|---|
| `app/for-providers/page.tsx` | Create — full page with metadata + all 9 sections |
| `app/api/daycares/search/route.ts` | Create — API route for provider name search |
| `components/SiteHeader.tsx` | Modify — add "For Providers" nav link (desktop + mobile drawer) |
| `components/SiteFooter.tsx` | Modify — add "For Providers" link |
| `app/sitemap.ts` | Modify — add `/for-providers` entry |

## Reuse (not modify)
- `components/DaycareCard.tsx` — before/after search card mockup
- `components/premium/VerifiedProviderBadge.tsx` — feature spotlight
- `components/premium/PremiumOwnerDescription.tsx` — "From the Owner" mockup
- `components/premium/PremiumAmenities.tsx` — amenities grid mockup
- `components/premium/PremiumHoursTable.tsx` — hours table mockup
- `components/premium/PremiumPricingTable.tsx` — pricing table mockup
- `data/mockPremiumListing.ts` — mock data for all premium component mockups
- `app/page.tsx` — WaveDivider, SparkleDecor patterns, color palette

---

## Verification Checklist
- [ ] Renders at `/for-providers`, fully responsive
- [ ] Live search returns matching daycares and links to detail pages
- [ ] Header + footer "For Providers" links present and working
- [ ] Metadata: title, description, canonical, OG tags
- [ ] `npx next build` passes
- [ ] All mockup components render correctly with mock data
