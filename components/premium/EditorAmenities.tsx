"use client";

import { useCallback } from "react";
import type { PremiumAmenitiesData } from "@/lib/premiumTypes";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  amenities: PremiumAmenitiesData;
  onChange: (amenities: PremiumAmenitiesData) => void;
};

type AmenityItem = {
  key: string;
  label: string;
  hasTextField?: boolean;
  textPlaceholder?: string;
};

type AmenityCategory = {
  name: string;
  items: AmenityItem[];
};

const AMENITY_CATEGORIES: AmenityCategory[] = [
  {
    name: "Daily Essentials",
    items: [
      { key: "diapers_provided", label: "Diapers provided" },
      { key: "wipes_provided", label: "Wipes provided" },
      { key: "crib_sheets_provided", label: "Crib sheets provided" },
      { key: "car_seat_storage", label: "Car seat storage" },
    ],
  },
  {
    name: "Meals & Feeding",
    items: [
      { key: "breakfast", label: "Breakfast" },
      { key: "lunch", label: "Lunch" },
      { key: "morning_snack", label: "Morning snack" },
      { key: "afternoon_snack", label: "Afternoon snack" },
      { key: "baby_food_provided", label: "Baby food provided" },
      { key: "formula_provided", label: "Formula provided" },
    ],
  },
  {
    name: "Facilities & Safety",
    items: [
      { key: "outdoor_playground", label: "Outdoor playground" },
      { key: "fenced_playground", label: "Fenced playground" },
      { key: "indoor_play_area", label: "Indoor play area" },
      { key: "security_cameras", label: "Security cameras" },
      { key: "keypad_entry", label: "Keypad entry" },
      {
        key: "live_parent_camera",
        label: "Live parent camera access",
        hasTextField: true,
        textPlaceholder: "System name (e.g. WatchMeGrow)",
      },
    ],
  },
  {
    name: "Communication",
    items: [
      {
        key: "parent_communication_app",
        label: "Parent communication app",
        hasTextField: true,
        textPlaceholder: "App name (e.g. Brightwheel)",
      },
    ],
  },
  {
    name: "Programs & Learning",
    items: [
      { key: "structured_curriculum", label: "Structured curriculum" },
      { key: "stem_activities", label: "STEM activities" },
      { key: "arts_and_crafts", label: "Arts & crafts" },
      { key: "music_and_movement", label: "Music & movement" },
      { key: "field_trips", label: "Field trips" },
    ],
  },
  {
    name: "Scheduling & Flexibility",
    items: [
      { key: "part_time_care", label: "Part-time care" },
      { key: "full_time_care", label: "Full-time care" },
      { key: "before_school_care", label: "Before-school care" },
      { key: "after_school_care", label: "After-school care" },
      { key: "drop_in_care", label: "Drop-in care" },
      { key: "weekend_hours", label: "Weekend hours" },
      { key: "evening_care", label: "Evening care" },
      { key: "overnight_care", label: "Overnight care" },
      { key: "summer_care", label: "Summer care (school-age)" },
      { key: "transportation_available", label: "Transportation available" },
    ],
  },
];

const MAX_CUSTOM = 5;

export default function EditorAmenities({ amenities, onChange }: Props) {
  const toggleChecked = useCallback(
    (key: string) => {
      const checked = amenities.checked.includes(key)
        ? amenities.checked.filter((k) => k !== key)
        : [...amenities.checked, key];
      // Also clear text field if unchecked
      const text_fields = { ...amenities.text_fields };
      if (!checked.includes(key)) {
        delete text_fields[key];
      }
      onChange({ ...amenities, checked, text_fields });
    },
    [amenities, onChange]
  );

  const setTextField = useCallback(
    (key: string, value: string) => {
      onChange({
        ...amenities,
        text_fields: { ...amenities.text_fields, [key]: value },
      });
    },
    [amenities, onChange]
  );

  const addCustom = useCallback(() => {
    if (amenities.custom.length >= MAX_CUSTOM) return;
    onChange({
      ...amenities,
      custom: [...amenities.custom, { label: "", value: "" }],
    });
  }, [amenities, onChange]);

  const updateCustom = useCallback(
    (index: number, field: "label" | "value", val: string) => {
      const custom = amenities.custom.map((c, i) =>
        i === index ? { ...c, [field]: val } : c
      );
      onChange({ ...amenities, custom });
    },
    [amenities, onChange]
  );

  const removeCustom = useCallback(
    (index: number) => {
      onChange({
        ...amenities,
        custom: amenities.custom.filter((_, i) => i !== index),
      });
    },
    [amenities, onChange]
  );

  return (
    <div className="space-y-6">
      {AMENITY_CATEGORIES.map((cat) => (
        <div key={cat.name}>
          <h3
            className="mb-2 text-xs font-bold uppercase tracking-wider"
            style={{ color: "#7EA8A4" }}
          >
            {cat.name}
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {cat.items.map((item) => {
              const isChecked = amenities.checked.includes(item.key);
              return (
                <div key={item.key}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleChecked(item.key)}
                    />
                    <span
                      className="text-sm"
                      style={{ color: isChecked ? "#4A6B67" : "#6B8A86" }}
                    >
                      {item.label}
                    </span>
                  </label>
                  {item.hasTextField && isChecked && (
                    <input
                      type="text"
                      value={amenities.text_fields[item.key] ?? ""}
                      onChange={(e) => setTextField(item.key, e.target.value)}
                      placeholder={item.textPlaceholder}
                      className="ml-6 mt-1 w-56 rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2"
                      style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom amenities */}
      <div>
        <h3
          className="mb-2 text-xs font-bold uppercase tracking-wider"
          style={{ color: "#7EA8A4" }}
        >
          Additional Details
        </h3>
        <div className="space-y-2">
          {amenities.custom.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={c.label}
                onChange={(e) => updateCustom(i, "label", e.target.value)}
                placeholder="Label (e.g. Languages Spoken)"
                className="w-44 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
              />
              <input
                type="text"
                value={c.value}
                onChange={(e) => updateCustom(i, "value", e.target.value)}
                placeholder="Value (e.g. English, Spanish)"
                className="flex-1 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
              />
              <button
                type="button"
                onClick={() => removeCustom(i)}
                className="rounded-full p-1 text-red-400 hover:text-red-600"
                aria-label="Remove custom amenity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {amenities.custom.length < MAX_CUSTOM && (
          <button
            type="button"
            onClick={addCustom}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-opacity-10"
            style={{ borderColor: "#7EA8A4", color: "#7EA8A4", backgroundColor: "rgba(126,168,164,0.06)" }}
          >
            <Plus className="h-4 w-4" /> Add custom detail
          </button>
        )}
      </div>
    </div>
  );
}
