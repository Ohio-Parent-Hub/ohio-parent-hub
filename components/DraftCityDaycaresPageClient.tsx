"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import LocationSearch from "@/components/LocationSearch";
import CityDashboard from "@/components/CityDashboard";
import { ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";

type DaycareRow = Record<string, string>;

type CitySutqStats = {
  gold: number;
  silver: number;
  bronze: number;
  notRated: number;
  total: number;
};

interface DraftCityDaycaresPageClientProps {
  cityDisplay: string;
  citySlug: string;
  cityCount: number;
  citySnippetCopy: string;
  sutqStats?: CitySutqStats;
  cityDescription?: string[];
  initialDaycares: DaycareRow[];
  verifiedProgramNumbers?: string[];
  premiumLogos?: Record<string, string>;
  premiumSummaries?: Record<string, import("@/lib/premiumTypes").PremiumFilterSummary>;
  hiringSummaries?: import("@/lib/jobTypes").JobSummaryByProgramNumber;
  basePath?: string;
  homeHref?: string;
  citiesHref?: string;
  countyLinks?: Array<{ label: string; href: string }>;
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
const lightGold = "#F5E9BE";

export default function DraftCityDaycaresPageClient({
  cityDisplay,
  citySlug,
  cityCount,
  citySnippetCopy,
  sutqStats,
  cityDescription = [],
  initialDaycares,
  verifiedProgramNumbers = [],
  premiumLogos = {},
  premiumSummaries = {},
  hiringSummaries = {},
  basePath = "/draft",
  homeHref = "/draft",
  citiesHref = "/draft/cities",
  countyLinks = [],
}: DraftCityDaycaresPageClientProps) {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState<number | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [heroSearchClearSignal, setHeroSearchClearSignal] = useState(0);
  const cityHref = `${basePath}/daycares/${citySlug}`;

  const aboutRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (aboutRef.current && window.innerWidth < 640) {
      aboutRef.current.removeAttribute("open");
    }
  }, []);

  return (
    <main className="min-h-screen" style={{ background: cream, color: dark }}>
      <section className="relative overflow-hidden px-6 pt-8 pb-12" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute left-[6%] top-10 h-5 w-5 opacity-30" style={{ color: gold }} />
        <SparkleDecor className="absolute right-[10%] top-16 h-4 w-4 opacity-30" style={{ color: pink }} />
        <SparkleDecor className="absolute left-[14%] bottom-10 h-4 w-4 opacity-20" style={{ color: teal }} />

        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: homeHref },
              { label: "Cities", href: citiesHref },
              { label: cityDisplay || "City", href: cityHref },
            ]}
            className="mb-6"
          />

          <div className="grid gap-8 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <h1 className="pr-2 font-serif text-4xl font-bold tracking-tight text-balance sm:text-5xl" style={{ color: dark }}>
                Best Daycares in {cityDisplay || "Ohio"}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
                {citySnippetCopy}
              </p>
              {countyLinks.length > 0 && (
                <p className="mt-3 text-sm" style={{ color: `${dark}bb` }}>
                  <span className="font-medium">County hubs:</span>{" "}
                  {countyLinks.map((countyLink, index) => (
                    <span key={`${countyLink.label}-${countyLink.href}`}>
                      {index > 0 && <span className="mx-1.5">•</span>}
                      <Link href={countyLink.href} className="underline hover:no-underline">
                        {countyLink.label}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
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

            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              {sutqStats && sutqStats.gold > 0 && (
                <div className="rounded-2xl border p-4 shadow-sm" style={{ background: lightGold, borderColor: `${gold}40` }}>
                  <div className="text-2xl font-bold font-serif leading-none" style={{ color: gold }}>{sutqStats.gold}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: `${dark}88` }}>Gold SUTQ</div>
                  <div className="mt-0.5 text-xs" style={{ color: `${dark}66` }}>{Math.round((sutqStats.gold / sutqStats.total) * 100)}% of programs</div>
                </div>
              )}
              {sutqStats && sutqStats.silver > 0 && (
                <div className="rounded-2xl border p-4 shadow-sm" style={{ background: "#F1F5F9", borderColor: "#CBD5E194" }}>
                  <div className="text-2xl font-bold font-serif leading-none" style={{ color: "#475569" }}>{sutqStats.silver}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: `${dark}88` }}>Silver SUTQ</div>
                  <div className="mt-0.5 text-xs" style={{ color: `${dark}66` }}>{Math.round((sutqStats.silver / sutqStats.total) * 100)}% of programs</div>
                </div>
              )}
              {sutqStats && sutqStats.bronze > 0 && (
                <div className="rounded-2xl border p-4 shadow-sm" style={{ background: "#FFF7ED", borderColor: "#FED7AA94" }}>
                  <div className="text-2xl font-bold font-serif leading-none" style={{ color: "#C2410C" }}>{sutqStats.bronze}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: `${dark}88` }}>Bronze SUTQ</div>
                  <div className="mt-0.5 text-xs" style={{ color: `${dark}66` }}>{Math.round((sutqStats.bronze / sutqStats.total) * 100)}% of programs</div>
                </div>
              )}
              {sutqStats && sutqStats.notRated > 0 && (
                <div className="rounded-2xl border p-4 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
                  <div className="text-2xl font-bold font-serif leading-none" style={{ color: `${dark}99` }}>{sutqStats.notRated}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: `${dark}88` }}>Not Rated</div>
                  <div className="mt-0.5 text-xs" style={{ color: `${dark}66` }}>{Math.round((sutqStats.notRated / sutqStats.total) * 100)}% of programs</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {cityDescription.length > 0 && (
        <section className="px-4 pt-6 pb-2 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <details
              ref={aboutRef}
              open
              className="group rounded-xl border-l-4 overflow-hidden"
              style={{
                borderLeftColor: sage,
                background: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <summary
                className="sm:hidden px-5 py-3.5 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden"
              >
                <span className="font-semibold text-[0.95rem]" style={{ color: dark }}>
                  About childcare in {cityDisplay}
                </span>
                <ChevronDown
                  size={18}
                  className="transition-transform duration-200 group-open:rotate-180"
                  style={{ color: `${dark}99` }}
                />
              </summary>
              <div className="px-5 pb-4 sm:!block sm:pt-4">
                <ul className="list-disc space-y-1.5 pl-5 text-[0.9rem] leading-relaxed" style={{ color: dark }}>
                  {cityDescription.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </details>
          </div>
        </section>
      )}

      <section className="px-0 sm:px-6 py-4 sm:py-8">
        <div className="mx-auto max-w-7xl sm:rounded-3xl sm:border px-2 py-3 sm:p-6 sm:shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
          <CityDashboard
            daycares={initialDaycares}
            citySlug={citySlug}
            cityDisplay={cityDisplay}
            initialTotalCount={cityCount}
            verifiedProgramNumbers={verifiedProgramNumbers}
            premiumLogos={premiumLogos}
            premiumSummaries={premiumSummaries}
            hiringSummaries={hiringSummaries}
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
