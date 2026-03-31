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
  title: "Contact Ohio Parent Hub",
  description:
    "Contact Ohio Parent Hub with questions, listing feedback, and partnership inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Ohio Parent Hub",
    description: "Contact Ohio Parent Hub with questions, listing feedback, and partnership inquiries.",
    url: "https://ohioparenthub.com/contact",
    siteName: "Ohio Parent Hub",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Contact Ohio Parent Hub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Ohio Parent Hub",
    description: "Contact Ohio Parent Hub with questions, listing feedback, and partnership inquiries.",
    images: ["/og-default.png"],
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
const emailAddress = "info@ohioparenthub.com";

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ background: cream, color: dark }}>
      <section className="relative overflow-hidden px-6 pt-8 pb-12" style={{ background: lightTeal }}>
        <SparkleDecor className="absolute left-[6%] top-10 h-5 w-5 opacity-30" style={{ color: gold }} />
        <SparkleDecor className="absolute right-[10%] top-16 h-4 w-4 opacity-30" style={{ color: pink }} />
        <SparkleDecor className="absolute left-[14%] bottom-10 h-4 w-4 opacity-20" style={{ color: teal }} />

        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full" style={{ background: `${pink}20` }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full" style={{ background: `${gold}20` }} />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Contact", href: "/contact" },
            ]}
            className="mb-6"
          />

          <div className="grid gap-8 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
                Contact Ohio Parent Hub
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
                Questions, listing feedback, or partnership requests are welcome. We review
                every message and prioritize data quality concerns.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium" style={{ color: `${dark}dd` }}>
                <a href={`mailto:${emailAddress}`} className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                  Email us
                </a>
                <Link href="/methodology" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                  View methodology
                </Link>
                <Link href="/about" className="rounded-full border px-3 py-1.5" style={{ borderColor: `${teal}55` }}>
                  About Ohio Parent Hub
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-3 gap-3">
              {[
                { value: "1–3 Days", label: "Response", bg: "#FFFFFF", accent: teal },
                { value: "State Data", label: "Source", bg: lightPink, accent: pink },
                { value: "Review", label: "Workflow", bg: lightGold, accent: gold },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border p-4 shadow-sm" style={{ background: stat.bg, borderColor: `${stat.accent}40` }}>
                  <div className="line-clamp-1 font-serif text-2xl font-bold" style={{ color: stat.accent }}>{stat.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest" style={{ color: `${dark}88` }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="px-6 py-8">
        <div className="mx-auto max-w-7xl rounded-3xl border bg-white p-6 shadow-sm sm:p-8" style={{ borderColor: `${sage}55` }}>
          <section className="rounded-2xl border p-5" style={{ borderColor: `${teal}44`, background: `${teal}0d` }}>
            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: `${dark}aa` }}>
              Email
            </p>
            <a href={`mailto:${emailAddress}`} className="mt-2 inline-block text-lg font-semibold underline" style={{ color: teal }}>
              {emailAddress}
            </a>
            <p className="mt-2 text-sm" style={{ color: `${dark}99` }}>
              Typical response time: 1–3 business days.
            </p>
          </section>

          <section className="mt-6 space-y-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              What to include
            </h2>
            <ul className="space-y-1">
              <li>• Page URL (if reporting listing issues)</li>
              <li>• Program name and city</li>
              <li>• Brief note on what appears incorrect</li>
            </ul>
          </section>

          <section className="mt-6 rounded-2xl border p-5" style={{ borderColor: `${sage}66`, background: `${cream}66` }}>
            <h2 className="text-xl font-semibold" style={{ color: dark }}>
              Important note on official records
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              Licensing status, license type, license dates, and SUTQ ratings are sourced from
              state-published records and are not manually edited on individual listings.
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
              We can review reports, correct display-level issues, and refresh listings after
              source updates, but official record corrections need to be made with the state first.
            </p>
          </section>

          <p className="mt-8 text-sm" style={{ color: `${dark}aa` }}>
            Looking for sourcing and normalization details? See our{" "}
            <Link href="/methodology" className="underline hover:no-underline">
              Methodology
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
