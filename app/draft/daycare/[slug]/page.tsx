import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SutqBadge } from "@/components/SutqBadge";
import StaticMap from "@/components/StaticMap";
import { slugify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
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

  const lat = Number.parseFloat(String(daycare["LAT"] ?? ""));
  const lng = Number.parseFloat(String(daycare["LNG"] ?? ""));
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Draft Home", href: "/draft" },
          { label: "Draft Cities", href: "/draft/cities" },
          { label: city, href: `/draft/daycares/${slugify(city)}` },
          { label: "Draft Daycare Details", href: `/draft/daycare/${canonicalSlug}` },
        ]}
        className="mb-6"
      />

      <div className="mb-6">
        <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10" asChild>
          <Link href={`/draft/daycares/${slugify(city)}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {city} Draft Daycares
          </Link>
        </Button>
      </div>

      <header className="mb-8 rounded-2xl border border-primary/20 bg-primary/10 p-6 sm:p-8">
        <Badge variant="outline" className="mb-4 border-primary/40 text-primary">Draft Licensed Program Profile</Badge>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-primary sm:text-4xl">{name}</h1>
        <p className="mt-2 text-muted-foreground">{city}, Ohio</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <SutqBadge rating={sutq} />
          <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">{programType}</Badge>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-serif text-2xl font-bold text-primary">Location</h2>
          <div className="space-y-2">
            <p className="text-foreground">{street}</p>
            <p className="text-foreground">{city}, OH {zip}</p>
            <p className="text-sm text-muted-foreground">{county} County</p>
          </div>

          {hasCoordinates ? (
            <div className="mt-6 overflow-hidden rounded-xl border border-primary/20">
              <StaticMap lat={lat} lng={lng} height="300px" />
              <div className="flex justify-between bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
                <span>OpenStreetMap</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  View on Google Maps <ExternalLink className="ml-1 inline h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Map unavailable for this listing.</p>
          )}
        </section>

        <section className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-2xl font-bold text-primary">Contact</h2>
          <div className="space-y-3">
            {administrator1 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Administrator</div>
                <div className="text-foreground">{administrator1}</div>
              </div>
            )}
            {administrator2 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Administrator 2</div>
                <div className="text-foreground">{administrator2}</div>
              </div>
            )}
            {administrator3 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Administrator 3</div>
                <div className="text-foreground">{administrator3}</div>
              </div>
            )}
            {email && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <a href={`mailto:${email}`} className="text-primary hover:underline">
                  {email}
                </a>
              </div>
            )}
            {phone && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Phone</div>
                <a href={`tel:${phone}`} className="text-primary hover:underline">
                  {phone}
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm lg:col-span-3">
          <h2 className="mb-4 font-serif text-2xl font-bold text-primary">Program Details</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Program Type</dt>
              <dd className="mt-1 text-foreground">{programType}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Program Number</dt>
              <dd className="mt-1 font-mono text-sm text-foreground">{programNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Initial License Date</dt>
              <dd className="mt-1 text-foreground">{initialLicense}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">License Expiration</dt>
              <dd className="mt-1 text-foreground">{licenseExpires}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
