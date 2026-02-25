import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SutqBadge } from "@/components/SutqBadge";
import StaticMap from "@/components/StaticMap";
import { Badge } from "@/components/ui/badge";
import BackToResultsButton from "@/components/BackToResultsButton";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type DaycareDetailPageShellProps = {
  breadcrumbs: Array<{ label: string; href: string }>;
  backHref: string;
  backLabel: string;
  browseLinks?: Array<{ label: string; href: string; isActive?: boolean }>;
  profileBadgeLabel: string;
  name: string;
  city: string;
  sutq: string;
  programType: string;
  programNumber: string;
  street: string;
  zip: string;
  county: string;
  phone: string;
  email: string;
  administrator1: string;
  administrator2: string;
  administrator3: string;
  initialLicense: string;
  licenseExpires: string;
  hasCoordinates: boolean;
  lat: number;
  lng: number;
  schema?: Record<string, unknown>;
};

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const lightTeal = "#D5E5E3";

export default function DaycareDetailPageShell({
  breadcrumbs,
  backHref,
  backLabel,
  browseLinks = [],
  profileBadgeLabel,
  name,
  city,
  sutq,
  programType,
  programNumber,
  street,
  zip,
  county,
  phone,
  email,
  administrator1,
  administrator2,
  administrator3,
  initialLicense,
  licenseExpires,
  hasCoordinates,
  lat,
  lng,
  schema,
}: DaycareDetailPageShellProps) {
  return (
    <main className="min-h-screen" style={{ background: cream, color: dark }}>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      <section className="relative overflow-hidden px-6 pt-8 pb-12" style={{ background: lightTeal }}>
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Breadcrumbs items={breadcrumbs} className="mb-6" />

          <div className="mb-6">
            <BackToResultsButton fallbackHref={backHref} label={backLabel} />

            {browseLinks.length > 0 && (
              <div className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium">Browse more:</span>{" "}
                {browseLinks.map((link, index) => (
                  <span key={`${link.label}-${link.href}`}>
                    {index > 0 && <span className="mx-1.5">•</span>}
                    <Link
                      href={link.href}
                      className={link.isActive ? "font-semibold text-foreground" : "hover:text-foreground hover:underline"}
                    >
                      {link.label}
                    </Link>
                  </span>
                ))}
              </div>
            )}
          </div>

          <header className="rounded-2xl border p-6 sm:p-8" style={{ background: "#fff", borderColor: `${sage}55` }}>
            <Badge variant="outline" className="mb-4" style={{ borderColor: `${teal}55`, color: dark }}>
              {profileBadgeLabel}
            </Badge>
            <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: dark }}>
              {name}
            </h1>
            <p className="mt-2 text-muted-foreground">{city}, Ohio</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <SutqBadge rating={sutq} />
              <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                {programType}
              </Badge>
            </div>
          </header>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-7xl rounded-3xl border p-4 sm:p-6 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
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
        </div>
      </section>
    </main>
  );
}