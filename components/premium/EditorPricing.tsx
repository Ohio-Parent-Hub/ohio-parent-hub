"use client";

import { useCallback } from "react";
import type { PremiumPricing, PremiumPricingTier } from "@/lib/premiumTypes";
import { Plus, X } from "lucide-react";

type Props = {
  pricing: PremiumPricing;
  onChange: (pricing: PremiumPricing) => void;
};

const AGE_OPTIONS: { value: number; label: string }[] = [
  { value: 1.5, label: "6 weeks" },
  { value: 3, label: "3 months" },
  { value: 6, label: "6 months" },
  { value: 12, label: "12 months" },
  { value: 18, label: "18 months" },
  { value: 24, label: "2 years" },
  { value: 30, label: "2.5 years" },
  { value: 36, label: "3 years" },
  { value: 48, label: "4 years" },
  { value: 60, label: "5 years" },
  { value: 72, label: "6 years" },
  { value: 84, label: "7 years" },
  { value: 96, label: "8 years" },
  { value: 108, label: "9 years" },
  { value: 120, label: "10 years" },
  { value: 144, label: "12 years" },
];

const PERIOD_OPTIONS: PremiumPricingTier["period"][] = ["weekly", "daily", "monthly"];

const EMPTY_TIER: PremiumPricingTier = {
  label: "",
  age_start: 1.5,
  age_end: 12,
  part_time: null,
  full_time: null,
  period: "weekly",
};

export default function EditorPricing({ pricing, onChange }: Props) {
  const updateTier = useCallback(
    (index: number, update: Partial<PremiumPricingTier>) => {
      const tiers = pricing.tiers.map((t, i) => (i === index ? { ...t, ...update } : t));
      onChange({ ...pricing, tiers });
    },
    [pricing, onChange]
  );

  const addTier = useCallback(() => {
    if (pricing.tiers.length >= 10) return;
    onChange({ ...pricing, tiers: [...pricing.tiers, { ...EMPTY_TIER }] });
  }, [pricing, onChange]);

  const removeTier = useCallback(
    (index: number) => {
      onChange({ ...pricing, tiers: pricing.tiers.filter((_, i) => i !== index) });
    },
    [pricing, onChange]
  );

  const setAdditionalRate = useCallback(
    (key: "drop_in" | "before_after", rate: number | null, period?: PremiumPricingTier["period"]) => {
      const current = pricing.additional_rates[key];
      if (rate === null && !current) return;
      const updated = { ...pricing.additional_rates };
      if (rate === null) {
        delete updated[key];
      } else {
        updated[key] = { rate, period: period ?? current?.period ?? (key === "drop_in" ? "daily" : "weekly") };
      }
      onChange({ ...pricing, additional_rates: updated });
    },
    [pricing, onChange]
  );

  return (
    <div className="space-y-6">
      {/* Age-Based Rates */}
      <div>
        <h3 className="mb-2 text-sm font-semibold" style={{ color: "#4A6B67" }}>
          Age-Based Rates
        </h3>
        <div className="space-y-3">
          {pricing.tiers.map((tier, index) => (
            <div
              key={index}
              className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
              style={{ borderColor: "#B8C5B2" }}
            >
              {/* Label */}
              <input
                type="text"
                value={tier.label}
                onChange={(e) => updateTier(index, { label: e.target.value })}
                placeholder="Label (e.g. Infant)"
                className="w-28 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
              />

              {/* Age range */}
              <select
                value={tier.age_start}
                onChange={(e) => updateTier(index, { age_start: Number(e.target.value) })}
                className="rounded-lg border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2"
                style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
              >
                {AGE_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              <span className="text-xs" style={{ color: "#6B8A86" }}>
                to
              </span>
              <select
                value={tier.age_end}
                onChange={(e) => updateTier(index, { age_end: Number(e.target.value) })}
                className="rounded-lg border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2"
                style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
              >
                {AGE_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>

              {/* Rates */}
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: "#6B8A86" }}>
                  PT $
                </span>
                <input
                  type="number"
                  min={0}
                  value={tier.part_time ?? ""}
                  onChange={(e) =>
                    updateTier(index, {
                      part_time: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="—"
                  className="w-16 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs" style={{ color: "#6B8A86" }}>
                  FT $
                </span>
                <input
                  type="number"
                  min={0}
                  value={tier.full_time ?? ""}
                  onChange={(e) =>
                    updateTier(index, {
                      full_time: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="—"
                  className="w-16 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                />
              </div>

              {/* Period */}
              <select
                value={tier.period}
                onChange={(e) =>
                  updateTier(index, { period: e.target.value as PremiumPricingTier["period"] })
                }
                className="rounded-lg border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2"
                style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeTier(index)}
                className="ml-auto rounded-full p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Remove tier"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {pricing.tiers.length < 10 && (
          <button
            type="button"
            onClick={addTier}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-opacity-10"
            style={{ borderColor: "#7EA8A4", color: "#7EA8A4", backgroundColor: "rgba(126,168,164,0.06)" }}
          >
            <Plus className="h-4 w-4" /> Add age group
          </button>
        )}
      </div>

      {/* Additional Rates */}
      <div>
        <h3 className="mb-2 text-sm font-semibold" style={{ color: "#4A6B67" }}>
          Additional Rates (optional)
        </h3>
        <div className="space-y-2">
          <AdditionalRateRow
            label="Drop-in"
            rate={pricing.additional_rates.drop_in?.rate ?? null}
            period={pricing.additional_rates.drop_in?.period ?? "daily"}
            onRateChange={(r) => setAdditionalRate("drop_in", r)}
            onPeriodChange={(p) =>
              setAdditionalRate("drop_in", pricing.additional_rates.drop_in?.rate ?? 0, p)
            }
          />
          <AdditionalRateRow
            label="Before/After school"
            rate={pricing.additional_rates.before_after?.rate ?? null}
            period={pricing.additional_rates.before_after?.period ?? "weekly"}
            onRateChange={(r) => setAdditionalRate("before_after", r)}
            onPeriodChange={(p) =>
              setAdditionalRate("before_after", pricing.additional_rates.before_after?.rate ?? 0, p)
            }
          />
        </div>
      </div>

      {/* Pricing Notes */}
      <div>
        <h3 className="mb-2 text-sm font-semibold" style={{ color: "#4A6B67" }}>
          Pricing Notes (optional)
        </h3>
        <textarea
          value={pricing.notes ?? ""}
          onChange={(e) => onChange({ ...pricing, notes: e.target.value })}
          rows={2}
          className="w-full rounded-lg border p-3 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#B8C5B2", color: "#4A6B67" }}
          placeholder="e.g., Registration fee: $50. 10% sibling discount. Rates include meals and snacks."
        />
      </div>
    </div>
  );
}

function AdditionalRateRow({
  label,
  rate,
  period,
  onRateChange,
  onPeriodChange,
}: {
  label: string;
  rate: number | null;
  period: PremiumPricingTier["period"];
  onRateChange: (r: number | null) => void;
  onPeriodChange: (p: PremiumPricingTier["period"]) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-36 text-sm" style={{ color: "#4A6B67" }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: "#6B8A86" }}>
        $
      </span>
      <input
        type="number"
        min={0}
        value={rate ?? ""}
        onChange={(e) => onRateChange(e.target.value ? Number(e.target.value) : null)}
        placeholder="—"
        className="w-20 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
        style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
      />
      <select
        value={period}
        onChange={(e) => onPeriodChange(e.target.value as PremiumPricingTier["period"])}
        className="rounded-lg border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2"
        style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
      >
        <option value="daily">daily</option>
        <option value="weekly">weekly</option>
        <option value="monthly">monthly</option>
      </select>
    </div>
  );
}
