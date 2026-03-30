import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { toTitleCaseIfAllCaps } from "@/lib/utils";
import { getCitiesWithMetroEntry, resolveCanonicalCityName } from "@/lib/metroAreas";
import { MapPin, Search, ShieldCheck, Baby, ArrowRight, Sparkles } from "lucide-react";
import HomepageSearchInput from "@/components/HomepageSearchInput";

export const metadata: Metadata = {
  title: "Best Daycares in Ohio | Licensed Child Care Search",
  description:
    "Find top-rated, licensed Ohio daycares by city. Compare SUTQ quality ratings and provider details to choose child care near you.",
  keywords: [
    "best daycares in ohio",
    "ohio daycare search",
    "licensed childcare ohio",
    "child care near me ohio",
    "sutq rated daycare",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Best Daycares in Ohio | Licensed Child Care Search",
    description:
      "Find top-rated, licensed Ohio daycares by city and compare SUTQ quality information.",
    url: "https://ohioparenthub.com/",
    siteName: "Ohio Parent Hub",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Ohio Parent Hub — Licensed Daycare & Family Resources",
      },
    ],
  },
};

type DaycareRow = Record<string, string>;
function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const lightTeal = "#D5E5E3";
const lightGold = "#F5E9BE";
const lightPink = "#FADED4";

function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      fill="none"
      preserveAspectRatio="none"
      className={`block w-full ${flip ? "rotate-180" : ""}`}
      style={{ height: "50px", marginBottom: flip ? 0 : "-1px", marginTop: flip ? "-1px" : 0 }}
    >
      <path
        d="M0 40C180 80 360 0 540 40C720 80 900 0 1080 40C1260 80 1440 0 1440 40V80H0V40Z"
        fill={fill}
      />
    </svg>
  );
}

function SparkleDecor({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
    </svg>
  );
}

type HomeFaqEntry = { question: string; schemaAnswer: string; answer: ReactNode };

const homeFaqs: HomeFaqEntry[] = [
  {
    question: "What is the average cost of daycare in Ohio?",
    schemaAnswer:
      "According to the Economic Policy Institute (data updated February 2025), the average annual cost of infant care in Ohio is $17,071 (approximately $1,423/month), and care for a 4-year-old averages $13,426/year. Ohio ranks as the 16th most expensive state for infant care in the U.S. Costs vary by provider type, location, and hours. Ohio's PFCC program may help eligible families offset expenses. Ohio also offers a free SUTQ Cost Estimator at sutqcalculator.childrenandyouth.ohio.gov that estimates costs by rating level and county.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#4A6B67cc" }}>
        <p>Ohio child care costs are among the highest in the nation. According to data from the Economic Policy Institute (updated February 2025):</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li><strong style={{ color: "#4A6B67" }}>Average annual cost of infant care in Ohio: $17,071</strong> — approximately $1,423/month</li>
          <li><strong style={{ color: "#4A6B67" }}>Average annual cost for a 4-year-old: $13,426</strong> — approximately $1,119/month</li>
          <li>Ohio ranks as the <strong style={{ color: "#4A6B67" }}>16th most expensive state</strong> for infant care in the U.S.</li>
          <li>Infant care in Ohio costs <strong style={{ color: "#4A6B67" }}>53.7% more per year</strong> than in-state college tuition</li>
        </ul>
        <p>Costs vary by provider type and location. Home-based Type B providers are typically less expensive than licensed Child Care Centers. Urban areas like Columbus, Cleveland, and Cincinnati tend to run higher than rural communities.</p>
        <p>
          Ohio offers a free{" "}
          <a href="https://sutqcalculator.childrenandyouth.ohio.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: "#7EA8A4" }}>SUTQ Cost Estimator</a>{" "}
          that estimates child care costs by SUTQ rating level and county. If cost is a barrier, Ohio&apos;s <strong style={{ color: "#4A6B67" }}>Publicly Funded Child Care (PFCC)</strong> program may help eligible families — contact your county Department of Job and Family Services to apply.
        </p>
        <p className="text-xs" style={{ color: "#4A6B6766" }}>
          Source:{" "}
          <a href="https://www.epi.org/child-care-costs-in-the-united-states/#/OH" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Economic Policy Institute — Child Care Costs in the United States (Ohio)</a>
        </p>
      </div>
    ),
  },
  {
    question: "What are the different types of child care providers in Ohio?",
    schemaAnswer:
      "Ohio licenses or certifies seven distinct child care provider types: Licensed Child Care Centers (non-residential facilities serving larger groups), Licensed Type A Family Child Care Homes (fully licensed home programs, up to 12 children), Licensed Type B Family Child Care Homes (registered home programs, up to 6 children), Licensed School-Age Child Care, Licensed School-Based Preschool, Certified In Home Aides (care in the child's own home), and Registered or Approved Day Camps. Ohio Parent Hub lists all seven types and allows filtering by program type.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#4A6B67cc" }}>
        <p>Ohio licenses, registers, or certifies seven distinct child care provider types:</p>
        <div className="space-y-2">
          <p><strong style={{ color: "#4A6B67" }}>Licensed Child Care Center</strong> — A licensed facility in a non-residential building serving larger groups across multiple age rooms. Most offer full-day, year-round programming.</p>
          <p><strong style={{ color: "#4A6B67" }}>Licensed Type A Family Child Care Home</strong> — A fully licensed home-based program serving up to 12 children with an assistant. Similar licensing rigor to a center, but in a residential setting.</p>
          <p><strong style={{ color: "#4A6B67" }}>Licensed Type B Family Child Care Home</strong> — A registered home program serving up to six children in the provider&apos;s own residence.</p>
          <p><strong style={{ color: "#4A6B67" }}>Licensed School-Age Child Care</strong> — Before/after school and break-time care for children in kindergarten through age 14.</p>
          <p><strong style={{ color: "#4A6B67" }}>Licensed School-Based Preschool</strong> — Early childhood programs operating within a school building for ages 3–5.</p>
          <p><strong style={{ color: "#4A6B67" }}>Certified In Home Aide</strong> — Care provided in the child&apos;s own home; common for families using Ohio&apos;s PFCC subsidy program.</p>
          <p><strong style={{ color: "#4A6B67" }}>Registered / Approved Day Camp</strong> — Structured daytime programs during summer and school breaks.</p>
        </div>
        <p>
          Ohio Parent Hub lists all seven types. Use the{" "}
          <Link href="/daycares" className="underline hover:no-underline" style={{ color: "#7EA8A4" }}>program type filter</Link>{" "}
          to find the setting that fits your family.
        </p>
        <p className="text-xs" style={{ color: "#4A6B6766" }}>
          Source:{" "}
          <a href="https://childrenandyouth.ohio.gov/for-families/early-care-education/child-care" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Department of Children and Youth — Child Care for Families</a>
        </p>
      </div>
    ),
  },
  {
    question: "Are all daycares listed on Ohio Parent Hub licensed by the state?",
    schemaAnswer:
      "Yes. Every provider listed on Ohio Parent Hub is sourced from Ohio's official state licensing database maintained by the Ohio Department of Children and Youth (DCY). All providers must pass initial inspections and are subject to ongoing compliance reviews. To verify current license status and inspection history, visit Ohio's Child Care Search at childcaresearch.ohio.gov.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#4A6B67cc" }}>
        <p>
          Yes. Every provider listed on Ohio Parent Hub is sourced from Ohio&apos;s official state licensing database maintained by the <strong style={{ color: "#4A6B67" }}>Ohio Department of Children and Youth (DCY)</strong>. Operating a child care program in Ohio without a license or registration is illegal in virtually all circumstances.
        </p>
        <p>
          All providers must pass initial inspections covering health and safety, staffing ratios, background checks, and physical environment — and are subject to ongoing compliance reviews to maintain their license.
        </p>
        <p>
          To verify a provider&apos;s current license status and view inspection history, visit{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: "#7EA8A4" }}>Ohio&apos;s Child Care Search</a>{" "}
          directly.
        </p>
        <p className="text-xs" style={{ color: "#4A6B6766" }}>
          Source:{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Department of Children and Youth — Child Care Search</a>
        </p>
      </div>
    ),
  },
  {
    question: "What is SUTQ and what do Gold, Silver, and Bronze ratings mean?",
    schemaAnswer:
      "SUTQ stands for Step Up To Quality, Ohio's voluntary tiered quality rating system administered by the Ohio Department of Children and Youth (DCY). It has three levels — Bronze (entry), Silver (intermediate), and Gold (highest) — covering curriculum, developmental screening, staff qualifications, and family partnerships. Not Rated means the provider has not enrolled in the voluntary program; it does not mean the provider is unlicensed or unsafe.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#4A6B67cc" }}>
        <p>
          SUTQ stands for <strong style={{ color: "#4A6B67" }}>Step Up To Quality</strong>, Ohio&apos;s voluntary tiered quality rating and improvement system administered by the Ohio Department of Children and Youth. It recognizes licensed providers that go above baseline licensing requirements.
        </p>
        <div className="space-y-1">
          <p><strong style={{ color: "#4A6B67" }}>🥉 Bronze</strong> — Research-based curriculum, developmental screenings, annual self-assessments, minimum staff education thresholds.</p>
          <p><strong style={{ color: "#4A6B67" }}>🥈 Silver</strong> — Everything in Bronze, plus formal child assessments shared with families and an on-site administrator with an Associate&apos;s Degree or CPL Level 3.</p>
          <p><strong style={{ color: "#4A6B67" }}>🥇 Gold</strong> — Everything in Silver, plus assessment-driven lesson planning, 50% of lead teachers with AA or CPL Level 3, and enhanced staff-to-child ratios.</p>
        </div>
        <p><strong style={{ color: "#4A6B67" }}>Not Rated</strong> means the provider hasn&apos;t enrolled in the voluntary SUTQ program — not that they&apos;re unlicensed or unsafe. Use the free{" "}
          <a href="https://sutqcalculator.childrenandyouth.ohio.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: "#7EA8A4" }}>SUTQ Cost Estimator</a>{" "}
          to compare costs by rating level in your county.
        </p>
        <p className="text-xs" style={{ color: "#4A6B6766" }}>
          Source:{" "}
          <a href="https://childrenandyouth.ohio.gov/for-providers/step-up-to-quality/step-up-to-quality" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio DCY — Step Up To Quality</a>{" "}|{" "}
          <a href="https://codes.ohio.gov/assets/laws/administrative-code/authenticated/5101/2/17/5101$2-17-01_20240707.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">OAC 5101:2-17-01 (PDF)</a>
        </p>
      </div>
    ),
  },
  {
    question: "What is PFCC and how do I get help paying for child care in Ohio?",
    schemaAnswer:
      "PFCC stands for Publicly Funded Child Care, an Ohio program that helps eligible families afford licensed child care using federal and state funds administered by the Ohio Department of Children and Youth. A PFCC Agreement on a listing means that provider has agreed to accept PFCC reimbursements as payment. Eligibility is based on family income and work or school participation. Contact your county Department of Job and Family Services to apply.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#4A6B67cc" }}>
        <p>
          <strong style={{ color: "#4A6B67" }}>PFCC (Publicly Funded Child Care)</strong> is an Ohio program that helps eligible families afford licensed child care using federal Child Care and Development Fund (CCDF) money combined with state funds, distributed through the Ohio Department of Children and Youth.
        </p>
        <p>
          When a listing shows a <strong style={{ color: "#4A6B67" }}>PFCC Agreement</strong>, it means that provider has a signed agreement to accept PFCC reimbursements as payment. If your family qualifies for assistance, you can use that benefit at any provider holding a PFCC Agreement.
        </p>
        <p>
          Eligibility is based on family income, work or school participation, and other factors. To apply, contact your county Department of Job and Family Services — each county administers the program locally.
        </p>
        <p className="text-xs" style={{ color: "#4A6B6766" }}>
          Source:{" "}
          <a href="https://childrenandyouth.ohio.gov/for-providers/resources/pfcc" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio DCY — Publicly Funded Child Care</a>
        </p>
      </div>
    ),
  },
];

export default function HomePage() {
  const daycares = loadDaycares();
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => {
    const c = resolveCanonicalCityName(d["CITY"] || "");
    if (c) cityCounts.set(c, (cityCounts.get(c) || 0) + 1);
  });
  const topCities = getCitiesWithMetroEntry(daycares)
    .sort((a, b) => b.count - a.count)
    .slice(0, 24)
    .map(({ name, count, slug }) => ({
      city: toTitleCaseIfAllCaps(name),
      count,
      slug,
    }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: cream, color: dark }}>
      <section className="relative overflow-hidden px-6 pt-12 pb-28 sm:pt-16 sm:pb-36" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute top-10 left-[8%] h-6 w-6 text-gold/30 animate-pulse" style={{ color: gold }} />
        <SparkleDecor className="absolute top-20 right-[12%] h-4 w-4 text-pink/30 animate-pulse" style={{ color: pink }} />
        <SparkleDecor className="absolute bottom-24 left-[15%] h-5 w-5 text-teal/20 animate-pulse" style={{ color: teal }} />
        <SparkleDecor className="absolute bottom-16 right-[20%] h-3 w-3 text-gold/30 animate-pulse" style={{ color: gold }} />
        <SparkleDecor className="absolute top-1/2 left-[4%] h-4 w-4 text-pink/20 animate-pulse" style={{ color: pink }} />
        <SparkleDecor className="absolute top-32 right-[5%] h-5 w-5" style={{ color: `${sage}60` }} />

        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full" style={{ background: `${gold}15` }} />
        <div className="pointer-events-none absolute top-1/3 right-[10%] h-32 w-32 rounded-full" style={{ background: `${sage}20` }} />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3 text-left">
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm" style={{ background: "rgba(255,255,255,0.7)", color: teal }}>
              <Sparkles className="h-4 w-4" style={{ color: gold }} />
              Ohio&apos;s Trusted Parent Resource
            </div>

            <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl" style={{ color: dark }}>
              <span className="text-balance">Find the Best Daycares</span>
              <br />
              <span style={{ color: pink }}>in Ohio.</span>
            </h1>

            <p className="mt-5 sm:mt-8 max-w-2xl text-lg leading-relaxed" style={{ color: `${dark}bb` }}>
              Browse <strong style={{ color: gold }}>{daycares.length.toLocaleString()}</strong> licensed programs across <strong style={{ color: gold }}>{cityCounts.size}</strong> Ohio cities to find child care near you.
            </p>

            <div className="mt-6 sm:mt-10 w-full max-w-2xl">
              <HomepageSearchInput />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: daycares.length.toLocaleString(), label: "Programs", bg: "#FFFFFF", accent: teal, darkAccent: "#5E8E8A", href: "/daycares" },
                { value: String(cityCounts.size), label: "Cities", bg: lightPink, accent: pink, darkAccent: "#C47A86", href: "/cities" },
                { value: "100%", label: "Licensed", bg: lightGold, accent: gold, darkAccent: "#B8962E", href: "/methodology" },
                { value: "Free", label: "For Parents", bg: "#F8FBFA", accent: dark, darkAccent: dark },
              ].map((s) => {
                const content = (
                  <>
                    <SparkleDecor className="mb-2 h-4 w-4" style={{ color: `${s.accent}60` }} />
                    <span className="font-serif text-3xl font-bold" style={{ color: s.darkAccent }}>{s.value}</span>
                    <span className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: `${dark}88` }}>{s.label}</span>
                  </>
                );
                const className = `flex flex-col items-start rounded-2xl border p-6 shadow-lg transition-colors ${"href" in s && s.href ? "hover:border-opacity-80 hover:shadow-xl cursor-pointer" : ""}`;
                const style = { background: s.bg, borderColor: `${s.accent}40`, boxShadow: "0 10px 24px rgba(61,90,86,0.12)" };

                return "href" in s && s.href ? (
                  <Link key={s.label} href={s.href} className={className} style={style}>
                    {content}
                  </Link>
                ) : (
                  <div key={s.label} className={className} style={style}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: lightTeal }}>
        <WaveDivider fill="#fff" />
      </div>

      <section className="px-6 pb-24 pt-12" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <SparkleDecor className="mb-4 h-6 w-6" style={{ color: `${gold}60` }} />
            <h2 className="font-serif text-4xl font-bold" style={{ color: dark }}>Why Parents Love Us</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-5">
            <div className="md:col-span-3 rounded-3xl p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: lightTeal }}>
              <div className="relative mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm" style={{ background: teal }}>
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <SparkleDecor className="absolute -top-2 -right-2 h-4 w-4" style={{ color: `${gold}50` }} />
              </div>
              <h3 className="mb-3 font-serif text-2xl font-bold" style={{ color: dark }}>State Licensed</h3>
              <p className="leading-relaxed" style={{ color: `${dark}88` }}>Every program listed is verified against official state records. We only show licensed providers to ensure your child&apos;s safety and quality of care.</p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-8">
              <div className="rounded-3xl p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: lightGold }}>
                <div className="relative mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm" style={{ background: gold }}>
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <SparkleDecor className="absolute -top-2 -right-2 h-4 w-4" style={{ color: `${gold}50` }} />
                </div>
                <h3 className="mb-3 font-serif text-2xl font-bold" style={{ color: dark }}>Local Focus</h3>
                <p className="leading-relaxed" style={{ color: `${dark}88` }}>Search by city for care in your neighborhood. Every corner of Ohio.</p>
              </div>

              <div className="rounded-3xl p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: lightPink }}>
                <div className="relative mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm" style={{ background: pink }}>
                    <Baby className="h-8 w-8 text-white" />
                  </div>
                  <SparkleDecor className="absolute -top-2 -right-2 h-4 w-4" style={{ color: `${gold}50` }} />
                </div>
                <h3 className="mb-3 font-serif text-2xl font-bold" style={{ color: dark }}>All Ages</h3>
                <p className="leading-relaxed" style={{ color: `${dark}88` }}>Infant care to after-school. Filter by age group.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: "#fff" }}>
        <WaveDivider fill={cream} />
      </div>

      <section className="px-6 pb-24 pt-12" style={{ background: cream }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <SparkleDecor className="mb-3 h-5 w-5" style={{ color: `${teal}50` }} />
              <h2 className="font-serif text-4xl font-bold" style={{ color: dark }}>Explore Top Cities</h2>
            </div>
            <Button variant="outline" className="group rounded-full border-2 font-bold" style={{ borderColor: teal, color: teal }} asChild>
              <Link href="/cities">View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {topCities.map(({ city, count, slug }, i) => {
              const pastels = [lightTeal, lightPink, lightGold, `${sage}30`];
              const accents = [teal, pink, gold, sage];
              return (
                <Link key={city} href={`/daycares/${slug}`} className="group block">
                  <div className="flex h-full flex-col rounded-2xl p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md" style={{ background: pastels[i % 4] }}>
                    <div className="mb-3 flex items-center justify-between">
                      <MapPin className="h-4 w-4" style={{ color: accents[i % 4] }} />
                      <span className="rounded-full px-3 py-0.5 text-xs font-bold" style={{ background: "rgba(255,255,255,0.6)", color: accents[i % 4] }}>{count}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold line-clamp-1" style={{ color: dark }}>{city}</h3>
                    <p className="mt-auto pt-2 text-xs" style={{ color: `${dark}50` }}>{"View programs \u2192"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <WaveDivider fill={teal} />

      <section className="relative overflow-hidden px-6 pb-28 pt-12 text-center" style={{ background: teal }}>
        <SparkleDecor className="absolute top-12 left-[10%] h-5 w-5 text-white/20 animate-pulse" />
        <SparkleDecor className="absolute bottom-16 right-[12%] h-4 w-4 animate-pulse" style={{ color: `${gold}40` }} />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl text-balance">Ready to find the perfect care?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">Join thousands of Ohio parents who trust us.</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-lg" style={{ background: gold, color: "#fff" }} asChild>
              <Link href="/daycares"><Search className="mr-2 h-5 w-5" />Start Your Search</Link>
            </Button>
            <Button size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-lg" style={{ background: pink, color: "#fff" }} asChild>
              <Link href="/cities">Browse Cities</Link>
            </Button>
          </div>
        </div>
      </section>

      <div style={{ background: teal }}>
        <WaveDivider fill={cream} />
      </div>

      {/* FAQ Section */}
      <section className="px-6 pb-24 pt-16" style={{ background: cream }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-10">
            <SparkleDecor className="mb-4 h-5 w-5" style={{ color: `${gold}60` }} />
            <h2 className="font-serif text-4xl font-bold" style={{ color: dark }}>Common Questions</h2>
            <p className="mt-3 text-base" style={{ color: `${dark}88` }}>
              Everything you need to know about finding child care in Ohio.
            </p>
          </div>
          <div className="space-y-4">
            {homeFaqs.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-2xl border shadow-sm"
                style={{ background: "#fff", borderColor: `${sage}55` }}
              >
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 marker:hidden [&::-webkit-details-marker]:hidden"
                  style={{ color: dark }}
                >
                  <h3 className="font-serif text-lg font-semibold leading-snug" style={{ color: dark }}>
                    {question}
                  </h3>
                  <span
                    className="flex-shrink-0 text-xl leading-none transition-transform duration-200 group-open:rotate-180"
                    style={{ color: teal }}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </summary>
                <div className="border-t px-6 pb-6 pt-4" style={{ borderColor: `${sage}33` }}>
                  {answer}
                </div>
              </details>
            ))}
          </div>
          <p className="mt-8 text-sm" style={{ color: `${dark}88` }}>
            More questions?{" "}
            <Link href="/faq" className="underline hover:no-underline" style={{ color: teal }}>
              Visit our full FAQ page
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
