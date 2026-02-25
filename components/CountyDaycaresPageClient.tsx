"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import LocationSearch from "@/components/LocationSearch";
import CityDashboard from "@/components/CityDashboard";

type DaycareRow = Record<string, string>;

interface CountyDaycaresPageClientProps {
  countyDisplay: string;
  countySlug: string;
  countyCount: number;
  countySnippetCopy: string;
  initialDaycares: DaycareRow[];
  basePath?: string;
  homeHref?: string;
  countiesHref?: string;
}

function SparkleDecor({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
    </svg>
  );
}

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const lightTeal = "#D5E5E3";
const lightPink = "#FADED4";
const lightGold = "#F5E9BE";

function getCountyValueClass(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const longestWordLength = words.reduce((maxLength, word) => Math.max(maxLength, word.length), 0);

  if (longestWordLength >= 11) {
    return "text-sm sm:text-base";
  }
  if (longestWordLength >= 9) {
    return "text-base sm:text-lg";
  }
  return "text-[clamp(0.95rem,3vw,1.5rem)]";
}

export default function CountyDaycaresPageClient({
  countyDisplay,
  countySlug,
  countyCount,
  countySnippetCopy,
  initialDaycares,
  basePath = "",
  homeHref = "/",
  countiesHref = "/counties",
}: CountyDaycaresPageClientProps) {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState<number | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [heroSearchClearSignal, setHeroSearchClearSignal] = useState(0);
  const countyHref = `${basePath}/daycares/county/${countySlug}`;

  return (
    <main className="min-h-screen" style={{ background: cream, color: dark }}>
      <section className="relative overflow-hidden px-6 pb-12 pt-8" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute left-[6%] top-10 h-5 w-5 opacity-30" style={{ color: gold }} />
        <SparkleDecor className="absolute right-[10%] top-16 h-4 w-4 opacity-30" style={{ color: pink }} />
        <SparkleDecor className="absolute bottom-10 left-[14%] h-4 w-4 opacity-20" style={{ color: teal }} />

        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: homeHref },
              { label: "Counties", href: countiesHref },
              { label: `${countyDisplay} County`, href: countyHref },
            ]}
            className="mb-6"
          />

          <div className="grid gap-8 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <h1 className="pr-2 text-balance font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
                Best Daycares in {countyDisplay} County, Ohio
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
                {countySnippetCopy}
              </p>
              <div className="mt-6 max-w-xl">
                <LocationSearch
                  onLocationFound={(lat, lng) => {
                    setMapCenter([lat, lng]);
                    setMapZoom(12);
                  }}
                  onSearchSuccess={(query) => setLocationQuery(query)}
                  clearSignal={heroSearchClearSignal}
                  placeholder="Search by street, city, or ZIP in Ohio"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:col-span-2">
              {[
                { value: countyCount.toLocaleString(), label: "Programs", bg: "#FFFFFF", accent: teal, type: "default" },
                { value: `${countyDisplay} County`, label: "County", bg: lightPink, accent: pink, type: "county" },
                { value: "100%", label: "Licensed", bg: lightGold, accent: gold, type: "default" },
              ].map((stat) => (
                <div key={stat.label} className="h-[96px] rounded-2xl border p-4 shadow-sm" style={{ background: stat.bg, borderColor: `${stat.accent}40` }}>
                  <div
                    className={
                      stat.type === "county"
                        ? `min-h-[2.7rem] ${getCountyValueClass(String(stat.value))} line-clamp-2 whitespace-normal break-normal text-balance font-serif font-bold leading-tight`
                        : "line-clamp-1 font-serif text-2xl font-bold"
                    }
                    style={{ color: stat.accent }}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest" style={{ color: `${dark}88` }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-7xl rounded-3xl border p-4 shadow-sm sm:p-6" style={{ background: "#fff", borderColor: `${sage}55` }}>
          <CityDashboard
            daycares={initialDaycares}
            countySlug={countySlug}
            cityDisplay={`${countyDisplay} County`}
            basePath={basePath}
            externalMapCenter={mapCenter}
            onExternalMapCenterChange={setMapCenter}
            externalMapZoom={mapZoom}
            onExternalMapZoomChange={setMapZoom}
            externalLocationQuery={locationQuery}
            onExternalLocationQueryChange={setLocationQuery}
            onClearAllFilters={() => setHeroSearchClearSignal((value) => value + 1)}
            hideHeaderLocationSearch
          />
        </div>
      </section>
    </main>
  );
}
