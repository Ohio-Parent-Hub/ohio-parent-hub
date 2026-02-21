import Link from "next/link";
import Image from "next/image";
import fs from "node:fs";
import path from "node:path";

type DaycareRow = Record<string, string>;
function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function slugify(s: string) {
  return (s || "").toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

import { MapPin, Search, ShieldCheck, Baby, ArrowRight, Heart } from "lucide-react";

/* =========================================================
   OPTION 2 — "Sunrise Warm" — Editorial Magazine
   Full-width alternating warm-toned bands (terracotta, cream,
   olive). NO cards at all. Large serif type, inline text links,
   big horizontal rules. Think Kinfolk / Cereal magazine.
   ========================================================= */

const terracotta = "#C2714F";
const cream = "#FBF5EE";
const olive = "#6B7C5E";
const brown = "#4A3728";
const sand = "#E8D9C5";
const lightOlive = "#E6ECE0";

export default function Option2() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 16).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: cream, color: brown }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: terracotta, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV - Centered logo above, links below. Magazine masthead. */}
      <header className="px-6 pt-10 pb-6 text-center">
        <Link href="/draft/option-2" className="mb-3 inline-flex items-center gap-3">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={44} height={44} className="rounded-full" />
        </Link>
        <h2 className="font-serif text-2xl font-bold tracking-tight" style={{ color: terracotta }}>Ohio Parent Hub</h2>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.4em]" style={{ color: olive }}>Ohio&apos;s Trusted Parent Resource</p>
        <nav className="mt-6 flex flex-wrap justify-center gap-8 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: brown }}>
          <Link href="/daycares">Find Daycares</Link>
          <Link href="/cities">Cities</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="mx-auto mt-6 h-px w-full max-w-5xl" style={{ background: brown }} />
      </header>

      {/* HERO - Full-width terracotta band, big serif, no imagery */}
      <section className="px-6 py-32 sm:py-40" style={{ background: terracotta, color: cream }}>
        <div className="mx-auto max-w-4xl">
          <h1 className="font-serif text-6xl font-bold leading-[1.1] sm:text-7xl md:text-8xl text-balance">
            Finding Childcare Should Be Simple.
          </h1>
          <div className="mt-12 flex items-center gap-8">
            <div className="h-px grow" style={{ background: `${cream}40` }} />
            <p className="shrink-0 text-base leading-relaxed" style={{ color: `${cream}cc` }}>
              {daycares.length.toLocaleString()} programs. {cityCounts.size} cities. 100% licensed.
            </p>
            <div className="h-px grow" style={{ background: `${cream}40` }} />
          </div>
          <div className="mt-10 flex flex-wrap gap-6">
            <Link href="/daycares" className="inline-flex items-center gap-2 border-b-2 pb-1 text-base font-semibold" style={{ borderColor: cream, color: cream }}>
              <Search className="h-4 w-4" /> Search All Programs
            </Link>
            <Link href="/cities" className="inline-flex items-center gap-2 border-b-2 pb-1 text-base font-semibold" style={{ borderColor: `${cream}60`, color: `${cream}bb` }}>
              <MapPin className="h-4 w-4" /> Browse by City
            </Link>
          </div>
        </div>
      </section>

      {/* STATS - Big numbers in a cream band, spread wide */}
      <section className="px-6 py-20" style={{ background: cream }}>
        <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-y-10">
          {[
            { value: daycares.length.toLocaleString(), label: "Licensed Programs", color: terracotta },
            { value: String(cityCounts.size), label: "Ohio Cities", color: olive },
            { value: "100%", label: "State Verified", color: brown },
            { value: "Free", label: "For Every Family", color: terracotta },
          ].map((s) => (
            <div key={s.label} className="w-1/2 px-4 md:w-auto">
              <span className="font-serif text-5xl font-bold md:text-6xl" style={{ color: s.color }}>{s.value}</span>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: `${brown}80` }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES - Olive band, just numbered text blocks, no cards */}
      <section className="px-6 py-24" style={{ background: olive, color: lightOlive }}>
        <div className="mx-auto max-w-4xl">
          <p className="mb-16 text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: sand }}>Why Parents Trust Us</p>
          {[
            { num: "01", title: "State Licensed Data", desc: "Every listing verified against official state records. We only show licensed, approved providers." },
            { num: "02", title: "Neighborhood Search", desc: "Browse by your city to find care steps from home. We cover every corner of Ohio." },
            { num: "03", title: "Every Age Group", desc: "Infant care, toddler programs, preschool, and after-school. All in one place." },
          ].map((f, i) => (
            <div key={f.num}>
              <div className="flex gap-8 py-12">
                <span className="shrink-0 font-serif text-5xl font-bold" style={{ color: `${sand}40` }}>{f.num}</span>
                <div>
                  <h3 className="mb-3 font-serif text-3xl font-bold" style={{ color: cream }}>{f.title}</h3>
                  <p className="max-w-lg text-base leading-relaxed" style={{ color: `${lightOlive}cc` }}>{f.desc}</p>
                </div>
              </div>
              {i < 2 && <div className="h-px" style={{ background: `${lightOlive}20` }} />}
            </div>
          ))}
        </div>
      </section>

      {/* CITIES - Sand band, 2-column list with horizontal rules */}
      <section className="px-6 py-24" style={{ background: sand }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 flex items-end justify-between">
            <h2 className="font-serif text-4xl font-bold" style={{ color: brown }}>Browse by City</h2>
            <Link href="/cities" className="text-sm font-semibold" style={{ color: terracotta }}>All Cities <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid gap-x-16 sm:grid-cols-2">
            {topCities.map(({ city, count, slug }) => (
              <Link key={city} href={`/daycares/${slug}`} className="group flex items-baseline justify-between border-b py-4 transition-colors" style={{ borderColor: `${brown}15` }}>
                <span className="font-serif text-xl font-bold transition-colors group-hover:underline" style={{ color: brown }}>{city}</span>
                <span className="text-xs font-medium" style={{ color: `${brown}60` }}>{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Terracotta band again */}
      <section className="px-6 py-28 text-center" style={{ background: terracotta, color: cream }}>
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-4xl font-bold sm:text-5xl text-balance">Ready to find the perfect care?</h2>
          <div className="mt-8 flex justify-center">
            <Link href="/daycares" className="inline-flex items-center gap-2 border-b-2 pb-1 text-lg font-semibold" style={{ borderColor: cream, color: cream }}>
              <Search className="h-5 w-5" /> Start Your Search <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER - Thin, magazine style */}
      <footer className="px-6 py-10 text-center" style={{ background: cream }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 h-px" style={{ background: brown }} />
          <div className="flex flex-wrap justify-center gap-8 text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: brown }}>
            <Link href="/daycares">Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1 text-xs" style={{ color: `${brown}60` }}>
            Made with <Heart className="mx-1 h-3 w-3" style={{ color: terracotta }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
