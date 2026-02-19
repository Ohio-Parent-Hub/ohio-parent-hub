import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SutqBadge } from "@/components/SutqBadge";
import { slugify } from "@/lib/utils";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const daycare = findDaycareBySlug(slug);
  
  if (!daycare) {
    return {
      title: "Daycare Not Found",
      description: "Ohio Parent Hub daycare listing.",
    };
  }

  const name = daycare["PROGRAM NAME"] || "Daycare";
  const city = daycare["CITY"] || "";
  const sutq = daycare["SUTQ RATING"] || "Not Rated";
  
  return {
    title: `${name} - ${city}, OH | Ohio Parent Hub`,
    description: `${name} in ${city}, Ohio. SUTQ Rating: ${sutq}. View program details, address, license information, and contact info.`,
  };
}

export default async function DaycarePage({ params }: Props) {
  const { slug } = await params;
  const daycare = findDaycareBySlug(slug);

  if (!daycare) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border p-6 text-center">
          <h1 className="text-xl font-semibold">Daycare Not Found</h1>
          <p className="mt-2 text-sm text-neutral-600">
            The daycare you're looking for doesn't exist or may have been delisted.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  const name = daycare["PROGRAM NAME"] || "Unknown";
  const programNumber = daycare["PROGRAM NUMBER"] || "";
  const programType = daycare["PROGRAM TYPE"] || "Not Specified";
  const licenseType = daycare["LICENSE TYPE"] || "—";
  const sutq = daycare["SUTQ RATING"] || "Not Rated";
  
  const street = daycare["STREET ADDRESS"] || "";
  const city = daycare["CITY"] || "";
  const zip = daycare["ZIP CODE"] || "";
  const county = daycare["COUNTY"] || "";
  
  const phone = daycare["BUSINESS TELEPHONE NUMBER"] || "";
  const email = daycare["E-MAIL"] || "";
  const website = daycare["WEB SITE"] || "";
  
  const capacity = daycare["LICENSED CAPACITY"] || "—";
  const ageFrom = daycare["AGE RANGE FROM (MONTHS)"] || "";
  const ageTo = daycare["AGE RANGE TO (MONTHS)"] || "";
  const ageRange = ageFrom && ageTo ? `${ageFrom}-${ageTo} months` : "—";
  
  const initialLicense = daycare["INITIAL LICENSE DATE"] || "—";
  const licenseExpires = daycare["LICENSE/REGISTRATION EXPIRATION DATE"] || "—";
  
  const administrator = daycare["ADMINISTRATOR FIRST NAME"] && daycare["ADMINISTRATOR LAST NAME"]
    ? `${daycare["ADMINISTRATOR FIRST NAME"]} ${daycare["ADMINISTRATOR LAST NAME"]}`
    : "—";

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
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    ...(website && { url: website.startsWith("http") ? website : `http://${website}` }),
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <Breadcrumbs 
        items={[
          { label: "Home", href: "/" },
          { label: "Cities", href: "/cities" },
          { label: city, href: `/daycares/${slugify(city)}` },
          { label: "Daycare Details", href: `/daycare/${slug}` }
        ]} 
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-6">
        <Link href={`/daycares/${slugify(city)}`} className="text-sm text-neutral-600 hover:underline">
          ← Back to {city} Daycares
        </Link>
      </div>

      {/* Title & Badges */}
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
        <p className="mt-2 text-neutral-600">{city}, Ohio</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <SutqBadge rating={sutq} />
          <span className="inline-flex rounded-full border px-3 py-1 text-sm text-neutral-700">
            {programType}
          </span>
          <span className="inline-flex rounded-full border px-3 py-1 text-sm text-neutral-700">
            {licenseType}
          </span>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address */}
          <section className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <div className="space-y-2">
              <p className="text-neutral-700">{street}</p>
              <p className="text-neutral-700">{city}, OH {zip}</p>
              <p className="text-sm text-neutral-600">{county} County</p>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              {phone && (
                <div>
                  <div className="text-sm font-medium text-neutral-600">Phone</div>
                  <a href={`tel:${phone}`} className="text-neutral-900 hover:underline">
                    {phone}
                  </a>
                </div>
              )}
              {email && (
                <div>
                  <div className="text-sm font-medium text-neutral-600">Email</div>
                  <a href={`mailto:${email}`} className="text-neutral-900 hover:underline">
                    {email}
                  </a>
                </div>
              )}
              {website && (
                <div>
                  <div className="text-sm font-medium text-neutral-600">Website</div>
                  <a
                    href={website.startsWith("http") ? website : `http://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visit Website →
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Program Details */}
          <section className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Program Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-neutral-600">Licensed Capacity</dt>
                <dd className="mt-1 text-neutral-900">{capacity}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-600">Age Range</dt>
                <dd className="mt-1 text-neutral-900">{ageRange}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-600">Program Type</dt>
                <dd className="mt-1 text-neutral-900">{programType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-600">License Type</dt>
                <dd className="mt-1 text-neutral-900">{licenseType}</dd>
              </div>
            </dl>
          </section>

          {/* License Info */}
          <section className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">License Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-neutral-600">Program Number</dt>
                <dd className="mt-1 font-mono text-sm text-neutral-900">{programNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-600">Initial License Date</dt>
                <dd className="mt-1 text-neutral-900">{initialLicense}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-600">License Expiration</dt>
                <dd className="mt-1 text-neutral-900">{licenseExpires}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-600">Administrator</dt>
                <dd className="mt-1 text-neutral-900">{administrator}</dd>
              </div>
            </dl>
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Map Placeholder */}
          <div className="rounded-2xl border p-6">
            <h2 className="text-sm font-semibold mb-3">Map</h2>
            <div className="flex h-48 items-center justify-center rounded-lg bg-neutral-50 text-sm text-neutral-500">
              Map coming soon
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border p-6">
            <h2 className="text-sm font-semibold mb-3">Quick Info</h2>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-600">
                <span className="font-medium">SUTQ Rating:</span> {sutq}
              </p>
              <p className="text-neutral-600">
                <span className="font-medium">Capacity:</span> {capacity}
              </p>
              <p className="text-neutral-600">
                <span className="font-medium">County:</span> {county}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs text-neutral-700">
              Information sourced from Ohio's public childcare database. Always verify details directly with the provider.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
