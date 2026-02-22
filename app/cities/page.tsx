import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs"; // Import added
import { slugify } from "@/lib/utils"; // Import added
import CityBrowseClient from "@/components/CityBrowseClient";
import { ArrowLeft, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Daycares by Ohio City | Ohio Parent Hub",
  description: "Browse licensed daycares and early childhood programs by city across Ohio to find child care near you.",
  keywords: [
    "best daycares by city ohio",
    "ohio daycare cities",
    "childcare near me ohio city",
    "licensed daycare by city",
  ],
  alternates: {
    canonical: "/cities",
  },
  openGraph: {
    title: "Best Daycares by Ohio City",
    description:
      "Explore Ohio cities and open local daycare listings with quality and program details.",
    url: "https://ohioparenthub.com/cities",
  },
};

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

// slugify removed here as it is imported

interface CityData {
  name: string;
  slug: string;
  count: number;
}

export default function CitiesPage() {
  const daycares = loadDaycares();
  
  // Aggregate by city
  const cityMap = new Map<string, number>();
  daycares.forEach((d) => {
    const city = d["CITY"];
    if (city) {
      // Normalize city name (e.g., proper casing if inconsistent, but usually raw is fine)
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    }
  });

  // Convert to array and sort alphabetically
  const allCities: CityData[] = Array.from(cityMap.entries())
    .map(([name, count]) => ({
      name,
      slug: slugify(name),
      count
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          {/* Replaced Back Button with Breadcrumbs */}
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Cities", href: "/cities" }
            ]} 
            className="mb-6"
          />
          
          <h1 className="font-serif text-4xl font-bold text-primary mb-4">
            Find the Best Daycares by City in Ohio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Find licensed childcare providers in {allCities.length} cities across Ohio. 
            Select your city to view detailed program information.
          </p>
        </div>

        <CityBrowseClient allCities={allCities} />
      </div>
    </div>
  );
}
