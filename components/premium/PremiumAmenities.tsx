import { Check, Sparkles, Baby, UtensilsCrossed, ShieldCheck, MessageCircle, GraduationCap, CalendarClock, Star } from "lucide-react";
import type { PremiumAmenitiesData } from "@/lib/premiumTypes";
import type { LucideIcon } from "lucide-react";

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
  handicap_accessible: "Handicap Accessible",
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

const AMENITY_CATEGORIES: { label: string; icon: LucideIcon; keys: string[] }[] = [
  {
    label: "Daily Essentials",
    icon: Baby,
    keys: ["diapers_provided", "wipes_provided", "crib_sheets_provided", "car_seat_storage"],
  },
  {
    label: "Meals & Feeding",
    icon: UtensilsCrossed,
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
    icon: ShieldCheck,
    keys: [
      "outdoor_playground",
      "fenced_playground",
      "indoor_play_area",
      "security_cameras",
      "keypad_entry",
      "handicap_accessible",
    ],
  },
  {
    label: "Communication",
    icon: MessageCircle,
    keys: ["parent_communication_app", "live_parent_camera"],
  },
  {
    label: "Programs & Learning",
    icon: GraduationCap,
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
    icon: CalendarClock,
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
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5" style={{ color: "#7EA8A4" }} />
        <h3 className="font-serif text-2xl font-bold" style={{ color: "#4A6B67" }}>
          Amenities & Services
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {activeCategories.map((category) => {
          const activeKeys = category.keys.filter((key) => checkedSet.has(key));
          if (activeKeys.length === 0) return null;
          return (
            <div
              key={category.label}
              className="rounded-xl p-4"
              style={{ backgroundColor: "#F8F6F2" }}
            >
              <h4
                className="mb-2.5 flex items-center gap-1.5 text-[15px] font-semibold"
                style={{ color: "#4A6B67" }}
              >
                <category.icon className="h-4 w-4" style={{ color: "#7EA8A4" }} />
                {category.label}
              </h4>
              <div className="space-y-1">
                {activeKeys.map((key) => {
                  const textExtra = amenities.text_fields[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "#3D5A56" }}
                    >
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "#7EA8A4" }} />
                      <span>{AMENITY_LABELS[key] || key}</span>
                      {textExtra && (
                        <span className="text-xs" style={{ color: "#4A6B6799" }}>
                          ({textExtra})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {amenities.custom.length > 0 && (
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "#F8F6F2" }}
          >
            <h4
              className="mb-2.5 flex items-center gap-1.5 text-[15px] font-semibold"
              style={{ color: "#4A6B67" }}
            >
              <Star className="h-4 w-4" style={{ color: "#DCB346" }} />
              Additional Details
            </h4>
            <div className="space-y-1">
              {amenities.custom.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "#3D5A56" }}
                >
                  <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "#DCB346" }} />
                  <span className="font-semibold">{item.label}:</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
