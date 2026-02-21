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
import { MapPin, Search, ShieldCheck, Sparkles, Baby, ArrowRight, Heart, BookOpen, Zap } from "lucide-react";

/* =========================================================
   OPTION 5 — "Candy Pop"
   Bold primaries: bright pink, electric blue, sunny yellow, lime
   Energetic, playful, youthful
   ========================================================= */

export default function Option5() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  const hotPink = "#FF1493";
  const electricBlue = "#00BFFF";
  const sunnyYellow = "#FFD700";
  const lime = "#7CFC00";
  const white = "#FFFFFF";
  const nearBlack = "#1A1A2E";
  const lightBg = "#FFF5F9";

  return (
    <div className="flex min-h-screen flex-col" style={{ background: lightBg, color: nearBlack }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: hotPink, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b-4 backdrop-blur-xl" style={{ borderColor: hotPink, background: `${white}ee` }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/draft/option-5" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-extrabold" style={{ color: hotPink }}>Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/daycares" className="text-sm font-bold" style={{ color: nearBlack }}>Daycares</Link>
            <Link href="/cities" className="text-sm font-bold" style={{ color: nearBlack }}>Cities</Link>
            <Button size="sm" className="rounded-full px-5 font-extrabold shadow-md" style={{ background: electricBlue, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-1.5 h-3.5 w-3.5" />Search</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO -- Hot pink with pops of yellow and blue */}
      <section className="relative overflow-hidden px-6 py-32 sm:py-40" style={{ background: hotPink }}>
        {/* Pop circles */}
        <div className="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full" style={{ background: sunnyYellow, opacity: 0.2 }} />
        <div className="pointer-events-none absolute top-20 right-[5%] h-32 w-32 rounded-full" style={{ background: electricBlue, opacity: 0.2 }} />
        <div className="pointer-events-none absolute bottom-10 left-[20%] h-24 w-24 rounded-full" style={{ background: lime, opacity: 0.15 }} />
        <div className="pointer-events-none absolute bottom-20 right-[15%] h-20 w-20 rounded-full" style={{ background: sunnyYellow, opacity: 0.15 }} />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={100} height={100} className="rounded-2xl shadow-2xl ring-4 ring-white/30" />
          </div>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-extrabold uppercase tracking-widest" style={{ background: sunnyYellow, color: nearBlack }}>
            <Zap className="h-4 w-4" />
            Ohio&apos;s #1 Parent Resource
          </span>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl" style={{ fontFamily: "inherit" }}>
            Finding Childcare
            <br className="hidden sm:block" />
            <span style={{ color: sunnyYellow }}>Should Be Simple!</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-white/90">
            Browse <strong style={{ color: sunnyYellow }}>{daycares.length.toLocaleString()}</strong> licensed programs across <strong style={{ color: sunnyYellow }}>{cityCounts.size}</strong> Ohio cities.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-extrabold shadow-xl" style={{ background: sunnyYellow, color: nearBlack }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Find a Daycare</Link>
            </Button>
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-extrabold shadow-xl" style={{ background: electricBlue, color: "#fff" }} asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STATS -- 4 colored blocks */}
      <section className="px-6 py-4" style={{ background: white }}>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { value: daycares.length.toLocaleString(), label: "Programs", bg: hotPink, text: "#fff" },
            { value: String(cityCounts.size), label: "Cities", bg: electricBlue, text: "#fff" },
            { value: "100%", label: "Licensed", bg: sunnyYellow, text: nearBlack },
            { value: "Free", label: "For Parents", bg: lime, text: nearBlack },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl p-6" style={{ background: s.bg, color: s.text }}>
              <span className="text-3xl font-extrabold">{s.value}</span>
              <span className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ opacity: 0.8 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6" style={{ background: white }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-extrabold" style={{ color: nearBlack }}>Why Parents <span style={{ color: hotPink }}>Love</span> Us</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "State Licensed", desc: "Every program verified against state records. Only licensed providers.", border: hotPink },
              { icon: MapPin, title: "Local Focus", desc: "Search by city for care in your neighborhood. Every corner of Ohio.", border: electricBlue },
              { icon: Baby, title: "All Ages", desc: "From infant care to after-school programs. Filter by age group.", border: sunnyYellow },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border-4 p-8 transition-all hover:-translate-y-2 hover:shadow-xl" style={{ borderColor: f.border, background: white }}>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: f.border }}>
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-extrabold" style={{ color: nearBlack }}>{f.title}</h3>
                <p className="leading-relaxed" style={{ color: `${nearBlack}99` }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="py-24 px-6" style={{ background: `${electricBlue}10` }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="text-4xl font-extrabold" style={{ color: nearBlack }}>Explore Top Cities</h2>
            <Button className="group rounded-full border-4 font-extrabold" style={{ borderColor: hotPink, background: "transparent", color: hotPink }} asChild>
              <Link href="/cities">View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {topCities.map(({ city, count, slug }, i) => {
              const accents = [hotPink, electricBlue, sunnyYellow, lime];
              const a = accents[i % 4];
              const textOnAccent = i % 4 >= 2 ? nearBlack : "#fff";
              return (
                <Link key={city} href={`/daycares/${slug}`} className="group block">
                  <div className="flex h-full flex-col rounded-xl border-2 p-5 transition-all group-hover:-translate-y-1 group-hover:shadow-lg" style={{ borderColor: `${a}40`, background: white }}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: a }}>
                        <MapPin className="h-4 w-4" style={{ color: textOnAccent }} />
                      </div>
                      <span className="rounded-full px-3 py-0.5 text-xs font-extrabold" style={{ background: a, color: textOnAccent }}>{count}</span>
                    </div>
                    <h3 className="text-lg font-extrabold line-clamp-1" style={{ color: nearBlack }}>{city}</h3>
                    <p className="mt-auto pt-2 text-xs font-bold" style={{ color: a }}>{"View programs \u2192"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 text-center" style={{ background: electricBlue }}>
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl text-balance">Ready to find the perfect care?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 font-medium">Join thousands of Ohio parents who trust us.</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-extrabold shadow-xl" style={{ background: sunnyYellow, color: nearBlack }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Start Your Search</Link>
            </Button>
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-extrabold shadow-xl" style={{ background: hotPink, color: "#fff" }} asChild>
              <Link href="/cities">Browse Cities</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6" style={{ background: nearBlack }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={48} height={48} className="rounded-lg" />
          <p className="text-lg font-extrabold" style={{ color: hotPink }}>Ohio Parent Hub</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
            <Link href="/daycares">Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
          </div>
          <div className="flex items-center gap-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Made with <Heart className="mx-1 h-3.5 w-3.5" style={{ color: hotPink }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
