# PRD: Daycare Claim & Premium Listing Monetization

> **Status:** Draft  
> **Created:** 2026-03-11  
> **Last Updated:** 2026-03-11

## TL;DR

Daycare owners can claim their listing by verifying their email against state data, then pay a monthly Stripe subscription to unlock a premium profile with photos, hours, pricing, FAQs, and amenities. Built on Supabase (Postgres + Auth + Storage) deployed on Vercel.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Database + Auth** | Supabase | Postgres + Auth + File Storage bundled. Generous free tier. First-class Vercel integration. Row-level security for multi-tenant data. |
| **Payments** | Stripe | Most mature. Checkout Sessions for payment, Customer Portal for self-service, Webhooks for subscription lifecycle. |
| **Hosting** | Vercel | Already planned. Supabase + Stripe webhooks work seamlessly on Vercel. |
| **Pricing** | Single tier | One monthly price unlocks all premium features. Simplest to launch. |
| **File storage** | Supabase Storage | Photos uploaded by owners stored in Supabase Storage buckets with RLS policies. |
| **Photo constraints** | Compress + cap | Client-side resize to max 1920×1080, compress to ≤500 KB WebP. Server-side hard cap: 2 MB/file, 10 photos/listing, `image/jpeg`, `image/png`, `image/webp` only. At 500 KB avg × 10 photos × 100 subscribers = ~500 MB, well within Supabase free tier (1 GB storage, 2 GB bandwidth/mo). Pro tier ($25/mo, 100 GB) easily funded by subscription revenue when needed. |
| **Grace period** | Keep premium during `past_due` | Treat `past_due` the same as `active` — premium content stays visible while Stripe retries (up to ~3 weeks). Only hide on `customer.subscription.deleted` (all retries exhausted). Owner-friendly, reduces churn from temporary card issues. |
| **Data merge strategy** | Overlay model | State CSV data remains the source of truth for base fields. Premium data (photos, hours, amenities) lives in Supabase and is merged at render time. Base data refreshes from CSV never overwrite premium data. |

---

## Phase 1: Foundation (Database, Auth, Environment)

### Step 1.1 — Supabase project setup
- Create Supabase project, obtain API keys
- Add `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Add Vercel environment variables for production
- Install `@supabase/supabase-js` and `@supabase/ssr`

### Step 1.2 — Database schema
Create tables via Supabase migrations:

**`profiles` table** (daycare owner accounts)
- `id` UUID (FK to auth.users)
- `email` TEXT NOT NULL
- `display_name` TEXT
- `program_number` TEXT UNIQUE NOT NULL (links to daycare)
- `claim_status` ENUM ('pending', 'verified', 'rejected')
- `claim_method` ENUM ('email_match', 'manual_review')
- `stripe_customer_id` TEXT
- `subscription_status` ENUM ('none', 'active', 'past_due', 'cancelled')
- `subscription_id` TEXT
- `created_at`, `updated_at` TIMESTAMPTZ

**`premium_listings` table** (owner-submitted content)
- `id` UUID PK
- `program_number` TEXT UNIQUE NOT NULL (FK to profiles)
- `hours` JSONB (structured day-by-day hours with split range support — see Hours Reference below)
- `pricing` JSONB (structured age-based rate tiers + additional rates + notes — see Pricing Reference below)
- `amenities` JSONB (structured amenity data — see Amenities Reference below)
- `custom_faqs` JSONB (array of `{ question, answer }`)
- `description` TEXT (owner-written bio/about)
- `website_url` TEXT
- `logo_url` TEXT (single Supabase Storage URL)
- `photos` TEXT[] (array of Supabase Storage URLs)
- `published` BOOLEAN DEFAULT false
- `created_at`, `updated_at` TIMESTAMPTZ

**`claim_requests` table** (for manual verification queue)
- `id` UUID PK
- `program_number` TEXT NOT NULL
- `email` TEXT NOT NULL
- `requester_name` TEXT
- `proof_description` TEXT (how they prove ownership)
- `status` ENUM ('pending', 'approved', 'rejected')
- `admin_notes` TEXT
- `created_at`, `reviewed_at` TIMESTAMPTZ

**RLS Policies:**
- Profiles: users can read/update only their own row
- Premium listings: users can write only their own; anyone can read published listings
- Claim requests: users can insert; only service role can update status

### Step 1.3 — Supabase Auth integration
- Create `lib/supabase/client.ts` (browser client) and `lib/supabase/server.ts` (server client using cookies)
- Add `middleware.ts` to refresh Supabase auth session on each request
- Auth method: **email + password** (Supabase built-in). No OAuth needed initially.
- Email templates configured in Supabase dashboard (confirmation, password reset)

### Step 1.4 — Auth UI in app shell
- Add login/signup links to `SiteHeader.tsx` (conditional on auth state)
- Create `/app/auth/login/page.tsx` and `/app/auth/signup/page.tsx` (simple forms)
- Create `/app/auth/callback/route.ts` for Supabase email confirmation redirect
- Create `AuthProvider` context in `app/layout.tsx`
- **Consent:** Signup form includes required checkbox: "I agree to the [Terms of Service](/terms) and [Privacy Policy](/privacy)"

**Files to create:**
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `middleware.ts`
- `app/auth/login/page.tsx`
- `app/auth/signup/page.tsx`
- `app/auth/callback/route.ts`

**Files to modify:**
- `app/layout.tsx` — wrap children in AuthProvider
- `components/SiteHeader.tsx` — add auth-aware navigation
- `package.json` — add Supabase deps
- `.env.local` (new) — Supabase keys

---

## Phase 2: Claim Flow

> **Key decision:** Claim IS the signup. No standalone signup page. No manual review queue.
> If email doesn't match → user contacts ohioparenthub@gmail.com for manual help.

### Step 2.1 — "Claim This Listing" CTA on detail page
- Add a `ClaimListingButton` component to `DaycareDetailPageShell.tsx`
- Placement: in the Contact section, below admin names / email / phone
- Button text: "Are you the owner? Claim this listing"
- Clicking opens a `<Dialog>` (shadcn) with the claim form
- Only show if listing is NOT already claimed (pass `isClaimed` prop from server)

### Step 2.2 — Claim verification logic (password-based signup with email confirmation)

1. Owner clicks "Claim This Listing" on a daycare detail page
2. Dialog opens → owner enters their email + creates a password (all in one form)
3. Server action checks: does entered email (case-insensitive) === daycare's `EMAIL` field in `daycares.json` for that program number?
4. **Match →** `supabase.auth.signUp({ email, password, options: { data: { program_number } } })` creates the account and sends a confirmation email (Supabase built-in). Show "Check Your Email" screen with resend button.
5. Owner clicks confirmation link → `/auth/callback` → session created → profile row created → redirect to `/dashboard/edit`
6. From then on, owner logs in with email + password via `/auth/login`
7. **No match →** Show error: "We couldn't verify your email for this listing. Please contact ohioparenthub@gmail.com for help."

### Step 2.3 — Returning users
- `/auth/login` page remains for returning owners (email + password)
- No standalone `/auth/signup` page — the claim dialog is the only entry point

### Step 2.4 — Server actions for claim
- Create `app/actions/claims.ts` with `"use server"` directive
- `submitClaim(programNumber, email, password)` — validates email against state data, creates account via `signUp` if match
- `checkClaimStatus(programNumber)` — returns whether a listing is already claimed (profile exists for that program number)

**Files to create:**
- `components/premium/ClaimListingDialog.tsx`
- `app/actions/claims.ts`

**Files to modify:**
- `components/DaycareDetailPageShell.tsx` — add ClaimListingDialog trigger
- `app/daycare/[slug]/page.tsx` — query claim status, pass `isClaimed` prop
- `app/auth/callback/route.ts` — create profile row after email confirmation
- `components/SiteHeader.tsx` — remove signup link

**Files to remove:**
- `app/auth/signup/page.tsx` — replaced by claim dialog

**DB changes:**
- Drop `claim_requests` table (no manual review queue)
- Drop `claim_request_status` enum
- Simplify `claim_status` enum: remove 'pending', 'rejected' — every account is 'verified'
- Drop `claim_method` enum — only email match is supported

---

## Phase 3: Stripe Subscription

### Step 3.1 — Stripe setup
- Create Stripe account, obtain API keys
- Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`
- Install `stripe` npm package
- Create a single Product + Price in Stripe Dashboard (e.g., "Premium Listing — $X/month")

### Step 3.2 — Checkout flow
- After claim is verified → show "Upgrade to Premium" CTA in owner dashboard
- Create `app/api/stripe/checkout/route.ts` — generates Stripe Checkout Session
  - `mode: 'subscription'`
  - `success_url` → `/dashboard?upgraded=true`
  - `cancel_url` → `/dashboard`
  - Pass `program_number` as metadata
- Create `app/api/stripe/portal/route.ts` — generates Stripe Customer Portal session (manage/cancel subscription)

### Step 3.3 — Webhook handler
- Create `app/api/stripe/webhook/route.ts`
- Handle events:
  - `checkout.session.completed` → update `profiles.subscription_status = 'active'`, store `subscription_id`
  - `invoice.payment_succeeded` → keep status `'active'`
  - `invoice.payment_failed` → set `subscription_status = 'past_due'` (premium content **stays visible** — grace period while Stripe retries)
  - `customer.subscription.deleted` → set `subscription_status = 'cancelled'` (premium content **hidden** — all retries exhausted or owner cancelled)
- Webhook verification using `stripe.webhooks.constructEvent()` with raw body
- **Rendering rule:** show premium content when `subscription_status IN ('active', 'past_due')`. Hide only when `'cancelled'` or `'none'`.

**Files to create:**
- `lib/stripe.ts` (Stripe client singleton)
- `app/api/stripe/checkout/route.ts`
- `app/api/stripe/portal/route.ts`
- `app/api/stripe/webhook/route.ts`

---

## Phase 4: Owner Dashboard & Premium Content

### Step 4.1 — Owner dashboard
- Create `/app/dashboard/page.tsx` — protected route (redirect to login if not authenticated)
- Sections:
  - **Listing overview**: current daycare name, program number, claim status
  - **Subscription status**: active/inactive, manage billing (Stripe portal link)
  - **Edit listing** (only if subscription active): link to edit page
  - **Delete account**: "Delete my account" button → confirmation dialog: *"This will cancel your subscription and remove your premium content. This cannot be undone."* On confirm: cancel Stripe subscription → delete `premium_listings` row → delete photos from Storage → delete `profiles` row → delete Supabase auth user. The daycare listing itself stays (public state data) — reverts to standard free page.

### Step 4.2 — Premium content editor
- Create `/app/dashboard/edit/page.tsx`
- Form sections (all optional, saved to `premium_listings` table):
  - **Logo**: Single image upload (Supabase Storage)
    - Client-side: resize to max 512×512 px, compress to ≤200 KB, convert to WebP
    - Server-side: same MIME type restrictions as photos
    - Simple upload/replace — no reordering needed
    - Displayed as rounded square next to daycare name in hero section on detail page. On browse cards, replaces default placeholder icon.
    - Optional — if no logo uploaded, pages render the same as today
  - **Photos**: Upload up to 10 photos (Supabase Storage)
    - Client-side: resize to max 1920×1080 px, compress to ≤500 KB, convert to WebP (via `browser-image-compression`)
    - Server-side: reject files >2 MB or non-image MIME types (`image/jpeg`, `image/png`, `image/webp` only)
    - No SVGs, PDFs, or animated GIFs
    - Drag-to-reorder for display order. First photo = hero/thumbnail on browse pages.
    - Delete button per photo. No captions, no crop tool — owners crop before uploading.
  - **Hours**: Day-by-day hour editor (Mon–Sun) — see Hours Reference below
    - Each day: toggle (Open/Closed) + time range dropdowns (15-min increments)
    - All days default to **Closed** — owner explicitly enables and sets times
    - "+ Add hours" button per day for split hours (max 2 ranges per day)
    - "Copy to all weekdays" button after setting one day
    - **Validation:** Cannot save if a day is toggled ON but times are not selected. Inline error: "Please set hours or mark as closed"
  - **Pricing**: Age-based rate tiers + optional additional rates + pricing notes — see Pricing Reference below
    - Each row: label, start age, end age, part-time rate, full-time rate, rate period
    - Separate section for drop-in and before/after school rates
    - Pricing notes textarea with placeholder example text
    - Max 10 age-based tiers
  - **Amenities**: Categorized checkbox grid (32 items) + 5 freeform key-value slots (see Amenities Reference below)
  - **Custom FAQs**: Up to 5 owner-written Q&A pairs — see FAQ Reference below
    - Drag-and-drop (or up/down arrows) to reorder
    - Placeholder example text in empty fields
    - Rendered above auto-generated FAQs on public page (additive, never replaces existing SEO content)
    - Profanity filter on save
  - **About/Description**: Textarea (max 2000 chars)
    - Placeholder text: *"Tell parents what makes your daycare special. What's your philosophy? What should families know about your program?"*
    - Renders on detail page in a "From the Owner" card above the FAQ section
  - **Website URL**: Text input, validated on save (must start with `https://`). Renders as a clickable link in the Contact section on the detail page.
- Save via server action → upserts `premium_listings` row
- Preview button: shows how it will look on the public page

### Step 4.3 — Premium content rendering on detail page
- In `app/daycare/[slug]/page.tsx`: query `premium_listings` for this program number
- If premium data exists AND subscription active → pass to `DaycareDetailPageShell`
- Shell renders premium sections:
  - **✓+ icon** next to the daycare name in the hero section. Tooltip on hover/tap: *"Verified by the provider — includes photos, hours, pricing, and more"*
  - **Logo** displayed as rounded square next to daycare name in hero (if uploaded)
  - **"Direct from Provider" section heading** groups all premium content below:
  - **Photo gallery** below the hero section
  - **Hours table** in a new section after Contact
  - **Pricing table** after Hours
  - **Amenities badges** (tag chips) after Pricing
  - **Custom FAQs** merged into existing FAQ section (owner FAQs first, then auto-generated)
  - **Description** in a "From the Owner" card above the FAQ section
- **Browse pages:** small ✓+ icon on listing cards for premium subscribers — no label text. Logo replaces default placeholder icon on card (if uploaded). Tooltip: *"Verified by the provider — includes photos, hours, pricing, and more"*. No sort boost or pinning — all cards treated equally in browse order.
- If subscription lapses → premium content hidden but NOT deleted (incentive to resubscribe). ✓+ icon removed from card and detail page.

**Files to create:**
- `app/dashboard/page.tsx`
- `app/dashboard/edit/page.tsx`
- `app/dashboard/layout.tsx` (auth guard layout)
- `components/PremiumPhotoGallery.tsx`
- `components/PremiumHoursTable.tsx`
- `components/PremiumPricingTable.tsx`
- `components/PremiumAmenities.tsx`
- `components/PremiumOwnerDescription.tsx`
- `app/actions/premium.ts` (server actions for saving/loading premium data)

**Files to modify:**
- `components/DaycareDetailPageShell.tsx` — conditional premium sections
- `app/daycare/[slug]/page.tsx` — fetch premium data, pass as props

---

## Phase 5: Admin & Operations (Deferred / Lightweight)

### Step 5.1 — Manual claim review
- Initially: review `claim_requests` directly in Supabase Dashboard (Table Editor)
- Future: build `/app/admin/claims/page.tsx` with approve/reject actions

### Step 5.2 — Email notifications
- Install `resend` package (free tier: 100 emails/day)
- Send transactional emails:
  - Claim submitted confirmation
  - Claim approved notification
  - Subscription activated confirmation
  - Payment failed warning
- Create `lib/email.ts` with template functions

---

## Phase 6: Legal & Compliance (Before Launch)

Must be completed before the claim/subscription flow goes live. Draft plain-language versions first; formal legal review post-launch when revenue justifies it.

### Step 6.1 — Terms of Service (new page)
- Create `/app/terms/page.tsx`
- Must cover:
  - **Account terms:** one account per daycare, must be authorized representative
  - **Content ownership:** owner retains ownership, grants Ohio Parent Hub license to display
  - **Content rules:** reference Content Guidelines, right to remove violations
  - **Subscription terms:** billing cycle, auto-renewal, cancellation via Stripe portal
  - **Refund policy:** no refunds for partial billing periods; cancel anytime, active until end of current period
  - **Data accuracy:** owner responsible for accuracy of listing content
  - **Termination:** Ohio Parent Hub can suspend/terminate accounts that violate terms
  - **Disclaimer:** site aggregates public Ohio CCIDS data, not a recommendation or endorsement
  - **Limitation of liability:** standard limitation clause
  - **Governing law:** State of Ohio

### Step 6.2 — Privacy Policy update
- Update existing `/app/privacy/page.tsx`
- Add/update sections for:
  - **Data collected:** email, name, display name, program number. Card data stored by Stripe, never by Ohio Parent Hub.
  - **How data is used:** account management, subscription billing, content publishing, transactional emails
  - **Third-party processors:** Supabase (database/auth), Stripe (payments), Resend (transactional email), Vercel (hosting)
  - **Cookies:** auth session cookies (functional, not tracking) in addition to existing analytics cookies
  - **Data retention:** how long account data is kept after cancellation or deletion
  - **User rights:** account deletion, data export
  - **Children's data:** Ohio Parent Hub does not collect data from children — clarify explicitly (important for a childcare site)

### Step 6.3 — Content Guidelines (new page)
- Create `/app/content-guidelines/page.tsx`
- Must cover:
  - **Allowed:** accurate business information, photos of own facilities, factual descriptions of services
  - **Prohibited:** profanity, hate speech, misleading claims, competitor disparagement, personal info of parents/children, copyrighted content they don't own, stock photos misrepresented as their facility, photos containing identifiable children, spam/promotional links to unrelated businesses
  - **Enforcement:** violation → warning → content removed → account suspended
  - **Appeals:** contact email for disputes

### Step 6.4 — Footer & consent touchpoints
- Add links to Terms of Service and Content Guidelines in `SiteFooter.tsx`
- Consent touchpoints:
  - **Signup form:** required checkbox — "I agree to the Terms of Service and Privacy Policy" (links to both)
  - **Premium editor save:** required checkbox — "I agree that my content complies with the Content Guidelines" (link)
  - **Stripe Checkout:** Stripe handles its own payment terms consent

**Files to create:**
- `app/terms/page.tsx`
- `app/content-guidelines/page.tsx`

**Files to modify:**
- `app/privacy/page.tsx` — major update for accounts, payments, third-party processors
- `components/SiteFooter.tsx` — add Terms of Service and Content Guidelines links

---

## Relevant Files

### Modify
- `components/DaycareDetailPageShell.tsx` — Add claim CTA button, premium content sections (photos, hours, pricing, amenities, owner description)
- `app/daycare/[slug]/page.tsx` — Fetch claim status + premium data from Supabase, pass to shell
- `components/SiteHeader.tsx` — Add login/signup/dashboard links
- `app/layout.tsx` — Wrap with AuthProvider, add Supabase session management
- `package.json` — Add @supabase/supabase-js, @supabase/ssr, stripe, resend
- `next.config.ts` — Add image domains for Supabase Storage URLs

### Create (new files)
- `lib/supabase/client.ts`, `lib/supabase/server.ts` — Supabase clients
- `lib/stripe.ts` — Stripe client singleton
- `lib/email.ts` — Email templates via Resend
- `middleware.ts` — Auth session refresh + route protection
- `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`, `app/auth/callback/route.ts` — Auth pages
- `app/dashboard/page.tsx`, `app/dashboard/edit/page.tsx`, `app/dashboard/layout.tsx` — Owner dashboard
- `app/api/stripe/checkout/route.ts`, `app/api/stripe/portal/route.ts`, `app/api/stripe/webhook/route.ts` — Stripe API routes
- `app/actions/claims.ts`, `app/actions/premium.ts` — Server actions
- `components/ClaimListingButton.tsx`, `components/ClaimListingDialog.tsx` — Claim UI
- `components/Premium*.tsx` — Premium content display components
- `app/terms/page.tsx` — Terms of Service
- `app/content-guidelines/page.tsx` — Content Guidelines

### Reference (read-only patterns)
- `lib/daycareProjection.ts` — Data field patterns
- `app/api/daycares/route.ts` — Existing API route pattern
- `components/GlobalDashboard.tsx` — Client component state patterns

---

## Verification

1. **Claim flow (email match):** Create test daycare claim → enter matching email → verify account created in Supabase `profiles` with `claim_status: 'verified'`
2. **Claim flow (manual):** Enter non-matching email → verify `claim_requests` row inserted with `status: 'pending'`
3. **Auth flow:** Sign up → confirm email → login → verify protected `/dashboard` is accessible
4. **Stripe checkout:** Click upgrade → complete Stripe test checkout → verify webhook fires → `subscription_status` updates to `active`
5. **Stripe cancellation:** Cancel in Stripe portal → verify webhook fires → `subscription_status` updates to `cancelled` → premium content hidden on public page
6. **Premium content:** Save photos/hours/pricing → verify rendered on public detail page → verify hidden after subscription cancels
7. **Security:** Verify RLS policies prevent cross-account data access. Verify webhook signature validation. Verify rate limiting on claim attempts.
8. **Edge case:** Daycare with no email → verify manual claim path triggers. Already-claimed listing → verify CTA hidden or shows "Claimed" state.

---

## Hours Reference

### Editor UX

Each day of the week is a row:

```
Monday    [OFF]  (Closed — time fields hidden)
Tuesday   [ON]   [7:00 AM ▾] — [6:00 PM ▾]              [+ Add hours]
Wednesday [ON]   [7:00 AM ▾] — [12:00 PM ▾]              [+ Add hours]
                  [2:00 PM ▾] — [6:00 PM ▾]              [✕ Remove]
```

| Element | Behavior |
|---------|----------|
| **Toggle** | Switch per day. Default: OFF (Closed). When OFF, row grays out, time fields hidden. |
| **Time dropdowns** | 15-minute increments, 5:00 AM – 11:45 PM. Placeholder text: "Open" / "Close" (no pre-selected values). |
| **"+ Add hours"** | Adds a second time range to the same day (for split hours). Max 2 ranges per day. |
| **"✕ Remove"** | Removes the second time range. |
| **"Copy to all weekdays"** | After setting any day, copies that day's hours to Mon–Fri. Owner must still make at least one intentional choice. |

### Validation Rules
- Cannot save if a day is toggled ON but times are not selected
- Close time must be after open time (within each range)
- Ranges cannot overlap (second range start must be after first range end)
- Max 2 ranges per day

### DB Storage Format (`hours` JSONB)
```json
{
  "mon": { "open": true, "ranges": [["07:00", "18:00"]] },
  "tue": { "open": true, "ranges": [["07:00", "18:00"]] },
  "wed": { "open": true, "ranges": [["07:00", "12:00"], ["14:00", "18:00"]] },
  "thu": { "open": true, "ranges": [["07:00", "18:00"]] },
  "fri": { "open": true, "ranges": [["07:00", "18:00"]] },
  "sat": { "open": false, "ranges": [] },
  "sun": { "open": false, "ranges": [] }
}
```

---

## Pricing Reference

### Editor UX

**Age-Based Rates** (main section):

Each row has: label, age range, part-time rate, full-time rate, and rate period.

```
── Age-Based Rates ──────────────────────────────────────────────────────────────
[Label: ________]  [Start age ▾]  to  [End age ▾]  PT [$___]  FT [$___]  [Per ▾]  [✕]

Infant             [6 wks ▾]      to  [12 mo ▾]    PT [$225]  FT [$325]  [weekly]  [✕]
Toddler            [12 mo ▾]      to  [3 yrs ▾]    PT [$190]  FT [$275]  [weekly]  [✕]
Preschool          [3 yrs ▾]      to  [5 yrs ▾]    PT [$175]  FT [$250]  [weekly]  [✕]
School-age         [5 yrs ▾]      to  [12 yrs ▾]   PT [$125]  FT [$175]  [weekly]  [✕]
[+ Add age group]

── Additional Rates (optional) ─────────────────────────────────────────────────
Drop-in              [$75]   [Per: daily ▾]
Before/After school   [$125]  [Per: weekly ▾]

── Pricing Notes ───────────────────────────────────────────────────────────────
[________________________________________________________________________]
Placeholder: "e.g., Registration fee: $50. 10% sibling discount. Rates include meals and snacks."
```

- PT and FT fields are both optional — leave blank if not offered for that age group
- Rate period options: weekly, daily, monthly
- Additional rates are simple: one rate + period each, optional
- Max 10 age-based tiers

### Age Dropdown Options

Single dropdown using months for under-2, years for 2+. Stored internally as months.

| Display Label | Stored Value (months) |
|--------------|----------------------|
| 6 weeks | 1.5 |
| 3 months | 3 |
| 6 months | 6 |
| 12 months | 12 |
| 18 months | 18 |
| 2 years | 24 |
| 2.5 years | 30 |
| 3 years | 36 |
| 4 years | 48 |
| 5 years | 60 |
| 6 years | 72 |
| 7 years | 84 |
| 8 years | 96 |
| 9 years | 108 |
| 10 years | 120 |
| 12 years | 144 |

### Validation Rules
- End age must be greater than start age
- Label required on each tier
- At least one of PT or FT rate required per tier (both can't be blank)
- Rate must be a positive number
- Max 10 age-based tiers

### DB Storage Format (`pricing` JSONB)
```json
{
  "tiers": [
    { "label": "Infant", "age_start": 1.5, "age_end": 12, "part_time": 225, "full_time": 325, "period": "weekly" },
    { "label": "Toddler", "age_start": 12, "age_end": 36, "part_time": 190, "full_time": 275, "period": "weekly" },
    { "label": "Preschool", "age_start": 36, "age_end": 60, "part_time": 175, "full_time": 250, "period": "weekly" },
    { "label": "School-age", "age_start": 60, "age_end": 144, "part_time": 125, "full_time": 175, "period": "weekly" }
  ],
  "additional_rates": {
    "drop_in": { "rate": 75, "period": "daily" },
    "before_after": { "rate": 125, "period": "weekly" }
  },
  "notes": "Registration fee: $50. 10% sibling discount. Rates include meals and snacks."
}
```

Null/omitted values = not offered → not rendered on public page.

---

## FAQ Reference

### Editor UX

Owner can add up to 5 custom FAQ pairs. Each pair has a question field and an answer field with inactive placeholder text as examples:

```
── Custom FAQs ─────────────────────────────────────────────────────────
[↕] Q: [What is your sick child policy?              ]  [✕]
    A: [Children must be symptom-free for 24 hours... ]  

[↕] Q: [Do you offer potty training support?           ]  [✕]
    A: [Yes, we work with families to...              ]

[+ Add FAQ]
```

| Element | Behavior |
|---------|----------|
| **[↕] Drag handle** | Drag-and-drop to reorder. Fallback: up/down arrow buttons for accessibility. |
| **Question field** | Text input, max 200 characters |
| **Answer field** | Textarea, max 1,000 characters (~150 words) |
| **Placeholder text (question)** | Rotates through examples: "What is your sick child policy?", "Do you offer potty training support?", "What does a typical day look like?", "What curriculum do you follow?", "Do you accept childcare subsidies?" |
| **Placeholder text (answer)** | Matches the question placeholder. e.g., "Describe your policy so parents know what to expect..." |
| **[✕] Remove** | Deletes the FAQ pair |
| **[+ Add FAQ]** | Adds a new empty pair. Hidden when 5 FAQs already exist. |
| **Max** | 5 FAQ pairs |

### Rendering on Public Detail Page

Owner FAQs appear **first** in the FAQ accordion, followed by the existing auto-generated FAQs. Owner FAQs are additive — auto-generated FAQs are **never removed or replaced** (preserves SEO value of indexed content).

```
── Frequently Asked Questions ──────────────────
  ▸ What is your sick child policy?           ← Owner FAQ
  ▸ Do you offer potty training support?       ← Owner FAQ
  ▸ What does a typical day look like?         ← Owner FAQ
  ▸ What is the SUTQ rating for [name]?        ← Auto-generated
  ▸ What type of program is [name]?            ← Auto-generated
  ▸ Is [name] currently licensed?              ← Auto-generated
```

All FAQs sit in the same accordion with no visual divider. Array order from DB = display order.

### Validation Rules
- Question required (can’t save an empty question with an answer)
- Answer required (can’t save a question without an answer)
- Max 200 characters per question
- Max 1,000 characters per answer
- Max 5 FAQ pairs
- Profanity filter on save (see Content Moderation below)

### DB Storage Format (`custom_faqs` JSONB)
```json
[
  { "question": "What is your sick child policy?", "answer": "Children must be symptom-free for 24 hours before returning to care. If your child develops a fever..." },
  { "question": "Do you offer potty training support?", "answer": "Yes, we work with families to establish a consistent potty training routine..." }
]
```

Array order = display order. Reordering updates array indices.

---

## Amenities Reference

### Fixed Checkbox List (32 items)

**Daily Essentials**
- Diapers provided
- Wipes provided
- Crib sheets provided
- Car seat storage (infant carriers stay on-site)

**Meals & Feeding**
- Breakfast
- Lunch
- Morning snack
- Afternoon snack
- Baby food provided
- Formula provided

**Facilities & Safety**
- Outdoor playground
- Fenced playground
- Indoor play area
- Security cameras
- Keypad entry
- Live parent camera access *(+ optional text field: system name)*

**Communication**
- Parent communication app *(+ optional text field: app name)*

**Programs & Learning**
- Structured curriculum
- STEM activities
- Arts & crafts
- Music & movement
- Field trips

**Scheduling & Flexibility**
- Part-time care
- Full-time care
- Before-school care
- After-school care
- Drop-in care
- Weekend hours
- Evening care
- Overnight care
- Summer care (school-age)
- Transportation available

### Freeform "Additional Details" (max 5)
Owner-defined key-value pairs for anything not covered above.  
Example: `"Languages Spoken" → "English, Spanish"`

### DB Storage Format (`amenities` JSONB)
```json
{
  "checked": ["diapers_provided", "breakfast", "outdoor_playground", "live_parent_camera"],
  "text_fields": {
    "live_parent_camera": "WatchMeGrow",
    "parent_communication_app": "Brightwheel"
  },
  "custom": [
    { "label": "Languages Spoken", "value": "English, Spanish" },
    { "label": "Pet Policy", "value": "Classroom guinea pig" }
  ]
}
```

---

## Content Moderation

Lightweight approach to protect site quality without adding build complexity.

| Layer | Implementation | Details |
|-------|---------------|----------|
| **Profanity filter** | npm package (`bad-words` or `leo-profanity`) | Server-side check on save for all text fields (FAQs, description, pricing notes, freeform amenities). If matched, reject with "Please revise your content." ~5 lines of code in server actions. |
| **Terms checkbox** | Required on editor page | "I agree that my content complies with Ohio Parent Hub’s content guidelines." Gives legal standing to remove content. |
| **`published` flag** | Already in DB schema | `DEFAULT false`. Auto-publish at launch (very few premium listings initially). Set `published = false` in Supabase Dashboard to pull any problematic listing. |
| **Character limits** | Per-field maxes | Prevents content dumping. Enforced client-side and server-side. |

**Not needed at launch:** AI moderation, user reporting, real-time scanning, manual pre-approval queue.

---

## Decisions & Scope

- **In scope:** Claim flow, auth, single-tier subscriptions, premium content editor, premium rendering on detail page, legal pages (ToS, Privacy update, Content Guidelines)
- **Out of scope (for now):** Admin dashboard UI (use Supabase Dashboard), multiple pricing tiers, review/rating system, featured placements on browse pages, analytics dashboard for owners
- **Data integrity:** CSV refresh pipeline (`buildDaycaresJson.mjs`) continues unchanged. Premium data lives entirely in Supabase. Merge happens at render time in `[slug]/page.tsx`. No risk of CSV overwrites.
- **Legal:** Plain-language drafts before launch. Formal legal review post-launch when revenue justifies it. Privacy policy update required before any user data collection begins.

---

## Implementation Order & Dependencies

### Build Order

1. ✅ **Premium detail page UI** (mock data) — extend existing detail page with all premium sections (logo, ✓+ icon, photos, hours, pricing, amenities, description, FAQs under "Direct from Provider"). Validate layout, field placement, and visual design before building the input form.
   - ✅ Type definitions (`lib/premiumTypes.ts`)
   - ✅ Mock data with SVG placeholders (`data/mockPremiumListing.ts`)
   - ✅ 6 display components: VerifiedProviderBadge, PremiumPhotoGallery (grid + lightbox), PremiumHoursTable, PremiumPricingTable, PremiumAmenities, PremiumOwnerDescription
   - ✅ DaycareDetailPageShell integration (hero logo/badge, website link, "Direct from Provider" section, "From the Owner" card)
   - ✅ Server page wiring with mock data gate (`app/daycare/[slug]/page.tsx`)
   - ⬜ UI polish pass (defer until after backend wiring)

2. ✅ **Premium editor form UI** (local state) — build the full editor at `/app/dashboard/edit/page.tsx`.
   - ✅ Logo upload (single image, preview)
   - ✅ Photo upload with drag-to-reorder (max 10)
   - ✅ Hours toggles (day-by-day on/off + open/close time pickers, split hours support)
   - ✅ Pricing tiers (add/remove rows: label, age range, PT/FT rates, period) + additional rates + notes
   - ✅ Amenity checkboxes (grouped by category, text extras for camera/app, custom amenities)
   - ✅ FAQ pairs (add/remove/reorder with drag-and-drop + arrow buttons, drop indicator line)
   - ✅ Description textarea
   - ✅ Website URL input
   - ✅ Preview mode (render display components with current form state)

3. ⬜ **Supabase setup + DB schema** — create project, tables, RLS policies, env vars.
   - ✅ Create Supabase project, add env vars to `.env.local`
   - ✅ Install `@supabase/supabase-js` + `@supabase/ssr`
   - ✅ Create tables: `profiles`, `premium_listings`, `claim_requests` (with migrations via `supabase/migrations/001_initial_schema.sql`)
   - ✅ Configure RLS policies (profiles: own row only; premium_listings: owners write, public read published; claim_requests: anyone insert, own read)
   - ✅ Create Supabase Storage bucket (`listings`, public) for photos/logos
   - ✅ Create `lib/supabase/client.ts` (browser) + `lib/supabase/server.ts` (server + service-role)
   - ✅ Create server actions (`app/actions/premium.ts`): `loadPremiumListing`, `loadPublishedPremiumListing`, `savePremiumListing`
   - ✅ Wire editor form → accepts `programNumber` + `initialData` props, calls `savePremiumListing` on save
   - ✅ Wire detail page → read premium data from Supabase (replaced mock data gate with `loadPublishedPremiumListing`)
   - ⬜ Wire photo/logo uploads → Supabase Storage

4. ✅ **Auth** — Supabase Auth integration, login page, proxy session refresh, auth-aware header, dashboard protection.
   - ✅ Create `lib/supabase/client.ts` (browser) + `lib/supabase/server.ts` (server) — done in Step 3
   - ✅ Integrate session refresh into `proxy.ts` (Next.js 16 uses `proxy.ts` instead of `middleware.ts`)
   - ✅ Login page (`/app/auth/login/page.tsx`) — email + password form, error handling, redirect on success
   - ✅ Auth callback route (`/app/auth/callback/route.ts`) — exchanges code for session, creates profile row for new claim users
   - ✅ Auth-aware SiteHeader — shows Sign In (anon) vs Dashboard + Sign Out (authed), both desktop and mobile
   - ✅ Dashboard layout (`/app/dashboard/layout.tsx`) — auth guard, redirects unauthenticated users to /auth/login
   - Note: No standalone signup page — claim dialog (Step 5) is the only entry point for new accounts

5. ✅ **Claim flow** — "Claim This Listing" dialog on detail page, email-match + password-based signup with email confirmation.
   - ✅ DB migration: drop `claim_requests` table, drop `claim_request_status` + `claim_method` enums, simplify `claim_status` → `verified` boolean (`supabase/migrations/002_simplify_claim_flow.sql`)
   - ✅ Server action: `submitClaim` (email match → `signUp({ email, password })` with email confirmation) in `app/actions/claims.ts`
   - ✅ Server action: `checkClaimStatus` (is listing already claimed?) in `app/actions/claims.ts`
   - ✅ `ClaimListingDialog` component (email + password form → "Check Your Email" screen with resend) in `components/premium/ClaimListingDialog.tsx`
   - ✅ Wire claim dialog into `DaycareDetailPageShell` (hide if already claimed, `isClaimed` prop)
   - ✅ `/auth/callback` creates profile row after email confirmation, redirects to `/dashboard/edit`
   - ✅ Remove `/auth/signup` page — claim dialog is now the only signup path
   - ✅ Remove `/auth/set-password` page — password set during claim submission, no separate step needed
   - ✅ Update login page: replaced signup link with "Visit your daycare's page" guidance
   - ✅ Branded confirmation email template configured in Supabase dashboard (Authentication → Email Templates → Confirm signup)
   - Note: No magic links. Standard password-based auth with Supabase email confirmation.
   - Note: No-match users contact ohioparenthub@gmail.com (manual support, no review queue)
   - ⚠️  Migration `002_simplify_claim_flow.sql` must be executed in Supabase SQL Editor before testing
   - ⚠️  "Confirm email" must be enabled in Supabase dashboard (Authentication → Providers → Email)

6. ✅ **Stripe** — checkout session, webhook handler, customer portal. Gates the editor behind active subscription.
   - ✅ Stripe account + env vars + `stripe` npm package installed
   - ✅ Create Stripe Product + Price (single monthly tier) — configured in Stripe dashboard
   - ✅ Checkout session API route (`/api/stripe/checkout`) — creates customer on first checkout, reuses existing
   - ✅ Webhook handler (`/api/stripe/webhook`) — handles `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`
   - ✅ Customer portal API route (`/api/stripe/portal`) — manages billing/cancellation
   - ✅ Gate editor form behind active subscription (redirect to `/dashboard` if not active/past_due)
   - ✅ Wire `subscription_status` updates to `profiles` table via webhook
   - ✅ `lib/stripe.ts` — Stripe client singleton
   - ⚠️  `STRIPE_PRICE_ID` in `.env.local` currently set to a Product ID (`prod_`) — needs to be updated to a Price ID (`price_`)

7. ✅ **Owner dashboard** — ties it all together: claim status, subscription status, edit link, manage billing, account deletion.
   - ✅ Dashboard page (`/app/dashboard/page.tsx`) — server component fetches profile + Stripe subscription details
   - ✅ `DashboardClient` component — displays subscription status badge, price, renewal date
   - ✅ "Edit Listing" link (to editor, gated on active subscription)
   - ✅ "View Public Page" link (opens daycare detail page)
   - ✅ "Manage Billing" button (opens Stripe Customer Portal for payment method changes)
   - ✅ "Subscribe to Premium" CTA (shown when no active subscription)
   - ✅ Change password form
   - ✅ Cancel subscription & delete account flow (confirmation dialog, cancels Stripe, deletes data + auth user)
   - ✅ Server actions in `app/actions/account.ts` (cancelSubscriptionAndDeleteAccount, changePassword)

8. ⬜ **Legal pages** — Terms of Service, Privacy Policy update, Content Guidelines. Must be live before first user signs up.

9. ⬜ **Email notifications** — transactional emails via Resend (claim confirmation, approval, payment alerts).

10. ⬜ **Content moderation** — profanity filter wired into server actions.

### Dependencies

```
Step 1 (Detail page UI)    → ✅ DONE
Step 2 (Editor form UI)    → ✅ DONE
Step 3 (Supabase + wiring) → ✅ DONE (DB, RLS, Storage bucket, server actions, editor + detail page wired; photo uploads still pending)
Step 4 (Auth)              → ✅ DONE (proxy session refresh, login/signup pages, callback route, auth-aware header, dashboard guard)
Step 5 (Claim flow)        → ✅ DONE (claim dialog, email match, password-based signup with email confirmation, callback creates profile, set-password page removed, branded email template configured)
Step 6 (Stripe)            → ✅ DONE (checkout, webhook, portal routes; editor gated behind active subscription)
Step 7 (Dashboard)         → ✅ DONE (subscription card, edit/view/billing links, change password, cancel & delete account)
Step 8 (Legal)             → no code dependencies; must be live before launch
Step 9 (Email)             → depends on step 5
Step 10 (Moderation)       → depends on step 3
```

Steps 5 and 6 can be built in parallel once step 4 is complete.
Step 8 can be worked on at any time but must be live before the first user signs up.
