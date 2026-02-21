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
import { MapPin, Search, ShieldCheck, Baby, ArrowRight, Heart, BookOpen, Sparkles } from "lucide-react";

/* =========================================================
   OPTION 7 — "Wonder Skies: Retro Groovy"
   Same palette, 70s-inspired: oversized rounded shapes,
   chunky borders, bold color blocking, playful stacking
   ========================================================= */

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const blush = "#F8D7DA";

export default function Option7() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: cream, color: dark }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: gold, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV -- Chunky rounded */}
      <nav className="sticky top-0 z-40" style={{ background: teal }}>
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/draft/option-7" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={44} height={44} className="rounded-full border-4 border-white/30" />
            <span className="text-xl font-extrabold text-white">Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/daycares" className="rounded-full px-4 py-2 text-sm font-bold text-white/90 hover:bg-white/10 transition-colors">Daycares</Link>
            <Link href="/cities" className="rounded-full px-4 py-2 text-sm font-bold text-white/90 hover:bg-white/10 transition-colors">Cities</Link>
            <Button size="sm" className="rounded-full border-4 border-white/30 px-6 font-extrabold shadow-md" style={{ background: gold, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-1.5 h-3.5 w-3.5" />Search</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO -- Big stacked color blocks */}
      <section className="relative overflow-hidden" style={{ background: pink }}>
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            {/* Left -- Logo in a big circle */}
            <div className="flex shrink-0 items-center justify-center">
              <div className="flex h-48 w-48 items-center justify-center rounded-full border-8 shadow-xl" style={{ borderColor: "rgba(255,255,255,0.4)", background: teal }}>
                <Image src="/icon.png" alt="Ohio Parent Hub" width={120} height={120} className="rounded-full" />
              </div>
            </div>
            {/* Right -- Text */}
            <div className="text-center md:text-left">
              <div className="mb-4 inline-block rounded-full border-4 px-6 py-2 text-sm font-extrabold uppercase tracking-widest" style={{ borderColor: gold, color: dark }}>
                Ohio&apos;s #1 Parent Resource
              </div>
              <h1 className="font-serif text-5xl font-bold sm:text-6xl md:text-7xl" style={{ color: dark }}>
                Finding Childcare
                <br />
                <span className="text-white">Should Be Simple.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed" style={{ color: `${dark}cc` }}>
                Browse <strong>{daycares.length.toLocaleString()}</strong> licensed programs across <strong>{cityCounts.size}</strong> Ohio cities.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="h-14 rounded-full border-4 px-10 text-lg font-extrabold shadow-lg" style={{ background: gold, borderColor: `${gold}`, color: "#fff" }} asChild>
                  <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Find a Daycare</Link>
                </Button>
                <Button size="lg" className="h-14 rounded-full border-4 px-10 text-lg font-extrabold" style={{ background: "transparent", borderColor: dark, color: dark }} asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Rounded bottom edge */}
        <svg viewBox="0 0 1440 80" fill="none" className="block w-full" preserveAspectRatio="none" style={{ height: "60px" }}>
          <ellipse cx="720" cy="0" rx="900" ry="80" fill={cream} />
        </svg>
      </section>

      {/* STATS -- Retro rounded badges */}
      <section className="px-6 py-16" style={{ background: cream }}>
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-6">
          {[
            { value: daycares.length.toLocaleString(), label: "Programs", bg: teal },
            { value: String(cityCounts.size), label: "Cities", bg: gold },
            { value: "100%", label: "Licensed", bg: pink },
            { value: "Free", label: "For Parents", bg: sage },
          ].map((s) => (
            <div key={s.label} className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-white shadow-lg sm:h-32 sm:w-32" style={{ background: s.bg }}>
              <span className="font-serif text-2xl font-bold text-white">{s.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES -- Chunky bordered cards */}
      <section className="py-24 px-6" style={{ background: teal }}>
        {/* Rounded top edge */}
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-4xl font-bold text-white">Why Parents <span style={{ color: gold }}>Trust</span> Us</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "State Licensed", desc: "Every program verified against state records.", bg: cream, border: gold },
              { icon: MapPin, title: "Local Focus", desc: "Search by city for care in your neighborhood.", bg: cream, border: pink },
              { icon: Baby, title: "All Ages", desc: "From infant care to after-school programs.", bg: cream, border: teal },
            ].map((f) => (
              <div key={f.title} className="rounded-3xl border-4 p-8 transition-all hover:-translate-y-2 hover:shadow-xl" style={{ background: f.bg, borderColor: f.border }}>
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-4" style={{ borderColor: f.border, background: `${f.border}20` }}>
                  <f.icon className="h-7 w-7" style={{ color: f.border }} />
                </div>
                <h3 className="mb-3 font-serif text-2xl font-bold" style={{ color: dark }}>{f.title}</h3>
                <p className="leading-relaxed" style={{ color: `${dark}88` }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="py-24 px-6" style={{ background: cream }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="font-serif text-4xl font-bold" style={{ color: dark }}>Explore <span style={{ color: teal }}>Top Cities</span></h2>
            <Button className="group rounded-full border-4 font-extrabold" style={{ borderColor: teal, background: "transparent", color: teal }} asChild>
              <Link href="/cities">View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {topCities.map(({ city, count, slug }, i) => {
              const accents = [teal, pink, gold, sage];
              const a = accents[i % 4];
              return (
                <Link key={city} href={`/daycares/${slug}`} className="group block">
                  <div className="flex h-full flex-col items-center rounded-2xl border-4 p-5 text-center transition-all group-hover:-translate-y-1 group-hover:shadow-lg" style={{ borderColor: a, background: "#fff" }}>
                    <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ background: a }}>{count}</span>
                    <h3 className="font-serif text-base font-bold line-clamp-1" style={{ color: dark }}>{city}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-28 text-center" style={{ background: gold }}>
        <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full border-8" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full border-8" style={{ borderColor: "rgba(255,255,255,0.15)" }} />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl text-balance">Ready to find the perfect care?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">Join thousands of Ohio parents who trust us.</p>
          <Button size="lg" className="mt-10 h-14 rounded-full border-4 border-white/30 px-10 text-lg font-extrabold shadow-xl" style={{ background: teal, color: "#fff" }} asChild>
            <Link href="/daycares">Start Your Search</Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6" style={{ background: teal }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={56} height={56} className="rounded-full border-4 border-white/30" />
          <p className="text-lg font-extrabold text-white">Ohio Parent Hub</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-white/70">
            <Link href="/daycares">Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
          </div>
          <div className="flex items-center gap-1 text-sm text-white/50">
            Made with <Heart className="mx-1 h-3.5 w-3.5" style={{ color: pink }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
