import type Stripe from "stripe";

function id(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return null;
}

/** Read signed payloads only; no external Stripe requests or payments are needed. */
export function billingEventInput(event: Stripe.Event) {
  const object = event.data.object as unknown as Record<string, unknown>;
  const customerId = id(object.customer);
  let subscriptionId: string | null;
  switch (event.type) {
    case "checkout.session.completed":
      if (object.mode !== "subscription" || !["paid", "no_payment_required"].includes(String(object.payment_status))) return null;
      subscriptionId = id(object.subscription);
      break;
    case "invoice.payment_succeeded":
    case "invoice.payment_failed": {
      const parent = object.parent as { subscription_details?: { subscription?: unknown } } | undefined;
      subscriptionId = id(parent?.subscription_details?.subscription) ?? id(object.subscription);
      if (!subscriptionId) return null; // One-off invoices do not grant subscription access.
      break;
    }
    case "customer.subscription.deleted": subscriptionId = id(object); break;
    default: return null;
  }
  if (!customerId || !subscriptionId || !event.id || !Number.isSafeInteger(event.created) || event.created < 0) throw new Error("Invalid billing payload");
  return { p_event_id: event.id, p_event_type: event.type, p_created: event.created, p_customer_id: customerId, p_subscription_id: subscriptionId };
}
