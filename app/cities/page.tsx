import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Daycares by City",
  description: "Find licensed daycares and early childhood programs in cities across Ohio. Browse alphabetically to find care near you.",
};

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

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

  // Group by first letter
  const groupedCities: Record<string, CityData[]> = {};
  allCities.forEach(city => {
    const firstLetter = city.name.charAt(0).toUpperCase();
    if (!groupedCities[firstLetter]) {
      groupedCities[firstLetter] = [];
    }
    groupedCities[firstLetter].push(city);
  });

  const letters = Object.keys(groupedCities).sort();

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <h1 className="font-serif text-4xl font-bold text-primary mb-4">
            Browse Daycares by City
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Find licensed childcare providers in {allCities.length} cities across Ohio. 
            Select your city to view detailed program information.
          </p>
        </div>

        {/* Quick Jump Links for Letters */}
        <div className="mb-12 flex flex-wrap gap-2 sticky top-4 z-10 bg-background/95 backdrop-blur py-2 border-b border-border/40">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#city-group-${letter}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
            >
              {letter}
            </a>
          ))}
        </div>

        {/* City Groups */}
        <div className="space-y-12">
          {letters.map((letter) => (
            <div key={letter} id={`city-group-${letter}`} className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-serif font-bold text-secondary-foreground bg-secondary/10 px-4 py-1 rounded-md inline-block min-w-[3rem] text-center">
                  {letter}
                </h2>
                <div className="h-px bg-border flex-1"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {groupedCities[letter].map((city) => (
                  <Link key={city.name} href={`/daycares/${city.slug}`} className="group block h-full">
                    <Card className="h-full border-transparent bg-card shadow-sm hover:border-primary/20 hover:shadow-md transition-all">
                      <CardContent className="p-4 flex items-center justify-between">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {city.name}
                        </span>
                        <Badge variant="secondary" className="bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground font-normal ml-2">
                          {city.count}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
