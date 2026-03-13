import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import daycares from "@/data/daycares.json";
import { slugify } from "@/lib/utils";
import { resolveCanonicalCitySlugFromName } from "@/lib/metroAreas";
import DashboardClient from "@/components/DashboardClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DaycareRow = Record<string, any>;

function findDaycareByProgramNumber(programNumber: string): DaycareRow | null {
  return (
    (daycares as unknown as DaycareRow[]).find(
      (d) => String(d["PROGRAM NUMBER"]) === programNumber
    ) ?? null
  );
}

function buildDaycareSlug(daycare: DaycareRow): string {
  const programNumber = daycare["PROGRAM NUMBER"] || "";
  const name = daycare["PROGRAM NAME"] || "";
  const citySlug = resolveCanonicalCitySlugFromName(daycare["CITY"] || "");
  return `${programNumber}-${slugify(name)}-${citySlug}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Auto-create profile if it doesn't exist (e.g. email verification
  // redirect didn't go through /auth/callback)
  if (!profile) {
    const programNumber = user.user_metadata?.program_number;
    if (!programNumber) redirect("/auth/login");

    const adminDb = createServiceClient();
    const { data: newProfile } = await adminDb
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email!,
          program_number: programNumber,
          verified: true,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (!newProfile) redirect("/auth/login");
    profile = newProfile;
  }

  // Auto-redirect to Stripe Checkout for new signups
  const isNewSignup = params.checkout === "true";
  const isActive =
    profile.subscription_status === "active" ||
    profile.subscription_status === "past_due";

  if (isNewSignup && !isActive) {
    const adminDb = createServiceClient();

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

    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/dashboard`,
      metadata: { program_number: profile.program_number },
    });

    if (session.url) redirect(session.url);
  }

  // Find daycare info from static data
  const daycare = findDaycareByProgramNumber(profile.program_number);
  const daycareName = daycare?.["PROGRAM NAME"] ?? "Your Daycare";
  const daycareSlug = daycare ? `/daycare/${buildDaycareSlug(daycare)}` : null;

  // Fetch Stripe subscription details if active
  let subscriptionDetails: {
    status: string;
    priceFormatted: string;
    currentPeriodEnd: string | null;
  } | null = null;

  if (profile.subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(
        profile.subscription_id,
        { expand: ["items.data.price", "latest_invoice"] }
      );
      const price = sub.items.data[0]?.price;
      const amount = price?.unit_amount ? (price.unit_amount / 100).toFixed(2) : "0.00";
      const interval = price?.recurring?.interval ?? "month";

      // Get next renewal date from latest invoice period_end
      let renewalDate: string | null = null;
      const latestInvoice =
        typeof sub.latest_invoice === "object" && sub.latest_invoice !== null
          ? sub.latest_invoice
          : null;
      if (latestInvoice && "period_end" in latestInvoice && latestInvoice.period_end) {
        renewalDate = new Date(
          (latestInvoice.period_end as number) * 1000
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }

      subscriptionDetails = {
        status: sub.status,
        priceFormatted: `$${amount}/${interval}`,
        currentPeriodEnd: renewalDate,
      };
    } catch {
      // Subscription may have been deleted on Stripe's side
    }
  }

  return (
    <DashboardClient
      daycareName={daycareName}
      daycareSlug={daycareSlug}
      email={profile.email}
      subscriptionStatus={profile.subscription_status}
      subscriptionDetails={subscriptionDetails}
      hasStripeCustomer={!!profile.stripe_customer_id}
    />
  );
}
