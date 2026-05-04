import { loadPublishedJobById } from "@/app/actions/jobs";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { buildJobApplyMailto, buildJobSlug, parseJobIdFromSlug } from "@/lib/jobUtils";
import { BriefcaseBusiness, ExternalLink, Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string; jobSlug: string }>;
};

const teal = "#7EA8A4";
const dark = "#4A6B67";
const cream = "#F5EDE4";
const gold = "#DCB346";
const lightTeal = "#D5E5E3";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://ohioparenthub.com").replace(/\/$/, "");
}

function jobLocation(job: {
  city: string | null;
  county: string | null;
  state: string | null;
}) {
  if (job.city && job.county) return `${job.city}, ${job.county} County`;
  return job.city ?? job.county ?? "Ohio";
}

function canonicalPath(daycareSlug: string, jobId: string, title: string) {
  return `/daycare/${daycareSlug}/jobs/${buildJobSlug(jobId, title)}`;
}

function trimForMeta(text: string, maxLength = 155) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= maxLength) return clean;
  const trimmed = clean.slice(0, maxLength - 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > 90 ? lastSpace : maxLength - 1)}...`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { jobSlug } = await params;
  const jobId = parseJobIdFromSlug(jobSlug);

  if (!jobId) {
    return {
      title: "Job Not Found | Ohio Parent Hub",
      robots: { index: false, follow: false },
    };
  }

  const job = await loadPublishedJobById(jobId);
  if (!job) {
    return {
      title: "Job Not Found | Ohio Parent Hub",
      robots: { index: false, follow: false },
    };
  }

  const location = job.city ? `${job.city}, Ohio` : "Ohio";
  const description = trimForMeta(
    `Apply for ${job.title} at ${job.daycare_name} in ${location}. View the daycare job description and apply by email.`,
  );
  const path = canonicalPath(job.daycare_slug, job.id, job.title);

  return {
    title: `${job.title} at ${job.daycare_name} | Ohio Parent Hub`,
    description,
    alternates: {
      canonical: `${siteUrl()}${path}`,
    },
    openGraph: {
      title: `${job.title} at ${job.daycare_name}`,
      description,
      url: `${siteUrl()}${path}`,
      type: "article",
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug, jobSlug } = await params;
  const jobId = parseJobIdFromSlug(jobSlug);

  if (!jobId) notFound();

  const job = await loadPublishedJobById(jobId);
  if (!job) notFound();

  const path = canonicalPath(job.daycare_slug, job.id, job.title);
  if (slug !== job.daycare_slug || jobSlug !== buildJobSlug(job.id, job.title)) {
    permanentRedirect(path);
  }

  const fullUrl = `${siteUrl()}${path}`;
  const mailto = buildJobApplyMailto(job.application_email, job.daycare_name, job.title);
  const location = jobLocation(job);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.created_at,
    hiringOrganization: {
      "@type": "Organization",
      name: job.daycare_name,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: job.street_address ?? undefined,
        addressLocality: job.city ?? undefined,
        addressRegion: job.state ?? "OH",
        postalCode: job.zip_code ?? undefined,
        addressCountry: "US",
      },
    },
    url: fullUrl,
  };

  return (
    <main className="min-h-screen" style={{ background: cream, color: dark }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative overflow-hidden px-4 pt-6 pb-10 sm:px-6" style={{ background: lightTeal }}>
        <div className="mx-auto max-w-4xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Jobs", href: "/jobs" },
              { label: job.daycare_name, href: `/daycare/${job.daycare_slug}` },
              { label: job.title, href: path },
            ]}
            className="mb-6"
          />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white"
              style={{ color: dark }}
            >
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold" style={{ color: `${dark}cc` }}>
                {job.daycare_name}
              </p>
              <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
                {job.title}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-sm" style={{ color: `${dark}aa` }}>
                <MapPin className="h-4 w-4" />
                {location}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8" style={{ borderColor: "#B8C5B255" }}>
            <h2 className="font-serif text-2xl font-semibold" style={{ color: dark }}>
              Job Description
            </h2>
            <div className="mt-5 whitespace-pre-wrap text-sm leading-7" style={{ color: `${dark}dd` }}>
              {job.description}
            </div>

            {job.job_url && (
              <div className="mt-8 rounded-xl border p-4" style={{ borderColor: "#B8C5B255", background: "#FAFAF8" }}>
                <p className="text-sm font-semibold" style={{ color: dark }}>
                  Full job description
                </p>
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium hover:underline"
                  style={{ color: teal }}
                >
                  Open external job link
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </article>

          <aside className="space-y-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: "#B8C5B255" }}>
              <h2 className="font-serif text-xl font-semibold" style={{ color: dark }}>
                Apply by Email
              </h2>
              <p className="mt-3 text-sm" style={{ color: `${dark}aa` }}>
                Applications for this role go to:
              </p>
              <p className="mt-2 break-words text-sm font-semibold" style={{ color: dark }}>
                {job.application_email}
              </p>
              <Button
                asChild
                className="mt-5 h-11 w-full rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: teal }}
              >
                <a href={mailto}>
                  <Mail className="h-4 w-4" />
                  Apply Now
                </a>
              </Button>
            </div>

            <div className="rounded-2xl border bg-white p-5 text-sm shadow-sm" style={{ borderColor: "#B8C5B255", color: `${dark}aa` }}>
              <p className="font-semibold" style={{ color: dark }}>
                More from Ohio Parent Hub
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Link href={`/daycare/${job.daycare_slug}`} className="font-medium hover:underline" style={{ color: teal }}>
                  View daycare page
                </Link>
                <Link href="/jobs" className="font-medium hover:underline" style={{ color: teal }}>
                  Back to all jobs
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border p-5 text-sm" style={{ borderColor: `${gold}55`, background: `${gold}16`, color: `${dark}cc` }}>
              Contact the provider directly to confirm role details and hiring timelines.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
