import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

function SparkleDecor({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9L12 0Z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Privacy Policy | Ohio Parent Hub",
  description:
    "Review how Ohio Parent Hub handles usage analytics, listing data, map and geocoding services, and contact communications.",
  alternates: {
    canonical: "/privacy",
  },
};

const teal = "#7EA8A4";
const pink = "#E8A0AC";
const gold = "#DCB346";
const sage = "#B8C5B2";
const cream = "#F5EDE4";
const dark = "#4A6B67";
const lightTeal = "#D5E5E3";
const lightPink = "#FADED4";
const lightGold = "#F5E9BE";
const updatedAt = "February 26, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: cream, color: dark }}>
      <section className="relative overflow-hidden px-6 pb-12 pt-8" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute left-[6%] top-10 h-5 w-5 opacity-30" style={{ color: gold }} />
        <SparkleDecor className="absolute right-[10%] top-16 h-4 w-4 opacity-30" style={{ color: pink }} />
        <SparkleDecor className="absolute left-[14%] bottom-10 h-4 w-4 opacity-20" style={{ color: teal }} />

        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Privacy", href: "/privacy" },
            ]}
            className="mb-6"
          />

          <div className="grid gap-8 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
                Privacy Policy
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
                This page explains what data Ohio Parent Hub receives, how it is used,
                and where third-party services are involved.
              </p>
              <p className="mt-3 text-sm" style={{ color: `${dark}aa` }}>
                Last updated: {updatedAt}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium" style={{ color: `${dark}dd` }}>
                <Link href="/contact" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                  Contact
                </Link>
                <Link href="/about" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                  About Ohio Parent Hub
                </Link>
                <Link href="/methodology" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                  Methodology
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:col-span-2">
              {[
                { value: "Minimal", label: "Collection", bg: "#FFFFFF", accent: teal },
                { value: "No Accounts", label: "Login Data", bg: lightPink, accent: pink },
                { value: "State-Sourced", label: "Listings", bg: lightGold, accent: gold },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border p-4 shadow-sm"
                  style={{ background: stat.bg, borderColor: `${stat.accent}40` }}
                >
                  <div className="line-clamp-1 font-serif text-2xl font-bold" style={{ color: stat.accent }}>
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest" style={{ color: `${dark}88` }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6 rounded-3xl border bg-white p-6 shadow-sm sm:p-8" style={{ borderColor: `${sage}55` }}>
          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              1) Information we receive
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>• Listing and location data displayed on this site comes from public/state-published records.</li>
              <li>• Google Analytics receives standard usage signals such as pages viewed and interaction events.</li>
              <li>• We store filter/search UI state in your browser session storage to preserve your browsing state while you navigate.</li>
              <li>• If you use location search, your query is sent to our geocoding endpoint and then forwarded to OpenStreetMap Nominatim to resolve coordinates.</li>
              <li>• If you email us, we receive the information you include in your message.</li>
            </ul>
          </section>

          <section className="rounded-2xl border p-5" style={{ borderColor: `${teal}44`, background: `${teal}0d` }}>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              2) How we use information
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>• Provide daycare search, filtering, and map browsing features.</li>
              <li>• Improve usability and understand broad site traffic trends.</li>
              <li>• Review listing concerns and fix display-level issues.</li>
              <li>• Refresh data when source records are updated.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              3) Third-party services
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Ohio Parent Hub uses third-party services for analytics and map/location functionality:
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              <li>• Google Analytics (when configured) for traffic and interaction measurement.</li>
              <li>• CARTO and OpenStreetMap tile services for interactive maps.</li>
              <li>• OpenStreetMap Nominatim for address/location geocoding requests.</li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}aa` }}>
              These providers may process technical request data (for example IP address, user agent,
              and request metadata) according to their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              4) Cookies and browser storage
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              We use browser session storage for temporary filter and map state. This data stays in
              your browser and is generally cleared when the tab/session ends.
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Analytics cookies or similar technologies may be set by Google Analytics.
              You can manage cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              5) Data accuracy and corrections
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Licensing status, license type, license dates, and SUTQ ratings are sourced from
              official records. We do not manually override those official values on individual listings.
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              If you report an issue, we can review it, fix display-level errors where applicable,
              and refresh listings after source updates.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              6) User privacy
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Ohio Parent Hub does not provide account registration or user profiles.
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              We do not provide site forms that request sensitive personal details. If you contact us
              by email, you control what information you include.
            </p>
          </section>

          <section className="border-t pt-6" style={{ borderColor: `${sage}66` }}>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              7) Contact and updates
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Questions about this policy can be sent through our{" "}
              <Link href="/contact" className="underline hover:no-underline">
                Contact page
              </Link>
              .
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}aa` }}>
              We may update this Privacy Policy from time to time. Material changes will be reflected
              by updating the date at the top of this page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
