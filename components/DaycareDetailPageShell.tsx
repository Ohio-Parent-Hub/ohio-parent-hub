"use client";

import type { ReactNode } from "react";
import type { PremiumListingData } from "@/lib/premiumTypes";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SutqBadge } from "@/components/SutqBadge";
import StaticMap from "@/components/StaticMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BackToResultsButton from "@/components/BackToResultsButton";
import VerifiedProviderBadge from "@/components/premium/VerifiedProviderBadge";
import PremiumPhotoGallery from "@/components/premium/PremiumPhotoGallery";
import PremiumHoursTable from "@/components/premium/PremiumHoursTable";
import PremiumPricingTable from "@/components/premium/PremiumPricingTable";
import PremiumAmenities from "@/components/premium/PremiumAmenities";
import PremiumOwnerDescription from "@/components/premium/PremiumOwnerDescription";
import ClaimListingDialog from "@/components/premium/ClaimListingDialog";
import Link from "next/link";
import TrackedUplinkLink from "@/components/TrackedUplinkLink";
import { ChevronDown, ExternalLink, Globe, Star } from "lucide-react";
import { useState } from "react";

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
};

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const lightTeal = "#D5E5E3";

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
        "Meets Gold and Silver requirements.",
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
      "The program may still be state licensed even when SUTQ is not displayed.",
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
}: DaycareDetailPageShellProps) {
  const [isSutqDetailsOpen, setIsSutqDetailsOpen] = useState(false);
  const [isAboutOpenMobile, setIsAboutOpenMobile] = useState(false);
  const [isQuestionsOpenMobile, setIsQuestionsOpenMobile] = useState(false);
  const [isCompareOpenMobile, setIsCompareOpenMobile] = useState(false);
  const sutqDetails = getSutqDetails(sutq);

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
            <BackToResultsButton fallbackHref={backHref} label={backLabel} trackingContext={uplinkContext} />

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

          <header className="rounded-2xl border p-6 sm:p-8" style={{ background: "#fff", borderColor: `${sage}55` }}>
            {premiumData ? (
              <div className="mb-4">
                <VerifiedProviderBadge />
              </div>
            ) : (
              <Badge variant="outline" className="mb-4" style={{ borderColor: `${teal}55`, color: dark }}>
                {programType}
              </Badge>
            )}
            {premiumData?.logo_url ? (
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
                  <p className="mt-2 text-muted-foreground">{programType} · {city}, Ohio</p>
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: dark }}>
                  {name}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {premiumData ? `${programType} · ` : ""}{city}, Ohio
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
        </div>
      </section>

      <section className="px-6 pt-6 pb-2">
        <div className="mx-auto max-w-7xl md:hidden">
          <div className="rounded-2xl border p-4 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
            <h2 className="font-serif text-base font-semibold" style={{ color: dark }}>
              Parent guidance for this listing
            </h2>

            <div className="mt-2 border-t" style={{ borderColor: `${sage}55` }}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-2.5 text-left"
                aria-expanded={isAboutOpenMobile}
                aria-controls="daycare-editorial-about-mobile"
                aria-label="Toggle how to read this listing"
                onClick={() => setIsAboutOpenMobile((current) => !current)}
              >
                <span className="text-sm font-semibold" style={{ color: dark }}>How to read this listing</span>
                <span className={`text-base leading-none transition-transform ${isAboutOpenMobile ? "rotate-180" : "rotate-0"}`} style={{ color: teal }} aria-hidden="true">▾</span>
              </button>
              <p
                id="daycare-editorial-about-mobile"
                className={`pb-3 text-sm leading-relaxed ${isAboutOpenMobile ? "block" : "hidden"}`}
                style={{ color: `${dark}cc` }}
              >
                Start with SUTQ status and program type, then check license dates and contact details before deciding who to call first.
              </p>
            </div>

            <div className="border-t" style={{ borderColor: `${sage}55` }}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-2.5 text-left"
                aria-expanded={isQuestionsOpenMobile}
                aria-controls="daycare-editorial-questions-mobile"
                aria-label="Toggle what to ask first"
                onClick={() => setIsQuestionsOpenMobile((current) => !current)}
              >
                <span className="text-sm font-semibold" style={{ color: dark }}>What to ask first</span>
                <span className={`text-base leading-none transition-transform ${isQuestionsOpenMobile ? "rotate-180" : "rotate-0"}`} style={{ color: teal }} aria-hidden="true">▾</span>
              </button>
              <p
                id="daycare-editorial-questions-mobile"
                className={`text-sm leading-relaxed ${isQuestionsOpenMobile ? "block" : "hidden"}`}
                style={{ color: `${dark}cc` }}
              >
                Ask about current openings for your child’s age, daily schedule fit, and how families receive updates.
              </p>
              <p
                className={`pb-3 pt-2 text-xs leading-relaxed ${isQuestionsOpenMobile ? "block" : "hidden"}`}
                style={{ color: `${dark}99` }}
              >
                If this listing looks promising, call now and verify current availability.
              </p>
            </div>

            <div className="border-t" style={{ borderColor: `${sage}55` }}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-2.5 text-left"
                aria-expanded={isCompareOpenMobile}
                aria-controls="daycare-editorial-compare-mobile"
                aria-label="Toggle how to compare options"
                onClick={() => setIsCompareOpenMobile((current) => !current)}
              >
                <span className="text-sm font-semibold" style={{ color: dark }}>How to compare options</span>
                <span className={`text-base leading-none transition-transform ${isCompareOpenMobile ? "rotate-180" : "rotate-0"}`} style={{ color: teal }} aria-hidden="true">▾</span>
              </button>
              <p
                id="daycare-editorial-compare-mobile"
                className={`text-sm leading-relaxed ${isCompareOpenMobile ? "block" : "hidden"}`}
                style={{ color: `${dark}cc` }}
              >
                Compare this listing with nearby and similar programs before final decisions.
              </p>
              <p
                className={`pb-3 pt-2 text-xs leading-relaxed ${isCompareOpenMobile ? "block" : "hidden"}`}
                style={{ color: `${dark}99` }}
              >
                A quick 2–3 program comparison usually makes the best fit clearer.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto hidden max-w-7xl gap-4 md:grid md:grid-cols-3">
          <article className="rounded-2xl border p-5 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
            <h2 className="font-serif text-lg font-semibold" style={{ color: dark }}>
              How to read this listing
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
              Start with SUTQ status and program type, then check license dates and contact details before deciding who to call first.
            </p>
          </article>

          <article className="rounded-2xl border p-5 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
            <h2 className="font-serif text-lg font-semibold" style={{ color: dark }}>
              What to ask first
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
              Ask about current openings for your child’s age, daily schedule fit, and how families receive updates.
            </p>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: `${dark}99` }}>
              If this listing looks promising, call now and verify current availability.
            </p>
          </article>

          <article className="rounded-2xl border p-5 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
            <h2 className="font-serif text-lg font-semibold" style={{ color: dark }}>
              How to compare options
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
              Compare this listing with nearby and similar programs before final decisions.
            </p>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: `${dark}99` }}>
              A quick 2–3 program comparison usually makes the best fit clearer.
            </p>
          </article>
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
                {premiumData?.website_url && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Website</div>
                    <a
                      href={premiumData.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {premiumData.website_url.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>

              {!isClaimed && (
                <ClaimListingDialog
                  programNumber={programNumber}
                  daycareName={name}
                />
              )}
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

      {premiumData && (
        <section className="px-6 py-8">
          <div className="mx-auto max-w-7xl rounded-3xl border p-4 sm:p-6 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
            <h2 className="mb-6 font-serif text-2xl font-bold" style={{ color: dark }}>
              Direct from Provider
            </h2>

            {premiumData.photos.length > 0 && (
              <PremiumPhotoGallery photos={premiumData.photos} daycareName={name} />
            )}

            {premiumData.hours && <PremiumHoursTable hours={premiumData.hours} />}

            {premiumData.pricing && <PremiumPricingTable pricing={premiumData.pricing} />}

            {premiumData.amenities && <PremiumAmenities amenities={premiumData.amenities} />}
          </div>
        </section>
      )}

      {premiumData?.description && (
        <PremiumOwnerDescription description={premiumData.description} />
      )}

      {faqSection}

      {nearbyDaycares.length > 0 && (
        <section className="px-6 py-8">
          <div className={`mx-auto grid max-w-7xl grid-cols-1 gap-6 ${similarDaycares.length > 0 ? "lg:grid-cols-2" : ""}`}>
            <div className="rounded-3xl border p-4 sm:p-6 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
              <section className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-serif text-2xl font-bold text-primary">More Daycares Nearby</h2>
                {renderDaycareCards(nearbyDaycares, "nearby")}
              </section>
            </div>

            {similarDaycares.length > 0 && (
              <div className="rounded-3xl border p-4 sm:p-6 shadow-sm" style={{ background: "#fff", borderColor: `${sage}55` }}>
                <section className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm">
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