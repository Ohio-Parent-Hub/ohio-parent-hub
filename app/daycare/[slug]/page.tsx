import DaycareDetailPageShell from "@/components/DaycareDetailPageShell";
import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { notFound, permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

type DaycareRow = Record<string, string>;

export const revalidate = 86400;

const PRIORITY_CITY_SLUGS = new Set(["columbus", "cleveland", "cincinnati"]);

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function findDaycareBySlug(slug: string): DaycareRow | null {
  const programNumber = slug.split("-")[0];
  const all = loadDaycares();
  return all.find((d) => d["PROGRAM NUMBER"] === programNumber) || null;
}

function canonicalDaycareSlug(daycare: DaycareRow) {
  const programNumber = daycare["PROGRAM NUMBER"] || "";
  const name = daycare["PROGRAM NAME"] || "";
  const city = daycare["CITY"] || "";
  return `${programNumber}-${slugify(name)}-${slugify(city)}`;
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

export async function generateStaticParams() {
  const all = loadDaycares();

  return all
    .filter((daycare) => {
      const citySlug = slugify(daycare["CITY"] || "");
      return Boolean(daycare["PROGRAM NUMBER"]) && PRIORITY_CITY_SLUGS.has(citySlug);
    })
    .map((daycare) => ({ slug: canonicalDaycareSlug(daycare) }));
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
  const city = toTitleCaseIfAllCaps(daycare["CITY"] || "");
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
  const city = toTitleCaseIfAllCaps(daycare["CITY"] || "");
  const zip = daycare["ZIP CODE"] || "";
  const county = toTitleCaseIfAllCaps(daycare["COUNTY"] || "");
  
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

  return (
    <DaycareDetailPageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Cities", href: "/cities" },
        { label: city, href: `/daycares/${slugify(city)}` },
        { label: "Daycare Details", href: `/daycare/${canonicalSlug}` },
      ]}
      backHref={`/daycares/${slugify(city)}`}
      backLabel={`Back to ${city} Daycares`}
      profileBadgeLabel="Licensed Program Profile"
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
    />
  );
}
