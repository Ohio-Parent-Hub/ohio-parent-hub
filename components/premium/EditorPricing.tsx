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
              className="rounded-lg border px-3 py-2.5"
              style={{ borderColor: "#B8C5B2" }}
            >
              {/* Desktop: single row */}
              <div className="hidden sm:flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={tier.label}
                  onChange={(e) => updateTier(index, { label: e.target.value })}
                  placeholder="e.g. Infant"
                  className="w-24 min-w-0 rounded-md border px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                />
                <select
                  value={tier.age_start}
                  onChange={(e) => updateTier(index, { age_start: Number(e.target.value) })}
                  className="rounded-md border bg-white px-1.5 py-1.5 text-xs focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                >
                  {AGE_OPTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px]" style={{ color: "#6B8A86" }}>to</span>
                <select
                  value={tier.age_end}
                  onChange={(e) => updateTier(index, { age_end: Number(e.target.value) })}
                  className="rounded-md border bg-white px-1.5 py-1.5 text-xs focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                >
                  {AGE_OPTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <span className="text-[11px]" style={{ color: "#6B8A86" }}>PT$</span>
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
                    className="w-16 min-w-0 rounded-md border px-2 py-1.5 text-xs focus:outline-none focus:ring-2"
                    style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px]" style={{ color: "#6B8A86" }}>FT$</span>
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
                    className="w-16 min-w-0 rounded-md border px-2 py-1.5 text-xs focus:outline-none focus:ring-2"
                    style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                  />
                </div>
                <select
                  value={tier.period}
                  onChange={(e) =>
                    updateTier(index, { period: e.target.value as PremiumPricingTier["period"] })
                  }
                  className="rounded-md border bg-white px-1.5 py-1.5 text-xs focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                >
                  {PERIOD_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeTier(index)}
                  className="ml-auto rounded-full p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove tier"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Mobile: 3 rows */}
              <div className="sm:hidden space-y-2">
                {/* Row 1: Label + Period + Delete */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tier.label}
                    onChange={(e) => updateTier(index, { label: e.target.value })}
                    placeholder="e.g. Infant"
                    className="flex-1 min-w-0 rounded-md border px-2 py-1.5 text-xs focus:outline-none focus:ring-2"
                    style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                  />
                  <select
                    value={tier.period}
                    onChange={(e) =>
                      updateTier(index, { period: e.target.value as PremiumPricingTier["period"] })
                    }
                    className="shrink-0 rounded-md border bg-white px-1.5 py-1.5 text-xs focus:outline-none focus:ring-2"
                    style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                  >
                    {PERIOD_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeTier(index)}
                    className="shrink-0 rounded-full p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove tier"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* Row 2: Ages */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] shrink-0" style={{ color: "#6B8A86" }}>Ages</span>
                  <select
                    value={tier.age_start}
                    onChange={(e) => updateTier(index, { age_start: Number(e.target.value) })}
                    className="flex-1 min-w-0 rounded-md border bg-white px-1.5 py-1.5 text-xs focus:outline-none focus:ring-2"
                    style={{ borderColor: "#D5E5E3", color: "#4A6B67", marginRight: "-4px" }}
                  >
                    {AGE_OPTIONS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] shrink-0" style={{ color: "#6B8A86" }}>to</span>
                  <select
                    value={tier.age_end}
                    onChange={(e) => updateTier(index, { age_end: Number(e.target.value) })}
                    className="flex-1 min-w-0 rounded-md border bg-white px-1.5 py-1.5 text-xs focus:outline-none focus:ring-2"
                    style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                  >
                    {AGE_OPTIONS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Row 3: Prices */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-1 min-w-0">
                    <span className="text-[11px] shrink-0" style={{ color: "#6B8A86" }}>PT$</span>
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
                      className="flex-1 min-w-0 rounded-md border px-2 py-1.5 text-xs focus:outline-none focus:ring-2"
                      style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                    />
                  </div>
                  <div className="flex flex-1 items-center gap-1 min-w-0">
                    <span className="text-[11px] shrink-0" style={{ color: "#6B8A86" }}>FT$</span>
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
                      className="flex-1 min-w-0 rounded-md border px-2 py-1.5 text-xs focus:outline-none focus:ring-2"
                      style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                    />
                  </div>
                </div>
              </div>
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
          Additional Rates
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
          Pricing Notes
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
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="w-24 sm:w-36 text-xs sm:text-sm shrink-0" style={{ color: "#4A6B67" }}>
        {label}
      </span>
      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0 shrink-0">
        <span className="text-xs sm:text-sm" style={{ color: "#6B8A86" }}>
          $
        </span>
        <input
          type="number"
          min={0}
          value={rate ?? ""}
          onChange={(e) => onRateChange(e.target.value ? Number(e.target.value) : null)}
          placeholder="—"
          className="w-16 sm:w-20 rounded-lg border px-2 sm:px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
        />
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as PremiumPricingTier["period"])}
          className="rounded-lg border bg-white px-1 sm:px-3 py-1.5 text-[11px] sm:text-xs focus:outline-none focus:ring-2"
          style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
        >
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
        </select>
      </div>
    </div>
  );
}
