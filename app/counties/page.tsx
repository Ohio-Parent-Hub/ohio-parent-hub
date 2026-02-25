import fs from "node:fs";
import path from "node:path";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import CountyBrowseClient from "@/components/CountyBrowseClient";
import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";

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
  title: "Best Daycares by Ohio County",
  description: "Browse licensed daycares and early childhood programs by county across Ohio to find child care near you.",
  keywords: [
    "best daycares by county ohio",
    "ohio daycare counties",
    "licensed daycare by county",
    "childcare near me ohio county",
  ],
  alternates: {
    canonical: "/counties",
  },
  openGraph: {
    title: "Best Daycares by Ohio County",
    description: "Explore Ohio counties and open local daycare listings with quality and program details.",
    url: "https://ohioparenthub.com/counties",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Best Daycares by Ohio County | Ohio Parent Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Daycares by Ohio County",
    description: "Explore Ohio counties and open local daycare listings with quality and program details.",
    images: ["/og-default.png"],
  },
};

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

interface CountyData {
  name: string;
  slug: string;
  count: number;
}

export default function CountiesPage() {
  const daycares = loadDaycares();

  const countyMap = new Map<string, number>();
  daycares.forEach((d) => {
    const county = d["COUNTY"];
    if (county) {
      countyMap.set(county, (countyMap.get(county) || 0) + 1);
    }
  });

  const allCounties: CountyData[] = Array.from(countyMap.entries())
    .map(([name, count]) => ({
      name: toTitleCaseIfAllCaps(name),
      slug: slugify(name),
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen" style={{ background: cream, color: dark }}>
      <section className="relative overflow-hidden px-6 pb-12 pt-8" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute left-[6%] top-10 h-5 w-5 opacity-30" style={{ color: gold }} />
        <SparkleDecor className="absolute right-[10%] top-16 h-4 w-4 opacity-30" style={{ color: pink }} />
        <SparkleDecor className="absolute bottom-10 left-[14%] h-4 w-4 opacity-20" style={{ color: teal }} />

        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Counties", href: "/counties" },
            ]}
            className="mb-6"
          />

          <div className="grid gap-8 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
                Find the Best Daycares by County in Ohio
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
                Browse Ohio counties alphabetically to quickly find licensed childcare providers and compare local program options.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:col-span-2">
              {[
                { value: allCounties.length.toLocaleString(), label: "Counties", bg: "#FFFFFF", accent: teal },
                { value: daycares.length.toLocaleString(), label: "Programs", bg: lightPink, accent: pink },
                { value: "100%", label: "Licensed", bg: lightGold, accent: gold },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border p-4 shadow-sm" style={{ background: stat.bg, borderColor: `${stat.accent}40` }}>
                  <div className="line-clamp-1 font-serif text-2xl font-bold" style={{ color: stat.accent }}>
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
          <CountyBrowseClient allCounties={allCounties} />
        </div>
      </section>
    </div>
  );
}
