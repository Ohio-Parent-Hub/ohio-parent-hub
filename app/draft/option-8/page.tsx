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
import { MapPin, Search, ShieldCheck, Baby, ArrowRight, Heart } from "lucide-react";

/* =========================================================
   OPTION 8 — "Wonder Skies: Editorial Magazine"
   Same palette, editorial feel: full-width color sections,
   oversized typography, asymmetric grids, dramatic scale
   ========================================================= */

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const blush = "#F8D7DA";

export default function Option8() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#fff", color: dark }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: dark, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV -- Tight editorial */}
      <nav className="sticky top-0 z-40 border-b-2 bg-white/95 backdrop-blur-sm" style={{ borderColor: dark }}>
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/draft/option-8" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={28} height={28} className="rounded" />
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: dark }}>Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/daycares" className="text-xs font-bold uppercase tracking-widest" style={{ color: dark }}>Daycares</Link>
            <Link href="/cities" className="text-xs font-bold uppercase tracking-widest" style={{ color: dark }}>Cities</Link>
            <Link href="/about" className="text-xs font-bold uppercase tracking-widest" style={{ color: dark }}>About</Link>
          </div>
        </div>
      </nav>

      {/* HERO -- Full-bleed, oversized text */}
      <section className="relative" style={{ background: teal }}>
        <div className="mx-auto grid max-w-7xl md:grid-cols-2">
          {/* Left -- Massive type */}
          <div className="flex flex-col justify-center px-8 py-24 sm:px-12 sm:py-36">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em]" style={{ color: gold }}>The #1 Resource</p>
            <h1 className="font-serif text-6xl font-bold leading-none text-white sm:text-7xl lg:text-8xl">
              Finding
              <br />
              Childcare
              <br />
              <span style={{ color: blush }}>Simply.</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-white/75">
              {daycares.length.toLocaleString()} licensed programs. {cityCounts.size} cities. One search.
            </p>
            <div className="mt-10">
              <Button size="lg" className="h-12 rounded-none px-10 text-sm font-bold uppercase tracking-widest" style={{ background: gold, color: "#fff" }} asChild>
                <Link href="/daycares"><Search className="mr-2 h-4 w-4" />Search Now</Link>
              </Button>
            </div>
          </div>
          {/* Right -- Image and color block */}
          <div className="relative hidden md:block" style={{ background: pink }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src="/icon.png" alt="Ohio Parent Hub" width={240} height={240} className="rounded-3xl opacity-90 shadow-2xl" />
            </div>
            {/* Gold accent strip */}
            <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: gold }} />
          </div>
        </div>
      </section>

      {/* STATS -- Full-bleed alternating color blocks */}
      <section className="grid grid-cols-2 md:grid-cols-4">
        {[
          { value: daycares.length.toLocaleString(), label: "Programs", bg: cream, color: dark },
          { value: String(cityCounts.size), label: "Cities", bg: gold, color: "#fff" },
          { value: "100%", label: "Licensed", bg: pink, color: "#fff" },
          { value: "Free", label: "Always", bg: teal, color: "#fff" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center justify-center py-12" style={{ background: s.bg, color: s.color }}>
            <span className="font-serif text-4xl font-bold">{s.value}</span>
            <span className="mt-2 text-xs font-bold uppercase tracking-widest" style={{ opacity: 0.7 }}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* FEATURES -- Asymmetric editorial layout */}
      <section className="py-24 px-6" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em]" style={{ color: pink }}>Why Parents Trust Us</p>
          <h2 className="mb-16 font-serif text-5xl font-bold" style={{ color: dark }}>Built for Ohio Families</h2>

          {/* Asymmetric grid */}
          <div className="grid gap-6 md:grid-cols-5">
            {/* Large feature */}
            <div className="rounded-none p-10 md:col-span-3" style={{ background: teal }}>
              <ShieldCheck className="mb-6 h-10 w-10 text-white" />
              <h3 className="mb-4 font-serif text-3xl font-bold text-white">State Licensed</h3>
              <p className="max-w-md text-lg leading-relaxed text-white/80">
                Every program listed is verified against official state records. We only show licensed providers to ensure your child&apos;s safety and quality of care.
              </p>
            </div>
            {/* Stacked features */}
            <div className="flex flex-col gap-6 md:col-span-2">
              <div className="flex-1 rounded-none p-8" style={{ background: pink }}>
                <MapPin className="mb-4 h-8 w-8 text-white" />
                <h3 className="mb-2 font-serif text-2xl font-bold text-white">Local Focus</h3>
                <p className="text-white/80 leading-relaxed">Search by city for care in your neighborhood. Every corner of Ohio.</p>
              </div>
              <div className="flex-1 rounded-none p-8" style={{ background: gold }}>
                <Baby className="mb-4 h-8 w-8 text-white" />
                <h3 className="mb-2 font-serif text-2xl font-bold text-white">All Ages</h3>
                <p className="text-white/80 leading-relaxed">Infant care to after-school. Filter by age group.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CITIES -- Two-column editorial */}
      <section className="py-24 px-6" style={{ background: cream }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.4em]" style={{ color: teal }}>Local Communities</p>
              <h2 className="font-serif text-5xl font-bold" style={{ color: dark }}>Top Cities</h2>
            </div>
            <Link href="/cities" className="text-sm font-bold uppercase tracking-widest" style={{ color: dark }}>
              All Cities <ArrowRight className="ml-1 inline h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {topCities.map(({ city, count, slug }, i) => {
              const bgs = [teal, pink, gold, sage];
              const bg = bgs[i % 4];
              return (
                <Link key={city} href={`/daycares/${slug}`} className="group block">
                  <div className="flex flex-col items-center py-6 transition-all group-hover:-translate-y-1" style={{ borderBottom: `4px solid ${bg}` }}>
                    <span className="font-serif text-2xl font-bold" style={{ color: bg }}>{count}</span>
                    <h3 className="mt-1 text-sm font-bold uppercase tracking-wide line-clamp-1" style={{ color: dark }}>{city}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA -- Full bleed, dramatic */}
      <section className="relative" style={{ background: dark }}>
        <div className="mx-auto grid max-w-7xl md:grid-cols-2">
          <div className="flex flex-col justify-center px-8 py-24 sm:px-12">
            <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl">Ready to find the perfect care?</h2>
            <p className="mt-6 text-lg text-white/70">Join thousands of Ohio parents.</p>
            <div className="mt-10 flex gap-4">
              <Button size="lg" className="h-12 rounded-none px-10 text-sm font-bold uppercase tracking-widest" style={{ background: gold, color: "#fff" }} asChild>
                <Link href="/daycares">Search</Link>
              </Button>
              <Button size="lg" className="h-12 rounded-none px-10 text-sm font-bold uppercase tracking-widest" style={{ background: pink, color: "#fff" }} asChild>
                <Link href="/cities">Cities</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block" style={{ background: teal }}>
            <div className="flex h-full items-center justify-center">
              <Image src="/icon.png" alt="Ohio Parent Hub" width={160} height={160} className="rounded-2xl opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 py-10 px-6" style={{ borderColor: dark, background: "#fff" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={28} height={28} className="rounded" />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: dark }}>Ohio Parent Hub</span>
          </div>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest" style={{ color: `${dark}80` }}>
            <Link href="/daycares">Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: `${dark}50` }}>
            Made with <Heart className="mx-1 h-3 w-3" style={{ color: pink }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
