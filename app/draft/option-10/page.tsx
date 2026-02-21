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
import { MapPin, Search, ShieldCheck, Baby, ArrowRight, Heart, Sparkles, BookOpen, ClipboardCheck, Users } from "lucide-react";

/* =========================================================
   OPTION 10 — "Screenshot-Inspired"
   Directly inspired by the attached screenshot: rounded stat
   cards in soft pastels, sparkle decorations, cream background,
   illustrated-icon cards, pill-shaped city buttons, warm &
   inviting parenting site aesthetic
   ========================================================= */

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#FAF5EF";
const dark = "#3D5A56";
const blush = "#F8D7DA";
const lightTeal = "#E3EDEB";
const lightPink = "#FCE8EB";
const lightGold = "#F8EDCC";
const lightSage = "#E8EFE5";

function SparkleDecor({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
    </svg>
  );
}

export default function Option10() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: cream, color: dark }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: teal, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: `${cream}ee` }}>
        <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/draft/option-10" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={40} height={40} className="rounded-lg" />
            <span className="font-serif text-lg font-bold" style={{ color: teal }}>Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-5 md:flex">
            <Link href="/daycares" className="text-sm font-medium" style={{ color: dark }}>Find Daycares</Link>
            <Link href="/cities" className="text-sm font-medium" style={{ color: dark }}>Browse Cities</Link>
            <Link href="/about" className="text-sm font-medium" style={{ color: dark }}>About</Link>
          </div>
        </div>
      </nav>

      {/* HERO -- Soft green gradient with sparkles, matching screenshot style */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32" style={{ background: `linear-gradient(180deg, ${lightTeal} 0%, ${cream} 100%)` }}>
        {/* Sparkle decorations scattered */}
        <SparkleDecor className="absolute top-8 left-[6%] h-5 w-5 animate-pulse" style={{ color: `${teal}35` }} />
        <SparkleDecor className="absolute top-16 right-[10%] h-6 w-6 animate-pulse" style={{ color: `${gold}40` }} />
        <SparkleDecor className="absolute top-36 left-[18%] h-3 w-3 animate-pulse" style={{ color: `${pink}40` }} />
        <SparkleDecor className="absolute bottom-20 right-[20%] h-4 w-4 animate-pulse" style={{ color: `${teal}25` }} />
        <SparkleDecor className="absolute bottom-32 left-[8%] h-5 w-5 animate-pulse" style={{ color: `${gold}30` }} />
        <SparkleDecor className="absolute top-24 right-[35%] h-3 w-3 animate-pulse" style={{ color: `${pink}30` }} />

        {/* Subtle painted blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full" style={{ background: `${sage}20` }} />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full" style={{ background: `${pink}12` }} />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Pill badge like screenshot */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm" style={{ background: teal, color: "#fff" }}>
            <SparkleDecor className="h-3.5 w-3.5" style={{ color: gold }} />
            Ohio&apos;s Trusted Parent Resource
          </div>

          <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl" style={{ color: dark }}>
            <span className="text-balance">Finding Childcare</span>
            <br className="hidden sm:block" />
            Should <span style={{ color: pink }}>Feel Easy.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
            Browse <strong style={{ color: dark }}>{daycares.length.toLocaleString()}</strong> licensed programs across <strong style={{ color: dark }}>{cityCounts.size}</strong> Ohio cities — all in one place.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 rounded-full px-8 text-base font-bold shadow-md" style={{ background: teal, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-4 w-4" />Find Childcare</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 rounded-full border-2 px-8 text-base font-bold" style={{ borderColor: dark, color: dark }} asChild>
              <Link href="/cities">Browse by City</Link>
            </Button>
          </div>

          {/* STAT CARDS -- Rounded, pastel backgrounds like screenshot */}
          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: daycares.length.toLocaleString(), label: "Programs", bg: lightTeal, accent: teal },
              { value: String(cityCounts.size), label: "Cities", bg: lightSage, accent: dark },
              { value: "100%", label: "Licensed", bg: lightPink, accent: pink },
              { value: "Always", label: "Free", bg: lightGold, accent: gold },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center rounded-2xl p-5 shadow-sm" style={{ background: s.bg }}>
                <SparkleDecor className="mb-1 h-3 w-3" style={{ color: `${s.accent}40` }} />
                <span className="font-serif text-2xl font-bold" style={{ color: s.accent }}>{s.value}</span>
                <span className="mt-0.5 text-xs font-semibold" style={{ color: `${dark}88` }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY PARENTS LOVE US -- Illustrated icon cards like screenshot */}
      <section className="px-6 py-20" style={{ background: cream }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <SparkleDecor className="h-4 w-4" style={{ color: `${gold}50` }} />
              <h2 className="font-serif text-3xl font-bold" style={{ color: dark }}>Why Ohio Parents Love Us</h2>
              <SparkleDecor className="h-4 w-4" style={{ color: `${gold}50` }} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ClipboardCheck,
                title: "Official State Data",
                desc: "We use real licensing records -- not crowdsourced listings.",
                bg: lightTeal,
                iconBg: teal,
                titleColor: teal,
              },
              {
                icon: Search,
                title: "Simple, Clean Search",
                desc: "Find programs in seconds.",
                bg: lightPink,
                iconBg: pink,
                titleColor: pink,
              },
              {
                icon: BookOpen,
                title: "Growing Parent Resource Hub",
                desc: "Soon: gear guides, books checklists & more.",
                bg: lightGold,
                iconBg: gold,
                titleColor: gold,
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center rounded-2xl p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: f.bg }}>
                <SparkleDecor className="mb-3 h-3 w-3" style={{ color: `${f.iconBg}40` }} />
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm" style={{ background: f.iconBg }}>
                  <f.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 font-serif text-lg font-bold" style={{ color: f.titleColor }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: `${dark}88` }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BROWSE BY CITY -- Pill-shaped buttons like screenshot */}
      <section className="relative px-6 py-20" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute top-8 left-[10%] h-4 w-4" style={{ color: `${gold}30` }} />
        <SparkleDecor className="absolute bottom-10 right-[8%] h-3 w-3" style={{ color: `${pink}25` }} />

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <SparkleDecor className="h-4 w-4" style={{ color: `${teal}40` }} />
            <h2 className="font-serif text-3xl font-bold" style={{ color: dark }}>Browse Childcare by City</h2>
            <SparkleDecor className="h-4 w-4" style={{ color: `${teal}40` }} />
          </div>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed" style={{ color: `${dark}88` }}>
            Ohio Parent Hub is building the ultimate resource for modern parents.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {topCities.slice(0, 12).map(({ city, count, slug }, i) => {
              const borders = [teal, pink, sage, gold];
              const b = borders[i % 4];
              return (
                <Link key={city} href={`/daycares/${slug}`}>
                  <div className="rounded-full border-2 px-5 py-2 text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5" style={{ borderColor: b, background: "#fff", color: dark }}>
                    {city}
                  </div>
                </Link>
              );
            })}
            <Link href="/cities" className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all hover:shadow-md" style={{ borderColor: dark, color: dark }}>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* MORE THAN A DIRECTORY -- Resource cards like screenshot */}
      <section className="px-6 py-20" style={{ background: cream }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center justify-center gap-2 text-center">
            <SparkleDecor className="h-4 w-4" style={{ color: `${gold}40` }} />
            <h2 className="font-serif text-3xl font-bold" style={{ color: dark }}>More Than a Directory</h2>
            <SparkleDecor className="h-4 w-4" style={{ color: `${gold}40` }} />
          </div>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed" style={{ color: `${dark}88` }}>
            Ohio Parent Hub is building the ultimate resource for modern parents.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: Baby, label: "Best Strollers", bg: lightPink, color: pink },
              { icon: ShieldCheck, label: "Car Seat Guides", bg: lightSage, color: sage },
              { icon: ClipboardCheck, label: "Preschool Checklists", bg: lightGold, color: gold },
              { icon: BookOpen, label: "Kids Book Lists", bg: lightTeal, color: teal },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center rounded-2xl p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: item.bg }}>
                <SparkleDecor className="mb-2 h-3 w-3" style={{ color: `${item.color}40` }} />
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: `${item.color}25` }}>
                  <item.icon className="h-7 w-7" style={{ color: item.color }} />
                </div>
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-6 py-24 text-center" style={{ background: teal }}>
        <SparkleDecor className="absolute top-8 left-[8%] h-5 w-5 text-white/15 animate-pulse" />
        <SparkleDecor className="absolute bottom-12 right-[10%] h-4 w-4 animate-pulse" style={{ color: `${gold}30` }} />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl text-balance">Ready to find the perfect care?</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/75">
            Join thousands of Ohio parents who trust us to help them find safe, licensed childcare.
          </p>
          <Button size="lg" className="mt-8 h-12 rounded-full px-8 text-base font-bold shadow-lg" style={{ background: gold, color: "#fff" }} asChild>
            <Link href="/daycares"><Search className="mr-2 h-4 w-4" />Start Your Search</Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12" style={{ background: cream }}>
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={48} height={48} className="rounded-lg" />
          <p className="font-serif text-lg font-bold" style={{ color: teal }}>Ohio Parent Hub</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium" style={{ color: `${dark}88` }}>
            <Link href="/daycares">Find Daycares</Link>
            <Link href="/cities">Browse Cities</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="h-px w-20" style={{ background: `${sage}60` }} />
          <div className="flex items-center gap-1 text-sm" style={{ color: `${dark}50` }}>
            Made with <Heart className="mx-1 h-3.5 w-3.5" style={{ color: pink }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
