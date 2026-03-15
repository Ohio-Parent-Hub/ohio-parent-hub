import { MessageSquare } from "lucide-react";

export default function PremiumOwnerDescription({
  description,
}: {
  description: string;
}) {
  return (
    <section className="px-6 py-4">
      <div className="mx-auto max-w-7xl">
        <div
          className="rounded-2xl border p-6 shadow-sm"
          style={{ background: "#fff", borderColor: "#B8C5B255" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" style={{ color: "#7EA8A4" }} />
            <h2 className="font-serif text-2xl font-bold" style={{ color: "#4A6B67" }}>
              From the Owner
            </h2>
          </div>
          <p
            className="whitespace-pre-line text-sm leading-relaxed"
            style={{ color: "#4A6B67cc" }}
          >
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
