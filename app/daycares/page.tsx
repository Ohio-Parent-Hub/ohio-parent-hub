import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import DraftDaycaresPageClient from "@/components/DraftDaycaresPageClient";
import { loadVerifiedProgramNumbers, loadPremiumLogos, loadPremiumFilterSummaries } from "@/app/actions/premium";
import fs from "node:fs";
import path from "node:path";
import { resolveCanonicalCityName } from "@/lib/metroAreas";
import { isTestDaycare } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Best Daycares in Ohio | Search Licensed Child Care Near You",
  description: "Search and filter over 8,000 licensed daycare and childcare programs in Ohio. Compare providers by city, county, SUTQ rating, and program type.",
  keywords: [
    "best daycares in ohio",
    "licensed daycare ohio",
    "childcare near me",
    "ohio childcare search",
    "top rated daycare ohio",
  ],
  alternates: {
    canonical: "/daycares",
  },
  openGraph: {
    title: "Best Daycares in Ohio | Search Licensed Child Care",
    description: "Search and compare licensed childcare providers across Ohio with city and quality filters.",
    url: "https://ohioparenthub.com/daycares",
  },
};

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function getInitialDaycares(daycares: DaycareRow[]) {
  return [...daycares]
    .sort((a, b) => {
      const ratingA = Number.parseInt(a["SUTQ RATING"] || "0", 10) || 0;
      const ratingB = Number.parseInt(b["SUTQ RATING"] || "0", 10) || 0;
      if (ratingA !== ratingB) return ratingB - ratingA;

      const nameA = a["PROGRAM NAME"] || "";
      const nameB = b["PROGRAM NAME"] || "";
      return nameA.localeCompare(nameB);
    })
    .slice(0, 30);
}

const teal = "#7EA8A4";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const gold = "#DCB346";

type DaycaresFaqEntry = { question: string; schemaAnswer: string; answer: ReactNode };

const daycaresFaqs: DaycaresFaqEntry[] = [
  {
    question: 'Does a "Not Rated" SUTQ status mean a daycare is low quality?',
    schemaAnswer:
      "No. A Not Rated SUTQ status means the provider has not enrolled in Ohio's voluntary Step Up To Quality program — it does not indicate a safety concern or licensing problem. Every provider listed on Ohio Parent Hub must comply with Ohio's mandatory baseline licensing requirements regardless of SUTQ status. Many excellent providers choose not to participate due to administrative demands. Review their inspection history on Ohio's Child Care Search, visit in person, and ask about staff qualifications.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>
          <strong style={{ color: dark }}>No.</strong> &ldquo;Not Rated&rdquo; means the provider has not enrolled in Ohio&apos;s voluntary Step Up To Quality (SUTQ) program — it does not indicate a safety concern, a licensing problem, or substandard care.
        </p>
        <p>
          Every provider on this page already complies with Ohio&apos;s mandatory baseline licensing requirements: background checks for all staff, health and safety inspections, required staff-to-child ratios, and annual continuing education. SUTQ is an optional, additional layer of quality recognition.
        </p>
        <p>
          When evaluating a &ldquo;Not Rated&rdquo; provider, review their inspection history on{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: teal }}>Ohio&apos;s Child Care Search</a>,
          {" "}visit in person, and ask about staff qualifications and curriculum.
        </p>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://codes.ohio.gov/assets/laws/administrative-code/authenticated/5101/2/17/5101$2-17-01_20240707.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Administrative Code 5101:2-17-01 (PDF)</a>
          {" "}— SUTQ is explicitly a voluntary program
        </p>
      </div>
    ),
  },
  {
    question: "What should I ask when I visit or call a daycare?",
    schemaAnswer:
      "Start with the basics: availability, rates, hours, and whether they accept Ohio PFCC subsidy. Then ask about licensing status and recent inspections, background checks for all staff, CPR and First Aid certification, staff experience, how they handle discipline, what a typical day looks like, screen time policies, and illness exclusion policies. For infants, also ask about safe sleep practices. Trust your instincts during any in-person visit.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>Before you commit, here are the most important questions to cover — whether by phone or in person:</p>
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
              <li>Are providers certified in infant/child CPR and First Aid?</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold" style={{ color: dark }}>Quality and daily life</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>What would a typical day look like for my child?</li>
              <li>How do providers interact with children throughout the day?</li>
              <li>How do you handle guidance and discipline at my child&apos;s age?</li>
              <li>What is your screen time policy?</li>
            </ul>
          </div>
        </div>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://info.childcareaware.org/hubfs/2023-24%20Consumer%20Ed/Short%20Notice%20Checklist_English.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Child Care Aware of America — Choosing Quality Child Care on Short Notice</a>
        </p>
      </div>
    ),
  },
  {
    question: "I can't find openings near me. What should I do?",
    schemaAnswer:
      "Use the city and county browse pages on Ohio Parent Hub to expand your search radius to nearby communities. Contact providers directly by phone to ask about current availability and waitlists. Getting on a waitlist early is often the best strategy, especially for infant care. Also ask whether providers accept Ohio's PFCC subsidy, which can significantly expand your affordable options.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>Ohio Parent Hub does not collect real-time seat availability — openings must be confirmed directly with each provider. If you&apos;re not finding what you need, here are the most effective next steps:</p>
        <ol className="list-decimal list-inside space-y-1 pl-1">
          <li>
            <strong style={{ color: dark }}>Expand your radius</strong> — Browse{" "}
            <Link href="/cities" className="underline hover:no-underline" style={{ color: teal }}>nearby cities</Link>{" "}
            or{" "}
            <Link href="/counties" className="underline hover:no-underline" style={{ color: teal }}>your county</Link>{" "}
            for providers you might not have considered
          </li>
          <li><strong style={{ color: dark }}>Call, don&apos;t email</strong> — A direct call is faster and signals genuine interest to providers with informal waitlists</li>
          <li><strong style={{ color: dark }}>Ask about waitlists</strong> — Many high-quality centers maintain them; getting on one early is often the best long-term strategy, especially for infants</li>
          <li><strong style={{ color: dark }}>Ask about PFCC</strong> — Providers accepting Ohio&apos;s Publicly Funded Child Care subsidy are marked on listings; this can broaden your affordable options significantly</li>
        </ol>
        <p>
          For the most current availability, also check{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: teal }}>Ohio&apos;s Child Care Search</a>{" "}
          which sometimes includes real-time enrollment status.
        </p>
      </div>
    ),
  },
  {
    question: "How do I find infant care specifically?",
    schemaAnswer:
      "Infant care is the hardest age group to place in Ohio. Start your search several months early, ideally before your child is born. Contact providers directly to ask about infant room openings for children under 12 months. Ask about the infant-to-caregiver ratio (Ohio licensing requires a maximum of 1:5 for centers), safe sleep practices, and whether infants are fed and napped on demand. Getting on waitlists early is often the only reliable strategy.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>
          Infant care (children under 12 months) is the hardest age group to place in Ohio — demand consistently outpaces supply, especially in urban areas. Starting your search <strong style={{ color: dark }}>several months early</strong> is strongly recommended.
        </p>
        <p>When you contact a provider, ask specifically:</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Do you have openings in the infant room for a child under 12 months?</li>
          <li>What is your infant-to-caregiver ratio? (Ohio licensing requires a maximum of 1:5 for licensed centers)</li>
          <li>How do you ensure safe sleep? (Babies should be placed on their backs on a firm surface — crib or pack-and-play — with no loose bedding)</li>
          <li>Are feeding and nap schedules based on each baby&apos;s individual needs, or a fixed schedule? (On-demand is best practice)</li>
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
    question: "How often is Ohio daycare licensing data updated on this site?",
    schemaAnswer:
      "Ohio's Department of Children and Youth maintains its licensing database on a rolling basis, updating records as licensing actions occur. Ohio Parent Hub periodically refreshes its data from that state database. Because licensing status can change between update cycles, always verify a provider's current status directly through Ohio's Child Care Search before making any enrollment decision.",
    answer: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
        <p>
          Ohio&apos;s Department of Children and Youth maintains its licensing database on a rolling basis — updating records as licensing actions occur, including new licenses, renewals, inspections, violations, and closures.
        </p>
        <p>
          Ohio Parent Hub periodically refreshes its data from that state database. Because licensing status can change between our update cycles, always verify a provider&apos;s current status directly through{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline" style={{ color: teal }}>Ohio&apos;s Child Care Search</a>{" "}
          before making any enrollment decision. That tool reflects the most current state records and includes recent inspection results.
        </p>
        <p className="text-xs" style={{ color: `${dark}66` }}>
          Source:{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Ohio Department of Children and Youth — Child Care Search</a>
        </p>
      </div>
    ),
  },
];

function buildStatewideSnippetCopy(count: number) {
  return `Browse all ${count.toLocaleString()} licensed daycares in Ohio. Compare program type, SUTQ status, and key details to find childcare that fits your family.`;
}

function buildStatewideEditorialCopy(count: number) {
  return {
    intro:
      `Choosing childcare in Ohio can feel overwhelming, especially when every family's needs are different. ` +
      `This page includes all ${count.toLocaleString()} licensed daycares in Ohio, so you can compare program type, SUTQ status, and core listing details in one place.`,
    sutq:
      "Step Up To Quality (SUTQ) is Ohio's quality rating system for licensed early care and education programs. " +
      "Ratings shown are Gold, Silver, Bronze, or Not Rated. In general, higher tiers indicate programs meeting additional quality standards beyond baseline licensing.",
    choosingCare:
      "Use SUTQ as a starting filter, then confirm day-to-day fit directly with each program. " +
      "Compare program type, call to confirm openings and waitlist timing, ask about teacher consistency and daily communication, and schedule a tour before deciding.",
    transparency:
      "Ohio Parent Hub does not currently include parent reviews. We focus on licensing details, SUTQ status, program type, and core program information to support your research.",
    notRated:
      "Not Rated does not automatically mean low quality—it means no SUTQ tier is currently shown. Use tours, licensing details, and direct questions to evaluate fit.",
  };
}

export default async function GlobalSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lng?: string; q?: string }>;
}) {
  const params = await searchParams;
  const daycares = loadDaycares().filter(d => !isTestDaycare(d));
  const cityCount = new Set(daycares.map((d) => resolveCanonicalCityName(d.CITY || "")).filter(Boolean)).size;
  const initialDaycares = getInitialDaycares(daycares);
  const statewideSnippetCopy = buildStatewideSnippetCopy(daycares.length);
  const statewideEditorialCopy = buildStatewideEditorialCopy(daycares.length);

  const initialLocation =
    params.lat && params.lng
      ? { lat: parseFloat(params.lat), lng: parseFloat(params.lng), q: params.q ?? "" }
      : null;

  return (
    <>
      <DraftDaycaresPageClient
        daycareCount={daycares.length}
        cityCount={cityCount}
        statewideSnippetCopy={statewideSnippetCopy}
        statewideIntroCopy={statewideEditorialCopy.intro}
        statewideSutqCopy={statewideEditorialCopy.sutq}
        statewideChoosingCareCopy={statewideEditorialCopy.choosingCare}
        statewideTransparencyCopy={statewideEditorialCopy.transparency}
        statewideNotRatedCopy={statewideEditorialCopy.notRated}
        initialDaycares={initialDaycares}
        verifiedProgramNumbers={[...(await loadVerifiedProgramNumbers())]}
        premiumLogos={await loadPremiumLogos()}
        premiumSummaries={await loadPremiumFilterSummaries()}
        initialLocation={initialLocation}
        basePath=""
        homeHref="/"
        searchHref="/daycares"
      />

      {/* FAQ Section — SSR, no JS required */}
      <section className="px-6 pb-24 pt-16" style={{ background: cream }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="mb-4 h-5 w-5" style={{ color: `${gold}60` }} aria-hidden="true">
              <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
            </svg>
            <h2 className="font-serif text-4xl font-bold" style={{ color: dark }}>Common Questions</h2>
            <p className="mt-3 text-base" style={{ color: `${dark}88` }}>
              Helpful answers for families searching for Ohio child care.
            </p>
          </div>
          <div className="space-y-4">
            {daycaresFaqs.map(({ question, answer }) => (
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
