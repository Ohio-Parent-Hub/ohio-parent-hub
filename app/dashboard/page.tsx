import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { validatePromoCode } from "@/lib/promoValidation";
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

    // Read promo code from user metadata (set at signup)
    const promoCode = user.user_metadata?.promo_code;
    const promoValidation = promoCode
      ? await validatePromoCode(promoCode)
      : null;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      ...(promoValidation
        ? {
            discounts: [{ promotion_code: promoValidation.promoCodeId }],
            ...(promoValidation.isFreeForever && {
              payment_method_collection: "if_required" as const,
            }),
          }
        : { allow_promotion_codes: true }),
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

  const licenseDate = daycare?.["LICENSE/CERTIFICATION/REGISTRATION BEGIN DATE"] ?? null;
  const licensedSince = licenseDate ? new Date(licenseDate).getFullYear().toString() : null;

  const daycareInfo = {
    programType: daycare?.["PROGRAM TYPE"] ?? null,
    sutqRating: daycare?.["SUTQ RATING"] ?? null,
    city: daycare?.["CITY"] ?? null,
    county: daycare?.["COUNTY"] ?? null,
    licensedSince,
  };

  // Fetch Stripe subscription details if active
  let subscriptionDetails: {
    status: string;
    priceFormatted: string;
    currentPeriodEnd: string | null;
    freeForever: boolean;
    freeUntil: string | null;
  } | null = null;

  if (profile.subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(
        profile.subscription_id,
        { expand: ["items.data.price", "discounts.source.coupon"] }
      );
      const price = sub.items.data[0]?.price;
      const amount = price?.unit_amount ? (price.unit_amount / 100).toFixed(2) : "0.00";
      const interval = price?.recurring?.interval ?? "month";

      // Check if subscription has a 100% off discount
      const discount = sub.discounts?.[0];
      const coupon =
        discount && typeof discount === "object"
          ? discount.source?.coupon
          : null;
      const isFull100Off = !!(coupon && typeof coupon === "object" && coupon.percent_off === 100);
      const freeForever = !!(isFull100Off && typeof coupon === "object" && coupon.duration === "forever");
      const freeUntil =
        isFull100Off && !freeForever && discount && typeof discount === "object" && discount.end
          ? new Date(discount.end * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : null;

      // Get next renewal date from subscription item's current_period_end
      const periodEnd = sub.items.data[0]?.current_period_end;
      const renewalDate = periodEnd
        ? new Date(periodEnd * 1000).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : null;

      subscriptionDetails = {
        status: sub.status,
        priceFormatted: `$${amount}/${interval}`,
        currentPeriodEnd: renewalDate,
        freeForever,
        freeUntil,
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
      daycareInfo={daycareInfo}
    />
  );
}
