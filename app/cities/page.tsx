import fs from "node:fs";
import path from "node:path";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import CityBrowseClient from "@/components/CityBrowseClient";
import { getCitiesWithMetroEntry } from "@/lib/metroAreas";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Best Daycares by Ohio City",
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

interface CityData {
  name: string;
  slug: string;
  count: number;
}

export default function CitiesPage() {
  const daycares = loadDaycares();
  const allCities: CityData[] = getCitiesWithMetroEntry(daycares);

  return (
    <div className="min-h-screen" style={{ background: cream, color: dark }}>
      <section className="relative overflow-hidden px-6 pt-8 pb-12" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute left-[6%] top-10 h-5 w-5 opacity-30" style={{ color: gold }} />
        <SparkleDecor className="absolute right-[10%] top-16 h-4 w-4 opacity-30" style={{ color: pink }} />
        <SparkleDecor className="absolute left-[14%] bottom-10 h-4 w-4 opacity-20" style={{ color: teal }} />

        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cities", href: "/cities" },
            ]}
            className="mb-6"
          />

          <div className="grid gap-8 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
                Find the Best Daycares by City in Ohio
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
                Browse Ohio cities alphabetically to quickly find licensed childcare providers in the areas families search most.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-3 gap-3">
              {[
                { value: allCities.length.toLocaleString(), label: "Cities", bg: "#FFFFFF", accent: teal },
                { value: daycares.length.toLocaleString(), label: "Programs", bg: lightPink, accent: pink },
                { value: "100%", label: "Licensed", bg: lightGold, accent: gold },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border p-4 shadow-sm" style={{ background: stat.bg, borderColor: `${stat.accent}40` }}>
                  <div className="text-2xl font-bold font-serif line-clamp-1" style={{ color: stat.accent }}>{stat.value}</div>
                  <div className="text-[11px] uppercase tracking-widest mt-1" style={{ color: `${dark}88` }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-7xl rounded-3xl border p-4 sm:p-6 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
          <CityBrowseClient allCities={allCities} />
        </div>
      </section>
    </div>
  );
}
