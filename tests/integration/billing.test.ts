import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";
import { localClient, ownerClient } from "../support/clients.mjs";
import { seedFixtures } from "../support/seed.mjs";
import { providers } from "../fixtures/providers.mjs";
import { loadTestEnvironment } from "../support/environment.mjs";

const state = vi.hoisted(() => ({ failure: null as "database" | "exception" | "empty_outcome" | "unknown_outcome" | null }));
vi.mock("@/lib/supabase/server", () => ({ createServiceClient: () => {
  const admin = localClient("service");
  if (state.failure === "database") vi.spyOn(admin, "rpc").mockResolvedValue({ data: null, error: { code: "XX000", message: "PRIVATE_BILLING_FIXTURE: database details" }, count: null, status: 500, statusText: "failure" } as never);
  if (state.failure === "exception") vi.spyOn(admin, "rpc").mockRejectedValue(new Error("PRIVATE_BILLING_FIXTURE: transport credentials"));
  if (state.failure === "empty_outcome" || state.failure === "unknown_outcome") vi.spyOn(admin, "rpc").mockResolvedValue({ data: state.failure === "empty_outcome" ? null : "unrecognized_outcome", error: null, count: null, status: 200, statusText: "OK" } as never);
  return admin;
} }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { revalidatePath } from "next/cache";
import { POST } from "@/app/api/stripe/webhook/route";
import { loadPublishedPremiumListing } from "@/app/actions/premium";

const owner = providers.find(p => p.status === "active")!;
const customer = "cus_oph_local_signed_fixture", subscription = "sub_oph_local_fixture";
const lifecycles = [
  { type: "checkout.session.completed", before: "none", after: "active", initialSubscription: null, finalSubscription: subscription },
  { type: "invoice.payment_succeeded", before: "past_due", after: "active", initialSubscription: subscription, finalSubscription: subscription },
  { type: "invoice.payment_failed", before: "active", after: "past_due", initialSubscription: subscription, finalSubscription: subscription },
  { type: "customer.subscription.deleted", before: "active", after: "cancelled", initialSubscription: subscription, finalSubscription: null },
] as const;
const stripe = new Stripe("sk_test_oph_inert_placeholder");
let sequence = 0;
function event(type: string, created: number, sub = subscription, eventId = `evt_oph_fixture_${++sequence}`) {
  const object = type === "checkout.session.completed" ? { customer, subscription: sub, mode: "subscription", payment_status: "paid" }
    : type === "customer.subscription.deleted" ? { customer, id: sub }
    : { customer, parent: { subscription_details: { subscription: sub } } };
  return { id: eventId, type, created, data: { object } };
}
async function deliver(payload: ReturnType<typeof event>, secret = loadTestEnvironment().STRIPE_WEBHOOK_SECRET) {
  const body = JSON.stringify(payload);
  const signature = stripe.webhooks.generateTestHeaderString({ payload: body, secret });
  return POST(new Request("http://127.0.0.1:3100/api/stripe/webhook", { method: "POST", body, headers: { "stripe-signature": signature } }));
}
async function profile() {
  const result = await localClient("service").from("profiles").select("subscription_status, subscription_id, billing_event_created, billing_event_priority, billing_event_subscription_id").eq("id", owner.id).single();
  expect(result.error).toBeNull();
  return result.data!;
}
async function receipts(eventId: string) {
  const result = await localClient("service").from("billing_event_receipts").select("event_id, outcome").eq("event_id", eventId);
  expect(result.error).toBeNull();
  return result.data!;
}
beforeEach(async () => {
  state.failure = null; vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect((await localClient("service").from("profiles").update({ stripe_customer_id: customer, subscription_id: subscription }).eq("id", owner.id)).error).toBeNull();
});
afterEach(async () => { state.failure = null; vi.restoreAllMocks(); await seedFixtures(); });

describe("real signature verification and atomic local billing persistence", () => {
  it("persists checkout, payment failure/grace, recovery and cancellation; invalidates public pages", async () => {
    for (const [index,type] of ["checkout.session.completed", "invoice.payment_failed", "invoice.payment_succeeded", "customer.subscription.deleted"].entries()) {
      expect((await deliver(event(type, 100 + index))).status).toBe(200);
      expect((await profile()).subscription_status).toBe(type === "invoice.payment_failed" ? "past_due" : type === "customer.subscription.deleted" ? "cancelled" : "active");
      expect(Boolean(await loadPublishedPremiumListing(owner.programNumber))).toBe(type !== "customer.subscription.deleted");
    }
    expect((await profile()).subscription_id).toBeNull();
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
  it("rejects missing/invalid signatures and acknowledges unrelated events without changing state", async () => {
    const before = await profile();
    expect((await POST(new Request("http://127.0.0.1:3100/api/stripe/webhook", { method: "POST", body: "{}" }))).status).toBe(400);
    expect((await deliver(event("invoice.payment_failed", 100), "whsec_wrong_fixture")).status).toBe(400);
    expect((await deliver(event("customer.created", 100))).status).toBe(200);
    expect(await profile()).toEqual(before);
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
  describe.each(["database", "exception"] as const)("%s persistence failures", failure => {
    it.each(lifecycles)("$type: preserves state, logs safely, retries and deduplicates", async lifecycle => {
      const admin = localClient("service");
      expect((await admin.from("profiles").update({ subscription_status: lifecycle.before, subscription_id: lifecycle.initialSubscription }).eq("id", owner.id)).error).toBeNull();
      const before = await profile(), payload = event(lifecycle.type, 100);
      state.failure = failure;
      const response = await deliver(payload);
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: "Unable to persist billing event" });
      expect(await profile()).toEqual(before);
      expect(await receipts(payload.id)).toEqual([]);
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledExactlyOnceWith("Stripe event persistence failed", {
        eventId: payload.id, type: lifecycle.type, operation: "apply_billing_event",
        code: failure === "database" ? "XX000" : "UNEXPECTED_ERROR",
      });

      state.failure = null;
      expect((await deliver(payload)).status).toBe(200);
      expect(await profile()).toMatchObject({ subscription_status: lifecycle.after, subscription_id: lifecycle.finalSubscription, billing_event_created: 100, billing_event_subscription_id: subscription });
      const recovered = await profile();
      expect((await deliver(payload)).status).toBe(200);
      expect(await profile()).toEqual(recovered);
      expect(await receipts(payload.id)).toEqual([{ event_id: payload.id, outcome: "applied" }]);
    });
  });
  it.each(lifecycles)("$type: unmatched customer fails atomically and retries after binding recovery", async lifecycle => {
    const admin = localClient("service"), payload = event(lifecycle.type, 100);
    expect((await admin.from("profiles").update({ stripe_customer_id: null, subscription_status: lifecycle.before, subscription_id: lifecycle.initialSubscription }).eq("id", owner.id)).error).toBeNull();
    const before = await profile();
    expect((await deliver(payload)).status).toBe(503);
    expect(await profile()).toEqual(before);
    expect(await receipts(payload.id)).toEqual([]);
    expect(console.error).toHaveBeenCalledExactlyOnceWith("Stripe event persistence failed", {
      eventId: payload.id, type: lifecycle.type, operation: "apply_billing_event", code: "P0002",
    });
    expect((await admin.from("profiles").update({ stripe_customer_id: customer }).eq("id", owner.id)).error).toBeNull();
    expect((await deliver(payload)).status).toBe(200);
    expect(await profile()).toMatchObject({ subscription_status: lifecycle.after, subscription_id: lifecycle.finalSubscription });
    expect(await receipts(payload.id)).toHaveLength(1);
  });
  it("rejects ambiguous customer bindings without updating either account, then retries after repair", async () => {
    const admin = localClient("service"), other = providers.find(p => p.id !== owner.id)!;
    const payload = event("customer.subscription.deleted", 100), before = await profile();
    expect((await admin.from("profiles").update({ stripe_customer_id: customer }).eq("id", other.id)).error).toBeNull();
    expect((await deliver(payload)).status).toBe(503);
    expect(await profile()).toEqual(before);
    expect((await admin.from("profiles").select("subscription_status").eq("id", other.id).single()).data?.subscription_status).toBe(other.status);
    expect(await receipts(payload.id)).toEqual([]);
    expect(console.error).toHaveBeenCalledExactlyOnceWith("Stripe event persistence failed", {
      eventId: payload.id, type: payload.type, operation: "apply_billing_event", code: "P0003",
    });
    expect((await admin.from("profiles").update({ stripe_customer_id: null }).eq("id", other.id)).error).toBeNull();
    expect((await deliver(payload)).status).toBe(200);
    expect((await profile()).subscription_status).toBe("cancelled");
  });
  it.each(["empty_outcome", "unknown_outcome"] as const)("does not acknowledge an %s RPC response as persisted", async failure => {
    const payload = event("invoice.payment_failed", 100), before = await profile();
    state.failure = failure;
    expect((await deliver(payload)).status).toBe(503);
    expect(await profile()).toEqual(before);
    expect(await receipts(payload.id)).toEqual([]);
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledExactlyOnceWith("Stripe event persistence failed", {
      eventId: payload.id, type: payload.type, operation: "apply_billing_event", code: "INVALID_OUTCOME",
    });
    state.failure = null;
    expect((await deliver(payload)).status).toBe(200);
    expect((await profile()).subscription_status).toBe("past_due");
  });
  it("ignores older events and never revives a cancelled subscription with a late invoice", async () => {
    expect((await deliver(event("customer.subscription.deleted", 200))).status).toBe(200);
    for (const created of [100, 201]) expect((await deliver(event("invoice.payment_succeeded", created))).status).toBe(200);
    expect((await profile()).subscription_status).toBe("cancelled");
    expect((await deliver(event("checkout.session.completed", 202, "sub_oph_new_fixture"))).status).toBe(200);
    expect((await profile()).subscription_status).toBe("active");
    expect((await deliver(event("customer.subscription.deleted", 203))).status).toBe(200);
    expect((await profile()).subscription_id).toBe("sub_oph_new_fixture");
  });
  it("does not reactivate a legacy cancelled profile with an invoice before any event receipt exists", async () => {
    expect((await localClient("service").from("profiles").update({ subscription_status: "cancelled", subscription_id: null }).eq("id", owner.id)).error).toBeNull();
    expect((await deliver(event("invoice.payment_succeeded", 100))).status).toBe(200);
    expect((await profile()).subscription_status).toBe("cancelled");
    expect((await deliver(event("checkout.session.completed", 101, "sub_oph_rejoin_fixture"))).status).toBe(200);
    expect((await profile()).subscription_status).toBe("active");
  });
  it("resolves same-second events deterministically and serializes concurrent delivery", async () => {
    const failure = event("invoice.payment_failed", 100), success = event("invoice.payment_succeeded", 100);
    expect((await Promise.all([deliver(failure), deliver(success), deliver(failure)])).every(r => r.status === 200)).toBe(true);
    expect((await profile()).subscription_status).toBe("past_due");
    expect((await deliver(event("customer.subscription.deleted", 100))).status).toBe(200);
    expect((await profile()).subscription_status).toBe("cancelled");
  });
  it("ignores unpaid checkout and one-off invoices; accepts expanded IDs and legacy invoice shapes", async () => {
    const checkout = event("checkout.session.completed", 100);
    checkout.data.object.payment_status = "unpaid";
    expect((await deliver(checkout)).status).toBe(200);
    const oneOff = event("invoice.payment_succeeded", 101);
    oneOff.data.object = { customer } as typeof oneOff.data.object;
    expect((await deliver(oneOff)).status).toBe(200);
    expect((await profile()).billing_event_created).toBe(0);
    const legacy = event("invoice.payment_failed", 102);
    legacy.data.object = { customer: { id: customer }, subscription: { id: subscription } } as unknown as typeof legacy.data.object;
    expect((await deliver(legacy)).status).toBe(200);
    expect((await profile()).subscription_status).toBe("past_due");
  });
  it("retries cache invalidation after successful persistence without applying an event twice", async () => {
    const payload = event("invoice.payment_failed", 100);
    vi.mocked(revalidatePath).mockImplementationOnce(() => { throw new Error("Injected cache failure"); });
    expect((await deliver(payload)).status).toBe(503);
    expect((await profile()).subscription_status).toBe("past_due");
    expect(console.error).toHaveBeenCalledExactlyOnceWith("Stripe event cache invalidation failed", {
      eventId: payload.id, type: payload.type, operation: "revalidatePath",
    });
    expect((await deliver(payload)).status).toBe(200);
    expect((await localClient("service").from("billing_event_receipts").select("event_id").eq("event_id", payload.id)).data).toHaveLength(1);
  });
  it("rejects direct client calls to the privileged persistence RPC", async () => {
    const anon = await localClient().rpc("apply_billing_event", { p_event_id: "evt_attack", p_event_type: "checkout.session.completed", p_created: 999, p_customer_id: customer, p_subscription_id: subscription });
    expect(anon.error?.code).toBe("42501");
    const authenticated = await ownerClient(owner);
    expect((await authenticated.rpc("apply_billing_event", { p_event_id: "evt_attack_owner", p_event_type: "checkout.session.completed", p_created: 999, p_customer_id: customer, p_subscription_id: subscription })).error?.code).toBe("42501");
  });
});
