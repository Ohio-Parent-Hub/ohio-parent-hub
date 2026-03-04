import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CountyDaycaresPageClient from "@/components/CountyDaycaresPageClient";
import { slugify } from "@/lib/utils";
import { projectDaycareListRows } from "@/lib/daycareProjection";

type Props = { params: Promise<{ county?: string }> };

type DaycareRow = Record<string, string>;

export const revalidate = 86400;

function prettyCounty(county: string) {
  return decodeURIComponent(county || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

const teal = "#7EA8A4";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const gold = "#DCB346";

type CountyFaqEntry = { question: string; schemaAnswer: string; answer: ReactNode };

function buildCountyFaqs(countyDisplay: string): CountyFaqEntry[] {
  return [
    {
      question: `Does "Not Rated" SUTQ mean a daycare in ${countyDisplay} County is low quality?`,
      schemaAnswer: `No. A Not Rated SUTQ status means the provider has not enrolled in Ohio's voluntary Step Up To Quality program — it does not indicate a safety concern or licensing problem. Every provider listed in ${countyDisplay} County must comply with Ohio's mandatory baseline licensing requirements regardless of SUTQ status. Many excellent providers choose not to participate due to administrative demands. Review their inspection history on Ohio's Child Care Search, visit in person, and ask about staff qualifications.`,
      answer: (
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
          <p>
            <strong style={{ color: dark }}>No.</strong> &ldquo;Not Rated&rdquo; means the provider has not enrolled in Ohio&apos;s voluntary Step Up To Quality (SUTQ) program &mdash; it does not indicate a safety concern, a licensing problem, or substandard care.
          </p>
          <p>
            Every provider in {countyDisplay} County on this page already complies with Ohio&apos;s mandatory baseline licensing requirements: background checks for all staff, health and safety inspections, required staff-to-child ratios, and annual continuing education. SUTQ is an optional, additional layer of quality recognition.
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
      question: `How do I find infant care in ${countyDisplay} County?`,
      schemaAnswer: `Infant care is the hardest age group to place in Ohio. Start your search several months early. Contact providers in ${countyDisplay} County directly to ask about infant room openings for children under 12 months, the infant-to-caregiver ratio (Ohio requires a maximum of 1:5 for licensed centers), safe sleep practices, and whether infants are fed and napped on demand. Getting on waitlists early is often the only reliable strategy.`,
      answer: (
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
          <p>
            Infant care (children under 12 months) is the hardest age group to place &mdash; demand consistently outpaces supply across Ohio, including {countyDisplay} County. Starting your search <strong style={{ color: dark }}>several months early</strong> is strongly recommended.
          </p>
          <p>When you contact a provider, ask specifically:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Do you have openings in the infant room for a child under 12 months?</li>
            <li>What is your infant-to-caregiver ratio? (Ohio licensing requires a maximum of 1:5 for licensed centers)</li>
            <li>How do you ensure safe sleep? (Backs on a firm surface &mdash; crib or pack-and-play &mdash; no loose bedding)</li>
            <li>Are feeding and nap schedules based on each baby&apos;s individual needs? (On-demand is best practice)</li>
            <li>Is there a waitlist? How far in advance should I apply?</li>
          </ul>
          <p className="text-xs" style={{ color: `${dark}66` }}>
            Source:{" "}
            <a href="https://codes.ohio.gov/ohio-revised-code/section-5104.033" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Revised Code 5104.033</a>{" "}|{" "}
            <a href="https://info.childcareaware.org/hubfs/2023-24%20Consumer%20Ed/Short%20Notice%20Checklist_English.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Child Care Aware of America &mdash; Short Notice Checklist</a>
          </p>
        </div>
      ),
    },
    {
      question: "What should I ask when I visit or call a daycare?",
      schemaAnswer:
        "Start with the basics: availability, rates, hours, and whether they accept Ohio PFCC subsidy. Then ask about licensing status and recent inspections, background checks for all staff, CPR and First Aid certification, how they handle discipline, what a typical day looks like, and screen time policies. Trust your instincts during any in-person visit.",
      answer: (
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
          <p>Before you commit, here are the most important questions to cover &mdash; by phone or in person:</p>
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
                <li>Is your license current? When was your most recent inspection &mdash; were any concerns found?</li>
                <li>Do all adults complete background checks before spending time with children?</li>
                <li>Are providers certified in infant/child CPR and First Aid?</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold" style={{ color: dark }}>Quality and daily life</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>What would a typical day look like for my child?</li>
                <li>How do providers interact with children throughout the day?</li>
                <li>How do you handle guidance and discipline at my child&apos;s age?</li>
              </ul>
            </div>
          </div>
          <p>
            For the full checklist including age-specific questions for infants, toddlers, preschoolers, and school-agers, see our{" "}
            <Link href="/faq" className="underline hover:no-underline" style={{ color: teal }}>FAQ page</Link>.
          </p>
          <p className="text-xs" style={{ color: `${dark}66` }}>
            Source:{" "}
            <a href="https://info.childcareaware.org/hubfs/2023-24%20Consumer%20Ed/Short%20Notice%20Checklist_English.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Child Care Aware of America &mdash; Short Notice Checklist</a>
          </p>
        </div>
      ),
    },
    {
      question: `What if I can't find openings in ${countyDisplay} County?`,
      schemaAnswer: `If you can't find openings in ${countyDisplay} County, try expanding your search to nearby cities or adjacent counties. Contact providers directly by phone to ask about availability and waitlists — getting on a waitlist early is often the best strategy, especially for infant care. Also ask whether providers accept Ohio's PFCC subsidy, which can expand your affordable options.`,
      answer: (
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
          <p>Ohio Parent Hub does not collect real-time seat availability &mdash; openings must be confirmed directly with each provider. If you&apos;re not finding what you need in {countyDisplay} County:</p>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>
              <strong style={{ color: dark }}>Browse nearby cities</strong> &mdash; Use our{" "}
              <Link href="/cities" className="underline hover:no-underline" style={{ color: teal }}>cities directory</Link>{" "}
              to find providers in adjacent communities
            </li>
            <li><strong style={{ color: dark }}>Call, don&apos;t email</strong> &mdash; A direct call is faster and signals genuine interest to providers with informal waitlists</li>
            <li><strong style={{ color: dark }}>Ask about waitlists</strong> &mdash; Many high-quality centers maintain them; getting on one early is often the best long-term strategy</li>
            <li>
              <strong style={{ color: dark }}>Check adjacent counties</strong> &mdash; Browse our{" "}
              <Link href="/counties" className="underline hover:no-underline" style={{ color: teal }}>county directory</Link>{" "}
              for providers just across county lines
            </li>
          </ol>
          <p>
            For the most current availability, also check{" "}
            <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: teal }}>Ohio&apos;s Child Care Search</a>
            {" "}which sometimes includes real-time enrollment status.
          </p>
        </div>
      ),
    },
  ];
}

function buildCountySnippetCopy(countyDisplay: string, count: number) {
  return `Browse all ${count.toLocaleString()} licensed daycares in ${countyDisplay} County, Ohio. Compare program type, SUTQ status, and key details to find childcare that fits your family.`;
}

type CountySutqStats = {
  gold: number;
  silver: number;
  bronze: number;
  notRated: number;
  total: number;
};

function buildCountySutqStats(daycares: DaycareRow[]): CountySutqStats {
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

function buildCountyEditorialCopy(countyDisplay: string, count: number) {
  return {
    intro:
      `Choosing childcare in ${countyDisplay} County can feel overwhelming, especially when every family's needs are different. ` +
      `This page includes all ${count.toLocaleString()} licensed daycares in ${countyDisplay} County, Ohio, so you can compare program type, SUTQ status, and core listing details in one place.`,
    sutq:
      "Step Up To Quality (SUTQ) is Ohio's quality rating system for licensed early care and education programs. " +
      "Ratings shown are Gold, Silver, Bronze, or Not Rated. In general, higher tiers indicate programs meeting additional quality standards beyond baseline licensing.",
    choosingCare:
      `Use SUTQ as a starting filter, then confirm day-to-day fit directly with each program in ${countyDisplay} County. ` +
      "Compare program type, call to confirm openings and waitlist timing, ask about teacher consistency and daily communication, and schedule a tour before deciding.",
    transparency:
      "Ohio Parent Hub does not currently include parent reviews. We focus on licensing details, SUTQ status, program type, and core program information to support your research.",
    notRated:
      "Not Rated does not automatically mean low quality—it means no SUTQ tier is currently shown. Use tours, licensing details, and direct questions to evaluate fit.",
  };
}

export async function generateStaticParams() {
  const countySlugs = Array.from(
    new Set(
      loadDaycares()
        .map((d) => slugify(d["COUNTY"] || ""))
        .filter(Boolean)
    )
  );

  return countySlugs.map((county) => ({ county }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { county } = await params;
  const countyParam = county ?? "";
  const countySlug = slugify(countyParam);
  const countyDisplay = prettyCounty(countyParam);

  const all = loadDaycares();
  const matches = all.filter((d) => {
    const dataCountySlug = slugify(d["COUNTY"] || "");
    return dataCountySlug === countySlug;
  });

  const count = matches.length;

  if (!countySlug || count === 0) {
    return {
      title: "County Not Found",
      description: "The requested county page was not found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const countySnippetCopy = buildCountySnippetCopy(countyDisplay, count);

  return {
    title: `Best Daycares in ${countyDisplay} County, Ohio`,
    description: countySnippetCopy,
    keywords: [
      `best daycares in ${countyDisplay} county`,
      `${countyDisplay} county daycare`,
      `${countyDisplay} county childcare`,
      `licensed daycare ${countyDisplay} county ohio`,
      `top rated daycare ${countyDisplay} county`,
    ],
    alternates: {
      canonical: `/daycares/county/${countySlug}`,
    },
    openGraph: {
      title: `Best Daycares in ${countyDisplay} County, Ohio`,
      description: countySnippetCopy,
      url: `https://ohioparenthub.com/daycares/county/${countySlug}`,
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: `Best Daycares in ${countyDisplay} County, Ohio | Ohio Parent Hub`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Best Daycares in ${countyDisplay} County, Ohio`,
      description: countySnippetCopy,
      images: ["/og-default.png"],
    },
  };
}

export default async function CountyDaycaresPage({ params }: Props) {
  const { county } = await params;
  const countyParam = county ?? "";
  const countySlug = slugify(countyParam);
  const countyDisplay = prettyCounty(countyParam);

  const all = loadDaycares();

  const matches = all.filter((d) => {
    const dataCountySlug = slugify(d["COUNTY"] || "");
    return dataCountySlug === countySlug;
  });

  if (!countySlug || matches.length === 0) {
    notFound();
  }

  const countySnippetCopy = buildCountySnippetCopy(countyDisplay, matches.length);
  const countyEditorialCopy = buildCountyEditorialCopy(countyDisplay, matches.length);
  const sutqStats = buildCountySutqStats(matches);
  const countyFaqs = buildCountyFaqs(countyDisplay);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: countyFaqs.map(({ question, schemaAnswer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: schemaAnswer },
    })),
  };

  return (
    <>
      <CountyDaycaresPageClient
        countyDisplay={countyDisplay}
        countySlug={countySlug}
        countyCount={matches.length}
        countySnippetCopy={countySnippetCopy}
        countyIntroCopy={countyEditorialCopy.intro}
        countySutqCopy={countyEditorialCopy.sutq}
        countyChoosingCareCopy={countyEditorialCopy.choosingCare}
        countyTransparencyCopy={countyEditorialCopy.transparency}
        countyNotRatedCopy={countyEditorialCopy.notRated}
        sutqStats={sutqStats}
        initialDaycares={projectDaycareListRows(matches.slice(0, 15))}
        basePath=""
        homeHref="/"
        countiesHref="/counties"
      />

      {/* FAQ Section — SSR, county-specific */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />
      <section className="px-6 pb-24 pt-16" style={{ background: cream }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="mb-4 h-5 w-5" style={{ color: `${gold}60` }} aria-hidden="true">
              <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
            </svg>
            <h2 className="font-serif text-4xl font-bold" style={{ color: dark }}>
              Common Questions About {countyDisplay} County Child Care
            </h2>
            <p className="mt-3 text-base" style={{ color: `${dark}88` }}>
              Helpful answers for families searching for daycares in {countyDisplay} County, Ohio.
            </p>
          </div>
          <div className="space-y-4">
            {countyFaqs.map(({ question, answer }) => (
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
