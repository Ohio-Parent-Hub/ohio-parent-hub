# Ticket 004 — Legal Compliance (Privacy, Terms, Cookies)

**Status:** In Progress  
**Priority:** High  
**Created:** 2026-03-16

## Problem

Site has monetized (Stripe subscriptions), added auth (Supabase), and uses analytics (GA4) but is missing critical legal pages and compliance mechanisms:

- Privacy policy doesn't mention accounts, payments, or uploaded content
- No Terms of Service page (Stripe requires this for card network compliance)
- No cookie consent banner (GA4 loads unconditionally)
- No terms acceptance statement in the provider claim flow

## Plan

### Phase 1: Create Terms of Service (`app/terms/page.tsx`)
- Acceptance of terms, service description, accounts & registration
- Subscription & payment (Stripe, cancel anytime, no partial refunds)
- Provider content responsibilities, acceptable use
- Data accuracy disclaimer (state-sourced, as-is)
- Limitation of liability, disclaimer of warranties
- Governing law (Ohio), changes to terms, contact
- Add canonical `/terms`, metadata

### Phase 2: Update Privacy Policy (`app/privacy/page.tsx`)
- Add Supabase Auth section (accounts, session cookies)
- Add Stripe section (payment processing, customer ID)
- Add provider-uploaded content section (photos, logos in Supabase Storage)
- Add provider profile data section
- Update cookies section (Supabase auth cookies as strictly necessary)
- Add data retention & deletion info
- Update stats cards (currently say "No Accounts" — outdated)
- Update "last updated" date

### Phase 3: Footer & Sitemap
- Add Terms link to SiteFooter nav
- Add `/terms` to sitemap.ts

### Phase 4: Provider Terms Acceptance Statement
- Add "By creating an account, you agree to our Terms of Service and Privacy Policy" text with links near the claim submit button in `ClaimListingDialog.tsx`
- No checkbox needed — sign-in wrap is legally sufficient

### Phase 5: Cookie Consent Banner
- Create `components/CookieConsent.tsx` (bottom banner)
- Two options: "Accept All" / "Necessary Only"
- If rejected: don't load GA4 script
- Store preference in localStorage
- Modify `app/layout.tsx` to conditionally load GA4 via client component

## Files Changed
- `app/terms/page.tsx` — New
- `app/privacy/page.tsx` — Updated
- `components/SiteFooter.tsx` — Add Terms link
- `app/sitemap.ts` — Add /terms
- `components/premium/ClaimListingDialog.tsx` — Add terms statement
- `components/CookieConsent.tsx` — New
- `app/layout.tsx` — Conditional GA4 loading

## No Supabase Changes Required
- No new tables or columns needed
- Terms acceptance via "sign-in wrap" pattern (visible statement + links, no stored timestamp)
