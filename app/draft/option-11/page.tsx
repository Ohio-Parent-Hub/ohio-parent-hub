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
import { Search, ShieldCheck, Baby, ArrowRight, Heart, BookOpen, ClipboardCheck } from "lucide-react";

/* =========================================================
   OPTION 11 — Hybrid of 6 + 9 + 10
   From 6: Massive whitespace, thin dividers, ultra-clean
           typography, sparse elegant feel
   From 9: Wavy SVG dividers, sparkle decorations, layered
           pastel section backgrounds
   From 10: Rounded pastel stat cards, pill-shaped city
            buttons, illustrated feature cards, "More Than
            a Directory" resource section
   ========================================================= */

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const dark = "#3D5A56";
const lightTeal = "#E3EDEB";
const lightPink = "#FCE8EB";
const lightGold = "#F8EDCC";
const lightSage = "#E8EFE5";
const blush = "#F8E8E8";

/* Sparkle from option 9 */
function SparkleDecor({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
    </svg>
  );
}

/* Wavy divider from option 9 */
function WaveDivider({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="block w-full" style={{ height: 50, marginBottom: "-1px" }}>
      <path d="M0 40C180 80 360 0 540 40C720 80 900 0 1080 40C1260 80 1440 0 1440 40V80H0V40Z" fill={fill} />
    </svg>
  );
}

export default function Option11() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#FDFCFA", color: dark }}>
      <div className="fixed top-4 left-4 z-50">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: teal, color: "#fff" }}>&larr; All Options</Link>
      </div>

      {/* NAV — Option 6 ultra-thin style */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-8">
          <Link href="/draft/option-11" className="flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={36} height={36} className="rounded-lg" />
            <span className="font-serif text-lg font-bold" style={{ color: teal }}>Ohio Parent Hub</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/daycares" className="text-xs font-medium uppercase tracking-widest" style={{ color: `${dark}99` }}>Daycares</Link>
            <Link href="/cities" className="text-xs font-medium uppercase tracking-widest" style={{ color: `${dark}99` }}>Cities</Link>
            <Link href="/about" className="text-xs font-medium uppercase tracking-widest" style={{ color: `${dark}99` }}>About</Link>
          </div>
        </div>
        <div className="h-px w-full" style={{ background: `${sage}40` }} />
      </nav>

      {/* HERO — Option 6 massive whitespace + Option 9 sparkles + Option 10 badge */}
      <section className="relative overflow-hidden px-8 py-36 sm:py-44" style={{ background: `linear-gradient(180deg, ${lightTeal} 0%, #FDFCFA 100%)` }}>
        {/* Sparkles from option 9, sparse like option 6 */}
        <SparkleDecor className="absolute top-12 left-[8%] h-5 w-5 animate-pulse" style={{ color: `${gold}30` }} />
        <SparkleDecor className="absolute top-24 right-[12%] h-4 w-4 animate-pulse" style={{ color: `${pink}30` }} />
        <SparkleDecor className="absolute bottom-28 left-[15%] h-3 w-3 animate-pulse" style={{ color: `${teal}25` }} />
        <SparkleDecor className="absolute bottom-20 right-[20%] h-5 w-5 animate-pulse" style={{ color: `${gold}20` }} />

        {/* Soft background circles from option 9 */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full" style={{ background: `${sage}15` }} />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full" style={{ background: `${pink}10` }} />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Logo - centered, clean */}
          <div className="mb-8 flex justify-center">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={72} height={72} className="rounded-xl shadow-md" />
          </div>

          {/* Pill badge from option 10 */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm" style={{ background: teal, color: "#fff" }}>
            <SparkleDecor className="h-3.5 w-3.5" style={{ color: gold }} />
            Ohio&apos;s Trusted Parent Resource
          </div>

          {/* Option 6 massive serif heading with breathing room */}
          <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl md:text-7xl" style={{ color: dark }}>
            Finding Childcare
            <br />
            <span style={{ color: pink }}>Should Be Simple.</span>
          </h1>

          <p className="mx-auto mt-10 max-w-lg text-base leading-relaxed" style={{ color: `${dark}88` }}>
            Browse <strong style={{ color: dark }}>{daycares.length.toLocaleString()}</strong> licensed programs across <strong style={{ color: dark }}>{cityCounts.size}</strong> Ohio cities — all in one place.
          </p>

          {/* Option 10 rounded buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 rounded-full px-8 text-base font-bold shadow-md" style={{ background: teal, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-4 w-4" />Find Childcare</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 rounded-full border-2 px-8 text-base font-bold" style={{ borderColor: dark, color: dark }} asChild>
              <Link href="/cities">Browse by City</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Option 6 thin gold divider */}
      <div className="mx-auto w-20 h-px" style={{ background: gold }} />

      {/* STATS — Option 10 rounded pastel cards + Option 6 whitespace */}
      <section className="px-8 py-20" style={{ background: "#FDFCFA" }}>
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-5 md:grid-cols-4">
          {[
            { value: daycares.length.toLocaleString(), label: "Programs", bg: lightTeal, accent: teal },
            { value: String(cityCounts.size), label: "Cities", bg: lightSage, accent: dark },
            { value: "100%", label: "Licensed", bg: lightPink, accent: pink },
            { value: "Always", label: "Free", bg: lightGold, accent: gold },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl p-6 shadow-sm" style={{ background: s.bg }}>
              <SparkleDecor className="mb-2 h-3 w-3" style={{ color: `${s.accent}40` }} />
              <span className="font-serif text-2xl font-bold" style={{ color: s.accent }}>{s.value}</span>
              <span className="mt-1 text-xs font-semibold" style={{ color: `${dark}88` }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Wavy divider from option 9 */}
      <WaveDivider fill={blush} />

      {/* FEATURES — Option 10 illustrated icon cards + Option 9 sparkles + Option 6 spacing */}
      <section className="px-8 pb-24 pt-12" style={{ background: blush }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <div className="mb-2 flex items-center justify-center gap-3">
              <SparkleDecor className="h-4 w-4" style={{ color: `${gold}50` }} />
              <p className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: gold }}>Why Parents Trust Us</p>
              <SparkleDecor className="h-4 w-4" style={{ color: `${gold}50` }} />
            </div>
            <h2 className="mt-3 font-serif text-3xl font-bold" style={{ color: dark }}>Why Ohio Parents Love Us</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: ClipboardCheck, title: "Official State Data", desc: "We use real licensing records -- not crowdsourced listings.", bg: lightTeal, iconBg: teal, titleColor: teal },
              { icon: Search, title: "Simple, Clean Search", desc: "Find programs in seconds.", bg: lightPink, iconBg: pink, titleColor: pink },
              { icon: BookOpen, title: "Growing Resource Hub", desc: "Soon: gear guides, book lists, checklists & more.", bg: lightGold, iconBg: gold, titleColor: gold },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center rounded-2xl p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: f.bg }}>
                <SparkleDecor className="mb-3 h-3 w-3" style={{ color: `${f.iconBg}40` }} />
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm" style={{ background: f.iconBg }}>
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-2 font-serif text-lg font-bold" style={{ color: f.titleColor }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: `${dark}88` }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wavy divider */}
      <WaveDivider fill="#FDFCFA" />

      {/* Option 6 thin divider */}
      <div className="mx-auto w-20 h-px" style={{ background: teal }} />

      {/* CITIES — Option 10 pill buttons + Option 6 whitespace */}
      <section className="px-8 py-24" style={{ background: "#FDFCFA" }}>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-2 flex items-center justify-center gap-3">
            <SparkleDecor className="h-4 w-4" style={{ color: `${teal}40` }} />
            <p className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: teal }}>Explore</p>
            <SparkleDecor className="h-4 w-4" style={{ color: `${teal}40` }} />
          </div>
          <h2 className="mt-3 font-serif text-3xl font-bold" style={{ color: dark }}>Browse Childcare by City</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed" style={{ color: `${dark}88` }}>
            Ohio Parent Hub is building the ultimate resource for modern parents.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {topCities.slice(0, 12).map(({ city, slug }, i) => {
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
            <Link href="/cities" className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all hover:shadow-md" style={{ borderColor: dark, color: dark }}>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Wavy divider */}
      <WaveDivider fill={lightTeal} />

      {/* MORE THAN A DIRECTORY — from Option 10 + Option 6 spacing */}
      <section className="px-8 pb-24 pt-12" style={{ background: lightTeal }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 flex items-center justify-center gap-3 text-center">
            <SparkleDecor className="h-4 w-4" style={{ color: `${gold}40` }} />
            <p className="text-xs font-medium uppercase tracking-[0.3em]" style={{ color: gold }}>Coming Soon</p>
            <SparkleDecor className="h-4 w-4" style={{ color: `${gold}40` }} />
          </div>
          <h2 className="mt-3 text-center font-serif text-3xl font-bold" style={{ color: dark }}>More Than a Directory</h2>
          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed" style={{ color: `${dark}88` }}>
            Ohio Parent Hub is building the ultimate resource for modern parents.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
            {[
              { icon: Baby, label: "Best Strollers", bg: lightPink, color: pink },
              { icon: ShieldCheck, label: "Car Seat Guides", bg: lightSage, color: sage },
              { icon: ClipboardCheck, label: "Preschool Checklists", bg: lightGold, color: gold },
              { icon: BookOpen, label: "Kids Book Lists", bg: "#fff", color: teal },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center rounded-2xl p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: item.bg }}>
                <SparkleDecor className="mb-2 h-3 w-3" style={{ color: `${item.color}40` }} />
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${item.color}20` }}>
                  <item.icon className="h-6 w-6" style={{ color: item.color }} />
                </div>
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wavy divider */}
      <WaveDivider fill={teal} />

      {/* CTA — Option 9 style teal background with sparkles + Option 6 simplicity */}
      <section className="relative overflow-hidden px-8 pb-24 pt-10 text-center" style={{ background: teal }}>
        <SparkleDecor className="absolute top-10 left-[10%] h-4 w-4 text-white/15 animate-pulse" />
        <SparkleDecor className="absolute bottom-12 right-[12%] h-5 w-5 animate-pulse" style={{ color: `${gold}30` }} />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl text-balance">Ready to find the perfect care?</h2>
          <p className="mt-4 text-base text-white/75">Join thousands of Ohio parents who trust us.</p>
          {/* Option 6 text-link style CTA */}
          <Link href="/daycares" className="mt-8 inline-flex items-center gap-2 border-b-2 pb-1 text-base font-semibold text-white" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
            Start Your Search <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Wavy divider */}
      <WaveDivider fill="#FDFCFA" />

      {/* FOOTER — Option 6 minimal + Option 10 logo */}
      <footer className="px-8 pb-12 pt-4" style={{ background: "#FDFCFA" }}>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Image src="/icon.png" alt="Ohio Parent Hub" width={44} height={44} className="rounded-lg shadow-sm" />
          <p className="font-serif text-base font-bold" style={{ color: teal }}>Ohio Parent Hub</p>
          <div className="flex gap-8 text-xs font-medium uppercase tracking-widest" style={{ color: `${dark}60` }}>
            <Link href="/daycares">Daycares</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: `${dark}40` }}>
            Made with <Heart className="mx-1 h-3 w-3" style={{ color: pink }} /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
