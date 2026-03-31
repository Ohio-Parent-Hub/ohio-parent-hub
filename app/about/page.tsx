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
  title: "About Ohio Parent Hub",
  description:
    "Learn what Ohio Parent Hub is, how listings are maintained, and how families can use the site to research child care options.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Ohio Parent Hub",
    description: "Learn what Ohio Parent Hub is, how listings are maintained, and how families can use the site to research child care options.",
    url: "https://ohioparenthub.com/about",
    siteName: "Ohio Parent Hub",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "About Ohio Parent Hub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Ohio Parent Hub",
    description: "Learn what Ohio Parent Hub is, how listings are maintained, and how families can use the site to research child care options.",
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

export default function AboutPage() {
  const stats = loadStats();
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
              { label: "About", href: "/about" },
            ]}
            className="mb-6"
          />

          <div className="grid gap-8 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
                About Ohio Parent Hub
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
                Ohio Parent Hub helps families quickly browse licensed child care options across Ohio.
                The goal is simple: make important program details easier to find and compare.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium" style={{ color: `${dark}dd` }}>
                <Link href="/daycares" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                  Find daycares
                </Link>
                <Link href="/methodology" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                  View methodology
                </Link>
                <Link href="/contact" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                  Report a listing concern
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-3 gap-3">
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
        <div className="mx-auto max-w-7xl rounded-3xl border bg-white p-6 shadow-sm sm:p-8" style={{ borderColor: `${sage}55` }}>

        <section>
          <h2 className="text-xl font-semibold" style={{ color: dark }}>
            Why Ohio Parent Hub exists
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            Ohio Parent Hub was built by a father of three kids under four years old with a software development
            background. After struggling to find a single resource that brought licensed daycare options together
            in one place, he built what he wished had existed: a free, searchable directory covering every
            licensed child care provider in the state of Ohio.
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            The project started with publicly available licensing data from the Ohio Department of Children and Youth.
            From there, the data is cleaned, standardized, and organized into city, county, and individual listing
            pages so families can compare options without visiting a dozen different websites.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold" style={{ color: dark }}>
            What this site does
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            <li>• Organizes {stats.total.toLocaleString()} licensed provider listings across {stats.cities} cities and {stats.counties} counties in a searchable, parent-friendly format</li>
            <li>• Surfaces city and county pages to support local discovery</li>
            <li>• Shows core profile details like location, licensing context, and SUTQ status when available</li>
            <li>• Covers seven program types: child care centers, Type A and Type B family child care homes, school-based preschools, school-age child care, registered day camps, and certified in-home aides</li>
            <li>• Lets families filter and compare programs by location, quality rating, and program type</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold" style={{ color: dark }}>
            What&apos;s in each listing
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            Every listing includes state-sourced data that is refreshed periodically from official records:
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            <li>• Program name, street address, city, county, and ZIP code</li>
            <li>• Phone number and email (when available)</li>
            <li>• Program type and license dates</li>
            <li>• SUTQ (Step Up To Quality) rating when assigned</li>
            <li>• PFCC (Publicly Funded Child Care) agreement status</li>
            <li>• Administrator names</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            Providers who{" "}
            <Link href="/for-providers" className="underline hover:no-underline">
              claim their listing
            </Link>
            {" "}can add additional details that families often look for:
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            <li>• Logo and photo gallery (up to 9 photos)</li>
            <li>• Hours of operation</li>
            <li>• Pricing and tuition by age group</li>
            <li>• Amenities and services offered</li>
            <li>• Custom FAQs written by the provider</li>
            <li>• &ldquo;From the Owner&rdquo; description</li>
            <li>• Website link</li>
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border p-5" style={{ borderColor: `${teal}44`, background: `${teal}0d` }}>
          <h2 className="text-xl font-semibold" style={{ color: dark }}>
            What this site is not
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            <li>• Not a licensing authority or a government agency</li>
            <li>• Not a substitute for visiting providers or confirming details directly</li>
            <li>• Not legal, medical, or child development advice</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold" style={{ color: dark }}>
            Data and updates
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            Listings are built from publicly available records and standardized for browsing.
            Data can change over time, so families should always verify current program details directly
            with providers and relevant agencies.
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            For sourcing details and normalization standards, see our{" "}
            <Link href="/methodology" className="underline hover:no-underline">
              Methodology
            </Link>
            .
          </p>
        </section>

        <section className="mt-8 border-t pt-6" style={{ borderColor: `${sage}66` }}>
          <h2 className="text-xl font-semibold" style={{ color: dark }}>
            Questions or data issues
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            Spot a listing issue or want to get in touch? Visit the{" "}
            <Link href="/contact" className="underline hover:no-underline">
              Contact page
            </Link>
            .
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            State-reported fields like licensing status, license type, license dates, and SUTQ ratings
            are sourced from official records and are not manually edited on individual profiles.
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            We can review issues, fix display problems, and prioritize refreshes after source updates,
            but official record changes must first be submitted through the state system.
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}aa` }}>
            You can also review our{" "}
            <Link href="/privacy" className="underline hover:no-underline">
              Privacy policy
            </Link>
            .
          </p>
        </section>
        </div>
      </main>
    </div>
  );
}
