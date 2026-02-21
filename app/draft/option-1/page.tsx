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
import { MapPin, Search, ShieldCheck, Baby, ArrowRight, Heart, Sparkles, BookOpen, ChevronRight } from "lucide-react";

/* =========================================================
   OPTION 1 — "Midnight Modern"
   Dark mode, asymmetric 2-column hero, glassmorphism cards,
   horizontal city scroll, SaaS-professional vibe
   ========================================================= */

const navy = "#0B1120";
const surface = "#131B2E";
const card = "#1A2340";
const blue = "#3B82F6";
const amber = "#F59E0B";
const slate = "#8B9CC0";
const white = "#EEF2FF";

export default function Option1() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: navy, color: white }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: blue, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV - minimal top bar with glow line */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: `${navy}dd` }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/draft/option-1" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={32} height={32} className="rounded-lg" />
            <span className="text-base font-bold" style={{ color: blue }}>Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/daycares" className="text-sm" style={{ color: slate }}>Daycares</Link>
            <Link href="/cities" className="text-sm" style={{ color: slate }}>Cities</Link>
            <Link href="/about" className="text-sm" style={{ color: slate }}>About</Link>
            <Button size="sm" className="rounded-lg font-bold" style={{ background: amber, color: navy }} asChild>
              <Link href="/daycares"><Search className="mr-1.5 h-3.5 w-3.5" />Search</Link>
            </Button>
          </div>
        </div>
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${blue}40, ${amber}40, transparent)` }} />
      </nav>

      {/* HERO - Asymmetric 2 columns: big text left, stat grid right */}
      <section className="relative overflow-hidden px-6 py-28 lg:py-36">
        {/* Background glow */}
        <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full blur-[120px]" style={{ background: `${blue}10` }} />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full blur-[100px]" style={{ background: `${amber}08` }} />

        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-5">
          {/* Left: 3 cols */}
          <div className="lg:col-span-3">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ borderColor: `${blue}30`, color: blue }}>
              <Sparkles className="h-3.5 w-3.5" style={{ color: amber }} /> Trusted by Ohio Parents
            </div>
            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl" style={{ color: white }}>
              Finding Childcare
              <br />
              <span style={{ color: amber }}>Should Be Simple.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed" style={{ color: slate }}>
              Browse <strong style={{ color: blue }}>{daycares.length.toLocaleString()}</strong> licensed programs across{" "}
              <strong style={{ color: blue }}>{cityCounts.size}</strong> Ohio cities. Verified data. Always free.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="h-12 rounded-lg px-8 font-bold" style={{ background: blue, color: "#fff" }} asChild>
                <Link href="/daycares"><Search className="mr-2 h-4 w-4" />Find a Daycare</Link>
              </Button>
              <Button size="lg" className="h-12 rounded-lg px-8 font-bold" style={{ background: `${amber}15`, color: amber }} asChild>
                <Link href="/cities"><MapPin className="mr-2 h-4 w-4" />Browse Cities</Link>
              </Button>
            </div>
          </div>

          {/* Right: 2 cols - Stat cards grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: daycares.length.toLocaleString(), label: "Programs", accent: blue },
                { value: String(cityCounts.size), label: "Cities", accent: amber },
                { value: "100%", label: "Licensed", accent: blue },
                { value: "Free", label: "Always", accent: amber },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border p-6 backdrop-blur-md" style={{ background: `${card}80`, borderColor: `${s.accent}20` }}>
                  <span className="font-serif text-3xl font-bold" style={{ color: s.accent }}>{s.value}</span>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: slate }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - 3 glass cards in a row */}
      <section className="px-6 py-24" style={{ background: surface }}>
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: amber }}>Why Parents Trust Us</p>
          <div className="mb-12 flex items-end justify-between">
            <h2 className="font-serif text-4xl font-bold" style={{ color: white }}>Built for Ohio Families</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "State Licensed", desc: "Every program verified against official state records. Only licensed providers.", accent: blue },
              { icon: MapPin, title: "Local Focus", desc: "Search by city to find care in your neighborhood. Every corner of Ohio.", accent: amber },
              { icon: Baby, title: "All Ages", desc: "Infant care to after-school. Filter by age, type, and location.", accent: blue },
            ].map((f) => (
              <div key={f.title} className="group rounded-xl border p-8 transition-all hover:-translate-y-1" style={{ borderColor: `${f.accent}15`, background: card }}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: `${f.accent}15` }}>
                  <f.icon className="h-6 w-6" style={{ color: f.accent }} />
                </div>
                <h3 className="mb-3 text-xl font-bold" style={{ color: white }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: slate }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES - Horizontal scrolling cards */}
      <section className="px-6 py-24" style={{ background: navy }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: blue }}>Explore</p>
              <h2 className="font-serif text-4xl font-bold" style={{ color: white }}>Top Ohio Cities</h2>
            </div>
            <Link href="/cities" className="hidden items-center gap-1 text-sm font-semibold md:inline-flex" style={{ color: amber }}>
              All Cities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {topCities.map(({ city, count, slug }, i) => {
              const accent = i % 2 === 0 ? blue : amber;
              return (
                <Link key={city} href={`/daycares/${slug}`} className="group shrink-0">
                  <div className="flex h-full w-48 flex-col rounded-xl border p-5 transition-all group-hover:-translate-y-1" style={{ borderColor: `${accent}15`, background: card }}>
                    <MapPin className="mb-3 h-4 w-4" style={{ color: accent }} />
                    <h3 className="text-base font-bold line-clamp-1" style={{ color: white }}>{city}</h3>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="text-xs font-semibold" style={{ color: accent }}>{count} programs</span>
                      <ChevronRight className="h-3.5 w-3.5" style={{ color: slate }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link href="/cities" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold md:hidden" style={{ color: amber }}>
            All Cities <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-6 py-28 text-center" style={{ background: surface }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${blue}12, transparent 70%)` }} />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="font-serif text-4xl font-bold sm:text-5xl text-balance" style={{ color: white }}>Ready to find the perfect care?</h2>
          <p className="mx-auto mt-6 max-w-lg text-lg" style={{ color: slate }}>Join thousands of Ohio parents who trust us.</p>
          <Button size="lg" className="mt-8 h-14 rounded-lg px-10 text-lg font-bold" style={{ background: amber, color: navy }} asChild>
            <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Start Your Search</Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t px-6 py-12" style={{ borderColor: `${blue}10`, background: navy }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 text-center">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={40} height={40} className="rounded-lg" />
          <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: slate }}>
            <Link href="/daycares">Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: `${slate}80` }}>
            Made with <Heart className="mx-1 h-3 w-3" style={{ color: amber }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
