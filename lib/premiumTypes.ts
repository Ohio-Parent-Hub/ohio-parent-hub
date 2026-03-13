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
