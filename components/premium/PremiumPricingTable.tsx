import { DollarSign } from "lucide-react";
import type { PremiumPricing } from "@/lib/premiumTypes";

function formatAge(months: number): string {
  if (months < 2) return "6 weeks";
  if (months < 24) return `${months} mo`;
  const years = months / 12;
  return `${years} yrs`;
}

function formatRate(value: number | null): string {
  if (value === null) return "—";
  return `$${value}`;
}

export default function PremiumPricingTable({ pricing }: { pricing: PremiumPricing }) {
  const hasPT = pricing.tiers.some((t) => t.part_time !== null);
  const hasFT = pricing.tiers.some((t) => t.full_time !== null);

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <DollarSign className="h-5 w-5" style={{ color: "#7EA8A4" }} />
        <h3 className="font-serif text-2xl font-bold" style={{ color: "#4A6B67" }}>
          Pricing
        </h3>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1 overflow-hidden rounded-xl border" style={{ borderColor: "#B8C5B255" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#D5E5E3" }}>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: "#4A6B67" }}>
                  Age Group
                </th>
                <th className="px-4 py-2.5 text-left font-semibold" style={{ color: "#4A6B67" }}>
                  Ages
                </th>
                {hasPT && (
                  <th className="px-4 py-2.5 text-right font-semibold" style={{ color: "#4A6B67" }}>
                    Part-Time
                  </th>
                )}
                {hasFT && (
                  <th className="px-4 py-2.5 text-right font-semibold" style={{ color: "#4A6B67" }}>
                    Full-Time
                  </th>
                )}
                <th className="px-4 py-2.5 text-right font-semibold" style={{ color: "#4A6B67" }}>
                  Per
                </th>
              </tr>
            </thead>
            <tbody>
              {pricing.tiers.map((tier, i) => (
                <tr key={i} className="border-t" style={{ borderColor: "#B8C5B222" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "#4A6B67" }}>
                    {tier.label}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#4A6B67cc" }}>
                    {formatAge(tier.age_start)} – {formatAge(tier.age_end)}
                  </td>
                  {hasPT && (
                    <td className="px-4 py-3 text-right font-medium" style={{ color: "#4A6B67" }}>
                      {formatRate(tier.part_time)}
                    </td>
                  )}
                  {hasFT && (
                    <td className="px-4 py-3 text-right font-medium" style={{ color: "#4A6B67" }}>
                      {formatRate(tier.full_time)}
                    </td>
                  )}
                  <td
                    className="px-4 py-3 text-right text-xs capitalize"
                    style={{ color: "#4A6B6788" }}
                  >
                    {tier.period}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(pricing.additional_rates.drop_in || pricing.additional_rates.before_after) && (
          <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border lg:w-64" style={{ borderColor: "#B8C5B255" }}>
            <div className="px-4 py-2.5 text-center font-semibold" style={{ background: "#D5E5E3", color: "#4A6B67" }}>
              Additional Rates
            </div>
            <div className="flex flex-col items-center space-y-4 p-4 text-sm">
              {pricing.additional_rates.drop_in && (
                <div className="text-center">
                  <div style={{ color: "#4A6B67cc" }}>Drop-in</div>
                  <div className="mt-1 font-medium" style={{ color: "#4A6B67" }}>
                    ${pricing.additional_rates.drop_in.rate}/{pricing.additional_rates.drop_in.period}
                  </div>
                </div>
              )}
              {pricing.additional_rates.before_after && (
                <div className="text-center">
                  <div style={{ color: "#4A6B67cc" }}>Before/After school</div>
                  <div className="mt-1 font-medium" style={{ color: "#4A6B67" }}>
                    ${pricing.additional_rates.before_after.rate}/
                    {pricing.additional_rates.before_after.period}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {pricing.notes && (
        <p className="px-1 text-sm italic" style={{ color: "#4A6B6799" }}>
          {pricing.notes}
        </p>
      )}
    </div>
  );
}
