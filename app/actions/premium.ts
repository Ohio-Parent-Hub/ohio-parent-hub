"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PREMIUM_STATUSES, hasPremiumAccess } from "@/lib/premiumAccess";
import type { PremiumListingData, PremiumFilterSummary, PremiumPricingTier, PremiumPriceTier } from "@/lib/premiumTypes";

function listingData(data: Record<string, unknown>): PremiumListingData {
  return {
    logo_url: (data.logo_url ?? undefined) as string | undefined,
    photos: (data.photos ?? []) as string[],
    hours: (data.hours ?? undefined) as PremiumListingData["hours"],
    pricing: (data.pricing ?? undefined) as PremiumListingData["pricing"],
    amenities: (data.amenities ?? undefined) as PremiumListingData["amenities"],
    custom_faqs: (data.custom_faqs ?? []) as NonNullable<PremiumListingData["custom_faqs"]>,
    description: (data.description ?? undefined) as string | undefined,
    website_url: (data.website_url ?? undefined) as string | undefined,
  };
}

/**
 * Load a premium listing by program_number.
 * Private owner read, including saved drafts/inactive subscription content.
 */
export async function loadPremiumListing(
  programNumber: string
): Promise<PremiumListingData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("program_number").eq("id", user.id).single();
  if (profile?.program_number !== programNumber) return null;
  const { data, error } = await supabase.from("premium_listings").select("*").eq("program_number", programNumber).maybeSingle();
  return error || !data ? null : listingData(data);
}

/**
 * Load the set of program numbers that have verified provider accounts.
 * Verification is earned by claiming, independent of paid subscription status.
 * Used for showing verified badges in list/map views.
 */
export async function loadVerifiedProgramNumbers(): Promise<Set<string>> {
  const supabase = createServiceClient();

  const { data } = await supabase.from("profiles").select("program_number").eq("verified", true);
  const numbers = new Set<string>();
  for (const row of data ?? []) numbers.add(row.program_number);

  return numbers;
}

/**
 * Load logo URLs for published premium listings.
 * Returns a map of program_number → logo_url (only entries with a logo).
 */
export async function loadPremiumLogos(): Promise<Record<string, string>> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("premium_listings")
    .select("program_number, logo_url, profiles!inner(verified, subscription_status)")
    .eq("published", true)
    .eq("profiles.verified", true)
    .in("profiles.subscription_status", [...PREMIUM_STATUSES])
    .not("logo_url", "is", null);

  if (error || !data) return {};

  const logos: Record<string, string> = {};
  for (const row of data) {
    if (row.logo_url) logos[row.program_number] = row.logo_url;
  }
  return logos;
}

/** Normalize a pricing tier rate to weekly. */
function toWeekly(rate: number, period: string): number {
  if (period === "daily") return rate * 5;
  if (period === "monthly") return rate / 4.33;
  return rate; // already weekly
}

/**
 * Load slim filter summaries for all published premium listings.
 * Used by FilterChipBar premium chips (age, price, schedule, amenities, photos).
 */
export async function loadPremiumFilterSummaries(): Promise<Record<string, PremiumFilterSummary>> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("premium_listings")
    .select("program_number, pricing, amenities, photos, profiles!inner(verified, subscription_status)")
    .eq("published", true)
    .eq("profiles.verified", true)
    .in("profiles.subscription_status", [...PREMIUM_STATUSES]);

  if (error || !data) return {};

  const summaries: Record<string, PremiumFilterSummary> = {};

  for (const row of data) {
    const pn: string = row.program_number;

    // Age range from pricing tiers
    let ageRange: [number, number] | null = null;
    let priceRange: [number, number] | null = null;
    const priceTiers: PremiumPriceTier[] = [];

    if (row.pricing?.tiers && Array.isArray(row.pricing.tiers)) {
      const tiers = row.pricing.tiers as PremiumPricingTier[];
      let minAge = Infinity;
      let maxAge = -Infinity;
      let minPrice = Infinity;
      let maxPrice = -Infinity;

      for (const tier of tiers) {
        if (typeof tier.age_start === "number" && typeof tier.age_end === "number") {
          if (tier.age_start < minAge) minAge = tier.age_start;
          if (tier.age_end > maxAge) maxAge = tier.age_end;
        }
        const period = tier.period || "weekly";
        let tierMin = Infinity;
        let tierMax = -Infinity;
        for (const rate of [tier.part_time, tier.full_time]) {
          if (typeof rate === "number" && rate > 0) {
            const weekly = toWeekly(rate, period);
            if (weekly < minPrice) minPrice = weekly;
            if (weekly > maxPrice) maxPrice = weekly;
            if (weekly < tierMin) tierMin = weekly;
            if (weekly > tierMax) tierMax = weekly;
          }
        }
        if (typeof tier.age_start === "number" && typeof tier.age_end === "number" && tierMin !== Infinity) {
          priceTiers.push({
            ageStart: tier.age_start,
            ageEnd: tier.age_end,
            minWeekly: Math.round(tierMin),
            maxWeekly: Math.round(tierMax),
          });
        }
      }

      if (minAge !== Infinity && maxAge !== -Infinity) ageRange = [minAge, maxAge];
      if (minPrice !== Infinity && maxPrice !== -Infinity) priceRange = [Math.round(minPrice), Math.round(maxPrice)];
    }

    // Amenity codes
    const amenities: string[] = row.amenities?.checked && Array.isArray(row.amenities.checked)
      ? (row.amenities.checked as string[])
      : [];

    // Photos
    const hasPhotos = Array.isArray(row.photos) && row.photos.length > 0;

    summaries[pn] = { ageRange, priceRange, priceTiers, amenities, hasPhotos };
  }

  return summaries;
}

/**
 * Load a published premium listing for the public detail page.
 * Returns null if listing doesn't exist or isn't published.
 */
export async function loadPublishedPremiumListing(
  programNumber: string
): Promise<PremiumListingData | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("premium_listings")
    .select(
      "hours, pricing, amenities, custom_faqs, description, website_url, logo_url, photos, profiles!inner(verified, subscription_status)"
    )
    .eq("program_number", programNumber)
    .eq("published", true)
    .eq("profiles.verified", true)
    .in("profiles.subscription_status", [...PREMIUM_STATUSES])
    .maybeSingle();

  if (error || !data) return null;

  return {
    logo_url: data.logo_url ?? undefined,
    photos: data.photos ?? [],
    hours: data.hours ?? undefined,
    pricing: data.pricing ?? undefined,
    amenities: data.amenities ?? undefined,
    custom_faqs: data.custom_faqs ?? [],
    description: data.description ?? undefined,
    website_url: data.website_url ?? undefined,
  };
}

/**
 * Save (upsert) a premium listing. Requires authenticated user.
 * Returns { success, error? }.
 */
export async function savePremiumListing(
  programNumber: string,
  listing: PremiumListingData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Verify the user owns this program_number
  const { data: profile } = await supabase
    .from("profiles")
    .select("program_number, verified, subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.program_number !== programNumber) {
    return { success: false, error: "Not authorized for this listing" };
  }

  if (!hasPremiumAccess(profile.subscription_status, profile.verified)) return { success: false, error: "Premium subscription required" };

  const row = {
    program_number: programNumber,
    hours: listing.hours ?? null,
    pricing: listing.pricing ?? null,
    amenities: listing.amenities ?? null,
    custom_faqs:
      listing.custom_faqs?.filter((f) => f.question.trim() && f.answer.trim()) ?? [],
    description: listing.description ?? null,
    website_url: listing.website_url ?? null,
    logo_url: listing.logo_url ?? null,
    photos: listing.photos ?? [],
    published: true, // Auto-publish for now (see PRD — few listings at launch)
  };

  const { error } = await supabase.from("premium_listings").upsert(row, {
    onConflict: "program_number",
  });

  if (error) {
    console.error("savePremiumListing error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

const BUCKET = "listings";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_SIZE = 500 * 1024; // 500 KB (compressed client-side, allow headroom)
const MAX_PHOTO_SIZE = 3 * 1024 * 1024; // 3 MB (compressed client-side, allow headroom)

/**
 * Upload an image to Supabase Storage.
 * Validates auth, ownership, file type, and size.
 * Returns the public URL on success.
 */
export async function uploadListingImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("program_number, verified, subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile?.program_number) return { error: "No listing linked" };
  if (!hasPremiumAccess(profile.subscription_status, profile.verified)) return { error: "Premium subscription required" };

  const file = formData.get("file") as File | null;
  const kind = formData.get("kind") as string; // "logo" | "photo"
  if (!file) return { error: "No file provided" };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only JPG, PNG, or WebP images are allowed" };
  }

  const maxSize = kind === "logo" ? MAX_LOGO_SIZE : MAX_PHOTO_SIZE;
  if (file.size > maxSize) {
    return {
      error: `File too large (max ${kind === "logo" ? "200 KB" : "2 MB"})`,
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${profile.program_number}/${kind === "logo" ? "logo" : "photos"}/${filename}`;

  const serviceClient = createServiceClient();
  const { error: uploadError } = await serviceClient.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = serviceClient.storage.from(BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}

/**
 * Delete an image from Supabase Storage.
 */
export async function deleteListingImage(
  fileUrl: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("program_number, verified, subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile?.program_number) return { success: false, error: "No listing linked" };

  // Extract the storage path from the public URL
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  let parsed: URL;
  try { parsed = new URL(fileUrl); } catch { return { success: false, error: "Invalid file URL" }; }
  if (parsed.origin !== new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin) return { success: false, error: "Invalid file URL" };
  const idx = parsed.pathname.indexOf(marker);
  if (idx !== 0) return { success: false, error: "Invalid file URL" };

  let path: string;
  try { path = decodeURIComponent(parsed.pathname.slice(marker.length)); } catch { return { success: false, error: "Invalid file URL" }; }
  if (path.split("/").some(segment => segment === ".." || segment === ".")) return { success: false, error: "Invalid file URL" };

  // Verify the path belongs to this user's program number
  if (!path.startsWith(`${profile.program_number}/`)) {
    return { success: false, error: "Not authorized" };
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.storage.from(BUCKET).remove([path]);

  if (error) {
    console.error("Delete error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
