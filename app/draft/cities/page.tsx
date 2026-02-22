import fs from "node:fs";
import path from "node:path";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { slugify } from "@/lib/utils";
import CityBrowseClient from "@/components/CityBrowseClient";

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

interface CityData {
  name: string;
  slug: string;
  count: number;
}

export default function DraftCitiesPage() {
  const daycares = loadDaycares();

  const cityMap = new Map<string, number>();
  daycares.forEach((d) => {
    const city = d["CITY"];
    if (city) cityMap.set(city, (cityMap.get(city) || 0) + 1);
  });

  const allCities: CityData[] = Array.from(cityMap.entries())
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <Breadcrumbs
            items={[
              { label: "Draft Home", href: "/draft" },
              { label: "Draft Cities", href: "/draft/cities" },
            ]}
            className="mb-6"
          />

          <h1 className="font-serif text-4xl font-bold text-primary mb-4">
            Draft: Find the Best Daycares by City in Ohio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Sandbox page for redesigning the city discovery experience across {allCities.length} Ohio cities.
          </p>
        </div>

        <CityBrowseClient allCities={allCities} basePath="/draft" />
      </div>
    </div>
  );
}
