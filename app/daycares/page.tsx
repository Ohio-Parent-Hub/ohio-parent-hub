import type { Metadata } from "next";
import DraftDaycaresPageClient from "@/components/DraftDaycaresPageClient";
import fs from "node:fs";
import path from "node:path";
import { resolveCanonicalCityName } from "@/lib/metroAreas";

export const metadata: Metadata = {
  title: "Best Daycares in Ohio | Search Licensed Child Care Near You",
  description: "Search and filter over 8,000 licensed daycare and childcare programs in Ohio. Compare providers by city, county, SUTQ rating, and program type.",
  keywords: [
    "best daycares in ohio",
    "licensed daycare ohio",
    "childcare near me",
    "ohio childcare search",
    "top rated daycare ohio",
  ],
  alternates: {
    canonical: "/daycares",
  },
  openGraph: {
    title: "Best Daycares in Ohio | Search Licensed Child Care",
    description: "Search and compare licensed childcare providers across Ohio with city and quality filters.",
    url: "https://ohioparenthub.com/daycares",
  },
};

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function getInitialDaycares(daycares: DaycareRow[]) {
  return [...daycares]
    .sort((a, b) => {
      const ratingA = Number.parseInt(a["SUTQ RATING"] || "0", 10) || 0;
      const ratingB = Number.parseInt(b["SUTQ RATING"] || "0", 10) || 0;
      if (ratingA !== ratingB) return ratingB - ratingA;

      const nameA = a["PROGRAM NAME"] || "";
      const nameB = b["PROGRAM NAME"] || "";
      return nameA.localeCompare(nameB);
    })
    .slice(0, 30);
}

export default function GlobalSearchPage() {
  const daycares = loadDaycares();
  const cityCount = new Set(daycares.map((d) => resolveCanonicalCityName(d.CITY || "")).filter(Boolean)).size;
  const initialDaycares = getInitialDaycares(daycares);

  return (
    <DraftDaycaresPageClient
      daycareCount={daycares.length}
      cityCount={cityCount}
      initialDaycares={initialDaycares}
      basePath=""
      homeHref="/"
      searchHref="/daycares"
    />
  );
}
