import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service client to read/write profile (bypasses RLS)
    const adminDb = createServiceClient();

    const { data: profile } = await adminDb
      .from("profiles")
      .select("stripe_customer_id, program_number, email")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Reuse existing Stripe customer or create one
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      // Check if a Stripe customer already exists for this email (e.g. from a previous account)
      const existing = await stripe.customers.list({ email: profile.email, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: profile.email,
          metadata: { program_number: profile.program_number },
        });
        customerId = customer.id;
      }

      await adminDb
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${getOrigin()}/dashboard?upgraded=true`,
      cancel_url: `${getOrigin()}/dashboard`,
      metadata: { program_number: profile.program_number },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Error creating checkout session:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

function getOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
