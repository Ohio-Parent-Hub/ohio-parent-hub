"use client";

import type { ReactNode } from "react";
import type { PremiumListingData } from "@/lib/premiumTypes";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SutqBadge } from "@/components/SutqBadge";
import StaticMap from "@/components/StaticMap";
import { Button } from "@/components/ui/button";
import BackToResultsButton from "@/components/BackToResultsButton";
import VerifiedProviderBadge from "@/components/premium/VerifiedProviderBadge";
import PremiumPhotoGallery from "@/components/premium/PremiumPhotoGallery";
import PremiumHoursTable from "@/components/premium/PremiumHoursTable";
import PremiumPricingTable from "@/components/premium/PremiumPricingTable";
import PremiumAmenities from "@/components/premium/PremiumAmenities";
import PremiumOwnerDescription from "@/components/premium/PremiumOwnerDescription";
import ClaimListingDialog from "@/components/premium/ClaimListingDialog";
import PublicJobsSection from "@/components/jobs/PublicJobsSection";
import Link from "next/link";
import TrackedUplinkLink from "@/components/TrackedUplinkLink";
import { BriefcaseBusiness, ChevronDown, ClipboardList, ExternalLink, Globe, MapPin, Phone, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { generateUniqueDescription } from "@/lib/generateUniqueDescription";
import type { PublicDaycareJob } from "@/lib/jobTypes";

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

type DaycareDetailPageShellProps = {
  breadcrumbs: Array<{ label: string; href: string }>;
  backHref: string;
  backLabel: string;
  uplinkContext?: "state" | "county" | "city" | "unknown";
  browseLinks?: Array<{ label: string; href: string; isActive?: boolean }>;
  nearbyDaycares?: RelatedDaycareCard[];
  similarDaycares?: RelatedDaycareCard[];
  name: string;
  city: string;
  sutq: string;
  pfcc: boolean;
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
  faqSection?: ReactNode;
  premiumData?: PremiumListingData;
  isClaimed?: boolean;
  publicJobs?: PublicDaycareJob[];
};

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const lightTeal = "#D5E5E3";

function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      fill="none"
      preserveAspectRatio="none"
      className={`block w-full ${flip ? "rotate-180" : ""}`}
      style={{ height: "50px", marginBottom: flip ? 0 : "-1px", marginTop: flip ? "-1px" : 0 }}
    >
      <path d="M0 40C180 80 360 0 540 40C720 80 900 0 1080 40C1260 80 1440 0 1440 40V80H0V40Z" fill={fill} />
    </svg>
  );
}

type SutqDetails = {
  label: string;
  badgeClassName: string;
  starClassName: string;
  points: string[];
};

function getSutqDetails(rating: string): SutqDetails {
  const value = String(rating || "").trim().toLowerCase();

  if (value === "3" || value.includes("gold")) {
    return {
      label: "Gold Rated",
      badgeClassName: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      starClassName: "fill-yellow-600 text-yellow-600",
      points: [
        "Meets Bronze and Silver requirements.",
        "Includes stronger quality expectations across curriculum, assessment, and improvement planning.",
        "For center-based programs, Gold includes added ratio and group-size requirements.",
      ],
    };
  }

  if (value === "2" || value.includes("silver")) {
    return {
      label: "Silver Rated",
      badgeClassName: "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200",
      starClassName: "fill-slate-400 text-slate-400",
      points: [
        "Meets Silver requirements and core Bronze requirements.",
        "Includes stronger documentation and family follow-through expectations.",
        "Requires ongoing annual quality-improvement planning.",
      ],
    };
  }

  if (value === "1" || value.includes("bronze")) {
    return {
      label: "Bronze Rated",
      badgeClassName: "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100",
      starClassName: "fill-orange-600 text-orange-600",
      points: [
        "Meets Bronze SUTQ requirements.",
        "Uses aligned curriculum and child-screening processes with required documentation.",
        "Requires annual self-assessment and continuous improvement planning.",
      ],
    };
  }

  return {
    label: "Not Rated",
    badgeClassName: "bg-white text-muted-foreground border-border hover:bg-muted/30",
    starClassName: "fill-transparent text-muted-foreground",
    points: [
      "No active SUTQ rating is shown for this listing.",
      "This program is state licensed but has not participated in SUTQ rating.",
      "Ask whether they are currently participating in SUTQ and where they are in the process.",
    ],
  };
}

export default function DaycareDetailPageShell({
  breadcrumbs,
  backHref,
  backLabel,
  uplinkContext = "unknown",
  browseLinks = [],
  nearbyDaycares = [],
  similarDaycares = [],
  name,
  city,
  sutq,
  pfcc,
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
  faqSection,
  premiumData,
  isClaimed,
  publicJobs = [],
}: DaycareDetailPageShellProps) {
  const [isSutqDetailsOpen, setIsSutqDetailsOpen] = useState(false);
  const sutqDetails = getSutqDetails(sutq);

  const aboutRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (aboutRef.current && window.innerWidth < 640) {
      aboutRef.current.removeAttribute("open");
    }
  }, []);

  const uniqueDescription = generateUniqueDescription({
    name,
    programType,
    sutq,
    pfcc,
    city,
    county,
    initialLicense,
    nearbyCount: nearbyDaycares.length,
    similarCount: similarDaycares.length,
    administrator: administrator1,
  });

  const renderDaycareCards = (items: RelatedDaycareCard[], keyPrefix: string) => (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={`${keyPrefix}-${item.href}`}
          className="group rounded-xl border bg-white p-4 transition-colors hover:border-black"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="font-bold text-base leading-tight">
              <Link href={item.href} className="hover:underline">
                {item.name}
              </Link>
            </h3>
            <SutqBadge rating={item.sutq} className="scale-90 origin-right" />
          </div>

          <p className="mb-2 text-sm text-neutral-500">
            <span className="font-medium text-black">{item.city}</span>
            {item.street && <span className="mx-1">•</span>}
            {item.street}
          </p>

          <div className="mb-3 flex items-center gap-2 text-xs text-neutral-400">
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-neutral-600">
              {item.programType}
            </span>
            {item.pfcc && (
              <span className="rounded bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                PFCC
              </span>
            )}
            <span className="text-neutral-500">{item.distanceMiles.toFixed(1)} mi</span>
          </div>

          <Link href={item.href}>
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: cream, color: dark }}>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      <section className="relative overflow-hidden px-4 pt-6 pb-8 sm:px-6" style={{ background: lightTeal }}>
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Breadcrumbs items={breadcrumbs} className="mb-3" />

          <div className="mb-4">
            <BackToResultsButton fallbackHref={backHref} label={backLabel} trackingContext={uplinkContext} />
          </div>

          <header className="rounded-2xl border p-6 sm:p-8" style={{ background: "#fff", borderColor: `${sage}55` }}>
            <div className="mb-4 flex flex-col-reverse items-start gap-2 sm:flex-row sm:items-center">
              {!isClaimed && (
                <ClaimListingDialog
                  programNumber={programNumber}
                  daycareName={name}
                />
              )}
              {(premiumData || isClaimed) && (
                <VerifiedProviderBadge />
              )}
              {publicJobs.length > 0 && (
                <a
                  href="#open-jobs"
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-shadow hover:shadow-md"
                  style={{ backgroundColor: `${gold}22`, color: dark }}
                >
                  <BriefcaseBusiness className="h-3 w-3" />
                  Now Hiring · {publicJobs.length} Open {publicJobs.length === 1 ? "Role" : "Roles"}
                </a>
              )}
            </div>
            {premiumData?.logo_url ? (
              <>
                <div className="flex items-start gap-4">
                  <img
                    src={premiumData.logo_url}
                    alt={`${name} logo`}
                    className="h-16 w-16 rounded-lg object-cover shadow-sm border"
                    style={{ borderColor: `${sage}55` }}
                  />
                  <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: dark }}>
                      {name}
                    </h1>
                    <p className="mt-2 hidden text-muted-foreground sm:block">{programType} · {city}, Ohio</p>
                  </div>
                </div>
                <p className="mt-2 text-muted-foreground sm:hidden">{programType}<br />{city}, Ohio</p>
              </>
            ) : (
              <>
                <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: dark }}>
                  {name}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {programType}<br className="sm:hidden" /><span className="hidden sm:inline"> · </span>{city}, Ohio
                </p>
              </>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${sutqDetails.badgeClassName}`}
                aria-expanded={isSutqDetailsOpen}
                aria-controls="sutq-rating-details"
                aria-label="Toggle SUTQ rating details"
                onClick={() => setIsSutqDetailsOpen((current) => !current)}
              >
                <Star className={`h-3.5 w-3.5 ${sutqDetails.starClassName}`} aria-hidden="true" />
                <span>{sutqDetails.label}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${isSutqDetailsOpen ? "rotate-180" : "rotate-0"}`}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div id="sutq-rating-details" className={`mt-3 ${isSutqDetailsOpen ? "block" : "hidden"}`}>
              <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                {sutqDetails.points.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </div>
          </header>

          {browseLinks.length > 0 && (
            <div className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium">Browse more:</span>{" "}
              {browseLinks.map((link, index) => (
                <span key={`${link.label}-${link.href}`}>
                  {index > 0 && <span className="mx-1.5">•</span>}
                  <TrackedUplinkLink
                    href={link.href}
                    target={link.label}
                    context={uplinkContext}
                    className={link.isActive ? "font-semibold text-foreground" : "hover:text-foreground hover:underline"}
                  >
                    {link.label}
                  </TrackedUplinkLink>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div style={{ background: lightTeal, marginTop: "-1px" }}>
        <WaveDivider fill={cream} />
      </div>

      <section className="px-4 pt-6 pb-2 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <details
            ref={aboutRef}
            open
            className="group rounded-xl border-l-4 overflow-hidden"
            style={{
              borderLeftColor: sage,
              background: "#ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <summary
              className="sm:hidden px-5 py-3.5 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden"
            >
              <span className="font-semibold text-[0.95rem]" style={{ color: dark }}>
                About {name}
              </span>
              <ChevronDown
                size={18}
                className="transition-transform duration-200 group-open:rotate-180"
                style={{ color: `${dark}99` }}
              />
            </summary>
            <div className="px-5 pb-4 sm:!block sm:pt-4">
              <ul className="list-disc space-y-1.5 pl-5 text-[0.9rem] leading-relaxed" style={{ color: dark }}>
                {uniqueDescription.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </section>

      <div className="sm:hidden" style={{ background: cream }}>
        <WaveDivider fill="#fff" />
      </div>

      <section className={`px-0 pt-0 sm:pt-4 sm:px-6 ${premiumData?.pricing ? "pb-0 sm:pb-8" : "pb-8"}`}>
        <div className="mx-auto max-w-7xl overflow-hidden sm:rounded-3xl sm:border sm:p-6 sm:shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
          <div className="grid gap-0 sm:gap-6 lg:grid-cols-3 overflow-hidden">

            {premiumData?.description && (
              <div className="px-4 py-5 sm:px-0 sm:py-0 lg:col-span-3 overflow-hidden">
                <PremiumOwnerDescription description={premiumData.description} />
              </div>
            )}

            <section className="flex flex-col border-b border-primary/10 bg-white px-4 py-5 sm:rounded-2xl sm:border sm:border-primary/20 sm:p-6 sm:shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" style={{ color: "#7EA8A4" }} />
                <h2 className="font-serif text-2xl font-bold" style={{ color: "#4A6B67" }}>Location</h2>
              </div>
              <div className="space-y-2">
                <p className="text-foreground">{street}</p>
                <p className="text-foreground">{city}, OH {zip}</p>
                <p className="text-sm text-muted-foreground">{county} County</p>
              </div>

              {hasCoordinates ? (
                <div className="mt-6 flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-xl border border-primary/20">
                  <div className="relative flex-1">
                    <div className="absolute inset-0">
                      <StaticMap lat={lat} lng={lng} height="100%" />
                    </div>
                  </div>
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

            <section className="border-b border-primary/10 bg-white px-4 py-5 sm:rounded-2xl sm:border sm:border-primary/20 sm:p-6 sm:shadow-sm overflow-hidden">
              <div className="mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" style={{ color: "#7EA8A4" }} />
                <h2 className="font-serif text-2xl font-bold" style={{ color: "#4A6B67" }}>Contact</h2>
              </div>
              <div className="space-y-3">
                {administrator1 && (
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#4A6B67" }}>Administrator</div>
                    <div className="text-foreground">{administrator1}</div>
                  </div>
                )}
                {administrator2 && (
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#4A6B67" }}>Administrator 2</div>
                    <div className="text-foreground">{administrator2}</div>
                  </div>
                )}
                {administrator3 && (
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#4A6B67" }}>Administrator 3</div>
                    <div className="text-foreground">{administrator3}</div>
                  </div>
                )}
                {email && (
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#4A6B67" }}>Email</div>
                    <a href={`mailto:${email}`} className="text-primary hover:underline">
                      {email}
                    </a>
                  </div>
                )}
                {phone && (
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#4A6B67" }}>Phone</div>
                    <a href={`tel:${phone}`} className="text-primary hover:underline">
                      {phone}
                    </a>
                  </div>
                )}
                {premiumData?.website_url && (
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold" style={{ color: "#4A6B67" }}>Website</div>
                    <a
                      href={premiumData.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline min-w-0 max-w-full"
                    >
                      <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{premiumData.website_url.replace(/^https?:\/\//, "")}</span>
                    </a>
                  </div>
                )}
              </div>

              {premiumData?.hours && (
                <div className="mt-5 border-t border-primary/10 pt-5">
                  <PremiumHoursTable hours={premiumData.hours} />
                </div>
              )}

            </section>

            {premiumData && premiumData.photos.length > 0 && (
              <div className="px-4 py-5 sm:px-0 sm:py-0 lg:col-span-3 overflow-hidden">
                <PremiumPhotoGallery photos={premiumData.photos} daycareName={name} />
              </div>
            )}

          </div>
        </div>
      </section>

      {premiumData?.pricing && (
        <>
          <div className="bg-white" style={{ background: undefined }}>
            <div className="sm:hidden">
              <WaveDivider fill={teal} />
            </div>
            <div className="hidden sm:block" style={{ background: cream }}>
              <WaveDivider fill={teal} />
            </div>
          </div>
          <section className="px-4 py-4 sm:px-6" style={{ background: teal }}>
            <div className="mx-auto max-w-7xl">
              <PremiumPricingTable pricing={premiumData.pricing} variant="dark" />
            </div>
          </section>
          <div style={{ background: teal }}>
            <div className="sm:hidden">
              <WaveDivider fill="#fff" />
            </div>
            <div className="hidden sm:block">
              <WaveDivider fill={cream} />
            </div>
          </div>
        </>
      )}

      <section className={`px-0 pb-8 sm:px-6 ${premiumData?.pricing ? "pt-0" : "pt-4"}`}>
        <div className="mx-auto max-w-7xl overflow-hidden sm:rounded-3xl sm:border sm:p-6 sm:shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
          <div className="grid gap-0 sm:gap-6 lg:grid-cols-3 overflow-hidden">

            {premiumData?.amenities && (
              <div className="border-b border-primary/10 px-4 py-5 sm:border-0 sm:px-0 sm:py-0 lg:col-span-3">
                <PremiumAmenities amenities={premiumData.amenities} />
              </div>
            )}

            <section className="border-b border-primary/10 bg-white px-4 py-5 sm:rounded-2xl sm:border sm:border-primary/20 sm:p-6 sm:shadow-sm lg:col-span-3">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5" style={{ color: "#7EA8A4" }} />
                <h2 className="font-serif text-2xl font-bold" style={{ color: "#4A6B67" }}>Program Details</h2>
              </div>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-bold" style={{ color: "#4A6B67" }}>Program Type</dt>
                  <dd className="mt-1 text-foreground">{programType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-bold" style={{ color: "#4A6B67" }}>Program Number</dt>
                  <dd className="mt-1 font-mono text-sm text-foreground">{programNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-bold" style={{ color: "#4A6B67" }}>Initial License Date</dt>
                  <dd className="mt-1 text-foreground">{initialLicense}</dd>
                </div>
                <div>
                  <dt className="text-sm font-bold" style={{ color: "#4A6B67" }}>License Expiration</dt>
                  <dd className="mt-1 text-foreground">{licenseExpires}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </section>

      {publicJobs.length > 0 && (
        <PublicJobsSection daycareName={name} jobs={publicJobs} />
      )}

      {faqSection}

      {nearbyDaycares.length > 0 && (
        <section className="px-4 py-8 sm:px-6">
          <div className={`mx-auto grid max-w-7xl grid-cols-1 gap-6 ${similarDaycares.length > 0 ? "lg:grid-cols-2" : ""}`}>
            <div className="sm:rounded-3xl sm:border sm:p-6 sm:shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
              <section className="bg-white px-4 py-5 sm:rounded-2xl sm:border sm:border-primary/20 sm:p-6 sm:shadow-sm">
                <h2 className="mb-4 font-serif text-2xl font-bold text-primary">More Daycares Nearby</h2>
                {renderDaycareCards(nearbyDaycares, "nearby")}
              </section>
            </div>

            {similarDaycares.length > 0 && (
              <div className="sm:rounded-3xl sm:border sm:p-6 sm:shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
                <section className="bg-white px-4 py-5 sm:rounded-2xl sm:border sm:border-primary/20 sm:p-6 sm:shadow-sm">
                  <h2 className="mb-4 font-serif text-2xl font-bold text-primary">Similar Daycares</h2>
                  {renderDaycareCards(similarDaycares, "similar")}
                </section>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
