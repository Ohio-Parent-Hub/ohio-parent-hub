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
  const canonicalSlug = canonicalDaycareSlug(daycare);
  
  return {
    title: `${name} in ${city}, OH | Daycare Profile`,
    description: `${name} is a licensed daycare in ${city}, Ohio. SUTQ Rating: ${sutq}. View address, contact details, and program information.`,
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
      description: `${name} is a licensed daycare in ${city}, Ohio. SUTQ Rating: ${sutq}.`,
      url: `https://ohioparenthub.com/daycare/${canonicalSlug}`,
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
