"use client";

import { useCallback } from "react";
import type { PremiumHours, PremiumHoursDay } from "@/lib/premiumTypes";
import { Plus, X, Copy } from "lucide-react";

type Props = {
  hours: PremiumHours;
  onChange: (hours: PremiumHours) => void;
};

const DAY_KEYS: (keyof PremiumHours)[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<keyof PremiumHours, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

// 15-minute increments from 5:00 AM to 11:45 PM
function buildTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 5; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const val = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const label = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
      options.push({ value: val, label });
    }
  }
  return options;
}

const TIME_OPTIONS = buildTimeOptions();

export default function EditorHours({ hours, onChange }: Props) {
  const updateDay = useCallback(
    (day: keyof PremiumHours, update: Partial<PremiumHoursDay>) => {
      onChange({
        ...hours,
        [day]: { ...hours[day], ...update },
      });
    },
    [hours, onChange]
  );

  const toggleDay = useCallback(
    (day: keyof PremiumHours) => {
      const current = hours[day];
      if (current.open) {
        updateDay(day, { open: false, ranges: [] });
      } else {
        updateDay(day, { open: true, ranges: [["", ""]] });
      }
    },
    [hours, updateDay]
  );

  const setRangeTime = useCallback(
    (day: keyof PremiumHours, rangeIndex: number, field: 0 | 1, value: string) => {
      const ranges = [...hours[day].ranges.map((r) => [...r] as [string, string])];
      ranges[rangeIndex][field] = value;
      updateDay(day, { ranges });
    },
    [hours, updateDay]
  );

  const addRange = useCallback(
    (day: keyof PremiumHours) => {
      if (hours[day].ranges.length >= 2) return;
      updateDay(day, { ranges: [...hours[day].ranges, ["", ""]] });
    },
    [hours, updateDay]
  );

  const removeRange = useCallback(
    (day: keyof PremiumHours, rangeIndex: number) => {
      const ranges = hours[day].ranges.filter((_, i) => i !== rangeIndex);
      updateDay(day, { ranges: ranges.length > 0 ? ranges : [["", ""]] });
    },
    [hours, updateDay]
  );

  const copyToWeekdays = useCallback(
    (sourceDay: keyof PremiumHours) => {
      const source = hours[sourceDay];
      const weekdays: (keyof PremiumHours)[] = ["mon", "tue", "wed", "thu", "fri"];
      const updated = { ...hours };
      for (const day of weekdays) {
        updated[day] = { open: source.open, ranges: source.ranges.map((r) => [...r] as [string, string]) };
      }
      onChange(updated);
    },
    [hours, onChange]
  );

  return (
    <div className="space-y-2">
      {DAY_KEYS.map((day) => {
        const dayData = hours[day];
        return (
          <div
            key={day}
            className="rounded-lg border p-3"
            style={{
              borderColor: dayData.open ? "#B8C5B2" : "#E5E7EB",
              backgroundColor: dayData.open ? "white" : "#F9FAFB",
            }}
          >
            <div className="flex items-center gap-3">
              {/* Day label */}
              <span
                className="w-24 text-sm font-medium"
                style={{ color: dayData.open ? "#4A6B67" : "#9CA3AF" }}
              >
                {DAY_LABELS[day]}
              </span>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => toggleDay(day)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: dayData.open ? "#D5E5E3" : "#F3F4F6",
                  color: dayData.open ? "#4A6B67" : "#9CA3AF",
                }}
              >
                {dayData.open ? "Open" : "Closed"}
              </button>

              {/* Time ranges (when open) */}
              {dayData.open && (
                <div className="flex flex-1 flex-col gap-1">
                  {dayData.ranges.map((range, ri) => (
                    <div key={ri} className="flex items-center gap-1.5">
                      <TimeSelect
                        value={range[0]}
                        onChange={(v) => setRangeTime(day, ri, 0, v)}
                        placeholder="Open"
                      />
                      <span className="text-xs" style={{ color: "#6B8A86" }}>
                        —
                      </span>
                      <TimeSelect
                        value={range[1]}
                        onChange={(v) => setRangeTime(day, ri, 1, v)}
                        placeholder="Close"
                      />
                      {ri > 0 && (
                        <button
                          type="button"
                          onClick={() => removeRange(day, ri)}
                          className="ml-1 rounded-full p-0.5 text-red-400 hover:text-red-600"
                          aria-label="Remove time range"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add split hours */}
              {dayData.open && dayData.ranges.length < 2 && (
                <button
                  type="button"
                  onClick={() => addRange(day)}
                  className="flex items-center gap-1 text-xs hover:underline"
                  style={{ color: "#7EA8A4" }}
                >
                  <Plus className="h-3 w-3" /> Split
                </button>
              )}

              {/* Copy to weekdays */}
              {dayData.open && (
                <button
                  type="button"
                  onClick={() => copyToWeekdays(day)}
                  className="flex items-center gap-1 text-xs hover:underline"
                  style={{ color: "#7EA8A4" }}
                  title="Copy to all weekdays (Mon–Fri)"
                >
                  <Copy className="h-3 w-3" /> Copy M–F
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimeSelect({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1"
      style={{ borderColor: "#B8C5B2", color: value ? "#4A6B67" : "#9CA3AF" }}
    >
      <option value="">{placeholder}</option>
      {TIME_OPTIONS.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );
}
