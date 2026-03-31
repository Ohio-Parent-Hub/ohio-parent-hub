import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

function SparkleDecor({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "See how Ohio Parent Hub sources, standardizes, and publishes licensed child care listings for families across Ohio.",
  alternates: {
    canonical: "/methodology",
  },
  openGraph: {
    title: "Methodology | Ohio Parent Hub",
    description: "See how Ohio Parent Hub sources, standardizes, and publishes licensed child care listings for families across Ohio.",
    url: "https://ohioparenthub.com/methodology",
    siteName: "Ohio Parent Hub",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Ohio Parent Hub Methodology" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Methodology | Ohio Parent Hub",
    description: "See how Ohio Parent Hub sources, standardizes, and publishes licensed child care listings for families across Ohio.",
    images: ["/og-default.png"],
  },
};

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const lightTeal = "#D5E5E3";
const lightPink = "#FADED4";
const lightGold = "#F5E9BE";
const updatedAt = "March 31, 2026";

type DaycareRow = Record<string, string>;
function loadStats() {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return { total: 0, cities: 0, counties: 0 };
  const data: DaycareRow[] = JSON.parse(fs.readFileSync(p, "utf8"));
  return {
    total: data.length,
    cities: new Set(data.map((d) => d.CITY).filter(Boolean)).size,
    counties: new Set(data.map((d) => d.COUNTY).filter(Boolean)).size,
  };
}

export default function MethodologyPage() {
  const stats = loadStats();
  return (
    <div className="min-h-screen" style={{ background: cream, color: dark }}>
      <section className="relative overflow-hidden px-6 pb-12 pt-8" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute left-[6%] top-10 h-5 w-5 opacity-30" style={{ color: gold }} />
        <SparkleDecor className="absolute right-[10%] top-16 h-4 w-4 opacity-30" style={{ color: pink }} />
        <SparkleDecor className="absolute left-[14%] bottom-10 h-4 w-4 opacity-20" style={{ color: teal }} />

        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Methodology", href: "/methodology" },
            ]}
            className="mb-6"
          />

          <div className="grid gap-8 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
                Methodology
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
                This page explains how Ohio Parent Hub sources daycare data, applies quality controls,
                and publishes searchable listings for families across Ohio.
              </p>
              <p className="mt-3 text-sm" style={{ color: `${dark}aa` }}>
                Last updated: {updatedAt}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium" style={{ color: `${dark}dd` }}>
                <Link href="https://childcaresearch.ohio.gov/" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }} target="_blank" rel="noopener noreferrer">
                  Official source
                </Link>
                <Link href="/privacy" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                  Privacy policy
                </Link>
                <Link href="/contact" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                  Contact
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:col-span-2">
              {[
                { value: stats.total.toLocaleString(), label: "Listings", bg: "#FFFFFF", accent: teal },
                { value: String(stats.cities), label: "Cities", bg: lightPink, accent: pink },
                { value: String(stats.counties), label: "Counties", bg: lightGold, accent: gold },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border p-4 shadow-sm" style={{ background: stat.bg, borderColor: `${stat.accent}40` }}>
                  <div className="line-clamp-1 font-serif text-2xl font-bold" style={{ color: stat.accent }}>{stat.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest" style={{ color: `${dark}88` }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-8" style={{ borderColor: `${sage}55` }}>
          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              1) Primary data source
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Ohio Parent Hub listing data is sourced from the Ohio child care search system:
              <br />
              <Link href="https://childcaresearch.ohio.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                https://childcaresearch.ohio.gov/
              </Link>
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              We publish state-sourced licensing and quality fields (including SUTQ) for easier discovery,
              but the source system remains the official record.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              2) Data fields tracked
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Each listing in the dataset includes the following state-sourced fields:
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>• Program number, program name, and program type</li>
              <li>• Street address, city, state, ZIP code, and county</li>
              <li>• Phone number and email address</li>
              <li>• SUTQ (Step Up To Quality) rating</li>
              <li>• License begin and end dates</li>
              <li>• Up to three administrator names</li>
              <li>• PFCC (Publicly Funded Child Care) agreement status</li>
              <li>• Geocoded latitude and longitude coordinates</li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              The current dataset covers {stats.total.toLocaleString()} licensed programs
              across {stats.cities} cities and {stats.counties} counties statewide.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              3) Program types covered
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Ohio Parent Hub indexes all licensed program types published by the state:
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>• Licensed Child Care Centers</li>
              <li>• Licensed Type A Family Child Care Homes (up to 12 children)</li>
              <li>• Licensed Type B Family Child Care Homes (up to 6 children)</li>
              <li>• Licensed School-Based Preschools</li>
              <li>• Licensed School-Age Child Care</li>
              <li>• Registered Day Camps / Approved Day Camps</li>
              <li>• Certified In-Home Aides</li>
            </ul>
          </section>

          <section className="rounded-2xl border p-5" style={{ borderColor: `${teal}44`, background: `${teal}0d` }}>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              4) Processing pipeline
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>• Source records are transformed into a structured listing dataset used by the site.</li>
              <li>• Core fields (name, location, program attributes, SUTQ, and related metadata) are standardized for consistent rendering.</li>
              <li>• Derived pages are generated for state, county, city, and individual listing routes.</li>
              <li>• Search and filtering use normalized values to improve match quality across variants.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              5) City normalization safeguards
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              City normalization is intentionally conservative to reduce accidental merges of distinct places.
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>• Alias merges are applied only from approved mappings in the maintained alias list.</li>
              <li>• Potentially unsafe or ambiguous matches are blocked and reviewed manually.</li>
              <li>• Suggestions from reporting workflows are treated as review input, not auto-applied truth.</li>
              <li>• Slug and naming normalization are used to reduce typo/format fragmentation while preserving real city distinctions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              6) Maps and geocoding
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Map views are built from listing coordinates when available. User-entered location searches are
              geocoded through our geocoding endpoint and resolved by OpenStreetMap Nominatim.
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}aa` }}>
              For service disclosures and usage details, see our{" "}
              <Link href="/privacy" className="underline hover:no-underline">
                Privacy policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              7) Updates and corrections
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Dataset refreshes are performed periodically. Because source systems can change over time,
              there may be temporary lag between an official update and what appears on this site.
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Ohio Parent Hub can review reported display issues and prioritize refreshes, but official
              licensing and SUTQ corrections must be made in the source system first.
            </p>
          </section>

          <section className="border-t pt-6" style={{ borderColor: `${sage}66` }}>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              8) Limitations
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>• Ohio Parent Hub is an informational directory and not a licensing authority.</li>
              <li>• Families should verify final details directly with providers and official state records.</li>
              <li>• Route grouping and normalization improve discoverability, but do not replace official determinations.</li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}aa` }}>
              Questions about methodology can be sent via the{" "}
              <Link href="/contact" className="underline hover:no-underline">
                Contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
