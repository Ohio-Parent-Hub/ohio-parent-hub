import { Check, Sparkles } from "lucide-react";
import type { PremiumAmenitiesData } from "@/lib/premiumTypes";

const AMENITY_LABELS: Record<string, string> = {
  diapers_provided: "Diapers Provided",
  wipes_provided: "Wipes Provided",
  crib_sheets_provided: "Crib Sheets Provided",
  car_seat_storage: "Car Seat Storage",
  breakfast: "Breakfast",
  lunch: "Lunch",
  morning_snack: "Morning Snack",
  afternoon_snack: "Afternoon Snack",
  baby_food_provided: "Baby Food Provided",
  formula_provided: "Formula Provided",
  outdoor_playground: "Outdoor Playground",
  fenced_playground: "Fenced Playground",
  indoor_play_area: "Indoor Play Area",
  security_cameras: "Security Cameras",
  keypad_entry: "Keypad Entry",
  live_parent_camera: "Live Parent Camera",
  parent_communication_app: "Parent Communication App",
  structured_curriculum: "Structured Curriculum",
  stem_activities: "STEM Activities",
  arts_and_crafts: "Arts & Crafts",
  music_and_movement: "Music & Movement",
  field_trips: "Field Trips",
  part_time_care: "Part-Time Care",
  full_time_care: "Full-Time Care",
  before_school_care: "Before-School Care",
  after_school_care: "After-School Care",
  drop_in_care: "Drop-In Care",
  weekend_hours: "Weekend Hours",
  evening_care: "Evening Care",
  overnight_care: "Overnight Care",
  summer_care: "Summer Care",
  transportation_available: "Transportation Available",
};

const AMENITY_CATEGORIES: { label: string; keys: string[] }[] = [
  {
    label: "Daily Essentials",
    keys: ["diapers_provided", "wipes_provided", "crib_sheets_provided", "car_seat_storage"],
  },
  {
    label: "Meals & Feeding",
    keys: [
      "breakfast",
      "lunch",
      "morning_snack",
      "afternoon_snack",
      "baby_food_provided",
      "formula_provided",
    ],
  },
  {
    label: "Facilities & Safety",
    keys: [
      "outdoor_playground",
      "fenced_playground",
      "indoor_play_area",
      "security_cameras",
      "keypad_entry",
      "live_parent_camera",
    ],
  },
  {
    label: "Communication",
    keys: ["parent_communication_app"],
  },
  {
    label: "Programs & Learning",
    keys: [
      "structured_curriculum",
      "stem_activities",
      "arts_and_crafts",
      "music_and_movement",
      "field_trips",
    ],
  },
  {
    label: "Scheduling & Flexibility",
    keys: [
      "part_time_care",
      "full_time_care",
      "before_school_care",
      "after_school_care",
      "drop_in_care",
      "weekend_hours",
      "evening_care",
      "overnight_care",
      "summer_care",
      "transportation_available",
    ],
  },
];

export default function PremiumAmenities({
  amenities,
}: {
  amenities: PremiumAmenitiesData;
}) {
  const checkedSet = new Set(amenities.checked);
  const activeCategories = AMENITY_CATEGORIES.filter((cat) =>
    cat.keys.some((key) => checkedSet.has(key))
  );

  if (activeCategories.length === 0 && amenities.custom.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4" style={{ color: "#7EA8A4" }} />
        <h3 className="font-serif text-lg font-semibold" style={{ color: "#4A6B67" }}>
          Amenities & Services
        </h3>
      </div>

      <div className="space-y-4">
        {activeCategories.map((category) => {
          const activeKeys = category.keys.filter((key) => checkedSet.has(key));
          if (activeKeys.length === 0) return null;
          return (
            <div key={category.label}>
              <h4
                className="mb-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#7EA8A4" }}
              >
                {category.label}
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeKeys.map((key) => {
                  const textExtra = amenities.text_fields[key];
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                      style={{
                        borderColor: "#7EA8A455",
                        color: "#4A6B67",
                        background: "#D5E5E320",
                      }}
                    >
                      <Check className="h-3 w-3" style={{ color: "#7EA8A4" }} />
                      {AMENITY_LABELS[key] || key}
                      {textExtra && (
                        <span className="ml-0.5 text-[10px]" style={{ color: "#4A6B6788" }}>
                          ({textExtra})
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}

        {amenities.custom.length > 0 && (
          <div>
            <h4
              className="mb-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#7EA8A4" }}
            >
              Additional Details
            </h4>
            <div className="flex flex-wrap gap-2">
              {amenities.custom.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                  style={{
                    borderColor: "#DCB34655",
                    color: "#4A6B67",
                    background: "#DCB34610",
                  }}
                >
                  <span className="font-semibold">{item.label}:</span> {item.value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
