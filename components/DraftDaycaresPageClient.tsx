"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import GlobalDashboard from "@/components/GlobalDashboard";
import LocationSearch from "@/components/LocationSearch";
import type { CSSProperties } from "react";

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

interface DraftDaycaresPageClientProps {
  daycareCount: number;
  cityCount: number;
  statewideSnippetCopy: string;
  statewideIntroCopy: string;
  statewideSutqCopy: string;
  statewideChoosingCareCopy: string;
  statewideTransparencyCopy: string;
  statewideNotRatedCopy: string;
  initialDaycares?: Record<string, string>[];
  verifiedProgramNumbers?: string[];
  premiumLogos?: Record<string, string>;
  initialLocation?: { lat: number; lng: number; q: string } | null;
  basePath?: string;
  homeHref?: string;
  searchHref?: string;
}

export default function DraftDaycaresPageClient({
  daycareCount,
  cityCount,
  statewideSnippetCopy,
  statewideIntroCopy,
  statewideSutqCopy,
  statewideChoosingCareCopy,
  statewideTransparencyCopy,
  statewideNotRatedCopy,
  initialDaycares = [],
  verifiedProgramNumbers = [],
  premiumLogos = {},
  initialLocation = null,
  basePath = "/draft",
  homeHref = "/draft",
  searchHref = "/draft/daycares",
}: DraftDaycaresPageClientProps) {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null
  );
  const [mapZoom, setMapZoom] = useState<number | null>(initialLocation ? 12 : null);
  const [locationQuery, setLocationQuery] = useState(initialLocation?.q ?? "");
  const [heroSearchClearSignal, setHeroSearchClearSignal] = useState(0);
  const [isAboutOpenMobile, setIsAboutOpenMobile] = useState(false);
  const [isSutqOpenMobile, setIsSutqOpenMobile] = useState(false);
  const [isChooseOpenMobile, setIsChooseOpenMobile] = useState(false);

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
              { label: "Find a Daycare", href: searchHref },
            ]}
            className="mb-6"
          />

          <div className="grid gap-8 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
                Find the Best Daycares in Ohio
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
                {statewideSnippetCopy}
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

            <div className="lg:col-span-2 grid grid-cols-3 gap-3">
              {[
                { value: daycareCount.toLocaleString(), label: "Programs", bg: "#FFFFFF", accent: teal },
                { value: cityCount.toLocaleString(), label: "Cities", bg: lightPink, accent: pink },
                { value: "100%", label: "Licensed", bg: lightGold, accent: gold },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border p-4 shadow-sm" style={{ background: stat.bg, borderColor: `${stat.accent}40` }}>
                  <div className="text-2xl font-bold font-serif" style={{ color: stat.accent }}>{stat.value}</div>
                  <div className="text-[11px] uppercase tracking-widest mt-1" style={{ color: `${dark}88` }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pt-6 pb-2">
        <div className="mx-auto max-w-7xl md:hidden">
          <div className="rounded-2xl border p-4 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
            <h2 className="font-serif text-base font-semibold" style={{ color: dark }}>
              Parent guidance for Ohio
            </h2>

            <div className="mt-2 border-t" style={{ borderColor: `${sage}55` }}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-2.5 text-left"
                aria-expanded={isAboutOpenMobile}
                aria-controls="state-editorial-about-mobile"
                aria-label="Toggle About childcare in Ohio"
                onClick={() => setIsAboutOpenMobile((current) => !current)}
              >
                <span className="text-sm font-semibold" style={{ color: dark }}>About childcare in Ohio</span>
                <span className={`text-base leading-none transition-transform ${isAboutOpenMobile ? "rotate-180" : "rotate-0"}`} style={{ color: teal }} aria-hidden="true">▾</span>
              </button>
              <p
                id="state-editorial-about-mobile"
                className={`pb-3 text-sm leading-relaxed ${isAboutOpenMobile ? "block" : "hidden"}`}
                style={{ color: `${dark}cc` }}
              >
                {statewideIntroCopy}
              </p>
            </div>

            <div className="border-t" style={{ borderColor: `${sage}55` }}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-2.5 text-left"
                aria-expanded={isSutqOpenMobile}
                aria-controls="state-editorial-sutq-mobile"
                aria-label="Toggle Understanding SUTQ in Ohio"
                onClick={() => setIsSutqOpenMobile((current) => !current)}
              >
                <span className="text-sm font-semibold" style={{ color: dark }}>Understanding SUTQ in Ohio</span>
                <span className={`text-base leading-none transition-transform ${isSutqOpenMobile ? "rotate-180" : "rotate-0"}`} style={{ color: teal }} aria-hidden="true">▾</span>
              </button>
              <p
                id="state-editorial-sutq-mobile"
                className={`text-sm leading-relaxed ${isSutqOpenMobile ? "block" : "hidden"}`}
                style={{ color: `${dark}cc` }}
              >
                {statewideSutqCopy}
              </p>
              <p
                className={`pb-3 pt-2 text-xs leading-relaxed ${isSutqOpenMobile ? "block" : "hidden"}`}
                style={{ color: `${dark}99` }}
              >
                {statewideNotRatedCopy}
              </p>
            </div>

            <div className="border-t" style={{ borderColor: `${sage}55` }}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-2.5 text-left"
                aria-expanded={isChooseOpenMobile}
                aria-controls="state-editorial-choose-mobile"
                aria-label="Toggle How to choose care in Ohio"
                onClick={() => setIsChooseOpenMobile((current) => !current)}
              >
                <span className="text-sm font-semibold" style={{ color: dark }}>How to choose care in Ohio</span>
                <span className={`text-base leading-none transition-transform ${isChooseOpenMobile ? "rotate-180" : "rotate-0"}`} style={{ color: teal }} aria-hidden="true">▾</span>
              </button>
              <p
                id="state-editorial-choose-mobile"
                className={`text-sm leading-relaxed ${isChooseOpenMobile ? "block" : "hidden"}`}
                style={{ color: `${dark}cc` }}
              >
                {statewideChoosingCareCopy}
              </p>
              <p
                className={`pb-3 pt-2 text-xs leading-relaxed ${isChooseOpenMobile ? "block" : "hidden"}`}
                style={{ color: `${dark}99` }}
              >
                {statewideTransparencyCopy}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto hidden max-w-7xl gap-4 md:grid md:grid-cols-3">
          <article className="rounded-2xl border p-5 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
            <h2 className="font-serif text-lg font-semibold" style={{ color: dark }}>
              About childcare in Ohio
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
              {statewideIntroCopy}
            </p>
          </article>

          <article className="rounded-2xl border p-5 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
            <h2 className="font-serif text-lg font-semibold" style={{ color: dark }}>
              Understanding SUTQ in Ohio
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
              {statewideSutqCopy}
            </p>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: `${dark}99` }}>
              {statewideNotRatedCopy}
            </p>
          </article>

          <article className="rounded-2xl border p-5 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
            <h2 className="font-serif text-lg font-semibold" style={{ color: dark }}>
              How to choose care in Ohio
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
              {statewideChoosingCareCopy}
            </p>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: `${dark}99` }}>
              {statewideTransparencyCopy}
            </p>
          </article>
        </div>
      </section>

      <section className="px-0 sm:px-6 py-4 sm:py-8">
        <div className="mx-auto max-w-7xl sm:rounded-3xl sm:border px-2 py-3 sm:p-6 sm:shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
          <GlobalDashboard
            initialDaycares={initialDaycares}
            initialTotalCount={daycareCount}
            verifiedProgramNumbers={verifiedProgramNumbers}
            premiumLogos={premiumLogos}
            basePath={basePath}
            externalMapCenter={mapCenter}
            onExternalMapCenterChange={setMapCenter}
            externalMapZoom={mapZoom}
            onExternalMapZoomChange={setMapZoom}
            externalLocationQuery={locationQuery}
            onExternalLocationQueryChange={setLocationQuery}
            onClearAllFilters={() => setHeroSearchClearSignal((value) => value + 1)}
            hideDesktopLocationSearch
            skipSessionRestore={!!initialLocation}
          />
        </div>
      </section>
    </main>
  );
}
