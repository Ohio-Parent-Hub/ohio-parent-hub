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
import { MapPin, Search, ShieldCheck, Sparkles, Baby, ArrowRight, Heart, BookOpen } from "lucide-react";

/* =========================================================
   OPTION 2 — "Sunrise Warm"
   Terracotta, burnt orange, warm cream, deep brown
   Earthy, cozy, organic
   ========================================================= */

export default function Option2() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  const cream = "#FFF8F0";
  const warmWhite = "#FEF3E7";
  const terracotta = "#C2704D";
  const burnt = "#D4824A";
  const deepBrown = "#5C3D2E";
  const sand = "#E8D5C0";
  const olive = "#7A8B5D";

  return (
    <div className="flex min-h-screen flex-col" style={{ background: cream, color: deepBrown }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: terracotta, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ borderColor: `${sand}`, background: `${cream}ee` }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/draft/option-2" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-bold" style={{ color: terracotta }}>Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/daycares" className="text-sm font-medium" style={{ color: deepBrown }}>Find Daycares</Link>
            <Link href="/cities" className="text-sm font-medium" style={{ color: deepBrown }}>Cities</Link>
            <Button size="sm" className="rounded-full px-5 font-bold" style={{ background: terracotta, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-1.5 h-3.5 w-3.5" />Search</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-32 sm:py-40" style={{ background: `linear-gradient(180deg, ${warmWhite} 0%, ${sand}50 100%)` }}>
        {/* Organic circles */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full" style={{ background: `${terracotta}12` }} />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full" style={{ background: `${olive}12` }} />
        <div className="pointer-events-none absolute top-1/3 right-[8%] h-24 w-24 rounded-full" style={{ background: `${burnt}10` }} />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={100} height={100} className="rounded-2xl shadow-xl" />
          </div>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold" style={{ borderColor: terracotta, color: terracotta }}>
            <Sparkles className="h-4 w-4" style={{ color: burnt }} />
            Ohio&apos;s Trusted Parent Resource
          </span>
          <h1 className="mt-6 font-serif text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl" style={{ color: deepBrown }}>
            Finding Childcare
            <br className="hidden sm:block" />
            <span style={{ color: terracotta }}>Should Be Simple.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed" style={{ color: `${deepBrown}bb` }}>
            Browse <strong style={{ color: terracotta }}>{daycares.length.toLocaleString()}</strong> licensed programs across <strong style={{ color: terracotta }}>{cityCounts.size}</strong> Ohio cities.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-lg" style={{ background: terracotta, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Find a Daycare</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-full border-2 px-10 text-lg font-bold" style={{ borderColor: deepBrown, color: deepBrown }} asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STATS -- Terracotta bar */}
      <section className="px-6 py-10" style={{ background: terracotta }}>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: daycares.length.toLocaleString(), label: "Programs", icon: BookOpen },
            { value: String(cityCounts.size), label: "Cities", icon: MapPin },
            { value: "100%", label: "Licensed", icon: ShieldCheck },
            { value: "Free", label: "For Parents", icon: Heart },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}>
                <s.icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-serif text-3xl font-bold text-white">{s.value}</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.7)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6" style={{ background: cream }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-widest" style={{ background: `${olive}20`, color: olive }}>Why Parents Trust Us</span>
            <h2 className="mt-4 font-serif text-4xl font-bold" style={{ color: deepBrown }}>Built for Ohio Families</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "State Licensed", desc: "Every program is verified against state records. Only licensed providers.", bg: `${terracotta}15`, accent: terracotta },
              { icon: MapPin, title: "Local Focus", desc: "Search by city for care in your neighborhood. We cover every corner of Ohio.", bg: `${olive}15`, accent: olive },
              { icon: Baby, title: "All Ages", desc: "From infant care to after-school programs. Filter by age group.", bg: `${burnt}15`, accent: burnt },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl p-8 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: f.bg }}>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: f.accent, color: "#fff" }}>
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 font-serif text-2xl font-bold" style={{ color: deepBrown }}>{f.title}</h3>
                <p className="leading-relaxed" style={{ color: `${deepBrown}aa` }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="py-24 px-6" style={{ background: warmWhite }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: olive, background: `${olive}15` }}>
                <MapPin className="h-3.5 w-3.5" /> Local Communities
              </span>
              <h2 className="mt-2 font-serif text-4xl font-bold" style={{ color: deepBrown }}>Explore Top Cities</h2>
            </div>
            <Button variant="outline" className="group rounded-full border-2" style={{ borderColor: terracotta, color: terracotta }} asChild>
              <Link href="/cities">View All Cities <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {topCities.map(({ city, count, slug }, i) => {
              const colors = [terracotta, olive, burnt, deepBrown];
              const accent = colors[i % 4];
              return (
                <Link key={city} href={`/daycares/${slug}`} className="group block">
                  <div className="flex h-full flex-col rounded-xl border-l-4 p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md" style={{ borderColor: accent, background: "#fff" }}>
                    <div className="mb-3 flex items-center justify-between">
                      <MapPin className="h-4 w-4" style={{ color: accent }} />
                      <span className="rounded-full px-3 py-0.5 text-xs font-bold" style={{ background: `${accent}15`, color: accent }}>{count}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold line-clamp-1" style={{ color: deepBrown }}>{city}</h3>
                    <p className="mt-auto pt-2 text-xs" style={{ color: `${deepBrown}60` }}>{"View licensed programs \u2192"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-28 text-center" style={{ background: `linear-gradient(135deg, ${deepBrown}, ${terracotta})` }}>
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl text-balance">Ready to find the perfect care?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            Join thousands of Ohio parents who trust us.
          </p>
          <Button size="lg" className="mt-10 h-14 rounded-full px-10 text-lg font-bold shadow-lg" style={{ background: burnt, color: "#fff" }} asChild>
            <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Start Your Search</Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6" style={{ background: sand }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={48} height={48} className="rounded-lg" />
          <p className="font-serif text-lg font-bold" style={{ color: deepBrown }}>Ohio Parent Hub</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium" style={{ color: `${deepBrown}aa` }}>
            <Link href="/daycares">Find Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-1 text-sm" style={{ color: `${deepBrown}60` }}>
            Made with <Heart className="mx-1 h-3.5 w-3.5" style={{ color: terracotta }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
