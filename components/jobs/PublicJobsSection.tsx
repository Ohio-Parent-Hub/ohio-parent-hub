import { Button } from "@/components/ui/button";
import { buildJobSlug } from "@/lib/jobUtils";
import type { PublicDaycareJob } from "@/lib/jobTypes";
import { BriefcaseBusiness, ExternalLink } from "lucide-react";
import Link from "next/link";

const teal = "#7EA8A4";
const dark = "#4A6B67";
const sage = "#B8C5B2";
const gold = "#DCB346";

type Props = {
  daycareName: string;
  jobs: PublicDaycareJob[];
};

function descriptionPreview(description: string): string {
  const trimmed = description.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 150) return trimmed;
  return `${trimmed.slice(0, 147)}...`;
}

function jobHref(job: PublicDaycareJob): string {
  return `/daycare/${job.daycare_slug}/jobs/${buildJobSlug(job.id, job.title)}`;
}

export default function PublicJobsSection({ daycareName, jobs }: Props) {
  if (jobs.length === 0) return null;

  return (
    <section id="open-jobs" className="px-4 pb-8 pt-0 sm:px-6">
      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-2xl border bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6"
        style={{ borderColor: `${sage}55` }}
      >
        <div className="mb-5 flex items-center gap-2">
          <BriefcaseBusiness className="h-5 w-5" style={{ color: teal }} />
          <h2 className="font-serif text-2xl font-bold" style={{ color: dark }}>
            Open Jobs at {daycareName}
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
              style={{ borderColor: `${sage}55` }}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-xl font-semibold leading-tight" style={{ color: dark }}>
                  {job.title}
                </h3>
                {job.job_url && (
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                    style={{ background: `${gold}18`, color: dark }}
                  >
                    <ExternalLink className="h-3 w-3" />
                    External link
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-6" style={{ color: `${dark}aa` }}>
                {descriptionPreview(job.description)}
              </p>
              <Button
                asChild
                className="mt-5 h-10 rounded-xl px-5 text-sm font-semibold text-white"
                style={{ backgroundColor: teal }}
              >
                <Link href={jobHref(job)}>View Job</Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
