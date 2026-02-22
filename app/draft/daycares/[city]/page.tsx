import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import CityDashboard from "@/components/CityDashboard";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ city?: string }> };
type DaycareRow = Record<string, string>;

function prettyCity(city: string) {
  return decodeURIComponent(city || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

export default async function DraftCityDaycaresPage({ params }: Props) {
  const { city } = await params;
  const cityParam = city ?? "";
  const citySlug = cityParam.trim().toLowerCase();
  const cityDisplay = prettyCity(cityParam);

  const all = loadDaycares();
  const matches = all.filter((d) => {
    const dataCitySlug = (d["CITY"] || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    return dataCitySlug === citySlug;
  });

  if (!citySlug || matches.length === 0) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Draft Home", href: "/draft" },
          { label: "Draft Cities", href: "/draft/cities" },
          { label: cityDisplay || "City", href: `/draft/daycares/${citySlug}` },
        ]}
        className="mb-6"
      />

      <section className="mb-8 rounded-2xl border border-primary/20 bg-primary/10 p-6 sm:p-8">
        <Badge variant="outline" className="mb-3 border-primary/40 text-primary">Draft City Overview</Badge>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Draft: Best Daycares in {cityDisplay || "Ohio"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Sandbox page for redesigning local city result layouts and filter UX.
        </p>
      </section>

      <CityDashboard daycares={matches} cityDisplay={cityDisplay} basePath="/draft" />
    </main>
  );
}
