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
import { MapPin, Search, ShieldCheck, Baby, ArrowRight, Heart, Zap } from "lucide-react";

/* =========================================================
   OPTION 5 — "Candy Pop" — Bento Grid
   The ENTIRE page is a bento grid of colorful tiles, each
   a different size. Memphis/geometric decorations. Bold
   primary colors. Very playful, very different layout.
   ========================================================= */

const hotPink = "#FF1493";
const electricBlue = "#0EA5E9";
const sunny = "#FACC15";
const lime = "#84CC16";
const nearBlack = "#1A1A2E";
const white = "#FFFFFF";
const lightBg = "#FFF5F8";

export default function Option5() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="min-h-screen px-3 py-3 sm:px-4 sm:py-4" style={{ background: nearBlack }}>
      {/* Back link */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: hotPink, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* TOP NAV TILE */}
      <div className="mb-3 flex items-center justify-between rounded-2xl px-6 py-4 sm:mb-4" style={{ background: white }}>
        <Link href="/draft/option-5" className="flex items-center gap-3">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-extrabold" style={{ color: hotPink }}>Ohio Parent Hub</span>
        </Link>
        <div className="hidden items-center gap-5 md:flex">
          <Link href="/daycares" className="text-sm font-bold" style={{ color: nearBlack }}>Daycares</Link>
          <Link href="/cities" className="text-sm font-bold" style={{ color: nearBlack }}>Cities</Link>
          <Button size="sm" className="rounded-full px-5 font-extrabold" style={{ background: electricBlue, color: white }} asChild>
            <Link href="/daycares"><Search className="mr-1 h-3.5 w-3.5" />Search</Link>
          </Button>
        </div>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">

        {/* HERO TILE - spans 4 cols, 2 rows on desktop */}
        <div className="col-span-2 row-span-2 flex flex-col justify-between rounded-2xl p-8 md:col-span-4 lg:col-span-4 lg:p-12" style={{ background: hotPink }}>
          {/* Memphis shapes */}
          <div className="pointer-events-none absolute -top-4 right-8 hidden h-16 w-16 rotate-12 rounded-lg lg:block" style={{ background: `${sunny}30` }} />
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest" style={{ background: sunny, color: nearBlack }}>
              <Zap className="h-3.5 w-3.5" /> Ohio&apos;s #1 Resource
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Finding Childcare
              <br />
              <span style={{ color: sunny }}>Should Be Simple!</span>
            </h1>
            <p className="mt-4 max-w-lg text-base font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
              Browse {daycares.length.toLocaleString()} licensed programs across {cityCounts.size} Ohio cities.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="h-12 rounded-full px-8 font-extrabold shadow-lg" style={{ background: sunny, color: nearBlack }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-4 w-4" />Find a Daycare</Link>
            </Button>
            <Button size="lg" className="h-12 rounded-full px-8 font-extrabold shadow-lg" style={{ background: electricBlue, color: white }} asChild>
              <Link href="/cities"><MapPin className="mr-2 h-4 w-4" />Browse Cities</Link>
            </Button>
          </div>
        </div>

        {/* STAT TILES - 2 cols on the right on desktop */}
        {[
          { value: daycares.length.toLocaleString(), label: "Programs", bg: sunny, text: nearBlack },
          { value: String(cityCounts.size), label: "Cities", bg: electricBlue, text: white },
          { value: "100%", label: "Licensed", bg: lime, text: nearBlack },
          { value: "Free", label: "Always", bg: white, text: hotPink },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center justify-center rounded-2xl p-5" style={{ background: s.bg, color: s.text }}>
            <span className="text-3xl font-extrabold">{s.value}</span>
            <span className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ opacity: 0.7 }}>{s.label}</span>
          </div>
        ))}

        {/* LOGO TILE */}
        <div className="flex items-center justify-center rounded-2xl p-6" style={{ background: lightBg }}>
          <Image src="/icon.png" alt="" width={80} height={80} className="rounded-2xl" />
        </div>

        {/* FEATURE TILES - Different sizes */}
        <div className="col-span-2 flex flex-col justify-center rounded-2xl p-8 md:col-span-2" style={{ background: electricBlue, color: white }}>
          <ShieldCheck className="mb-3 h-8 w-8" />
          <h3 className="text-xl font-extrabold">State Licensed</h3>
          <p className="mt-2 text-sm font-medium" style={{ opacity: 0.85 }}>Every program verified against official state records. Only licensed providers.</p>
        </div>

        <div className="flex flex-col justify-center rounded-2xl p-6" style={{ background: sunny, color: nearBlack }}>
          <MapPin className="mb-3 h-7 w-7" />
          <h3 className="text-lg font-extrabold">Local Focus</h3>
          <p className="mt-1 text-xs font-medium" style={{ opacity: 0.75 }}>Every corner of Ohio.</p>
        </div>

        <div className="flex flex-col justify-center rounded-2xl p-6" style={{ background: lime, color: nearBlack }}>
          <Baby className="mb-3 h-7 w-7" />
          <h3 className="text-lg font-extrabold">All Ages</h3>
          <p className="mt-1 text-xs font-medium" style={{ opacity: 0.75 }}>Infant to after-school.</p>
        </div>

        {/* Decorative shape tile */}
        <div className="flex items-center justify-center rounded-2xl" style={{ background: hotPink }}>
          <div className="h-16 w-16 rotate-45 rounded-lg" style={{ background: `${sunny}40` }} />
        </div>

        {/* SECTION HEADER TILE */}
        <div className="col-span-2 flex items-center justify-between rounded-2xl px-8 py-5 md:col-span-4 lg:col-span-6" style={{ background: white }}>
          <h2 className="text-2xl font-extrabold" style={{ color: nearBlack }}>Top Ohio Cities</h2>
          <Link href="/cities" className="flex items-center gap-1 text-sm font-extrabold" style={{ color: hotPink }}>
            All Cities <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* CITY TILES - Each one a bento tile */}
        {topCities.map(({ city, count, slug }, i) => {
          const bgs = [hotPink, electricBlue, sunny, lime, white, lightBg];
          const texts = [white, white, nearBlack, nearBlack, nearBlack, nearBlack];
          const bg = bgs[i % bgs.length];
          const text = texts[i % texts.length];
          const wide = i === 0 || i === 5;
          return (
            <Link key={city} href={`/daycares/${slug}`} className={`group block ${wide ? "col-span-2" : ""}`}>
              <div className="flex h-full flex-col justify-between rounded-2xl p-5 transition-all group-hover:-translate-y-1 group-hover:shadow-xl" style={{ background: bg, color: text }}>
                <div className="flex items-center justify-between">
                  <MapPin className="h-4 w-4" />
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-extrabold" style={{ background: "rgba(0,0,0,0.1)" }}>{count}</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-extrabold line-clamp-1">{city}</h3>
                  <span className="text-xs font-bold" style={{ opacity: 0.6 }}>{"View programs \u2192"}</span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Decorative circle tile */}
        <div className="flex items-center justify-center rounded-2xl" style={{ background: electricBlue }}>
          <div className="h-14 w-14 rounded-full" style={{ background: `${white}30` }} />
        </div>

        {/* CTA TILE - Full width */}
        <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl px-8 py-14 text-center md:col-span-4 lg:col-span-6" style={{ background: sunny }}>
          <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: nearBlack }}>Ready to find the perfect care?</h2>
          <p className="mt-3 text-base font-medium" style={{ color: `${nearBlack}99` }}>Join thousands of Ohio parents who trust us.</p>
          <div className="mt-6 flex gap-3">
            <Button size="lg" className="h-12 rounded-full px-8 font-extrabold shadow-lg" style={{ background: hotPink, color: white }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-4 w-4" />Start Your Search</Link>
            </Button>
            <Button size="lg" className="h-12 rounded-full px-8 font-extrabold shadow-lg" style={{ background: nearBlack, color: white }} asChild>
              <Link href="/cities">Browse Cities</Link>
            </Button>
          </div>
        </div>

        {/* FOOTER TILE */}
        <div className="col-span-2 flex items-center justify-between rounded-2xl px-6 py-4 md:col-span-4 lg:col-span-6" style={{ background: `${white}10` }}>
          <div className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={28} height={28} className="rounded-md" />
            <span className="text-sm font-extrabold" style={{ color: hotPink }}>Ohio Parent Hub</span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Link href="/daycares">Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
          </div>
          <div className="hidden items-center gap-1 text-xs sm:flex" style={{ color: "rgba(255,255,255,0.3)" }}>
            <Heart className="h-3 w-3" style={{ color: hotPink }} /> Ohio families
          </div>
        </div>
      </div>
    </div>
  );
}
