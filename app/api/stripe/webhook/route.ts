import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { billingEventInput } from "@/lib/billingEvents";
import type Stripe from "stripe";

function persistenceFailure(event: Stripe.Event, code: string) {
  console.error("Stripe event persistence failed", {
    eventId: event.id,
    type: event.type,
    operation: "apply_billing_event",
    code,
  });
  return NextResponse.json({ error: "Unable to persist billing event" }, { status: 503 });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!); }
  catch { return NextResponse.json({ error: "Invalid signature" }, { status: 400 }); }
  let input;
  try { input = billingEventInput(event); }
  catch { return NextResponse.json({ error: "Invalid billing payload" }, { status: 400 }); }
  if (!input) return NextResponse.json({ received: true });
  let outcome: string;
  try {
    const { data, error } = await createServiceClient().rpc("apply_billing_event", input);
    if (error) return persistenceFailure(event, error.code);
    if (typeof data !== "string" || !["applied", "duplicate", "stale", "subscription_mismatch"].includes(data)) {
      return persistenceFailure(event, "INVALID_OUTCOME");
    }
    outcome = data;
  } catch {
    // Transport/configuration exceptions may contain credentials or payload data.
    return persistenceFailure(event, "UNEXPECTED_ERROR");
  }
  // Cached detail/city/county/jobs pages must stop showing cancelled content.
  // Also retry invalidation for duplicates if a previous response failed afterward.
  try {
    if (outcome === "applied" || outcome === "duplicate") revalidatePath("/", "layout");
  } catch {
    console.error("Stripe event cache invalidation failed", {
      eventId: event.id,
      type: event.type,
      operation: "revalidatePath",
    });
    return NextResponse.json({ error: "Unable to refresh public listings" }, { status: 503 });
  }
  return NextResponse.json({ received: true });
}
