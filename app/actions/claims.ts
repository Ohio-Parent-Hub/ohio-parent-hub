"use server";

import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import daycares from "@/data/daycares.json";

type ClaimResult =
  | { status: "confirmation_email_sent" }
  | { status: "no_match"; message: string }
  | { status: "already_claimed" }
  | { status: "error"; message: string };

/**
 * Submit a claim for a daycare listing.
 * Checks if the email matches the state data for the given program number.
 * If match → creates account via signUp (sends confirmation email).
 * If no match → returns an error with contact info.
 */
export async function submitClaim(
  programNumber: string,
  email: string,
  password: string
): Promise<ClaimResult> {
  if (typeof programNumber !== "string" || typeof email !== "string" || typeof password !== "string" || !programNumber.trim()) {
    return { status: "error", message: "Please enter a valid listing, email and password." };
  }
  const trimmedEmail = email.trim().toLowerCase();

  // Check if already claimed
  const claimed = await createServiceClient().from("profiles").select("id").eq("program_number", programNumber).maybeSingle();
  if (claimed.error) return { status: "error", message: "Unable to check this claim. Please try again." };
  if (claimed.data) {
    return { status: "already_claimed" };
  }

  // Find the daycare in local data
  const daycare = (daycares as Record<string, unknown>[]).find(
    (d) => String(d["PROGRAM NUMBER"]) === programNumber
  );

  if (!daycare) {
    return { status: "error", message: "Daycare not found." };
  }

  const stateEmail = (daycare["EMAIL"] as string | undefined)
    ?.trim()
    .toLowerCase();

  if (!stateEmail) {
    return {
      status: "no_match",
      message:
        "No email is on file for this listing. Please contact info@ohioparenthub.com for help claiming your listing.",
    };
  }

  if (trimmedEmail !== stateEmail) {
    return {
      status: "no_match",
      message:
        "The email you entered doesn't match what's on file for this listing. Please use the email associated with your childcare license, or contact info@ohioparenthub.com for help.",
    };
  }

  // Email matches → create account with password (Supabase sends confirmation email)
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Read promo code from cookie (set by middleware when ?promo= is in URL)
  const cookieStore = await cookies();
  const promoCode = cookieStore.get("promo_code")?.value;

  const { error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: {
        program_number: programNumber,
        ...(promoCode && { promo_code: promoCode }),
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "confirmation_email_sent" };
}

/**
 * Check whether a listing has a verified claim (for the public badge).
 */
export async function checkClaimStatus(
  programNumber: string
): Promise<boolean> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("program_number", programNumber)
    .eq("verified", true)
    .maybeSingle();

  if (error) throw new Error("Unable to check this claim. Please try again.");
  return !!data;
}
