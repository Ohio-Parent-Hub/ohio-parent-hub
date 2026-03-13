import type { PremiumListingData } from "@/lib/premiumTypes";

function placeholderImage(label: string, color: string, w = 800, h = 600): string {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect fill="${color}" width="${w}" height="${h}"/><text fill="white" font-family="system-ui,sans-serif" font-size="28" x="${w / 2}" y="${h / 2}" text-anchor="middle" dy=".3em">${label}</text></svg>`
  )}`;
}

export const MOCK_PREMIUM_LISTING: PremiumListingData = {
  logo_url: placeholderImage("Logo", "#4A6B67", 512, 512),
  photos: [
    placeholderImage("Main Entrance", "#7EA8A4"),
    placeholderImage("Classroom", "#E8A0AC"),
    placeholderImage("Playground", "#DCB346"),
    placeholderImage("Art Room", "#B8C5B2"),
    placeholderImage("Reading Corner", "#4A6B67"),
    placeholderImage("Outdoor Play", "#7EA8A4"),
  ],
  hours: {
    mon: { open: true, ranges: [["07:00", "18:00"]] },
    tue: { open: true, ranges: [["07:00", "18:00"]] },
    wed: { open: true, ranges: [["07:00", "12:00"], ["14:00", "18:00"]] },
    thu: { open: true, ranges: [["07:00", "18:00"]] },
    fri: { open: true, ranges: [["07:00", "17:30"]] },
    sat: { open: true, ranges: [["08:00", "13:00"]] },
    sun: { open: false, ranges: [] },
  },
  pricing: {
    tiers: [
      { label: "Infant", age_start: 1.5, age_end: 12, part_time: 225, full_time: 325, period: "weekly" },
      { label: "Toddler", age_start: 12, age_end: 36, part_time: 190, full_time: 275, period: "weekly" },
      { label: "Preschool", age_start: 36, age_end: 60, part_time: 175, full_time: 250, period: "weekly" },
      { label: "School-age", age_start: 60, age_end: 144, part_time: 125, full_time: 175, period: "weekly" },
    ],
    additional_rates: {
      drop_in: { rate: 75, period: "daily" },
      before_after: { rate: 125, period: "weekly" },
    },
    notes: "Registration fee: $50. 10% sibling discount. Rates include meals and snacks.",
  },
  amenities: {
    checked: [
      "diapers_provided",
      "wipes_provided",
      "breakfast",
      "lunch",
      "morning_snack",
      "afternoon_snack",
      "outdoor_playground",
      "fenced_playground",
      "indoor_play_area",
      "security_cameras",
      "keypad_entry",
      "live_parent_camera",
      "parent_communication_app",
      "structured_curriculum",
      "arts_and_crafts",
      "music_and_movement",
      "part_time_care",
      "full_time_care",
      "before_school_care",
      "after_school_care",
      "summer_care",
    ],
    text_fields: {
      live_parent_camera: "WatchMeGrow",
      parent_communication_app: "Brightwheel",
    },
    custom: [
      { label: "Languages Spoken", value: "English, Spanish" },
      { label: "Pet Policy", value: "Classroom guinea pig" },
    ],
  },
  custom_faqs: [
    {
      question: "What is your sick child policy?",
      answer:
        "Children must be symptom-free for 24 hours before returning to care. If your child develops a fever, vomiting, or other symptoms during the day, we'll contact you for pickup within 30 minutes.",
    },
    {
      question: "Do you offer potty training support?",
      answer:
        "Yes! We work with families to establish a consistent potty training routine. We ask that you send extra clothes and pull-ups, and we'll follow your preferred approach throughout the day.",
    },
    {
      question: "What does a typical day look like?",
      answer:
        "Our day includes structured learning, free play, outdoor time, meals, and rest. Infants follow their own schedule. Toddlers and preschoolers have circle time, art projects, music, and story time built into each day.",
    },
  ],
  description:
    "Welcome to our family-centered daycare! We've been serving families in the community for over 15 years. Our experienced, caring staff focus on creating a warm, stimulating environment where every child can learn, play, and grow. We believe in hands-on learning through play, with a structured curriculum that prepares children for kindergarten and beyond. Our low teacher-to-child ratios ensure your child receives the individual attention they deserve.",
  website_url: "https://example-daycare.com",
};

/** Set this to a real PROGRAM NUMBER from daycares.json to preview the premium UI */
export const MOCK_PREMIUM_PROGRAM_NUMBER = "2190020840";
