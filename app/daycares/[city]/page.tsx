import type { Metadata } from "next";

type Props = {
  params: { city: string };
};

export function generateMetadata({ params }: Props): Metadata {
  const cityName = decodeURIComponent(params.city).replace(/-/g, " ");
  return {
    title: `Daycares in ${cityName}`,
    description: `Browse licensed daycares in ${cityName}, Ohio.`,
  };
}

export default function CityDaycaresPage({ params }: Props) {
  const cityName = decodeURIComponent(params.city).replace(/-/g, " ");

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Daycares in {cityName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This is a placeholder. Soon this will list daycares in the city and show
        a map view.
      </p>

      <div className="mt-6 rounded-lg border p-4">
        <p className="text-sm">
          Example URL: <span className="font-mono">/daycares/columbus</span>
        </p>
      </div>
    </main>
  );
}
