"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CountyData {
  name: string;
  slug: string;
  count: number;
}

interface CountyBrowseClientProps {
  allCounties: CountyData[];
  basePath?: string;
}

export default function CountyBrowseClient({ allCounties, basePath = "" }: CountyBrowseClientProps) {
  const [query, setQuery] = useState("");

  const filteredCounties = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return allCounties;
    return allCounties.filter((county) => county.name.toLowerCase().includes(normalizedQuery));
  }, [allCounties, query]);

  const groupedCounties = useMemo(() => {
    const groups: Record<string, CountyData[]> = {};
    filteredCounties.forEach((county) => {
      const firstLetter = county.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(county);
    });
    return groups;
  }, [filteredCounties]);

  const letters = useMemo(() => Object.keys(groupedCounties).sort(), [groupedCounties]);

  return (
    <>
      <div className="sticky top-24 z-10 mb-12 rounded-2xl border border-border/40 bg-background/95 p-3 backdrop-blur">
        <div className="mb-4">
          <label htmlFor="county-search" className="mb-2 block text-sm font-medium text-foreground">
            Search for a county
          </label>
          <input
            id="county-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Start typing a county name..."
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border/40 pt-3">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#county-group-${letter}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
            >
              {letter}
            </a>
          ))}
        </div>
      </div>

      {filteredCounties.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          No counties match your search.
        </div>
      ) : (
        <div className="space-y-12">
          {letters.map((letter) => (
            <div key={letter} id={`county-group-${letter}`} className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-4">
                <h2 className="inline-block min-w-[3rem] rounded-md bg-secondary/10 px-4 py-1 text-center font-serif text-2xl font-bold text-secondary-foreground">
                  {letter}
                </h2>
                <div className="h-px flex-1 bg-border"></div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {groupedCounties[letter].map((county) => (
                  <Link key={county.name} href={`${basePath}/daycares/county/${county.slug}`} className="group block h-full">
                    <Card className="h-full border-transparent bg-card shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
                      <CardContent className="flex items-center justify-between p-4">
                        <span className="font-medium text-foreground transition-colors group-hover:text-primary">{county.name}</span>
                        <Badge variant="secondary" className="ml-2 bg-secondary/10 font-normal text-secondary-foreground hover:bg-secondary/20">
                          {county.count}
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
