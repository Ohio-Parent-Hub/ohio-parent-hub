import DaycareDetailPageShell from "@/components/DaycareDetailPageShell";
import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";
import fs from "node:fs";
import path from "node:path";
import { notFound, permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

type DaycareRow = Record<string, string>;

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

export default async function DraftDaycarePage({ params }: Props) {
  const { slug } = await params;
  const daycare = findDaycareBySlug(slug);

  if (!daycare) {
    notFound();
  }

  const canonicalSlug = canonicalDaycareSlug(daycare);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/draft/daycare/${canonicalSlug}`);
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

  return (
    <DaycareDetailPageShell
      breadcrumbs={[
        { label: "Home", href: "/draft" },
        { label: "Cities", href: "/draft/cities" },
        { label: city, href: `/draft/daycares/${slugify(city)}` },
        { label: "Daycare Details", href: `/draft/daycare/${canonicalSlug}` },
      ]}
      backHref={`/draft/daycares/${slugify(city)}`}
      backLabel="Back to results"
      browseLinks={[
        { label: "Ohio", href: "/draft/daycares" },
        { label: city, href: `/draft/daycares/${slugify(city)}`, isActive: true },
      ]}
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
    />
  );
}
