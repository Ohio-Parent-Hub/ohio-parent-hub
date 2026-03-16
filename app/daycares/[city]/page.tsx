import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import DraftCityDaycaresPageClient from "@/components/DraftCityDaycaresPageClient";
import { loadVerifiedProgramNumbers, loadPremiumLogos, loadPremiumFilterSummaries } from "@/app/actions/premium";
import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";
import { projectDaycareListRows } from "@/lib/daycareProjection";
import {
  getDaycaresForCitySlug,
  getMetroCitySlugs,
  getMetroDisplayNameBySlug,
  resolveCanonicalCityName,
  resolveCanonicalCitySlugFromName,
  resolveCanonicalCitySlugFromSlug,
} from "@/lib/metroAreas";

type Props = { params: Promise<{ city?: string }> };

type DaycareRow = Record<string, string>;

export const revalidate = 86400;

function prettyCity(city: string) {
  return decodeURIComponent(city || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function canonicalDaycareSlug(daycare: DaycareRow) {
  const programNumber = daycare["PROGRAM NUMBER"] || "";
  const name = daycare["PROGRAM NAME"] || "";
  const citySlug = resolveCanonicalCitySlugFromName(daycare["CITY"] || "");
  return `${programNumber}-${slugify(name)}-${citySlug}`;
}

function daycareDisplayName(daycare: DaycareRow) {
  return toTitleCaseIfAllCaps(daycare["PROGRAM NAME"] || "") || "Licensed Daycare";
}

function buildCitySnippetCopy(cityDisplay: string, count: number) {
  return `Browse all ${count.toLocaleString()} licensed daycares in ${cityDisplay}, Ohio. Compare program type, SUTQ status, and key details to find childcare that fits your family.`;
}

type CitySutqStats = {
  gold: number;
  silver: number;
  bronze: number;
  notRated: number;
  total: number;
};

function buildCitySutqStats(daycares: DaycareRow[]): CitySutqStats {
  let gold = 0;
  let silver = 0;
  let bronze = 0;
  let notRated = 0;
  for (const d of daycares) {
    const r = (d["SUTQ RATING"] || "").trim();
    if (r === "3") gold++;
    else if (r === "2") silver++;
    else if (r === "1") bronze++;
    else notRated++;
  }
  return { gold, silver, bronze, notRated, total: daycares.length };
}

const teal = "#7EA8A4";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const gold = "#DCB346";

type CityFaqEntry = { question: string; schemaAnswer: string; answer: ReactNode };

function buildCityFaqs(cityDisplay: string, countySlug: string): CityFaqEntry[] {
  return [
    {
      question: `Does a "Not Rated" SUTQ status mean a daycare in ${cityDisplay} is low quality?`,
      schemaAnswer:
        `No. "Not Rated" means the provider has not enrolled in Ohio's voluntary Step Up To Quality program — it does not indicate a safety concern or licensing problem. Every provider listed in ${cityDisplay} on Ohio Parent Hub complies with Ohio's mandatory baseline licensing requirements regardless of SUTQ status. Many excellent providers choose not to participate due to the administrative demands of the program.`,
      answer: (
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
          <p>
            <strong style={{ color: dark }}>No.</strong> &ldquo;Not Rated&rdquo; means the provider has not enrolled in Ohio&apos;s voluntary Step Up To Quality (SUTQ) program — it does not indicate a safety concern, a licensing problem, or substandard care.
          </p>
          <p>
            Every provider listed in {cityDisplay} already complies with Ohio&apos;s mandatory baseline licensing requirements: background checks for all staff, health and safety inspections, required staff-to-child ratios, and annual continuing education.
          </p>
          <p>
            When evaluating a &ldquo;Not Rated&rdquo; provider, review their inspection history on{" "}
            <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: teal }}>Ohio&apos;s Child Care Search</a>,
            {" "}visit in person, and ask about staff qualifications and curriculum.
          </p>
          <p className="text-xs" style={{ color: `${dark}66` }}>
            Source:{" "}
            <a href="https://codes.ohio.gov/assets/laws/administrative-code/authenticated/5101/2/17/5101$2-17-01_20240707.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Administrative Code 5101:2-17-01 (PDF)</a>
          </p>
        </div>
      ),
    },
    {
      question: `How do I find infant care in ${cityDisplay}, Ohio?`,
      schemaAnswer:
        `Infant care is the hardest age group to place in Ohio. In ${cityDisplay}, start your search several months early. Contact providers directly to ask about infant room openings for children under 12 months. Ask about the infant-to-caregiver ratio (Ohio licensing requires a maximum of 1:5 for centers), safe sleep practices, and whether infants are fed and napped on demand. Getting on waitlists early is often the only reliable strategy.`,
      answer: (
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
          <p>
            Infant care (children under 12 months) is the hardest age group to place — demand consistently outpaces supply. In {cityDisplay}, starting your search <strong style={{ color: dark }}>several months early</strong> is strongly recommended.
          </p>
          <p>When you contact a provider, ask specifically:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Do you have openings in the infant room for a child under 12 months?</li>
            <li>What is your infant-to-caregiver ratio? (Ohio licensing requires a maximum of 1:5 for licensed centers)</li>
            <li>How do you ensure safe sleep? (Babies on their backs, firm surface, no loose bedding)</li>
            <li>Are feeding and nap schedules based on each baby&apos;s individual needs? (On-demand is best practice)</li>
            <li>Is there a waitlist? How far in advance should I apply?</li>
          </ul>
          <p className="text-xs" style={{ color: `${dark}66` }}>
            Source:{" "}
            <a href="https://codes.ohio.gov/ohio-revised-code/section-5104.033" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Revised Code 5104.033</a>{" "}|{" "}
            <a href="https://info.childcareaware.org/hubfs/2023-24%20Consumer%20Ed/Short%20Notice%20Checklist_English.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Child Care Aware of America — Short Notice Checklist</a>
          </p>
        </div>
      ),
    },
    {
      question: `What should I ask when I visit or call a daycare in ${cityDisplay}?`,
      schemaAnswer:
        `Start with the basics: availability, rates, hours, and whether they accept Ohio PFCC subsidy. Then ask about licensing status and recent inspections, background checks for all staff, CPR and First Aid certification, how providers interact with children, discipline approach, what a typical day looks like, and illness exclusion policies. Trust your instincts during any in-person visit.`,
      answer: (
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
          <p>Before committing to a provider in {cityDisplay}, cover these questions by phone or in person:</p>
          <div className="space-y-3">
            <div>
              <p className="font-semibold" style={{ color: dark }}>Logistics first</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Do you have space for my child starting on [date]?</li>
                <li>What are your rates and fees? Do you accept Ohio&apos;s PFCC subsidy?</li>
                <li>What are your hours, holiday closures, and inclement weather policies?</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold" style={{ color: dark }}>Licensing and safety</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Is your license current? When was your most recent inspection — were any concerns found?</li>
                <li>Do all adults complete background checks before spending time with children?</li>
                <li>Are providers certified in CPR and First Aid?</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold" style={{ color: dark }}>Quality and daily life</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>What would a typical day look like for my child?</li>
                <li>How do you handle guidance and discipline at my child&apos;s age?</li>
                <li>What is your screen time policy?</li>
              </ul>
            </div>
          </div>
          <p className="text-xs">
            <Link href="/faq#what-should-i-ask" className="underline hover:no-underline" style={{ color: teal }}>
              See the full checklist on our FAQ page →
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: `What if I can\'t find openings in ${cityDisplay}?`,
      schemaAnswer:
        `Expand your search to nearby cities or browse all providers in the surrounding county. Contact providers directly by phone to ask about current availability and waitlists — getting on a waitlist early is often the best strategy. Also ask whether providers accept Ohio's PFCC subsidy, which can significantly expand your affordable options.`,
      answer: (
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
          <p>Ohio Parent Hub does not collect real-time seat availability — openings must be confirmed directly with each provider. If you&apos;re not finding what you need in {cityDisplay}:</p>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>
              <strong style={{ color: dark }}>Browse the county</strong> — View all providers in{" "}
              <Link href={`/daycares/county/${countySlug}`} className="underline hover:no-underline" style={{ color: teal }}>the surrounding county</Link>{" "}
              to find programs in nearby communities
            </li>
            <li><strong style={{ color: dark }}>Call, don&apos;t email</strong> — A direct call is faster and signals genuine interest to providers with informal waitlists</li>
            <li><strong style={{ color: dark }}>Ask about waitlists</strong> — Many high-quality centers maintain them; getting on one early is often the best long-term strategy, especially for infants</li>
            <li><strong style={{ color: dark }}>Ask about PFCC</strong> — Providers accepting Ohio&apos;s subsidy are marked on listings and can broaden your affordable options significantly</li>
          </ol>
        </div>
      ),
    },
  ];
}

function buildCityEditorialCopy(cityDisplay: string, count: number) {
  return {
    intro:
      `Choosing childcare in ${cityDisplay} can feel overwhelming, especially when every family's needs are different. ` +
      `This page includes all ${count.toLocaleString()} licensed daycares in ${cityDisplay}, Ohio, so you can compare program type, SUTQ status, and core listing details in one place.`,
    sutq:
      "Step Up To Quality (SUTQ) is Ohio's quality rating system for licensed early care and education programs. " +
      "Ratings shown are Gold, Silver, Bronze, or Not Rated. In general, higher tiers indicate programs meeting additional quality standards beyond baseline licensing.",
    choosingCare:
      `Use SUTQ as a starting filter, then confirm day-to-day fit directly with each program in ${cityDisplay}. ` +
      "Compare program type, call to confirm openings and waitlist timing, ask about teacher consistency and daily communication, and schedule a tour before deciding.",
    transparency:
      "Ohio Parent Hub does not currently include parent reviews. We focus on licensing details, SUTQ status, program type, and core program information to support your research.",
    notRated:
      "Not Rated does not automatically mean low quality—it means no SUTQ tier is currently shown. Use tours, licensing details, and direct questions to evaluate fit.",
  };
}

export async function generateStaticParams() {
  const allDaycares = loadDaycares();
  const citySlugs = Array.from(
    new Set(
      allDaycares
        .map((d) => resolveCanonicalCitySlugFromName(d["CITY"] || ""))
        .filter(Boolean)
    )
  );

  citySlugs.push(...getMetroCitySlugs(allDaycares));

  return Array.from(new Set(citySlugs)).map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityParam = city ?? "";
  const requestedCitySlug = slugify(cityParam);
  const citySlug = resolveCanonicalCitySlugFromSlug(requestedCitySlug);
  
  const all = loadDaycares();
  const matches = getDaycaresForCitySlug(all, citySlug);
  const cityDisplay =
    getMetroDisplayNameBySlug(citySlug)
    || toTitleCaseIfAllCaps(resolveCanonicalCityName(matches[0]?.["CITY"] || cityParam))
    || prettyCity(cityParam);
  
  const count = matches.length;

  if (!citySlug || count === 0) {
    return {
      title: "City Not Found",
      description: "The requested city page was not found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const citySnippetCopy = buildCitySnippetCopy(cityDisplay, count);
  const pageTitle = `${count} Daycares in ${cityDisplay}, OH | Compare`;
  
  return {
    title: pageTitle,
    description: citySnippetCopy,
    keywords: [
      `best daycares in ${cityDisplay}`,
      `${cityDisplay} daycare`,
      `${cityDisplay} childcare`,
      `licensed daycare ${cityDisplay} ohio`,
      `top rated daycare ${cityDisplay}`,
    ],
    alternates: {
      canonical: `/daycares/${citySlug}`,
    },
    openGraph: {
      title: pageTitle,
      description: citySnippetCopy,
      url: `https://ohioparenthub.com/daycares/${citySlug}`,
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: `Best Daycares in ${cityDisplay}, Ohio | Ohio Parent Hub`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: citySnippetCopy,
      images: ["/og-default.png"],
    },
  };
}

export default async function CityDaycaresPage({ params }: Props) {
  const { city } = await params;
  const cityParam = city ?? "";
  const requestedCitySlug = slugify(cityParam);
  const citySlug = resolveCanonicalCitySlugFromSlug(requestedCitySlug);

  if (requestedCitySlug && citySlug && requestedCitySlug !== citySlug) {
    permanentRedirect(`/daycares/${citySlug}`);
  }

  const all = loadDaycares();
  const matches = getDaycaresForCitySlug(all, citySlug);
  const cityDisplay =
    getMetroDisplayNameBySlug(citySlug)
    || toTitleCaseIfAllCaps(resolveCanonicalCityName(matches[0]?.["CITY"] || cityParam))
    || prettyCity(cityParam);

  if (!citySlug || matches.length === 0) {
    notFound();
  }

  const citySnippetCopy = buildCitySnippetCopy(cityDisplay, matches.length);
  const cityEditorialCopy = buildCityEditorialCopy(cityDisplay, matches.length);
  const sutqStats = buildCitySutqStats(matches);
  const primaryCountySlug = slugify((matches[0]?.["COUNTY"] || "").trim());
  const cityFaqs = buildCityFaqs(cityDisplay, primaryCountySlug);
  const countyLinks = Array.from(
    new Map(
      matches
        .map((daycare) => (daycare["COUNTY"] || "").trim())
        .filter(Boolean)
        .map((countyName) => {
          const countyLabel = `${toTitleCaseIfAllCaps(countyName)} County`;
          return [slugify(countyName), { label: countyLabel, href: `/daycares/county/${slugify(countyName)}` }];
        }),
    ).values(),
  ).slice(0, 5);

  const alphabeticalMatches = [...matches].sort((a, b) => {
    const aName = daycareDisplayName(a);
    const bName = daycareDisplayName(b);
    return aName.localeCompare(bName, undefined, { sensitivity: "base" });
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Licensed Daycares in ${cityDisplay}, Ohio`,
    numberOfItems: Math.min(10, alphabeticalMatches.length),
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: alphabeticalMatches.slice(0, 10).map((daycare, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: daycareDisplayName(daycare),
      url: `https://ohioparenthub.com/daycare/${canonicalDaycareSlug(daycare)}`,
    })),
  };
  const itemListJson = JSON.stringify(itemListSchema).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: itemListJson }}
      />
      <DraftCityDaycaresPageClient
        cityDisplay={cityDisplay}
        citySlug={citySlug}
        cityCount={matches.length}
        citySnippetCopy={citySnippetCopy}
        cityIntroCopy={cityEditorialCopy.intro}
        citySutqCopy={cityEditorialCopy.sutq}
        cityChoosingCareCopy={cityEditorialCopy.choosingCare}
        cityTransparencyCopy={cityEditorialCopy.transparency}
        cityNotRatedCopy={cityEditorialCopy.notRated}
        sutqStats={sutqStats}
        countyLinks={countyLinks}
        initialDaycares={projectDaycareListRows(matches.slice(0, 15))}
        verifiedProgramNumbers={[...(await loadVerifiedProgramNumbers())]}
        premiumLogos={await loadPremiumLogos()}
        premiumSummaries={await loadPremiumFilterSummaries()}
        basePath=""
        homeHref="/"
        citiesHref="/cities"
      />

      {/* FAQ Section — SSR, city-specific */}
      <section className="px-6 pb-24 pt-16" style={{ background: cream }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="mb-4 h-5 w-5" style={{ color: `${gold}60` }} aria-hidden="true">
              <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
            </svg>
            <h2 className="font-serif text-4xl font-bold" style={{ color: dark }}>
              Common Questions About {cityDisplay} Child Care
            </h2>
            <p className="mt-3 text-base" style={{ color: `${dark}88` }}>
              Helpful answers for families searching for daycares in {cityDisplay}, Ohio.
            </p>
          </div>
          <div className="space-y-4">
            {cityFaqs.map(({ question, answer }) => (
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
    </>
  );
}
