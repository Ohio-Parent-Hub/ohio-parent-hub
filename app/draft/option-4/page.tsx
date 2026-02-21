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
import { MapPin, Search, ShieldCheck, Baby, ArrowRight, Heart, Leaf, Flower2, TreePine } from "lucide-react";

/* =========================================================
   OPTION 4 — "Garden Party"
   Sticky sidebar navigation on the left, single scrolling
   content column on the right. Botanical greens, floral
   pinks, golden accents. Lush, elegant, editorial.
   ========================================================= */

const forest = "#2D5016";
const leaf = "#4A7C28";
const floral = "#D4577A";
const golden = "#D4A843";
const cream = "#FEFDF5";
const lightGreen = "#E8F5E0";
const softPink = "#FDECF2";

export default function Option4() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => { const c = d["CITY"]; if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1); });
  const topCities = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 16).map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <div className="flex min-h-screen" style={{ background: cream, color: forest }}>
      {/* Back link */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Link href="/draft" className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: forest, color: "#fff" }}>&larr; Back</Link>
      </div>

      {/* SIDEBAR NAV -- Sticky left, hidden on mobile */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r px-6 py-8 lg:flex" style={{ borderColor: `${leaf}15`, background: lightGreen }}>
        <div>
          <Link href="/draft/option-4" className="mb-8 flex items-center gap-3">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={40} height={40} className="rounded-xl shadow-sm" />
          </Link>
          <h3 className="font-serif text-xl font-bold" style={{ color: forest }}>Ohio Parent Hub</h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: `${forest}88` }}>Parent Resource</p>

          <nav className="mt-10 flex flex-col gap-1">
            {[
              { label: "Find Daycares", href: "/daycares", icon: Search },
              { label: "Browse Cities", href: "/cities", icon: MapPin },
              { label: "About Us", href: "/about", icon: Leaf },
              { label: "Contact", href: "/contact", icon: Heart },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/60" style={{ color: forest }}>
                <item.icon className="h-4 w-4" style={{ color: leaf }} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/draft" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/60" style={{ color: `${forest}88` }}>
            &larr; All Options
          </Link>
          <div className="flex items-center gap-1 text-xs" style={{ color: `${forest}50` }}>
            <Flower2 className="h-3 w-3" style={{ color: floral }} /> Made for Ohio families
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT -- Single scrolling column */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile nav */}
        <nav className="sticky top-0 z-40 flex items-center justify-between border-b px-6 py-3 backdrop-blur-xl lg:hidden" style={{ borderColor: `${leaf}15`, background: `${cream}ee` }}>
          <Link href="/draft/option-4" className="flex items-center gap-2">
            <Image src="/icon.png" alt="Ohio Parent Hub" width={32} height={32} className="rounded-lg" />
            <span className="font-serif text-base font-bold" style={{ color: forest }}>Ohio Parent Hub</span>
          </Link>
          <Button size="sm" className="rounded-full font-bold" style={{ background: floral, color: "#fff" }} asChild>
            <Link href="/daycares"><Search className="mr-1 h-3 w-3" />Search</Link>
          </Button>
        </nav>

        {/* HERO - Elegant, long-form, left-aligned */}
        <section className="px-8 py-28 lg:px-16 lg:py-36">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-12" style={{ background: floral }} />
              <span className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: floral }}>Ohio&apos;s Trusted Parent Resource</span>
            </div>
            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl" style={{ color: forest }}>
              Finding Childcare
              <br />
              <span style={{ color: floral }}>Should Be Simple.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed" style={{ color: `${forest}bb` }}>
              Browse <strong style={{ color: golden }}>{daycares.length.toLocaleString()}</strong> licensed programs across <strong style={{ color: golden }}>{cityCounts.size}</strong> Ohio cities. Verified. Always free.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" className="h-12 rounded-lg px-8 font-bold shadow-md" style={{ background: forest, color: "#fff" }} asChild>
                <Link href="/daycares"><Search className="mr-2 h-4 w-4" />Find a Daycare</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-lg border-2 px-8 font-bold" style={{ borderColor: floral, color: floral }} asChild>
                <Link href="/cities"><MapPin className="mr-2 h-4 w-4" />Browse Cities</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* STATS - Inline, elegant */}
        <section className="border-y px-8 py-10 lg:px-16" style={{ borderColor: `${leaf}15`, background: lightGreen }}>
          <div className="flex flex-wrap gap-12">
            {[
              { val: daycares.length.toLocaleString(), lbl: "Programs", c: forest },
              { val: String(cityCounts.size), lbl: "Cities", c: golden },
              { val: "100%", lbl: "Licensed", c: floral },
              { val: "Free", lbl: "Always", c: leaf },
            ].map((s) => (
              <div key={s.lbl}>
                <span className="font-serif text-4xl font-bold" style={{ color: s.c }}>{s.val}</span>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: `${forest}60` }}>{s.lbl}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES - Long-form text blocks, botanical style */}
        <section className="px-8 py-24 lg:px-16">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <TreePine className="h-5 w-5" style={{ color: leaf }} />
              <h2 className="font-serif text-3xl font-bold" style={{ color: forest }}>Why Parents Trust Us</h2>
            </div>
            <div className="mt-12 flex flex-col gap-12">
              {[
                { icon: ShieldCheck, title: "State Licensed Data", desc: "Every listing is verified against official Ohio state records. We only show licensed, approved childcare providers -- never crowdsourced or unverified.", accent: forest },
                { icon: MapPin, title: "Neighborhood Search", desc: "Browse by your exact city to find care right in your community. We cover all of Ohio, from Columbus to the smallest towns.", accent: floral },
                { icon: Baby, title: "Every Age Group", desc: "Whether you need infant care, a toddler program, preschool, or after-school supervision -- find it all in one place.", accent: golden },
              ].map((f) => (
                <div key={f.title} className="flex gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg" style={{ background: `${f.accent}15` }}>
                    <f.icon className="h-6 w-6" style={{ color: f.accent }} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold" style={{ color: forest }}>{f.title}</h3>
                    <p className="mt-2 max-w-lg leading-relaxed" style={{ color: `${forest}99` }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CITIES - Alternating color rows */}
        <section className="border-t px-8 py-24 lg:px-16" style={{ borderColor: `${leaf}15` }}>
          <div className="max-w-3xl">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-serif text-3xl font-bold" style={{ color: forest }}>Top Ohio Cities</h2>
              <Link href="/cities" className="text-sm font-semibold" style={{ color: floral }}>All Cities <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
            </div>
            <div className="flex flex-col">
              {topCities.map(({ city, count, slug }, i) => {
                const bg = i % 2 === 0 ? lightGreen : softPink;
                const accent = i % 2 === 0 ? forest : floral;
                return (
                  <Link key={city} href={`/daycares/${slug}`} className="group flex items-center justify-between rounded-lg px-5 py-4 transition-all hover:shadow-sm" style={{ background: bg }}>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4" style={{ color: accent }} />
                      <span className="font-serif text-lg font-bold" style={{ color: forest }}>{city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: `${forest}60` }}>{count} programs</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: accent }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-8 py-24 lg:px-16" style={{ background: forest }}>
          <div className="max-w-3xl">
            <h2 className="font-serif text-4xl font-bold text-white">Ready to find the perfect care?</h2>
            <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.75)" }}>Join thousands of Ohio parents who trust us.</p>
            <div className="mt-8 flex gap-4">
              <Button size="lg" className="h-12 rounded-lg px-8 font-bold" style={{ background: golden, color: forest }} asChild>
                <Link href="/daycares"><Search className="mr-2 h-4 w-4" />Start Your Search</Link>
              </Button>
              <Button size="lg" className="h-12 rounded-lg px-8 font-bold" style={{ background: floral, color: "#fff" }} asChild>
                <Link href="/cities">Browse Cities</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="px-8 py-8 lg:px-16" style={{ background: cream }}>
          <div className="flex items-center gap-1 text-xs" style={{ color: `${forest}50` }}>
            Made with <Heart className="mx-1 h-3 w-3" style={{ color: floral }} /> for Ohio families
          </div>
        </footer>
      </main>
    </div>
  );
}
