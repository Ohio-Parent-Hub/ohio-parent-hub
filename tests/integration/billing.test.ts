import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";
import { localClient, ownerClient } from "../support/clients.mjs";
import { seedFixtures } from "../support/seed.mjs";
import { providers } from "../fixtures/providers.mjs";
import { loadTestEnvironment } from "../support/environment.mjs";

const state = vi.hoisted(() => ({ fail: false }));
vi.mock("@/lib/supabase/server", () => ({ createServiceClient: () => {
  const admin = localClient("service");
  if (state.fail) vi.spyOn(admin, "rpc").mockResolvedValue({ data: null, error: { code: "XX000", message: "Injected failure" }, count: null, status: 500, statusText: "failure" } as never);
  return admin;
} }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { revalidatePath } from "next/cache";
import { POST } from "@/app/api/stripe/webhook/route";
import { loadPublishedPremiumListing } from "@/app/actions/premium";

const owner = providers.find(p => p.status === "active")!;
const customer = "cus_oph_local_signed_fixture", subscription = "sub_oph_local_fixture";
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
async function profile() { return (await localClient("service").from("profiles").select("subscription_status, subscription_id, billing_event_created").eq("id", owner.id).single()).data!; }
beforeEach(async () => {
  state.fail = false; vi.clearAllMocks();
  expect((await localClient("service").from("profiles").update({ stripe_customer_id: customer, subscription_id: subscription }).eq("id", owner.id)).error).toBeNull();
});
afterEach(async () => { state.fail = false; await seedFixtures(); });

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
    expect((await POST(new Request("http://127.0.0.1:3100/api/stripe/webhook", { method: "POST", body: "{}" }))).status).toBe(400);
    expect((await deliver(event("invoice.payment_failed", 100), "whsec_wrong_fixture")).status).toBe(400);
    expect((await deliver(event("customer.created", 100))).status).toBe(200);
    expect((await profile()).subscription_status).toBe("active"); expect(revalidatePath).not.toHaveBeenCalled();
  });
  it("returns non-2xx on persistence failure; retry succeeds and duplicate replay is harmless", async () => {
    const payload = event("invoice.payment_failed", 100);
    state.fail = true; expect((await deliver(payload)).status).toBe(503);
    expect((await profile()).subscription_status).toBe("active");
    expect((await localClient("service").from("billing_event_receipts").select("event_id").eq("event_id", payload.id)).data).toEqual([]);
    state.fail = false; expect((await deliver(payload)).status).toBe(200);
    expect((await deliver(payload)).status).toBe(200);
    expect((await profile()).subscription_status).toBe("past_due");
    expect((await localClient("service").from("billing_event_receipts").select("event_id").eq("event_id", payload.id)).data).toHaveLength(1);
  });
  it("rolls back failed database transactions, leaving the event retryable", async () => {
    const admin = localClient("service"), payload = event("invoice.payment_failed", 100);
    expect((await admin.from("profiles").update({ stripe_customer_id: null }).eq("id", owner.id)).error).toBeNull();
    expect((await deliver(payload)).status).toBe(503);
    expect((await admin.from("billing_event_receipts").select("event_id").eq("event_id", payload.id)).data).toEqual([]);
    expect((await admin.from("profiles").update({ stripe_customer_id: customer }).eq("id", owner.id)).error).toBeNull();
    expect((await deliver(payload)).status).toBe(200);
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
