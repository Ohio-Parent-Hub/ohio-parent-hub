"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SutqBadge } from "@/components/SutqBadge";
import InteractiveMap from "@/components/InteractiveMap";
import FilterInput from "@/components/FilterInput";

type Daycare = Record<string, string>;

interface CityDashboardProps {
  daycares: Daycare[];
  cityDisplay: string;
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function CityDashboard({ daycares, cityDisplay }: CityDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDaycares = useMemo(() => {
    if (!searchQuery) return daycares;

    const lowerQuery = searchQuery.toLowerCase();
    
    return daycares.filter((d) => {
      // Search fields: Name, Address, Zip
      const name = (d["PROGRAM NAME"] || "").toLowerCase();
      const address = (d["STREET ADDRESS"] || "").toLowerCase();
      const zip = (d["ZIP CODE"] || "");
      
      return (
        name.includes(lowerQuery) ||
        address.includes(lowerQuery) ||
        zip.includes(lowerQuery)
      );
    });
  }, [daycares, searchQuery]);

  // Limit rendered list for performance (pagination can come later)
  const displayList = filteredDaycares.slice(0, 50);

  // Map markers based on FILTERED results
  const markers = useMemo(() => {
    return filteredDaycares
      .filter((d) => d["LAT"] && d["LNG"])
      .map((d) => {
        const id = d["PROGRAM NUMBER"];
        const name = d["PROGRAM NAME"] || "Daycare";
        const city = d["CITY"] || "";
        const url = `/daycare/${id}-${slugify(name)}-${slugify(city)}`;
        return {
          lat: Number(d["LAT"]),
          lng: Number(d["LNG"]),
          title: name,
          url,
        };
      });
  }, [filteredDaycares]);

  // Center on the first result if available, otherwise default to a central Ohio coordinate (or the first original result)
  const markerCenter: [number, number] | null = markers.length > 0
    ? [markers[0].lat, markers[0].lng]
    : null;

  // Fallback if no markers
  const defaultCenter: [number, number] = [39.9612, -82.9988]; 
  const center = markerCenter || defaultCenter;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Daycares in {cityDisplay || "Ohio"}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Showing {displayList.length}
          {filteredDaycares.length > displayList.length ? ` of ${filteredDaycares.length}` : ""} licensed programs
          {daycares.length !== filteredDaycares.length ? ` (filtered from ${daycares.length})` : ""}.
        </p>

        <div className="mt-5">
           <FilterInput
             value={searchQuery}
             onChange={setSearchQuery} 
             placeholder="Search name, address, or zip code..."
           />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-12">
        {/* Filters placeholder */}
        <aside className="lg:col-span-3">
          <div className="sticky top-6 rounded-2xl border p-4">
            <h2 className="text-sm font-semibold">Filters</h2>
            <p className="mt-2 text-sm text-neutral-600">Coming next.</p>
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border">
            <div className="border-b p-4">
              <h2 className="text-sm font-semibold">Results</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Data source: Ohio early care & education programs.
              </p>
            </div>

            <div className="p-4">
              {displayList.length === 0 ? (
                <div className="rounded-xl border p-4 text-sm text-neutral-600">
                  No results found for &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div className="space-y-3">
                  {displayList.map((d) => {
                    const id = d["PROGRAM NUMBER"] || "";
                    const name = d["PROGRAM NAME"] || "";
                    const county = d["COUNTY"] || "";
                    const sutq = d["SUTQ RATING"] || "—";
                    const street = d["STREET ADDRESS"] || "";
                    const zip = d["ZIP CODE"] || "";
                    const programType = d["PROGRAM TYPE"] || "—";
                    const city = d["CITY"] || cityDisplay;

                    const slug = `${id}-${slugify(name)}-${slugify(city)}`;

                    return (
                      <div key={id} className="rounded-xl border p-4 hover:bg-neutral-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">{name}</div>
                            <div className="mt-1 text-sm text-neutral-600">
                              {street}, {cityDisplay}, OH {zip}
                            </div>
                            <div className="mt-1 text-sm text-neutral-600">
                              {county} County • {programType}
                            </div>

                            <div className="mt-2 inline-flex gap-2">
                              <SutqBadge rating={sutq} />
                            </div>
                          </div>

                          <Link
                            href={`/daycare/${slug}`}
                            className="shrink-0 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-white"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredDaycares.length > displayList.length && (
                <p className="mt-4 text-xs text-neutral-500">
                  Showing first {displayList.length} of {filteredDaycares.length} results. Refine your search to see more.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl border overflow-hidden">
              <InteractiveMap
                center={center}
                zoom={markers.length > 0 ? 12 : 10}
                markers={markers}
                height="400px"
                className="w-full h-full"
              />
              <div className="bg-neutral-50 px-4 py-2 text-xs text-neutral-500 border-t flex justify-between">
                <span>{markers.length} Locations Mapped</span>
                <span>OpenStreetMap</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
