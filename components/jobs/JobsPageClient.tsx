"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildJobSlug } from "@/lib/jobUtils";
import type { PublicDaycareJob } from "@/lib/jobTypes";
import { BriefcaseBusiness, ExternalLink, MapPin, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const teal = "#7EA8A4";
const dark = "#4A6B67";
const cream = "#F5EDE4";
const gold = "#DCB346";
const lightTeal = "#D5E5E3";

type Props = {
  jobs: PublicDaycareJob[];
};

function normalize(value: string | null): string {
  return (value ?? "").trim();
}

function descriptionPreview(description: string): string {
  const trimmed = description.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 180) return trimmed;
  return `${trimmed.slice(0, 177)}...`;
}

function sortedUnique(values: Array<string | null>): string[] {
  return Array.from(new Set(values.map(normalize).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function jobHref(job: PublicDaycareJob): string {
  return `/daycare/${job.daycare_slug}/jobs/${buildJobSlug(job.id, job.title)}`;
}

function locationLabel(job: PublicDaycareJob): string {
  if (job.city && job.county) return `${job.city}, ${job.county} County`;
  return job.city ?? job.county ?? "Ohio";
}

export default function JobsPageClient({ jobs }: Props) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");

  const cityOptions = useMemo(() => sortedUnique(jobs.map((job) => job.city)), [jobs]);
  const countyOptions = useMemo(() => sortedUnique(jobs.map((job) => job.county)), [jobs]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery =
        !q ||
        [
          job.title,
          job.daycare_name,
          job.city ?? "",
          job.county ?? "",
        ].some((value) => value.toLowerCase().includes(q));
      const matchesCity = !city || job.city === city;
      const matchesCounty = !county || job.county === county;

      return matchesQuery && matchesCity && matchesCounty;
    });
  }, [city, county, jobs, query]);

  const hasFilters = !!query || !!city || !!county;

  function clearFilters() {
    setQuery("");
    setCity("");
    setCounty("");
  }

  return (
    <main className="min-h-screen" style={{ background: cream, color: dark }}>
      <section className="relative overflow-hidden px-6 pt-8 pb-12" style={{ background: lightTeal }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold"
                style={{ borderColor: `${teal}40`, color: dark }}
              >
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                Licensed child care providers
              </div>
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: dark }}>
                Ohio Daycare Jobs
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: `${dark}bb` }}>
                Find open roles at licensed child care providers across Ohio.
              </p>
            </div>
            <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm" style={{ borderColor: `${teal}40` }}>
              <p className="font-serif text-3xl font-bold" style={{ color: teal }}>
                {jobs.length}
              </p>
              <p className="text-xs uppercase tracking-widest" style={{ color: `${dark}88` }}>
                Published jobs
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: "#B8C5B255" }}>
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: `${dark}88` }} />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, daycare, city, or county"
                  className="h-11 pl-9"
                  style={{ borderColor: "#B8C5B2", color: dark }}
                />
              </div>

              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="h-11 rounded-md border bg-white px-3 text-sm shadow-sm"
                style={{ borderColor: "#B8C5B2", color: dark }}
                aria-label="Filter by city"
              >
                <option value="">All cities</option>
                {cityOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <select
                value={county}
                onChange={(event) => setCounty(event.target.value)}
                className="h-11 rounded-md border bg-white px-3 text-sm shadow-sm"
                style={{ borderColor: "#B8C5B2", color: dark }}
                aria-label="Filter by county"
              >
                <option value="">All counties</option>
                {countyOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="h-11 rounded-xl"
                style={{ borderColor: "#B8C5B2", color: dark }}
              >
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            </div>
          </div>

          {jobs.length === 0 ? (
            <EmptyState
              title="No daycare jobs posted yet"
              copy="Check back soon for open roles from Ohio child care providers."
            />
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              title="No jobs match your filters"
              copy="Try clearing your search or choosing a different city or county."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredJobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                  style={{ borderColor: "#B8C5B255" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-xl font-semibold leading-tight" style={{ color: dark }}>
                        {job.title}
                      </h2>
                      <p className="mt-2 text-sm font-medium" style={{ color: teal }}>
                        {job.daycare_name}
                      </p>
                    </div>
                    {job.job_url && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium" style={{ background: `${gold}18`, color: dark }}>
                        <ExternalLink className="h-3 w-3" />
                        External link
                      </span>
                    )}
                  </div>

                  <p className="mt-3 flex items-center gap-2 text-sm" style={{ color: `${dark}88` }}>
                    <MapPin className="h-4 w-4" />
                    {locationLabel(job)}
                  </p>

                  <p className="mt-4 text-sm leading-6" style={{ color: `${dark}aa` }}>
                    {descriptionPreview(job.description)}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button
                      asChild
                      className="h-10 rounded-xl px-5 text-sm font-semibold text-white"
                      style={{ backgroundColor: teal }}
                    >
                      <Link href={jobHref(job)}>View Job</Link>
                    </Button>
                    <Link
                      href={`/daycare/${job.daycare_slug}`}
                      className="text-sm font-medium hover:underline"
                      style={{ color: dark }}
                    >
                      View daycare
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-2xl border bg-white px-6 py-12 text-center shadow-sm" style={{ borderColor: "#B8C5B255" }}>
      <h2 className="font-serif text-2xl font-semibold" style={{ color: dark }}>
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: `${dark}99` }}>
        {copy}
      </p>
    </div>
  );
}
