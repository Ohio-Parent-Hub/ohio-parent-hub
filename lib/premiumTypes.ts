export type PremiumHoursDay = {
  open: boolean;
  ranges: [string, string][];
};

export type PremiumHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  PremiumHoursDay
>;

export type PremiumPricingTier = {
  label: string;
  age_start: number;
  age_end: number;
  part_time: number | null;
  full_time: number | null;
  period: "weekly" | "daily" | "monthly";
};

export type PremiumPricing = {
  tiers: PremiumPricingTier[];
  additional_rates: {
    drop_in?: { rate: number; period: "weekly" | "daily" | "monthly" };
    before_after?: { rate: number; period: "weekly" | "daily" | "monthly" };
  };
  notes?: string;
};

export type PremiumAmenitiesData = {
  checked: string[];
  text_fields: Record<string, string>;
  custom: { label: string; value: string }[];
};

export type PremiumFaq = {
  question: string;
  answer: string;
};

export type PremiumListingData = {
  logo_url?: string;
  photos: string[];
  hours?: PremiumHours;
  pricing?: PremiumPricing;
  amenities?: PremiumAmenitiesData;
  custom_faqs: PremiumFaq[];
  description?: string;
  website_url?: string;
};

/** Slim summary used by filter chips — one per published listing. */
export type PremiumFilterSummary = {
  /** Broadest age range across all pricing tiers [minMonths, maxMonths] */
  ageRange: [number, number] | null;
  /** [min, max] weekly rate (normalized from daily ×5, monthly ÷4.33) */
  priceRange: [number, number] | null;
  /** Amenity codes present (includes schedule codes) */
  amenities: string[];
  /** Whether the listing has at least one photo */
  hasPhotos: boolean;
};
