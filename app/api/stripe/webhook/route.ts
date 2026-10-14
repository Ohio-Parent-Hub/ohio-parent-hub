import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { billingEventInput } from "@/lib/billingEvents";
import type Stripe from "stripe";

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
  const { data, error } = await createServiceClient().rpc("apply_billing_event", input);
  if (error) {
    console.error("Stripe event persistence failed", { eventId: event.id, type: event.type, code: error.code });
    return NextResponse.json({ error: "Unable to persist billing event" }, { status: 503 });
  }
  // Cached detail/city/county/jobs pages must stop showing cancelled content.
  // Also retry invalidation for duplicates if a previous response failed afterward.
  try { if (data === "applied" || data === "duplicate") revalidatePath("/", "layout"); }
  catch { return NextResponse.json({ error: "Unable to refresh public listings" }, { status: 503 }); }
  return NextResponse.json({ received: true });
}
