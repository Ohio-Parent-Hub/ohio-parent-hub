import { Heart } from "lucide-react";

export default function PremiumOwnerDescription({
  description,
}: {
  description: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 shadow-sm"
      style={{ background: "linear-gradient(135deg, #FDF6F0 0%, #F9EEF1 50%, #F0F4F3 100%)", borderColor: "#E8A0AC55" }}
    >
      <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full" style={{ background: "#E8A0AC15" }} />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full" style={{ background: "#DCB34615" }} />

      <div className="relative mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "#E8A0AC20" }}>
          <Heart className="h-4.5 w-4.5" style={{ color: "#E8A0AC", fill: "#E8A0AC" }} />
        </div>
        <h2 className="font-serif text-2xl font-bold" style={{ color: "#4A6B67" }}>
          From the Owner
        </h2>
      </div>
      <p
        className="relative whitespace-pre-line text-sm leading-relaxed"
        style={{ color: "#4A6B67cc" }}
      >
        {description}
      </p>
    </div>
  );
}
