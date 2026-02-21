import Link from "next/link";
import Image from "next/image";
import fs from "node:fs";
import path from "node:path";

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

import { Button } from "@/components/ui/button";
import {
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Baby,
  ArrowRight,
  Heart,
  Star,
  Users,
  BookOpen,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Color palette (from logo + reference image)                        */
/*  Teal:    #7EA8A4  (logo bg)                                        */
/*  Pink:    #E8A0AC  (dusty pink from logo)                           */
/*  Gold:    #DCB346  (mustard gold from logo)                         */
/*  Sage:    #B8C5B2  (soft sage green)                                */
/*  Cream:   #F5EDE4  (warm cream)                                     */
/*  Blush:   #F8D7DA  (light pink)                                     */
/* ------------------------------------------------------------------ */

function SparkleDecoration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
    </svg>
  );
}

export default function DraftHomePage() {
  const daycares = loadDaycares();

  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => {
    const city = d["CITY"];
    if (city) {
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    }
  });

  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen flex-col">

      {/* ============================================================ */}
      {/*  NAVBAR                                                       */}
      {/* ============================================================ */}
      <nav className="sticky top-0 z-50 border-b border-[#B8C5B2]/40 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/draft" className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="Ohio Parent Hub logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-serif text-xl font-bold text-[#7EA8A4]">
              Ohio Parent Hub
            </span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/daycares" className="text-sm font-medium text-[#5A7A7E] hover:text-[#E8A0AC] transition-colors">
              Find Daycares
            </Link>
            <Link href="/cities" className="text-sm font-medium text-[#5A7A7E] hover:text-[#E8A0AC] transition-colors">
              Browse Cities
            </Link>
            <Link href="/about" className="text-sm font-medium text-[#5A7A7E] hover:text-[#E8A0AC] transition-colors">
              About
            </Link>
            <Button
              size="sm"
              className="rounded-full bg-[#E8A0AC] px-5 text-white hover:bg-[#d88e9a]"
              asChild
            >
              <Link href="/daycares">
                <Search className="mr-1.5 h-3.5 w-3.5" />
                Search
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO -- Full teal background like the logo                   */}
      {/* ============================================================ */}
      <section
        className="relative overflow-hidden px-6 py-28 sm:py-36"
        style={{ background: "linear-gradient(160deg, #7EA8A4 0%, #6B9B96 50%, #7EA8A4 100%)" }}
      >
        {/* Sparkle decorations -- mirroring the logo sparkles */}
        <SparkleDecoration className="absolute top-12 left-[6%] h-5 w-5 text-white/30 animate-pulse" />
        <SparkleDecoration className="absolute top-24 right-[10%] h-6 w-6 text-[#DCB346]/50 animate-pulse" />
        <SparkleDecoration className="absolute top-40 left-[20%] h-3 w-3 text-[#F8D7DA]/50 animate-pulse" />
        <SparkleDecoration className="absolute bottom-20 left-[12%] h-4 w-4 text-white/25 animate-pulse" />
        <SparkleDecoration className="absolute bottom-32 right-[18%] h-5 w-5 text-[#DCB346]/40 animate-pulse" />
        <SparkleDecoration className="absolute top-16 right-[35%] h-3 w-3 text-[#E8A0AC]/40 animate-pulse" />
        <SparkleDecoration className="absolute bottom-16 right-[8%] h-4 w-4 text-white/20 animate-pulse" />

        {/* Soft blurs for depth */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#E8A0AC]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#DCB346]/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/icon.png"
              alt="Ohio Parent Hub logo"
              width={120}
              height={120}
              className="rounded-2xl shadow-2xl ring-4 ring-white/20"
            />
          </div>

          {/* Tagline pill */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-[#DCB346]" />
            The #1 Resource for Ohio Parents
          </span>

          <h1 className="mt-6 font-serif text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
            <span className="text-balance">Finding Childcare</span>
            <br className="hidden sm:block" />
            <span className="text-[#F8D7DA]">Should Be Simple.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/85">
            Browse <strong className="text-[#DCB346]">{daycares.length.toLocaleString()}</strong> state-licensed daycares, preschools, and early learning centers across <strong className="text-[#DCB346]">{cityCounts.size}</strong> Ohio cities.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-14 rounded-full bg-[#E8A0AC] px-10 text-lg font-semibold text-white shadow-lg hover:bg-[#d88e9a] hover:shadow-xl transition-all w-full sm:w-auto"
              asChild
            >
              <Link href="/daycares">
                <Search className="mr-2 h-5 w-5" />
                Find a Daycare
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-2 border-white/40 bg-white/10 px-10 text-lg font-semibold text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto"
              asChild
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STATS RIBBON -- gold/mustard bar                             */}
      {/* ============================================================ */}
      <section className="bg-[#DCB346] px-6 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: daycares.length.toLocaleString(), label: "Programs", icon: BookOpen },
            { value: String(cityCounts.size), label: "Cities", icon: MapPin },
            { value: "100%", label: "Licensed", icon: ShieldCheck },
            { value: "Free", label: "For Parents", icon: Heart },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/25">
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-serif text-3xl font-bold text-white">
                {stat.value}
              </span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/70">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  WHY PARENTS TRUST US -- cream bg, colored cards              */}
      {/* ============================================================ */}
      <section className="relative py-24 bg-[#F5EDE4]">
        <SparkleDecoration className="absolute top-10 right-[8%] h-5 w-5 text-[#DCB346]/30" />
        <SparkleDecoration className="absolute bottom-14 left-[6%] h-4 w-4 text-[#E8A0AC]/30" />

        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block rounded-full bg-[#E8A0AC]/20 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-[#E8A0AC]">
              Why Parents Trust Us
            </span>
            <h2 className="mt-2 font-serif text-4xl font-bold text-[#4A6B67]">
              Built for Ohio Families
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#6B8A8E] leading-relaxed">
              We aggregate official state data to help you make informed decisions about your child&apos;s care.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Card 1 -- Sage/teal */}
            <div className="group rounded-2xl bg-[#7EA8A4] p-8 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/25">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 font-serif text-2xl font-bold text-white">
                State Licensed
              </h3>
              <p className="text-white/80 leading-relaxed">
                Every program listed on Ohio Parent Hub is verified against state records. We only show licensed providers to ensure safety and quality standards.
              </p>
            </div>

            {/* Card 2 -- Dusty pink */}
            <div className="group rounded-2xl bg-[#E8A0AC] p-8 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/25">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 font-serif text-2xl font-bold text-white">
                Local Focus
              </h3>
              <p className="text-white/80 leading-relaxed">
                Search by city to find care right in your neighborhood. From Cleveland to Cincinnati, we cover every corner of the state.
              </p>
            </div>

            {/* Card 3 -- Mustard gold */}
            <div className="group rounded-2xl bg-[#DCB346] p-8 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/25">
                <Baby className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 font-serif text-2xl font-bold text-white">
                All Ages
              </h3>
              <p className="text-white/80 leading-relaxed">
                From infant care to preschool and after-school programs. Filter by age group to find the perfect fit for your family&apos;s needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BROWSE BY CITY -- alternating colored accents                */}
      {/* ============================================================ */}
      <section id="browse-cities" className="relative py-24 px-6 bg-white">
        <SparkleDecoration className="absolute top-8 left-[10%] h-4 w-4 text-[#B8C5B2]/40 animate-pulse" />
        <SparkleDecoration className="absolute bottom-12 right-[12%] h-3 w-3 text-[#E8A0AC]/30 animate-pulse" />

        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#7EA8A4]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#7EA8A4]">
                <MapPin className="h-3.5 w-3.5" />
                Local Communities
              </span>
              <h2 className="mt-2 font-serif text-4xl font-bold text-[#4A6B67]">
                Explore Top Cities
              </h2>
            </div>
            <Button
              variant="outline"
              className="group rounded-full border-[#7EA8A4] text-[#7EA8A4] hover:bg-[#7EA8A4]/10"
              asChild
            >
              <Link href="/cities">
                View All Cities
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {topCities.map(({ city, count, slug }, i) => {
              // Cycle through the palette colors for left border and icon bg
              const colors = [
                { border: "border-l-[#7EA8A4]", iconBg: "bg-[#7EA8A4]/15", iconText: "text-[#7EA8A4]", hoverIconBg: "bg-[#7EA8A4]", badge: "bg-[#7EA8A4]/15 text-[#7EA8A4]" },
                { border: "border-l-[#E8A0AC]", iconBg: "bg-[#E8A0AC]/15", iconText: "text-[#E8A0AC]", hoverIconBg: "bg-[#E8A0AC]", badge: "bg-[#E8A0AC]/15 text-[#E8A0AC]" },
                { border: "border-l-[#DCB346]", iconBg: "bg-[#DCB346]/15", iconText: "text-[#DCB346]", hoverIconBg: "bg-[#DCB346]", badge: "bg-[#DCB346]/15 text-[#DCB346]" },
                { border: "border-l-[#B8C5B2]", iconBg: "bg-[#B8C5B2]/30", iconText: "text-[#6B8A6E]", hoverIconBg: "bg-[#B8C5B2]", badge: "bg-[#B8C5B2]/20 text-[#6B8A6E]" },
              ];
              const c = colors[i % 4];

              return (
                <Link
                  key={city}
                  href={`/daycares/${slug}`}
                  className="group block"
                >
                  <div className={`flex h-full flex-col rounded-xl border border-[#E8E4DF] ${c.border} border-l-4 bg-[#FAFAF8] p-5 transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5`}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${c.iconBg} ${c.iconText} transition-colors group-hover:${c.hoverIconBg} group-hover:text-white`}>
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className={`rounded-full ${c.badge} px-3 py-0.5 text-xs font-bold`}>
                        {count}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#4A6B67] transition-colors group-hover:text-[#7EA8A4] line-clamp-1">
                      {city}
                    </h3>
                    <p className="mt-auto pt-2 text-xs text-[#6B8A8E]/50">
                      View licensed programs &rarr;
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS -- pink section                                 */}
      {/* ============================================================ */}
      <section className="relative py-24 bg-[#F8D7DA]/40">
        <SparkleDecoration className="absolute top-14 right-[15%] h-5 w-5 text-[#DCB346]/30" />
        <SparkleDecoration className="absolute bottom-10 left-[8%] h-4 w-4 text-[#7EA8A4]/30" />

        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="mb-3 inline-block rounded-full bg-[#7EA8A4]/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-[#7EA8A4]">
            How It Works
          </span>
          <h2 className="mt-2 font-serif text-4xl font-bold text-[#4A6B67]">
            Three Simple Steps
          </h2>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#7EA8A4] text-white shadow-lg">
                <Search className="h-7 w-7" />
              </div>
              <div className="mb-2 font-serif text-sm font-bold uppercase tracking-widest text-[#E8A0AC]">
                Step 1
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold text-[#4A6B67]">
                Search
              </h3>
              <p className="text-[#6B8A8E] leading-relaxed">
                Enter your city or browse our directory to find licensed childcare programs near you.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8A0AC] text-white shadow-lg">
                <Star className="h-7 w-7" />
              </div>
              <div className="mb-2 font-serif text-sm font-bold uppercase tracking-widest text-[#DCB346]">
                Step 2
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold text-[#4A6B67]">
                Compare
              </h3>
              <p className="text-[#6B8A8E] leading-relaxed">
                Review program details, licensing info, and location data to compare your options.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#DCB346] text-white shadow-lg">
                <Heart className="h-7 w-7" />
              </div>
              <div className="mb-2 font-serif text-sm font-bold uppercase tracking-widest text-[#7EA8A4]">
                Step 3
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold text-[#4A6B67]">
                Choose
              </h3>
              <p className="text-[#6B8A8E] leading-relaxed">
                Pick the perfect program and contact them directly. It&apos;s that simple.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA -- Teal bg with pink and gold accents                    */}
      {/* ============================================================ */}
      <section
        className="relative overflow-hidden py-28 text-center"
        style={{ background: "linear-gradient(135deg, #7EA8A4 0%, #6B9B96 50%, #5A8A86 100%)" }}
      >
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#E8A0AC]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#DCB346]/20 blur-3xl" />

        {/* Sparkles */}
        <SparkleDecoration className="absolute top-16 left-[10%] h-5 w-5 text-white/20 animate-pulse" />
        <SparkleDecoration className="absolute bottom-20 right-[8%] h-4 w-4 text-[#DCB346]/30 animate-pulse" />
        <SparkleDecoration className="absolute top-24 right-[25%] h-3 w-3 text-[#F8D7DA]/30 animate-pulse" />

        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8A0AC] shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl text-balance">
            Ready to find the perfect care?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 leading-relaxed">
            Join thousands of Ohio parents who trust us to help them find safe, licensed childcare.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-14 rounded-full bg-[#DCB346] px-10 text-lg font-bold text-white shadow-lg hover:bg-[#c9a33e] hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/daycares">
                <Search className="mr-2 h-5 w-5" />
                Start Your Search
              </Link>
            </Button>
            <Button
              size="lg"
              className="h-14 rounded-full bg-[#E8A0AC] px-10 text-lg font-bold text-white shadow-lg hover:bg-[#d88e9a] hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/cities">
                Browse Cities
              </Link>
            </Button>
          </div>
          <p className="mt-10 text-sm text-white/50">
            Are you a provider?{" "}
            <Link href="/contact" className="underline hover:text-white/80 transition-colors">
              Update your listing
            </Link>
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER -- warm cream                                         */}
      {/* ============================================================ */}
      <footer className="bg-[#F5EDE4] py-12 px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center">
          <Image
            src="/icon.png"
            alt="Ohio Parent Hub logo"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <p className="font-serif text-lg font-bold text-[#4A6B67]">
            Ohio Parent Hub
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-[#6B8A8E]">
            <Link href="/daycares" className="hover:text-[#E8A0AC] transition-colors">Find Daycares</Link>
            <Link href="/cities" className="hover:text-[#E8A0AC] transition-colors">Browse Cities</Link>
            <Link href="/about" className="hover:text-[#E8A0AC] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#E8A0AC] transition-colors">Contact</Link>
          </div>
          <div className="h-px w-full max-w-xs bg-[#B8C5B2]/40" />
          <div className="flex items-center gap-1 text-sm text-[#6B8A8E]/50">
            Made with <Heart className="mx-1 h-3.5 w-3.5 text-[#E8A0AC]" /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
