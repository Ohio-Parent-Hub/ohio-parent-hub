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
import { MapPin, Search, ShieldCheck, Sparkles, Baby, ArrowRight, Heart, BookOpen, Waves } from "lucide-react";

/* =========================================================
   OPTION 3 — "Ocean Breeze"
   Coastal blues, sandy beige, coral, seafoam
   Fresh, clean, airy
   ========================================================= */

export default function Option3() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  const sky = "#E8F4FD";
  const ocean = "#2980B9";
  const deepOcean = "#1A5276";
  const seafoam = "#76D7C4";
  const coral = "#E87461";
  const sandColor = "#F5E6D3";
  const white = "#FFFFFF";

  return (
    <div className="flex min-h-screen flex-col" style={{ background: sky, color: deepOcean }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: ocean, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ borderColor: `${ocean}20`, background: `${white}ee` }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/draft/option-3" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-bold" style={{ color: ocean }}>Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/daycares" className="text-sm font-medium" style={{ color: deepOcean }}>Find Daycares</Link>
            <Link href="/cities" className="text-sm font-medium" style={{ color: deepOcean }}>Cities</Link>
            <Button size="sm" className="rounded-full px-5 font-bold" style={{ background: coral, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-1.5 h-3.5 w-3.5" />Search</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO -- gradient sky to white */}
      <section className="relative overflow-hidden px-6 py-32 sm:py-40" style={{ background: `linear-gradient(180deg, ${ocean} 0%, ${seafoam}60 60%, ${sky} 100%)` }}>
        {/* Wave SVG at bottom */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" style={{ height: "80px" }}>
          <path d="M0 60C240 120 480 0 720 60C960 120 1200 0 1440 60V120H0V60Z" fill={sky} />
        </svg>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={100} height={100} className="rounded-full shadow-2xl ring-4 ring-white/30" />
          </div>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold" style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}>
            <Waves className="h-4 w-4" />
            Ohio&apos;s Trusted Parent Resource
          </span>
          <h1 className="mt-6 font-serif text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
            Finding Childcare
            <br className="hidden sm:block" />
            <span style={{ color: sandColor }}>Should Be Simple.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
            Browse <strong style={{ color: sandColor }}>{daycares.length.toLocaleString()}</strong> licensed programs across <strong style={{ color: sandColor }}>{cityCounts.size}</strong> Ohio cities.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-lg" style={{ background: coral, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Find a Daycare</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-full border-2 px-10 text-lg font-bold" style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }} asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 py-10" style={{ background: white }}>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: daycares.length.toLocaleString(), label: "Programs", icon: BookOpen, color: ocean },
            { value: String(cityCounts.size), label: "Cities", icon: MapPin, color: seafoam },
            { value: "100%", label: "Licensed", icon: ShieldCheck, color: coral },
            { value: "Free", label: "For Parents", icon: Heart, color: ocean },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl p-6" style={{ background: `${s.color}10` }}>
              <s.icon className="mb-2 h-6 w-6" style={{ color: s.color }} />
              <span className="font-serif text-3xl font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: deepOcean }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6" style={{ background: sky }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-widest" style={{ background: `${seafoam}30`, color: deepOcean }}>Why Parents Trust Us</span>
            <h2 className="mt-4 font-serif text-4xl font-bold" style={{ color: deepOcean }}>Built for Ohio Families</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "State Licensed", desc: "Every program verified against state records. Only licensed providers.", color: ocean },
              { icon: MapPin, title: "Local Focus", desc: "Search by city for care in your neighborhood. Every corner of Ohio covered.", color: seafoam },
              { icon: Baby, title: "All Ages", desc: "From infant care to after-school programs. Filter by age group.", color: coral },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl" style={{ background: white }}>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: `${f.color}15` }}>
                  <f.icon className="h-7 w-7" style={{ color: f.color }} />
                </div>
                <h3 className="mb-3 font-serif text-2xl font-bold" style={{ color: deepOcean }}>{f.title}</h3>
                <p className="leading-relaxed" style={{ color: `${deepOcean}99` }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="py-24 px-6" style={{ background: sandColor }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-4xl font-bold" style={{ color: deepOcean }}>Explore Top Cities</h2>
            </div>
            <Button variant="outline" className="group rounded-full border-2" style={{ borderColor: ocean, color: ocean }} asChild>
              <Link href="/cities">View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {topCities.map(({ city, count, slug }, i) => {
              const colors = [ocean, seafoam, coral, deepOcean];
              const accent = colors[i % 4];
              return (
                <Link key={city} href={`/daycares/${slug}`} className="group block">
                  <div className="flex h-full flex-col rounded-xl p-5 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg" style={{ background: white }}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: `${accent}15` }}>
                        <MapPin className="h-4 w-4" style={{ color: accent }} />
                      </div>
                      <span className="rounded-full px-3 py-0.5 text-xs font-bold" style={{ background: `${accent}15`, color: accent }}>{count}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold line-clamp-1" style={{ color: deepOcean }}>{city}</h3>
                    <p className="mt-auto pt-2 text-xs" style={{ color: `${deepOcean}50` }}>{"View programs \u2192"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-28 text-center" style={{ background: ocean }}>
        <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" style={{ height: "40px" }}>
          <path d="M0 0C360 60 720 0 1080 30C1260 45 1350 15 1440 0V0H0V0Z" fill={sandColor} />
        </svg>
        <div className="relative z-10 mx-auto max-w-3xl px-6 pt-8">
          <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl text-balance">Ready to find the perfect care?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>Join thousands of Ohio parents who trust us.</p>
          <Button size="lg" className="mt-10 h-14 rounded-full px-10 text-lg font-bold shadow-lg" style={{ background: coral, color: "#fff" }} asChild>
            <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Start Your Search</Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6" style={{ background: white }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={48} height={48} className="rounded-lg" />
          <p className="font-serif text-lg font-bold" style={{ color: ocean }}>Ohio Parent Hub</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium" style={{ color: deepOcean }}>
            <Link href="/daycares">Find Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
          </div>
          <div className="flex items-center gap-1 text-sm" style={{ color: `${deepOcean}60` }}>
            Made with <Heart className="mx-1 h-3.5 w-3.5" style={{ color: coral }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
