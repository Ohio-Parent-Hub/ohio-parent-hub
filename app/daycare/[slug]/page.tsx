import DaycareDetailPageShell from "@/components/DaycareDetailPageShell";
import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";
import { getMetroForDaycare, resolveCanonicalCityName, resolveCanonicalCitySlugFromName } from "@/lib/metroAreas";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { notFound, permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

type DaycareRow = Record<string, string>;
type RelatedDaycareCard = {
  href: string;
  name: string;
  city: string;
  street: string;
  programType: string;
  sutq: string;
  pfcc: boolean;
  distanceMiles: number;
};

// ─── Detail Page FAQ ──────────────────────────────────────────────────────────
const teal = "#7EA8A4";
const dark = "#4A6B67";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const gold = "#DCB346";

type DetailFaqEntry = {
  question: string;
  answer: ReactNode;
  schemaAnswer: string;
};

function buildDetailFaqs(
  name: string,
  sutq: string,
  city: string,
  citySlug: string,
  isPfcc: boolean,
  initialLicense: string,
  licenseExpires: string,
): DetailFaqEntry[] {
  const sutqNum = parseInt(sutq, 10);
  const sutqLabel =
    sutqNum === 3 ? "Gold" :
    sutqNum === 2 ? "Silver" :
    sutqNum === 1 ? "Bronze" :
    "Not Rated";

  return [
    {
      question: `What does ${name}'s SUTQ rating of "${sutqLabel}" mean?`,
      answer:
        sutqNum >= 1 && sutqNum <= 3 ? (
          <p>
            Ohio&apos;s <strong>Step Up to Quality (SUTQ)</strong> program rates licensed child care providers on a 1–3 star scale.{" "}
            {name} holds a <strong>{sutqLabel}</strong> rating, meaning they meet{" "}
            {sutqNum === 1
              ? "foundational quality standards above the basic licensing requirements."
              : sutqNum === 2
                ? "enhanced quality standards including stronger staff qualifications and curriculum."
                : "Ohio's highest quality standards — the top tier for staff credentials, curriculum, and family engagement."}{" "}
            Ratings are verified by Ohio CCIDS.{" "}
            <a href="https://childrenandyouth.ohio.gov/for-providers/step-up-to-quality" target="_blank" rel="noopener noreferrer" style={{ color: dark }}>Learn more about SUTQ ratings</a>.
          </p>
        ) : (
          <p>
            <strong>Not Rated</strong> does not mean low quality. Many excellent licensed providers — including newer programs
            or those who have not yet enrolled — do not participate in SUTQ. All licensed Ohio providers must meet baseline
            health and safety requirements regardless of rating. Verify this provider&apos;s license at{" "}
            <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" style={{ color: dark }}>childcaresearch.ohio.gov</a>.{" "}
            <a href="/faq#sutq" style={{ color: dark }}>Learn more about SUTQ on our FAQ page</a>.
          </p>
        ),
      schemaAnswer:
        sutqNum >= 1 && sutqNum <= 3
          ? `Ohio's SUTQ program rates providers 1–3 stars. ${name} holds a ${sutqLabel} rating, meaning they meet ${sutqNum === 1 ? "foundational quality standards above basic licensing." : sutqNum === 2 ? "enhanced quality standards including stronger staff qualifications." : "Ohio's highest quality standards — the top tier."} Ratings are verified by Ohio CCIDS.`
          : `Not Rated does not mean low quality. Many excellent providers do not participate in SUTQ. All licensed Ohio providers must meet baseline health and safety requirements. Verify at childcaresearch.ohio.gov.`,
    },
    {
      question: `Is ${name} currently licensed in Ohio?`,
      answer: (
        <p>
          {name} is a licensed Ohio child care provider
          {initialLicense !== "—" ? `, licensed since ${initialLicense}` : ""}.
          {licenseExpires !== "—" ? ` License expiration on record: ${licenseExpires}.` : ""}{" "}
          Ohio licensing is administered by the Ohio Department of Children and Youth. You can confirm current license
          status and view compliance history at{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" style={{ color: dark }}>childcaresearch.ohio.gov</a>.
        </p>
      ),
      schemaAnswer: `${name} is a licensed Ohio child care provider${initialLicense !== "—" ? `, licensed since ${initialLicense}` : ""}${licenseExpires !== "—" ? `. License expiration on record: ${licenseExpires}.` : "."} Confirm current status at childcaresearch.ohio.gov.`,
    },
    {
      question: `Does ${name} accept PFCC child care assistance?`,
      answer: isPfcc ? (
        <p>
          <strong>Yes</strong> — {name} is listed as accepting <strong>Publicly Funded Child Care (PFCC)</strong>,
          Ohio&apos;s subsidy program that helps income-eligible families cover child care costs. Eligibility and co-pays
          are based on income and family size. To apply, contact your county Job and Family Services office or visit{" "}
          <a href="https://childrenandyouth.ohio.gov/for-families/child-care-families" target="_blank" rel="noopener noreferrer" style={{ color: dark }}>childrenandyouth.ohio.gov</a>.
        </p>
      ) : (
        <p>
          {name} is <strong>not currently listed</strong> as a PFCC provider in our data. If your family needs child care
          assistance, you can search for PFCC-accepting providers in {city} on our{" "}
          <a href={`/daycares/${citySlug}`} style={{ color: dark }}>{city} listings page</a>, or contact your county
          Job and Family Services office for a current provider list.
        </p>
      ),
      schemaAnswer: isPfcc
        ? `Yes, ${name} accepts Publicly Funded Child Care (PFCC), Ohio's subsidy for income-eligible families. Apply through county Job and Family Services or childrenandyouth.ohio.gov.`
        : `${name} is not currently listed as a PFCC provider. Search for PFCC-accepting providers in ${city} or contact county Job and Family Services.`,
    },
    {
      question: `What should I ask when I call ${name}?`,
      answer: (
        <div>
          <p className="mb-2">Before enrolling, cover these during your call or tour:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Do you have current openings for my child&apos;s age group?</li>
            <li>What are your hours and which holidays are you closed?</li>
            <li>What is the caregiver-to-child ratio for my child&apos;s age?</li>
            <li>What experience and certifications do your caregivers hold?</li>
            <li>How do you handle illness, medication, and emergencies?</li>
            <li>What does a typical day look like for my child&apos;s age?</li>
            <li>What are all fees — registration, supply, and late pickup?</li>
            <li>Do you accept PFCC, Child Care Choice, or other subsidies?</li>
          </ul>
          <p className="mt-2 text-sm">
            See the full age-specific checklist at{" "}
            <a href="/faq" style={{ color: dark }}>our FAQ page</a>, adapted from the Child Care Aware of America Short Notice Checklist.
          </p>
        </div>
      ),
      schemaAnswer: `Ask about: current openings for your child's age, hours and holidays, caregiver-to-child ratios, staff certifications, illness and emergency procedures, daily schedule, all fees, and subsidy acceptance. See the full checklist at ohioparenthub.com/faq.`,
    },
    {
      question: `How up-to-date is the information shown for ${name}?`,
      answer: (
        <p>
          This profile is sourced from the Ohio CCIDS public licensing database, updated periodically by the Ohio
          Department of Children and Youth. PFCC status, SUTQ ratings, administrator names, and contact details may
          change between updates. Always confirm details directly with the provider and verify the current license
          status at{" "}
          <a href="https://childcaresearch.ohio.gov" target="_blank" rel="noopener noreferrer" style={{ color: dark }}>childcaresearch.ohio.gov</a>.
        </p>
      ),
      schemaAnswer: `This profile is sourced from the Ohio CCIDS public licensing database. PFCC status, ratings, and contact info may change. Always confirm directly with the provider and verify license status at childcaresearch.ohio.gov.`,
    },
  ];
}

export const revalidate = 86400;


const NEARBY_BUCKET_DEGREES = 0.2;
const NEARBY_BUCKET_RADIUS = 1;

type SpatialPoint = {
  index: number;
  lat: number;
  lng: number;
  programNumber: string;
};

type DaycareDataset = {
  rows: DaycareRow[];
  byProgramNumber: Map<string, DaycareRow>;
  spatialBuckets: Map<string, SpatialPoint[]>;
};

let daycareDatasetCache: DaycareDataset | null = null;

function getBucketKey(lat: number, lng: number) {
  const latBucket = Math.floor(lat / NEARBY_BUCKET_DEGREES);
  const lngBucket = Math.floor(lng / NEARBY_BUCKET_DEGREES);
  return `${latBucket}:${lngBucket}`;
}

function buildDaycareDataset(rows: DaycareRow[]): DaycareDataset {
  const byProgramNumber = new Map<string, DaycareRow>();
  const spatialBuckets = new Map<string, SpatialPoint[]>();

  rows.forEach((row, index) => {
    const programNumber = row["PROGRAM NUMBER"] || "";
    if (programNumber) {
      byProgramNumber.set(programNumber, row);
    }

    const lat = Number.parseFloat(String(row["LAT"] ?? ""));
    const lng = Number.parseFloat(String(row["LNG"] ?? ""));
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !programNumber) return;

    const key = getBucketKey(lat, lng);
    const points = spatialBuckets.get(key) || [];
    points.push({ index, lat, lng, programNumber });
    spatialBuckets.set(key, points);
  });

  return {
    rows,
    byProgramNumber,
    spatialBuckets,
  };
}

function getDaycareDataset(): DaycareDataset {
  if (daycareDatasetCache) return daycareDatasetCache;

  const datasetPath = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(datasetPath)) {
    daycareDatasetCache = buildDaycareDataset([]);
    return daycareDatasetCache;
  }

  const raw = fs.readFileSync(datasetPath, "utf8");
  const parsed = JSON.parse(raw) as DaycareRow[];
  daycareDatasetCache = buildDaycareDataset(parsed);
  return daycareDatasetCache;
}

function loadDaycares(): DaycareRow[] {
  return getDaycareDataset().rows;
}

function findDaycareBySlug(slug: string): DaycareRow | null {
  const programNumber = slug.split("-")[0];
  if (!programNumber) return null;
  return getDaycareDataset().byProgramNumber.get(programNumber) || null;
}

function getNearbySpatialPoints(lat: number, lng: number) {
  const { spatialBuckets } = getDaycareDataset();
  const latBucket = Math.floor(lat / NEARBY_BUCKET_DEGREES);
  const lngBucket = Math.floor(lng / NEARBY_BUCKET_DEGREES);
  const nearby: SpatialPoint[] = [];

  for (let latOffset = -NEARBY_BUCKET_RADIUS; latOffset <= NEARBY_BUCKET_RADIUS; latOffset += 1) {
    for (let lngOffset = -NEARBY_BUCKET_RADIUS; lngOffset <= NEARBY_BUCKET_RADIUS; lngOffset += 1) {
      const bucketKey = `${latBucket + latOffset}:${lngBucket + lngOffset}`;
      const bucketPoints = spatialBuckets.get(bucketKey);
      if (bucketPoints?.length) {
        nearby.push(...bucketPoints);
      }
    }
  }

  return nearby;
}

function canonicalDaycareSlug(daycare: DaycareRow) {
  const programNumber = daycare["PROGRAM NUMBER"] || "";
  const name = daycare["PROGRAM NAME"] || "";
  const citySlug = resolveCanonicalCitySlugFromName(daycare["CITY"] || "");
  return `${programNumber}-${slugify(name)}-${citySlug}`;
}

function normalizeProgramType(programType: string) {
  const cleanType = toTitleCaseIfAllCaps(programType || "").trim();
  if (!cleanType || cleanType.toLowerCase() === "not specified") {
    return "daycare program";
  }
  return cleanType.toLowerCase();
}

function trimForMeta(text: string, maxLength = 155) {
  if (text.length <= maxLength) return text;

  const trimmed = text.slice(0, maxLength - 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace > 100) {
    return `${trimmed.slice(0, lastSpace)}…`;
  }

  return `${trimmed}…`;
}

function buildDaycareDescription(params: {
  name: string;
  city: string;
  sutq: string;
  programType: string;
  maxLength?: number;
}) {
  const { name, city, sutq, programType, maxLength = 155 } = params;
  const location = city ? `${city}, Ohio` : "Ohio";
  const sutqValue = (sutq || "").trim();
  const hasRatedSutq = Boolean(sutqValue) && sutqValue.toLowerCase() !== "not rated";
  const sutqSnippet = hasRatedSutq ? ` SUTQ: ${sutqValue}.` : "";
  const normalizedType = normalizeProgramType(programType);

  const templates = [
    `${name} is a licensed ${normalizedType} in ${location}.${sutqSnippet} View licensing, address, and contact details.`,
    `${name} is a licensed daycare in ${location}.${sutqSnippet} View licensing, address, and contact details.`,
    `Licensed daycare profile in ${location}.${sutqSnippet} View licensing, address, and contact details.`,
  ];

  for (const template of templates) {
    if (template.length <= maxLength) {
      return template;
    }
  }

  return trimForMeta(templates[templates.length - 1], maxLength);
}

function parseSutqRatingValue(sutq: string): 1 | 2 | 3 | null {
  const match = (sutq || "").match(/\d+/);
  if (!match) return null;

  const numericValue = Number.parseInt(match[0], 10);
  if (numericValue >= 1 && numericValue <= 3) {
    return numericValue as 1 | 2 | 3;
  }

  return null;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function isPfccEnabled(row: DaycareRow) {
  return row["PFCC"] === "Y" || row["PFCC AGREEMENT"] === "Y";
}

export async function generateStaticParams() {
  // Return empty — pages render on-demand via ISR (revalidate = 86400).
  // Each page is ~88KB HTML; pre-rendering 8000+ exceeds Vercel's 75MB limit.
  // Bots still get fully server-rendered HTML on every request, cached 24h.
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const daycare = findDaycareBySlug(slug);
  
  if (!daycare) {
    return {
      title: "Daycare Not Found",
      description: "Ohio Parent Hub daycare listing.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const name = toTitleCaseIfAllCaps(daycare["PROGRAM NAME"] || "") || "Daycare";
  const city = toTitleCaseIfAllCaps(resolveCanonicalCityName(daycare["CITY"] || ""));
  const sutq = daycare["SUTQ RATING"] || "Not Rated";
  const programType = daycare["PROGRAM TYPE"] || "";
  const canonicalSlug = canonicalDaycareSlug(daycare);
  const pageDescription = buildDaycareDescription({
    name,
    city,
    sutq,
    programType,
    maxLength: 155,
  });
  const socialDescription = buildDaycareDescription({
    name,
    city,
    sutq,
    programType,
    maxLength: 140,
  });
  
  return {
    title: `${name} in ${city}, OH | Daycare Profile`,
    description: pageDescription,
    keywords: [
      `${name}`,
      `${city} daycare`,
      `${city} childcare`,
      `licensed daycare ${city} ohio`,
      `${name} ${city} ohio`,
    ],
    alternates: {
      canonical: `/daycare/${canonicalSlug}`,
    },
    openGraph: {
      title: `${name} in ${city}, Ohio | Daycare Profile`,
      description: socialDescription,
      url: `https://ohioparenthub.com/daycare/${canonicalSlug}`,
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: `${name} daycare profile in ${city}, Ohio | Ohio Parent Hub`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} in ${city}, Ohio | Daycare Profile`,
      description: socialDescription,
      images: ["/og-default.png"],
    },
  };
}

export default async function DaycarePage({ params }: Props) {
  const { slug } = await params;
  const daycare = findDaycareBySlug(slug);

  if (!daycare) {
    notFound();
  }

  const canonicalSlug = canonicalDaycareSlug(daycare);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/daycare/${canonicalSlug}`);
  }

  const name = toTitleCaseIfAllCaps(daycare["PROGRAM NAME"] || "") || "Unknown";
  const programNumber = daycare["PROGRAM NUMBER"] || "";
  const programType = toTitleCaseIfAllCaps(daycare["PROGRAM TYPE"] || "") || "Not Specified";
  const sutq = daycare["SUTQ RATING"] || "Not Rated";
  
  const street = toTitleCaseIfAllCaps(daycare["STREET ADDRESS"] || "");
  const city = toTitleCaseIfAllCaps(resolveCanonicalCityName(daycare["CITY"] || ""));
  const citySlug = resolveCanonicalCitySlugFromName(daycare["CITY"] || city);
  const zip = daycare["ZIP CODE"] || "";
  const county = toTitleCaseIfAllCaps(daycare["COUNTY"] || "");
  const countySlug = slugify(county);
  const metro = getMetroForDaycare(daycare);
  
  const phone = daycare["PHONE"] || "";
  const email = daycare["EMAIL"] || "";
  
  const initialLicense = daycare["LICENSE/CERTIFICATION/REGISTRATION BEGIN DATE"] || "—";
  const licenseExpires = daycare["LICENSE/CERTIFICATION/REGISTRATION END DATE"] || "—";
  
  const administrator1 = toTitleCaseIfAllCaps(daycare["ADMINISTRATOR 1 NAME"] || "");
  const administrator2 = toTitleCaseIfAllCaps(daycare["ADMINISTRATOR 2 NAME"] || "");
  const administrator3 = toTitleCaseIfAllCaps(daycare["ADMINISTRATOR 3 NAME"] || "");

  const lat = Number.parseFloat(String(daycare["LAT"] ?? ""));
  const lng = Number.parseFloat(String(daycare["LNG"] ?? ""));
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
  const sutqRatingValue = parseSutqRatingValue(sutq);

  const stateHref = "/daycares";
  const cityHref = `/daycares/${citySlug}`;
  const countyHref = countySlug ? `/daycares/county/${countySlug}` : null;
  const metroHref = metro ? `/daycares/${metro.slug}` : null;
  // Nav context (back-to-results) now comes from sessionStorage client-side (TICKET-001)
  const context: "state" | "county" | "city" | "unknown" = "unknown";
  const backHref = cityHref;

  const allDaycares = loadDaycares();
  const currentProgramType = (daycare["PROGRAM TYPE"] || "").trim().toLowerCase();
  const currentSutq = (daycare["SUTQ RATING"] || "").trim().toLowerCase();
  const currentPfcc = isPfccEnabled(daycare);
  const nearbyCandidates = hasCoordinates
    ? getNearbySpatialPoints(lat, lng)
        .filter((candidate) => candidate.programNumber !== programNumber)
        .map((candidate) => {
          const daycareRow = allDaycares[candidate.index];
          if (!daycareRow) return null;

          const miles = distanceMiles(lat, lng, candidate.lat, candidate.lng);
          if (miles > 10) return null;

          return {
            daycare: daycareRow,
            miles,
          };
        })
        .filter((candidate): candidate is { daycare: DaycareRow; miles: number } => Boolean(candidate))
        .sort((a, b) => a.miles - b.miles)
    : [];

  const nearbyDaycares: RelatedDaycareCard[] = nearbyCandidates.slice(0, 5).map(({ daycare: candidate, miles }) => ({
    href: `/daycare/${canonicalDaycareSlug(candidate)}`,
    name: toTitleCaseIfAllCaps(candidate["PROGRAM NAME"] || "Licensed Daycare"),
    city: toTitleCaseIfAllCaps(resolveCanonicalCityName(candidate["CITY"] || "Ohio")),
    street: toTitleCaseIfAllCaps(candidate["STREET ADDRESS"] || ""),
    programType: toTitleCaseIfAllCaps(candidate["PROGRAM TYPE"] || "Not Specified"),
    sutq: candidate["SUTQ RATING"] || "0",
    pfcc: isPfccEnabled(candidate),
    distanceMiles: miles,
  }));

  const similarDaycares: RelatedDaycareCard[] = nearbyCandidates
    .filter(({ daycare: candidate }) => {
      const candidateProgramType = (candidate["PROGRAM TYPE"] || "").trim().toLowerCase();
      const candidateSutq = (candidate["SUTQ RATING"] || "").trim().toLowerCase();
      const candidatePfcc = isPfccEnabled(candidate);
      return (
        candidateProgramType === currentProgramType &&
        candidateSutq === currentSutq &&
        candidatePfcc === currentPfcc
      );
    })
    .slice(0, 5)
    .map(({ daycare: candidate, miles }) => ({
      href: `/daycare/${canonicalDaycareSlug(candidate)}`,
      name: toTitleCaseIfAllCaps(candidate["PROGRAM NAME"] || "Licensed Daycare"),
      city: toTitleCaseIfAllCaps(resolveCanonicalCityName(candidate["CITY"] || "Ohio")),
      street: toTitleCaseIfAllCaps(candidate["STREET ADDRESS"] || ""),
      programType: toTitleCaseIfAllCaps(candidate["PROGRAM TYPE"] || "Not Specified"),
      sutq: candidate["SUTQ RATING"] || "0",
      pfcc: isPfccEnabled(candidate),
      distanceMiles: miles,
    }));

  const browseLinks = [
    { label: "Ohio", href: stateHref },
    ...(countyHref
      ? [{ label: `${county} County`, href: countyHref }]
      : []),
    ...(metroHref && metro
      ? [{ label: metro.name, href: metroHref }]
      : []),
    { label: city, href: cityHref, isActive: true },
  ];

  // Schema.org LocalBusiness structured data
  const schema = {
    "@context": "https://schema.org",
    "@type": "ChildCare",
    name,
    description: `${name} is a licensed ${programType.toLowerCase()} in ${city}, Ohio.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: city,
      addressRegion: "OH",
      postalCode: zip,
      addressCountry: "US",
    },
    ...(hasCoordinates && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: lat,
        longitude: lng,
      },
      hasMap: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    }),
    ...(sutqRatingValue !== null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: sutqRatingValue,
        bestRating: 3,
        worstRating: 1,
        ratingCount: 1,
      },
    }),
    ...(phone && { telephone: phone }),
    ...(email && { email }),
  };

  // ─── FAQ section ────────────────────────────────────────────────────────────
  const detailFaqs = buildDetailFaqs(
    name,
    sutq,
    city,
    citySlug,
    isPfccEnabled(daycare),
    initialLicense,
    licenseExpires,
  );

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: detailFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.schemaAnswer },
    })),
  };

  const faqSection = (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />
      <section
        className="px-6 pb-24 pt-16"
        style={{ background: cream }}
        aria-label={`Frequently asked questions about ${name}`}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="mb-4 h-5 w-5" style={{ color: `${gold}60` }} aria-hidden="true">
              <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
            </svg>
            <h2 className="font-serif text-4xl font-bold" style={{ color: dark }}>
              Common Questions About {name}
            </h2>
            <p className="mt-2" style={{ color: `${dark}88` }}>
              Helpful answers for families researching this provider.
            </p>
          </div>
          <div className="space-y-4">
            {detailFaqs.map(({ question, answer }) => (
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
          <p className="mt-6 text-sm" style={{ color: `${dark}88` }}>
            More questions?{" "}
            <a href="/faq" className="underline hover:no-underline" style={{ color: teal }}>
              Visit our full FAQ page
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );

  return (
    <DaycareDetailPageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Cities", href: "/cities" },
        { label: city, href: cityHref },
        { label: "Daycare Details", href: `/daycare/${canonicalSlug}` },
      ]}
      backHref={backHref}
      backLabel="Back to results"
      uplinkContext={context}
      browseLinks={browseLinks}
      nearbyDaycares={nearbyDaycares}
      similarDaycares={similarDaycares}
      name={name}
      city={city}
      sutq={sutq}
      programType={programType}
      programNumber={programNumber}
      street={street}
      zip={zip}
      county={county}
      phone={phone}
      email={email}
      administrator1={administrator1}
      administrator2={administrator2}
      administrator3={administrator3}
      initialLicense={initialLicense}
      licenseExpires={licenseExpires}
      hasCoordinates={hasCoordinates}
      lat={lat}
      lng={lng}
      schema={schema}
      faqSection={faqSection}
    />
  );
}
