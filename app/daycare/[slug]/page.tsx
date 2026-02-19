import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SutqBadge } from "@/components/SutqBadge";
import StaticMap from "@/components/StaticMap";
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
            The daycare you&apos;re looking for doesn&apos;t exist or may have been delisted.
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
  const sutq = daycare["SUTQ RATING"] || "Not Rated";
  
  const street = daycare["STREET ADDRESS"] || "";
  const city = daycare["CITY"] || "";
  const zip = daycare["ZIP CODE"] || "";
  const county = daycare["COUNTY"] || "";
  
  const phone = daycare["PHONE"] || "";
  const email = daycare["EMAIL"] || "";
  
  const initialLicense = daycare["LICENSE/CERTIFICATION/REGISTRATION BEGIN DATE"] || "—";
  const licenseExpires = daycare["LICENSE/CERTIFICATION/REGISTRATION END DATE"] || "—";
  
  const administrator1 = daycare["ADMINISTRATOR 1 NAME"] || "";
  const administrator2 = daycare["ADMINISTRATOR 2 NAME"] || "";
  const administrator3 = daycare["ADMINISTRATOR 3 NAME"] || "";

  const lat = daycare["LAT"] ? Number(daycare["LAT"]) : null;
  const lng = daycare["LNG"] ? Number(daycare["LNG"]) : null;

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
    ...(lat && lng && {
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
            
            {lat && lng && (
              <div className="mt-6 overflow-hidden rounded-xl border">
                <StaticMap lat={lat} lng={lng} height="300px" />
                <div className="bg-neutral-50 px-4 py-2 text-xs text-neutral-500 flex justify-between">
                  <span>OpenStreetMap</span>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-neutral-700 font-medium"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </div>
            )}
          </section>

          {/* Contact */}
          <section className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              {administrator1 && (
                <div>
                  <div className="text-sm font-medium text-neutral-600">Administrator 1</div>
                  <div className="text-neutral-900">{administrator1}</div>
                </div>
              )}
              {administrator2 && (
                <div>
                  <div className="text-sm font-medium text-neutral-600">Administrator 2</div>
                  <div className="text-neutral-900">{administrator2}</div>
                </div>
              )}
              {administrator3 && (
                <div>
                  <div className="text-sm font-medium text-neutral-600">Administrator 3</div>
                  <div className="text-neutral-900">{administrator3}</div>
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
              {phone && (
                <div>
                  <div className="text-sm font-medium text-neutral-600">Phone</div>
                  <a href={`tel:${phone}`} className="text-neutral-900 hover:underline">
                    {phone}
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
                <dt className="text-sm font-medium text-neutral-600">Program Type</dt>
                <dd className="mt-1 text-neutral-900">{programType}</dd>
              </div>
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
            </dl>
          </section>

        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Disclaimer */}
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs text-neutral-700">
              Information sourced from Ohio&apos;s public childcare database. Always verify details directly with the provider.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
