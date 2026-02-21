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
import { MapPin, Search, ShieldCheck, Baby, ArrowRight, Heart, Sparkles } from "lucide-react";

/* =========================================================
   OPTION 9 — "Wonder Skies: Storybook Illustrated"
   Same palette but heavily illustrated feel: wavy dividers,
   hand-drawn-style soft borders, layered pastel backgrounds,
   warm & childlike, like a children's book
   ========================================================= */

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const blush = "#F8D7DA";
const lightTeal = "#D5E5E3";
const lightGold = "#F5E9BE";
const lightPink = "#FADED4";

function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      fill="none"
      preserveAspectRatio="none"
      className={`block w-full ${flip ? "rotate-180" : ""}`}
      style={{ height: "50px", marginBottom: flip ? 0 : "-1px", marginTop: flip ? "-1px" : 0 }}
    >
      <path
        d="M0 40C180 80 360 0 540 40C720 80 900 0 1080 40C1260 80 1440 0 1440 40V80H0V40Z"
        fill={fill}
      />
    </svg>
  );
}

function SparkleDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
    </svg>
  );
}

export default function Option9() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: cream, color: dark }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: teal, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV -- Soft, rounded, storybook feel */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: `${cream}ee` }}>
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/draft/option-9" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={44} height={44} className="rounded-xl shadow-md" />
            <span className="font-serif text-xl font-bold" style={{ color: teal }}>Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/daycares" className="text-sm font-medium" style={{ color: dark }}>Find Daycares</Link>
            <Link href="/cities" className="text-sm font-medium" style={{ color: dark }}>Browse Cities</Link>
            <Button size="sm" className="rounded-full px-5 font-bold" style={{ background: pink, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-1.5 h-3.5 w-3.5" />Search</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO -- Layered pastel background with sparkles */}
      <section className="relative overflow-hidden px-6 py-28 sm:py-36" style={{ background: lightTeal }}>
        {/* Decorative elements */}
        <SparkleDecor className="absolute top-10 left-[8%] h-6 w-6 text-gold/30 animate-pulse" style={{ color: gold }} />
        <SparkleDecor className="absolute top-20 right-[12%] h-4 w-4 text-pink/30 animate-pulse" style={{ color: pink }} />
        <SparkleDecor className="absolute bottom-24 left-[15%] h-5 w-5 text-teal/20 animate-pulse" style={{ color: teal }} />
        <SparkleDecor className="absolute bottom-16 right-[20%] h-3 w-3 text-gold/30 animate-pulse" style={{ color: gold }} />
        <SparkleDecor className="absolute top-1/2 left-[4%] h-4 w-4 text-pink/20 animate-pulse" style={{ color: pink }} />
        <SparkleDecor className="absolute top-32 right-[5%] h-5 w-5" style={{ color: `${sage}60` }} />

        {/* Soft background circles */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full" style={{ background: `${gold}15` }} />
        <div className="pointer-events-none absolute top-1/3 right-[10%] h-32 w-32 rounded-full" style={{ background: `${sage}20` }} />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full p-3 shadow-lg" style={{ background: "rgba(255,255,255,0.6)" }}>
              <Image src="/icon.png" alt="Ohio Parent Hub" width={100} height={100} className="rounded-full" />
            </div>
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm" style={{ background: "rgba(255,255,255,0.7)", color: teal }}>
            <Sparkles className="h-4 w-4" style={{ color: gold }} />
            Ohio&apos;s Trusted Parent Resource
          </div>

          <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl" style={{ color: dark }}>
            <span className="text-balance">Finding Childcare</span>
            <br className="hidden sm:block" />
            <span style={{ color: pink }}>Should Be Simple.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed" style={{ color: `${dark}bb` }}>
            Browse <strong style={{ color: gold }}>{daycares.length.toLocaleString()}</strong> licensed programs across <strong style={{ color: gold }}>{cityCounts.size}</strong> Ohio cities.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-lg" style={{ background: teal, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Find a Daycare</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-full border-2 px-10 text-lg font-bold" style={{ borderColor: pink, color: pink }} asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Wave into stats */}
      <WaveDivider fill={cream} />

      {/* STATS -- Pastel cards in a row */}
      <section className="px-6 pb-16" style={{ background: cream }}>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-5 md:grid-cols-4">
          {[
            { value: daycares.length.toLocaleString(), label: "Programs", bg: lightTeal, accent: teal },
            { value: String(cityCounts.size), label: "Cities", bg: lightPink, accent: pink },
            { value: "100%", label: "Licensed", bg: lightGold, accent: gold },
            { value: "Free", label: "For Parents", bg: `${sage}30`, accent: sage },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl p-6 shadow-sm" style={{ background: s.bg }}>
              <SparkleDecor className="mb-2 h-4 w-4" style={{ color: `${s.accent}60` }} />
              <span className="font-serif text-3xl font-bold" style={{ color: s.accent }}>{s.value}</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: `${dark}88` }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Wave into features */}
      <WaveDivider fill={blush} />

      {/* FEATURES */}
      <section className="px-6 pb-24 pt-12" style={{ background: blush }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <SparkleDecor className="mx-auto mb-4 h-6 w-6" style={{ color: `${gold}60` }} />
            <h2 className="font-serif text-4xl font-bold" style={{ color: dark }}>Why Parents Love Us</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "State Licensed", desc: "Every program verified against state records. Only licensed providers.", bg: lightTeal, iconBg: teal },
              { icon: MapPin, title: "Local Focus", desc: "Search by city. We cover every corner of Ohio.", bg: lightGold, iconBg: gold },
              { icon: Baby, title: "All Ages", desc: "Infant care to after-school programs. Filter by age.", bg: lightPink, iconBg: pink },
            ].map((f) => (
              <div key={f.title} className="rounded-3xl p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: f.bg }}>
                <div className="relative mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm" style={{ background: f.iconBg }}>
                    <f.icon className="h-8 w-8 text-white" />
                  </div>
                  <SparkleDecor className="absolute -top-2 -right-2 h-4 w-4" style={{ color: `${gold}50` }} />
                </div>
                <h3 className="mb-3 font-serif text-2xl font-bold" style={{ color: dark }}>{f.title}</h3>
                <p className="leading-relaxed" style={{ color: `${dark}88` }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave into cities */}
      <WaveDivider fill="#fff" />

      {/* CITIES */}
      <section className="px-6 pb-24 pt-12" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <SparkleDecor className="mb-3 h-5 w-5" style={{ color: `${teal}50` }} />
              <h2 className="font-serif text-4xl font-bold" style={{ color: dark }}>Explore Top Cities</h2>
            </div>
            <Button variant="outline" className="group rounded-full border-2 font-bold" style={{ borderColor: teal, color: teal }} asChild>
              <Link href="/cities">View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {topCities.map(({ city, count, slug }, i) => {
              const pastels = [lightTeal, lightPink, lightGold, `${sage}30`];
              const accents = [teal, pink, gold, sage];
              return (
                <Link key={city} href={`/daycares/${slug}`} className="group block">
                  <div className="flex h-full flex-col rounded-2xl p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md" style={{ background: pastels[i % 4] }}>
                    <div className="mb-3 flex items-center justify-between">
                      <MapPin className="h-4 w-4" style={{ color: accents[i % 4] }} />
                      <span className="rounded-full px-3 py-0.5 text-xs font-bold" style={{ background: "rgba(255,255,255,0.6)", color: accents[i % 4] }}>{count}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold line-clamp-1" style={{ color: dark }}>{city}</h3>
                    <p className="mt-auto pt-2 text-xs" style={{ color: `${dark}50` }}>{"View programs \u2192"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Wave into CTA */}
      <WaveDivider fill={teal} />

      {/* CTA */}
      <section className="relative overflow-hidden px-6 pb-28 pt-12 text-center" style={{ background: teal }}>
        <SparkleDecor className="absolute top-12 left-[10%] h-5 w-5 text-white/20 animate-pulse" />
        <SparkleDecor className="absolute bottom-16 right-[12%] h-4 w-4 animate-pulse" style={{ color: `${gold}40` }} />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl text-balance">Ready to find the perfect care?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">Join thousands of Ohio parents who trust us.</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-lg" style={{ background: gold, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Start Your Search</Link>
            </Button>
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-lg" style={{ background: pink, color: "#fff" }} asChild>
              <Link href="/cities">Browse Cities</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Wave into footer */}
      <WaveDivider fill={cream} />

      {/* FOOTER */}
      <footer className="px-6 pb-12 pt-4" style={{ background: cream }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={48} height={48} className="rounded-xl shadow-sm" />
          <p className="font-serif text-lg font-bold" style={{ color: teal }}>Ohio Parent Hub</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium" style={{ color: `${dark}88` }}>
            <Link href="/daycares">Find Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-1 text-sm" style={{ color: `${dark}50` }}>
            Made with <Heart className="mx-1 h-3.5 w-3.5" style={{ color: pink }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
