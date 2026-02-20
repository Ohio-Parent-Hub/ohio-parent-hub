"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CityData {
  name: string;
  slug: string;
  count: number;
}

interface CityBrowseClientProps {
  allCities: CityData[];
}

export default function CityBrowseClient({ allCities }: CityBrowseClientProps) {
  const [query, setQuery] = useState("");

  const filteredCities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return allCities;
    return allCities.filter((city) => city.name.toLowerCase().includes(normalizedQuery));
  }, [allCities, query]);

  const groupedCities = useMemo(() => {
    const groups: Record<string, CityData[]> = {};
    filteredCities.forEach((city) => {
      const firstLetter = city.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(city);
    });
    return groups;
  }, [filteredCities]);

  const letters = useMemo(() => Object.keys(groupedCities).sort(), [groupedCities]);

  return (
    <>
      <div className="mb-8">
        <label htmlFor="city-search" className="mb-2 block text-sm font-medium text-foreground">
          Search for a city
        </label>
        <input
          id="city-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Start typing a city name..."
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
        />
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

      {filteredCities.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          No cities match your search.
        </div>
      ) : (
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
      )}
    </>
  );
}
