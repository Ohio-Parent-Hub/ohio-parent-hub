import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Baby,
  ArrowRight,
  Heart,
  Star,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Decorative sparkle SVG used as accents throughout the page         */
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

function FourPointStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 0C10 0 11.5 7 10 10C10 10 7 11.5 0 10C0 10 7 10 10 10C10 10 10 7 10 0ZM10 20C10 20 8.5 13 10 10C10 10 13 8.5 20 10C20 10 13 10 10 10C10 10 10 13 10 20Z" />
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
    <div className="flex min-h-screen flex-col bg-[#FAF8F5]">

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden px-6 py-28 sm:py-36" style={{ background: "linear-gradient(180deg, #EEF2EC 0%, #FAF8F5 100%)" }}>

        {/* Floating sparkle decorations */}
        <SparkleDecoration className="absolute top-16 left-[8%] h-5 w-5 text-[#D4A843] opacity-60 animate-pulse" />
        <SparkleDecoration className="absolute top-28 right-[12%] h-4 w-4 text-[#E8B4B8] opacity-50 animate-pulse" />
        <SparkleDecoration className="absolute bottom-20 left-[15%] h-3 w-3 text-[#B8C5B2] opacity-50 animate-pulse" />
        <FourPointStar className="absolute top-20 right-[25%] h-6 w-6 text-[#E8B4B8] opacity-40" />
        <FourPointStar className="absolute bottom-32 right-[10%] h-4 w-4 text-[#D4A843] opacity-40" />

        {/* Soft circular blurs for depth -- inspired by the image's circular logo elements */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#B8C5B2]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-60 w-60 rounded-full bg-[#E8B4B8]/15 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Top tag */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm font-medium text-[#6B8A8E] shadow-sm ring-1 ring-[#B8C5B2]/40 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-[#D4A843]" />
            The #1 Resource for Ohio Parents
          </span>

          <h1 className="mt-6 font-serif text-5xl font-bold tracking-tight text-[#4A6063] sm:text-6xl md:text-7xl">
            <span className="text-balance">Finding Childcare</span>
            <br className="hidden sm:block" />
            <span className="text-[#E8B4B8]">Should Be Simple.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#6B8A8E]">
            Browse <strong className="text-[#4A6063]">{daycares.length.toLocaleString()}</strong> state-licensed daycares, preschools, and early learning centers across <strong className="text-[#4A6063]">{cityCounts.size}</strong> Ohio cities.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-13 rounded-full bg-[#6B8A8E] px-8 text-lg font-medium text-white shadow-lg hover:bg-[#5A7A7E] hover:shadow-xl transition-all w-full sm:w-auto"
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
              className="h-13 rounded-full border-2 border-[#B8C5B2] px-8 text-lg font-medium text-[#6B8A8E] hover:bg-[#B8C5B2]/15 w-full sm:w-auto"
              asChild
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>

          {/* Stats ribbon */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 rounded-2xl bg-white/70 px-8 py-8 shadow-sm ring-1 ring-[#B8C5B2]/30 backdrop-blur-sm md:grid-cols-4">
            {[
              { value: daycares.length.toLocaleString(), label: "Programs" },
              { value: String(cityCounts.size), label: "Cities" },
              { value: "100%", label: "Licensed" },
              { value: "Free", label: "For Parents" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="font-serif text-3xl font-bold text-[#D4A843]">
                  {stat.value}
                </span>
                <span className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#6B8A8E]/70">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  WHY PARENTS TRUST US                                         */}
      {/* ============================================================ */}
      <section className="relative py-24 bg-white">
        <SparkleDecoration className="absolute top-12 right-[7%] h-4 w-4 text-[#D4A843] opacity-40" />
        <SparkleDecoration className="absolute bottom-16 left-[5%] h-3 w-3 text-[#E8B4B8] opacity-40" />

        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-[#E8B4B8]">
              Why Parents Trust Us
            </span>
            <h2 className="font-serif text-4xl font-bold text-[#4A6063]">
              Built for Ohio Families
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#6B8A8E] leading-relaxed">
              We aggregate official state data to help you make informed decisions about your child&apos;s care.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-[#B8C5B2]/30 bg-[#FAF8F5] p-8 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#B8C5B2]/25 text-[#6B8A8E] transition-colors group-hover:bg-[#B8C5B2]/40">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="mb-3 font-serif text-2xl font-bold text-[#4A6063]">
                State Licensed
              </h3>
              <p className="text-[#6B8A8E] leading-relaxed">
                Every program listed on Ohio Parent Hub is verified against state records. We only show licensed providers to ensure safety and quality standards.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-[#D4A843]/20 bg-[#FAF8F5] p-8 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#D4A843]/15 text-[#D4A843] transition-colors group-hover:bg-[#D4A843]/25">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="mb-3 font-serif text-2xl font-bold text-[#4A6063]">
                Local Focus
              </h3>
              <p className="text-[#6B8A8E] leading-relaxed">
                Search by city to find care right in your neighborhood. From Cleveland to Cincinnati, we cover every corner of the state.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-[#E8B4B8]/30 bg-[#FAF8F5] p-8 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E8B4B8]/20 text-[#E8B4B8] transition-colors group-hover:bg-[#E8B4B8]/30">
                <Baby className="h-7 w-7" />
              </div>
              <h3 className="mb-3 font-serif text-2xl font-bold text-[#4A6063]">
                All Ages
              </h3>
              <p className="text-[#6B8A8E] leading-relaxed">
                From infant care to preschool and after-school programs. Filter by age group to find the perfect fit for your family&apos;s needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BROWSE BY CITY                                               */}
      {/* ============================================================ */}
      <section id="browse-cities" className="relative py-24 px-6 bg-[#FAF8F5]">
        <SparkleDecoration className="absolute top-10 left-[10%] h-4 w-4 text-[#B8C5B2] opacity-40 animate-pulse" />

        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#B8C5B2]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#6B8A8E]">
                <MapPin className="h-3.5 w-3.5" />
                Local Communities
              </span>
              <h2 className="mt-2 font-serif text-4xl font-bold text-[#4A6063]">
                Explore Top Cities
              </h2>
            </div>
            <Button
              variant="outline"
              className="group rounded-full border-[#B8C5B2] text-[#6B8A8E] hover:bg-[#B8C5B2]/15"
              asChild
            >
              <Link href="/cities">
                View All Cities
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {topCities.map(({ city, count, slug }) => (
              <Link
                key={city}
                href={`/daycares/${slug}`}
                className="group block"
              >
                <div className="flex h-full flex-col rounded-xl border border-[#B8C5B2]/25 bg-white p-5 transition-all duration-200 group-hover:border-[#6B8A8E]/40 group-hover:shadow-md group-hover:-translate-y-0.5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B8C5B2]/20 text-[#6B8A8E] transition-colors group-hover:bg-[#6B8A8E] group-hover:text-white">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="rounded-full bg-[#D4A843]/12 px-3 py-0.5 text-xs font-semibold text-[#D4A843]">
                      {count}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#4A6063] transition-colors group-hover:text-[#6B8A8E] line-clamp-1">
                    {city}
                  </h3>
                  <p className="mt-auto pt-2 text-xs text-[#6B8A8E]/60">
                    View licensed programs &rarr;
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                          */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden py-28 text-center" style={{ background: "linear-gradient(135deg, #6B8A8E 0%, #5A7A7E 50%, #4A6A6E 100%)" }}>
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#E8B4B8]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#D4A843]/15 blur-3xl" />

        {/* Sparkles */}
        <SparkleDecoration className="absolute top-16 left-[10%] h-5 w-5 text-white/20 animate-pulse" />
        <SparkleDecoration className="absolute bottom-20 right-[8%] h-4 w-4 text-[#D4A843]/30 animate-pulse" />
        <FourPointStar className="absolute top-24 right-[20%] h-6 w-6 text-white/10" />

        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <Heart className="mx-auto mb-6 h-10 w-10 text-[#E8B4B8]" />
          <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl text-balance">
            Ready to find the perfect care?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 leading-relaxed">
            Join thousands of Ohio parents who trust us to help them find safe, licensed childcare.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-14 rounded-full bg-white px-10 text-lg font-semibold text-[#6B8A8E] shadow-lg hover:bg-[#FAF8F5] hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/daycares">
                <Search className="mr-2 h-5 w-5" />
                Start Your Search
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
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="border-t border-[#B8C5B2]/30 bg-white py-10 px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
          <p className="font-serif text-lg font-bold text-[#4A6063]">
            Ohio Parent Hub
          </p>
          <p className="text-sm text-[#6B8A8E]/60">
            Helping Ohio families find quality childcare since 2024.
          </p>
          <div className="flex items-center gap-1 text-sm text-[#6B8A8E]/40">
            Made with <Heart className="mx-1 h-3.5 w-3.5 text-[#E8B4B8]" /> for Ohio families
          </div>
        </div>
      </footer>
    </div>
  );
}
