import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import daycares from "@/data/daycares.json";
import { createServiceClient } from "@/lib/supabase/server";

export type ClaimFailure = "unconfirmed" | "unverified_profile" | "no_listing" | "email_mismatch" | "already_claimed" | "persistence";
export type ProviderProfile = {
  id: string;
  email: string;
  program_number: string;
  verified: boolean;
  stripe_customer_id: string | null;
  subscription_id: string | null;
  subscription_status: "none" | "active" | "past_due" | "cancelled";
};
type ClaimCompletion = { status: "verified"; profile: ProviderProfile } | { status: "error"; reason: ClaimFailure };

export function listingEmail(programNumber: unknown): string | null {
  if (typeof programNumber !== "string" || !programNumber.trim()) return null;
  const listing = (daycares as Record<string, unknown>[]).find(row => String(row["PROGRAM NUMBER"]) === programNumber);
  const email = listing?.EMAIL;
  return typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;
}

/** A metadata program number is only a locator, never proof of ownership. */
export async function completeVerifiedClaim(session: SupabaseClient): Promise<ClaimCompletion> {
  const { data: { user }, error: authError } = await session.auth.getUser();
  if (authError || !user?.email || !user.email_confirmed_at || user.is_anonymous) {
    return { status: "error", reason: "unconfirmed" };
  }

  const admin = createServiceClient();
  const existing = await admin.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (existing.error) return { status: "error", reason: "persistence" };
  // Preserve established ownership and billing even if metadata or the directory changes.
  if (existing.data) return existing.data.verified
    ? { status: "verified", profile: existing.data as ProviderProfile }
    : { status: "error", reason: "unverified_profile" };

  const programNumber: unknown = user.user_metadata?.program_number;
  const authoritativeEmail = listingEmail(programNumber);
  if (!authoritativeEmail) return { status: "error", reason: "no_listing" };
  if (user.email.trim().toLowerCase() !== authoritativeEmail) return { status: "error", reason: "email_mismatch" };

  // INSERT, never upsert: unique id/program_number constraints arbitrate concurrent claims.
  const result = await admin.from("profiles").insert({
    id: user.id,
    email: user.email.trim().toLowerCase(),
    program_number: programNumber as string,
    verified: true,
  }).select("*").single();
  if (!result.error && result.data) return { status: "verified", profile: result.data as ProviderProfile };
  if (result.error?.code === "23505") {
    // The same user's parallel callback may have won. Never transfer a different claim.
    const winner = await admin.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (winner.error) return { status: "error", reason: "persistence" };
    if (winner.data?.program_number === programNumber) return winner.data.verified
      ? { status: "verified", profile: winner.data as ProviderProfile }
      : { status: "error", reason: "unverified_profile" };
    return { status: "error", reason: "already_claimed" };
  }
  return { status: "error", reason: "persistence" };
}

export function safeNextPath(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value : "/dashboard?checkout=true";
}
