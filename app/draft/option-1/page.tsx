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
import { MapPin, Search, ShieldCheck, Sparkles, Baby, ArrowRight, Heart, Star, BookOpen } from "lucide-react";

/* =========================================================
   OPTION 1 — "Midnight Modern"
   Dark navy/charcoal + electric blue + warm amber
   Sleek, professional, modern
   ========================================================= */

export default function Option1() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  const navy = "#0F172A";
  const charcoal = "#1E293B";
  const slate = "#334155";
  const electricBlue = "#3B82F6";
  const amber = "#F59E0B";
  const lightSlate = "#94A3B8";

  return (
    <div className="flex min-h-screen flex-col" style={{ background: navy, color: "#E2E8F0" }}>
      {/* Back link */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: electricBlue, color: "#fff" }}>
          &larr; All Options
        </Link>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ borderColor: `${electricBlue}20`, background: `${navy}ee` }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/draft/option-1" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-bold" style={{ color: electricBlue }}>Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/daycares" className="text-sm font-medium" style={{ color: lightSlate }}>Find Daycares</Link>
            <Link href="/cities" className="text-sm font-medium" style={{ color: lightSlate }}>Cities</Link>
            <Link href="/about" className="text-sm font-medium" style={{ color: lightSlate }}>About</Link>
            <Button size="sm" className="rounded-full px-5 font-bold" style={{ background: amber, color: navy }} asChild>
              <Link href="/daycares"><Search className="mr-1.5 h-3.5 w-3.5" />Search</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-32 sm:py-40">
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${electricBlue}15, transparent)` }} />
        <div className="pointer-events-none absolute top-10 right-[15%] h-2 w-2 rounded-full animate-pulse" style={{ background: amber }} />
        <div className="pointer-events-none absolute top-32 left-[10%] h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: electricBlue }} />
        <div className="pointer-events-none absolute bottom-20 right-[25%] h-2 w-2 rounded-full animate-pulse" style={{ background: amber }} />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold" style={{ borderColor: `${electricBlue}40`, color: electricBlue }}>
            <Sparkles className="h-4 w-4" style={{ color: amber }} />
            Ohio&apos;s Trusted Parent Resource
          </span>
          <h1 className="mt-6 font-serif text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl" style={{ color: "#F1F5F9" }}>
            Finding Childcare
            <br className="hidden sm:block" />
            <span style={{ color: amber }}>Should Be Simple.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed" style={{ color: lightSlate }}>
            Browse <strong style={{ color: electricBlue }}>{daycares.length.toLocaleString()}</strong> licensed programs across <strong style={{ color: electricBlue }}>{cityCounts.size}</strong> Ohio cities.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-lg transition-all" style={{ background: electricBlue, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Find a Daycare</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-full border-2 px-10 text-lg font-bold transition-all" style={{ borderColor: `${lightSlate}60`, color: lightSlate }} asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 py-10" style={{ background: charcoal }}>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: daycares.length.toLocaleString(), label: "Programs", icon: BookOpen },
            { value: String(cityCounts.size), label: "Cities", icon: MapPin },
            { value: "100%", label: "Licensed", icon: ShieldCheck },
            { value: "Free", label: "For Parents", icon: Heart },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${electricBlue}20` }}>
                <s.icon className="h-5 w-5" style={{ color: electricBlue }} />
              </div>
              <span className="font-serif text-3xl font-bold" style={{ color: amber }}>{s.value}</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: lightSlate }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6" style={{ background: navy }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-widest" style={{ background: `${amber}20`, color: amber }}>Why Parents Trust Us</span>
            <h2 className="mt-4 font-serif text-4xl font-bold" style={{ color: "#F1F5F9" }}>Built for Ohio Families</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "State Licensed", desc: "Every program listed is verified against state records. We only show licensed providers.", color: electricBlue },
              { icon: MapPin, title: "Local Focus", desc: "Search by city to find care right in your neighborhood. We cover every corner of Ohio.", color: amber },
              { icon: Baby, title: "All Ages", desc: "From infant care to preschool and after-school programs. Filter by age group.", color: electricBlue },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border p-8 transition-all hover:-translate-y-1" style={{ borderColor: `${f.color}30`, background: charcoal }}>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: `${f.color}20` }}>
                  <f.icon className="h-7 w-7" style={{ color: f.color }} />
                </div>
                <h3 className="mb-3 font-serif text-2xl font-bold" style={{ color: "#F1F5F9" }}>{f.title}</h3>
                <p className="leading-relaxed" style={{ color: lightSlate }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="py-24 px-6" style={{ background: charcoal }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: electricBlue, background: `${electricBlue}15` }}>
                <MapPin className="h-3.5 w-3.5" /> Local Communities
              </span>
              <h2 className="mt-2 font-serif text-4xl font-bold" style={{ color: "#F1F5F9" }}>Explore Top Cities</h2>
            </div>
            <Button variant="outline" className="group rounded-full border-2" style={{ borderColor: `${electricBlue}50`, color: electricBlue }} asChild>
              <Link href="/cities">View All Cities <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {topCities.map(({ city, count, slug }, i) => {
              const accent = i % 2 === 0 ? electricBlue : amber;
              return (
                <Link key={city} href={`/daycares/${slug}`} className="group block">
                  <div className="flex h-full flex-col rounded-xl border p-5 transition-all duration-200 group-hover:-translate-y-0.5" style={{ borderColor: `${accent}25`, background: slate }}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: `${accent}20` }}>
                        <MapPin className="h-4 w-4" style={{ color: accent }} />
                      </div>
                      <span className="rounded-full px-3 py-0.5 text-xs font-bold" style={{ background: `${accent}20`, color: accent }}>{count}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold line-clamp-1" style={{ color: "#F1F5F9" }}>{city}</h3>
                    <p className="mt-auto pt-2 text-xs" style={{ color: `${lightSlate}80` }}>{"View licensed programs \u2192"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-28 text-center" style={{ background: `linear-gradient(135deg, ${electricBlue}, ${electricBlue}cc)` }}>
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl" style={{ background: `${amber}30` }} />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl text-balance">Ready to find the perfect care?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            Join thousands of Ohio parents who trust us to help them find safe, licensed childcare.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-lg" style={{ background: amber, color: navy }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Start Your Search</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6" style={{ background: navy, borderTop: `1px solid ${slate}` }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={48} height={48} className="rounded-lg" />
          <p className="font-serif text-lg font-bold" style={{ color: electricBlue }}>Ohio Parent Hub</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium" style={{ color: lightSlate }}>
            <Link href="/daycares" className="hover:opacity-80">Find Daycares</Link>
            <Link href="/cities" className="hover:opacity-80">Cities</Link>
            <Link href="/about" className="hover:opacity-80">About</Link>
            <Link href="/contact" className="hover:opacity-80">Contact</Link>
          </div>
          <div className="flex items-center gap-1 text-sm" style={{ color: `${lightSlate}80` }}>
            Made with <Heart className="mx-1 h-3.5 w-3.5" style={{ color: amber }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
