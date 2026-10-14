# Premium access and billing regression rollout

## Product rules

Verified owners with `active` or `past_due` subscriptions may save/publish listings, upload images and create/update jobs. `past_due` preserves the existing payment-retry grace period. `none` and `cancelled` deny these paid writes and hide premium overlays, logos, filter summaries and jobs publicly. The free state-data listing and verified ownership badge remain. Saved owner content is retained, including drafts, so it can return after resubscription.

Owners retain private listing/job reads and deletion/image cleanup even without a paid subscription. Cleanup does not allow republishing or uploading new content. Other owners' private reads and all cross-owner mutations remain denied. The listing editor now reads its own saved data rather than using the public published-only loader.

## Enforcement

`lib/premiumAccess.ts` defines the shared grace rule. Server actions check verified ownership and entitlement; listing/job RLS INSERT and UPDATE require the same predicate. Public server loaders use explicit verified/subscription joins because service-role reads bypass RLS.

`premium_entitlements` holds only public program numbers and eligibility booleans. An internal trigger in the unexposed `oph_private` schema synchronizes it transactionally from protected profile fields. This allows anonymous publication policies to check eligibility without exposing private profile emails/billing data or weakening profile RLS. Clients cannot modify it. The trigger uses a fixed search path, a caller-id guard, and no public execution grants.

Storage metadata/write policies scope requests to the first path segment matching the owner program. Upload/update additionally require premium status. Delete and own metadata reads support cleanup. Server-side uploads use a service client only after checking paid ownership. Cleanup validates the actual storage URL origin and path. The existing public bucket remains public: retained image URLs may still be fetched directly after cancellation; they disappear from premium pages/search overlays. This is visibility gating, not a revocation of previously public files.

## Billing persistence and event ordering

To satisfy OPH-15's failure/replay requirements, the webhook now calls service-only `apply_billing_event`. Signature verification still checks the raw request body. No external Stripe API call is needed to process an event. Supported subscription checkout, invoice success/failure and subscription deletion map to the existing state matrix. Unpaid/non-subscription checkout, one-off invoices and unrelated events are acknowledged without granting premium access. Current invoice parent subscription references, legacy references, and expanded IDs are supported.

The RPC locks the matching profile and writes its entitlement/cursor plus an event receipt in one database transaction. Failure leaves no deduplication receipt and returns HTTP 503, so Stripe can retry. Duplicate events do not apply state again. Missing/ambiguous customer bindings also return 503 rather than silently losing an event; investigate retries for deleted accounts/binding races. Logs include event ID/type/error code, never the payload or signing secret.

Ordering policy:

- Older `event.created` timestamps are recorded as stale and do not change current state.
- For equal timestamps on the same subscription, deletion outranks failure, failure outranks success, and success outranks checkout. Payment failure still retains premium access during grace.
- A late invoice cannot reactivate a cancelled account. Only a paid/no-payment-required subscription checkout may reopen it. Known cancelled subscription IDs cannot be reopened by replay.
- Invoice/deletion events for a different current subscription are ignored. A newer checkout for a different subscription establishes the new binding; same-second new-subscription checkout may supersede an old cancellation.
- This uses signed event chronology and subscription identity, not an upstream Stripe reconciliation fetch. If there are missing events or multiple same-second subscription checkouts, reconcile through a separately reviewed billing process. Receipt/cursor fields are not writable by clients.

After successful persistence, the webhook invalidates public routes so cached detail/city/county/jobs pages refresh on the next visit. Invalidation failure returns 503; a duplicate retry retries invalidation without applying state twice. Manual/admin subscription changes outside the webhook must also invalidate the corresponding Next routes; database RLS/direct loaders change immediately, but existing page caches otherwise remain until revalidation.

## Verification

The required CI suite includes the full status matrix through real authenticated Data API calls and server actions, real Storage uploads/cleanup, cross-owner denial, unpublished/inactive visibility, retained private reads, the free verified badge, and client denial of eligibility/cursor forgery. Signed fixtures use only the local webhook secret, synthetic customers/subscriptions and the disposable local database. Tests cover invalid signatures, supported events, grace/cancellation, failed persistence/retry/duplicate, real failed RPC transactions, deterministic ordering, stale subscription events and failed cache invalidation. One test injects an RPC failure; the rest exercise real SQL/roles. No payment, production mutation, real email or live Stripe customer is part of these tests.

Playwright additionally checks editor/jobs navigation for `none`, `active`, `past_due`, and `cancelled` owners in desktop/mobile Chromium. Run integration and browser suites sequentially because fixture reseeding changes Auth credentials. Existing public/claim regressions still run. There are no skipped entitlement failures or test retries.

## Review and rollout

The confirmed production project is `aziibxfjoduwwkmcczrm`. Read-only inspection found ownership-only premium/job write policies, published-only public reads, a public listings bucket with no custom object policies, and three active plus one unpaid profile. No hosted data was changed during development. Stripe account identity and a separate hosted staging project remain unconfirmed; the suite requires neither.

Apply only the two new reviewed migrations, in order: `20261014205650_enforce_premium_access.sql`, then `20261014205741_persist_billing_events.sql`. Do not blindly push legacy 001–003: the existing production history differs from the repository. The deployed webhook requires its RPC; coordinate migrations with application rollout. Prefer migrations just before deploying the reviewed app, keep the interval short, and inspect effective policies/functions/grants afterward. Legacy service-role loaders/uploads will not enforce the new server rule until the new app is deployed. These migrations retain listing/job content and publication preferences; only the eligibility table is backfilled. New billing cursor fields start at zero, preserving current stored subscription state until supported events arrive.

Record a schema/permission snapshot and a compatible deployment before release. Check public discovery, owner editing and cancellation/cache behavior in a confirmed test environment, then read-only production smoke checks. Verify webhook delivery/error logs after release without exposing credentials. Public SEO URLs, titles/canonicals, state data and hosting are unchanged. Revalidation may rebuild cached pages on their next visit, rather than eagerly rebuilding the entire directory.

Rollback must preserve profile-field protection and paid policies. Keep a compatible RPC/schema while the new webhook is deployed; removing it would intentionally return 503 and delay events. Do not roll back to a handler that acknowledges failed writes or undo paid gates to hide an operational issue. Event receipts are server-only operational metadata; retaining/deleting them requires a reviewed maintenance policy. Application rollback does not undo Stripe state or database changes.
