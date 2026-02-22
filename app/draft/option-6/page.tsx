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

import { Button } from "@/components/ui/button";
import { MapPin, Search, ShieldCheck, Baby, ArrowRight, Heart, BookOpen } from "lucide-react";

/* =========================================================
   OPTION 6 — "Wonder Skies: Minimalist Zen"
   Same palette but ultra-minimal: massive whitespace, thin
   lines, sparse decoration, large breathing room
   ========================================================= */

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";

export default function Option6() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#FDFCFA", color: dark }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: teal, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV -- ultra thin */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-8">
          <Link href="/draft/option-6" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={32} height={32} className="rounded-md" />
            <span className="text-sm font-medium tracking-wide" style={{ color: dark }}>Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/daycares" className="text-xs font-medium uppercase tracking-widest" style={{ color: `${dark}99` }}>Daycares</Link>
            <Link href="/cities" className="text-xs font-medium uppercase tracking-widest" style={{ color: `${dark}99` }}>Cities</Link>
            <Link href="/about" className="text-xs font-medium uppercase tracking-widest" style={{ color: `${dark}99` }}>About</Link>
          </div>
        </div>
        <div className="h-px w-full" style={{ background: `${sage}40` }} />
      </nav>

      {/* HERO -- Massive whitespace, centered, just text */}
      <section className="px-8 py-40 sm:py-52">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-8 text-xs font-medium uppercase tracking-[0.3em]" style={{ color: pink }}>Ohio&apos;s Trusted Parent Resource</p>
          <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl md:text-7xl" style={{ color: dark }}>
            Finding Childcare
            <br />
            <span style={{ color: teal }}>Should Be Simple.</span>
          </h1>
          <p className="mx-auto mt-10 max-w-lg text-base leading-relaxed" style={{ color: `${dark}88` }}>
            Browse {daycares.length.toLocaleString()} licensed programs across {cityCounts.size} Ohio cities. All verified. Always free.
          </p>
          <div className="mt-12 flex justify-center gap-4">
            <Link href="/daycares" className="inline-flex items-center gap-2 border-b-2 pb-1 text-sm font-medium transition-colors" style={{ borderColor: teal, color: teal }}>
              <Search className="h-4 w-4" /> Find a Daycare
            </Link>
            <span style={{ color: `${sage}80` }}>|</span>
            <Link href="/cities" className="inline-flex items-center gap-2 border-b-2 pb-1 text-sm font-medium transition-colors" style={{ borderColor: pink, color: pink }}>
              <MapPin className="h-4 w-4" /> Browse Cities
            </Link>
          </div>
        </div>
      </section>

      {/* THIN DIVIDER */}
      <div className="mx-auto w-16 h-px" style={{ background: gold }} />

      {/* STATS -- Horizontal, ultra-minimal */}
      <section className="px-8 py-20">
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-16">
          {[
            { value: daycares.length.toLocaleString(), label: "Programs", color: teal },
            { value: String(cityCounts.size), label: "Cities", color: gold },
            { value: "100%", label: "Licensed", color: pink },
            { value: "Free", label: "For Parents", color: sage },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <span className="font-serif text-4xl font-bold" style={{ color: s.color }}>{s.value}</span>
              <p className="mt-2 text-xs font-medium uppercase tracking-widest" style={{ color: `${dark}60` }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto w-16 h-px" style={{ background: sage }} />

      {/* FEATURES -- Clean rows, no cards */}
      <section className="px-8 py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-16 text-center text-xs font-medium uppercase tracking-[0.3em]" style={{ color: gold }}>Why Parents Trust Us</p>
          <div className="flex flex-col gap-16">
            {[
              { icon: ShieldCheck, title: "State Licensed", desc: "Every program verified against official state records. Only licensed providers.", color: teal },
              { icon: MapPin, title: "Local Focus", desc: "Search by city to find care right in your neighborhood. We cover every corner of Ohio.", color: pink },
              { icon: Baby, title: "All Ages", desc: "From infant care to preschool and after-school programs. Filter by age group.", color: gold },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: `${f.color}15` }}>
                  <f.icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold" style={{ color: dark }}>{f.title}</h3>
                  <p className="mt-2 leading-relaxed" style={{ color: `${dark}88` }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-16 h-px" style={{ background: pink }} />

      {/* CITIES -- Simple list */}
      <section className="px-8 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 flex items-end justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: teal }}>Top Cities</p>
            <Link href="/cities" className="text-xs font-medium uppercase tracking-widest" style={{ color: pink }}>
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
            {topCities.map(({ city, count, slug }) => (
              <Link key={city} href={`/daycares/${slug}`} className="group flex items-center justify-between border-b py-5 transition-colors" style={{ borderColor: `${sage}30` }}>
                <span className="font-serif text-lg font-medium transition-colors" style={{ color: dark }}>{city}</span>
                <span className="text-xs font-medium" style={{ color: `${dark}50` }}>{count} programs</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-16 h-px" style={{ background: teal }} />

      {/* CTA -- Minimal */}
      <section className="px-8 py-32 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl font-bold" style={{ color: dark }}>Ready to find the perfect care?</h2>
          <p className="mt-4 leading-relaxed" style={{ color: `${dark}88` }}>Join thousands of Ohio parents who trust us.</p>
          <Link href="/daycares" className="mt-8 inline-flex items-center gap-2 border-b-2 pb-1 text-sm font-medium" style={{ borderColor: teal, color: teal }}>
            Start Your Search <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <div className="h-px w-full" style={{ background: `${sage}30` }} />
          <div className="flex gap-8 text-xs font-medium uppercase tracking-widest mt-4" style={{ color: `${dark}60` }}>
            <Link href="/daycares">Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: `${dark}40` }}>
            Made with <Heart className="mx-1 h-3 w-3" style={{ color: pink }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
