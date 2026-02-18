import type { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export function generateMetadata({ params }: Props): Metadata {
  // We'll replace this with real daycare data later.
  return {
    title: `Daycare ${params.slug}`,
    description: "Ohio Parent Hub daycare listing.",
  };
}

export default function DaycarePage({ params }: Props) {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Daycare Detail (placeholder)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Slug: <span className="font-mono">{params.slug}</span>
      </p>

      <div className="mt-6 rounded-lg border p-4">
        <p className="text-sm">
          This page will show daycare info + a map pin.
        </p>
      </div>
    </main>
  );
}
