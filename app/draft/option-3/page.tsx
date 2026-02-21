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
import { MapPin, Search, ShieldCheck, Baby, ArrowRight, Heart, Waves } from "lucide-react";

/* =========================================================
   OPTION 3 — "Ocean Breeze"
   Split hero (text left, big circle illustration right),
   wave SVG dividers between sections, masonry city grid
   on deep blue, coastal palette. Truly unique layout.
   ========================================================= */

const deepBlue = "#1B4965";
const seafoam = "#7FBFB5";
const coral = "#E8756D";
const sand = "#F5E6D3";
const lightSea = "#D4F0EC";
const offWhite = "#FAFAF7";
const mist = "#EEF6F5";

function WaveSvg({ fill, className }: { fill: string; className?: string }) {
  return (
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className={`block w-full ${className || ""}`} style={{ height: 60 }}>
      <path d="M0 60C240 20 480 100 720 60C960 20 1200 100 1440 60V100H0Z" fill={fill} />
    </svg>
  );
}

export default function Option3() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: offWhite, color: deepBlue }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: deepBlue, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: `${offWhite}ee` }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/draft/option-3" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={36} height={36} className="rounded-full" />
            <span className="font-serif text-lg font-bold" style={{ color: deepBlue }}>Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/daycares" className="text-sm font-medium" style={{ color: deepBlue }}>Daycares</Link>
            <Link href="/cities" className="text-sm font-medium" style={{ color: deepBlue }}>Cities</Link>
            <Button size="sm" className="rounded-full font-bold" style={{ background: coral, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-1.5 h-3.5 w-3.5" />Search</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO - Split: text left, big circle with stats right */}
      <section className="px-6 py-20 lg:py-28" style={{ background: mist }}>
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Waves className="h-5 w-5" style={{ color: seafoam }} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: seafoam }}>Ohio&apos;s Trusted Parent Resource</span>
            </div>
            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl" style={{ color: deepBlue }}>
              Finding Childcare
              <br />
              <span style={{ color: coral }}>Should Be Simple.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed" style={{ color: `${deepBlue}bb` }}>
              Browse <strong>{daycares.length.toLocaleString()}</strong> licensed programs across <strong>{cityCounts.size}</strong> Ohio cities -- all verified, always free.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="h-12 rounded-full px-8 font-bold shadow-md" style={{ background: deepBlue, color: "#fff" }} asChild>
                <Link href="/daycares"><Search className="mr-2 h-4 w-4" />Find a Daycare</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-full border-2 px-8 font-bold" style={{ borderColor: coral, color: coral }} asChild>
                <Link href="/cities"><MapPin className="mr-2 h-4 w-4" />Browse Cities</Link>
              </Button>
            </div>
          </div>
          {/* Right: big circle with logo + stats */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="h-80 w-80 rounded-full sm:h-96 sm:w-96" style={{ background: lightSea }}>
                <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-10">
                  <Image src="/icon.png" alt="" width={80} height={80} className="rounded-2xl shadow-lg" />
                  <div className="grid w-full grid-cols-2 gap-3 px-4">
                    {[
                      { val: daycares.length.toLocaleString(), lbl: "Programs", c: deepBlue },
                      { val: String(cityCounts.size), lbl: "Cities", c: coral },
                      { val: "100%", lbl: "Licensed", c: seafoam },
                      { val: "Free", lbl: "Always", c: deepBlue },
                    ].map((s) => (
                      <div key={s.lbl} className="text-center">
                        <span className="font-serif text-xl font-bold" style={{ color: s.c }}>{s.val}</span>
                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${deepBlue}88` }}>{s.lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 h-14 w-14 rounded-full" style={{ background: `${coral}30` }} />
              <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full" style={{ background: `${seafoam}20` }} />
              <div className="absolute top-1/2 -right-8 h-8 w-8 rounded-full" style={{ background: `${sand}80` }} />
            </div>
          </div>
        </div>
      </section>

      <WaveSvg fill={offWhite} />

      {/* FEATURES - Horizontal feature rows with left icon + right text */}
      <section className="px-6 pb-8 pt-12" style={{ background: offWhite }}>
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center font-serif text-4xl font-bold" style={{ color: deepBlue }}>Why Parents Trust Us</h2>
          <div className="flex flex-col gap-0">
            {[
              { icon: ShieldCheck, title: "State Licensed", desc: "Every program verified against official state records.", bg: lightSea, accent: seafoam },
              { icon: MapPin, title: "Local Focus", desc: "Search by city. We cover every corner of Ohio.", bg: sand, accent: coral },
              { icon: Baby, title: "All Ages", desc: "Infant care to after-school programs. Filter by age.", bg: mist, accent: deepBlue },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-6 border-b px-6 py-8" style={{ borderColor: `${deepBlue}10` }}>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full" style={{ background: f.bg }}>
                  <f.icon className="h-7 w-7" style={{ color: f.accent }} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold" style={{ color: deepBlue }}>{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: `${deepBlue}88` }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveSvg fill={deepBlue} />

      {/* CITIES - Masonry grid on dark blue */}
      <section className="px-6 py-16" style={{ background: deepBlue }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-4xl font-bold" style={{ color: "#fff" }}>Explore Ohio Cities</h2>
            <Link href="/cities" className="text-sm font-semibold" style={{ color: coral }}>All Cities <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {topCities.map(({ city, count, slug }, i) => {
              const tall = i % 5 === 0 || i % 7 === 0;
              const colors = [seafoam, coral, `${sand}dd`, lightSea];
              const bg = colors[i % colors.length];
              return (
                <Link key={city} href={`/daycares/${slug}`} className={`group block ${tall ? "row-span-2" : ""}`}>
                  <div className="flex h-full flex-col justify-between rounded-xl p-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg" style={{ background: bg }}>
                    <MapPin className="h-4 w-4" style={{ color: deepBlue }} />
                    <div className="mt-auto">
                      <h3 className="font-serif text-base font-bold line-clamp-1" style={{ color: deepBlue }}>{city}</h3>
                      <span className="text-xs font-semibold" style={{ color: `${deepBlue}88` }}>{count} programs</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <WaveSvg fill={coral} />

      {/* CTA */}
      <section className="px-6 pb-20 pt-8 text-center" style={{ background: coral }}>
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl text-balance">Ready to find the perfect care?</h2>
          <p className="mx-auto mt-4 max-w-lg text-base" style={{ color: "rgba(255,255,255,0.85)" }}>Join thousands of Ohio parents who trust us.</p>
          <Button size="lg" className="mt-8 h-12 rounded-full px-8 font-bold shadow-lg" style={{ background: "#fff", color: coral }} asChild>
            <Link href="/daycares"><Search className="mr-2 h-4 w-4" />Start Your Search</Link>
          </Button>
        </div>
      </section>

      <WaveSvg fill={offWhite} />

      {/* FOOTER */}
      <footer className="px-6 pb-12 pt-4" style={{ background: offWhite }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={40} height={40} className="rounded-full" />
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium" style={{ color: `${deepBlue}88` }}>
            <Link href="/daycares">Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: `${deepBlue}60` }}>
            Made with <Heart className="mx-1 h-3 w-3" style={{ color: coral }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
