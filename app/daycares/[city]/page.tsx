import fs from "node:fs";
import path from "node:path";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import CityDashboard from "@/components/CityDashboard";
import type { Metadata } from "next";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
  
  const count = matches.length;
  
  return {
    title: `${count} Licensed Daycares in ${cityDisplay}, Ohio | Ohio Parent Hub`,
    description: `Find ${count} licensed daycare and childcare programs in ${cityDisplay}, OH. Browse SUTQ-rated providers, view program details, addresses, and contact information.`,
    openGraph: {
      title: `Daycares in ${cityDisplay}, Ohio`,
      description: `${count} licensed childcare programs in ${cityDisplay}`,
    },
  };
}

export default async function CityDaycaresPage({ params }: Props) {
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

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <Breadcrumbs 
        items={[
          { label: "Home", href: "/" }, 
          { label: "Cities", href: "/cities" },
          { label: cityDisplay || "City", href: `/daycares/${citySlug}` }
        ]} 
        className="mb-6"
      />
      
      <CityDashboard daycares={matches} cityDisplay={cityDisplay} />
    </main>
  );
}
