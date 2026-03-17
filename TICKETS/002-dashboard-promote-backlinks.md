# TICKET 002 — Dashboard Promote & Backlink Feature

**Status:** In Progress  
**Created:** 2026-03-16  

## Objective

Add a "Promote Your Listing" section to the premium provider dashboard with social sharing buttons, copy-URL, and a backlink badge/embed system to drive organic backlinks for SEO.

## Scope

### Phase 1: Dashboard Layout Restructure
1. Move "Manage Billing" button from Quick Actions grid **into** the Subscription card as an inline CTA
2. Quick Actions grid now only has: Edit Listing + View Public Page

### Phase 2: Promote Section UI
3. New full-width "Promote Your Listing" section between Quick Actions and Change Password (premium-only, gated behind `isActive`)
4. **Share buttons:**
   - **Facebook** — `https://www.facebook.com/sharer/sharer.php?u={url}` popup (OG tags handle preview)
   - **X (Twitter)** — `https://twitter.com/intent/tweet?url={url}&text={prefilled}` popup
   - **Native Share** — `navigator.share()` on mobile (covers Instagram, TikTok, WhatsApp, iMessage)
   - **Copy Link** — Clipboard API with "Copied!" visual feedback
5. **Listing URL display** — Styled read-only field: `ohioparenthub.com/daycare/{slug}` with copy button

### Phase 3: Backlink Badge & Embed
6. **Badge API route** — `app/badge/[programNumber]/route.tsx` returns branded SVG badge ("Find us on Ohio Parent Hub")
7. **Embed snippet section** — Copyable `<a><img></a>` HTML code block + "Get a free month" incentive callout
8. **Platform instructions** — Collapsible accordion: Wix, Squarespace, WordPress, Other
9. **Free month claim** — Email link (honor system for now, automated verification is a future ticket)

## Decisions

- **Premium subscribers only** — Promote section gated behind active subscription
- **Honor system** — Provider emails to claim free month after adding badge; no automated verification
- **No Instagram/TikTok buttons** — No web share API; covered by `navigator.share()` on mobile
- **Static OG image for now** — Dynamic per-listing OG images are a separate follow-up ticket
- **Badge is a dynamic SVG route** — Allows future per-listing customization

## Files

| File | Action |
|------|--------|
| `components/DashboardClient.tsx` | Move Manage Billing into Subscription card; add Promote section |
| `app/dashboard/page.tsx` | Pass `programNumber` prop to DashboardClient |
| `app/badge/[programNumber]/route.tsx` | **NEW** — SVG badge generation |
| `components/ui/accordion.tsx` | Reuse for platform instructions |

## Verification

1. `npm run build` passes
2. Share buttons: Facebook opens sharer, X opens with prefilled text, native share works on mobile, Copy Link copies URL
3. Badge renders at `/badge/{programNumber}`
4. Embed HTML works when pasted in a test file
5. Manage Billing appears inside Subscription card
6. Promote section hidden for non-subscribers
7. Responsive on mobile

## Follow-up Tickets

- [ ] Dynamic per-listing OG images (daycare name/photo in social preview)
- [ ] Automated backlink verification (crawler checks badge exists on provider's site)
- [ ] Stripe coupon auto-application for verified backlinks
