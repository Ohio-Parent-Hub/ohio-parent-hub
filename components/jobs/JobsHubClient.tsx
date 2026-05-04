"use client";

import { createJob, deleteJob, updateJob, type JobInput } from "@/app/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApplicationEmailMode, DaycareJob } from "@/lib/jobTypes";
import { BriefcaseBusiness, ExternalLink, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

const teal = "#7EA8A4";
const dark = "#4A6B67";
const cream = "#F5EDE4";
const gold = "#DCB346";

type Props = {
  accountEmail: string;
  daycareName: string;
  initialJobs: DaycareJob[];
};

type FormState = {
  title: string;
  description: string;
  jobUrl: string;
  applicationEmailMode: ApplicationEmailMode;
  applicationEmailCustom: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  jobUrl: "",
  applicationEmailMode: "default",
  applicationEmailCustom: "",
};

function toInput(form: FormState): JobInput {
  return {
    title: form.title,
    description: form.description,
    job_url: form.jobUrl,
    application_email_mode: form.applicationEmailMode,
    application_email_custom: form.applicationEmailCustom,
  };
}

function descriptionPreview(description: string): string {
  const trimmed = description.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 150) return trimmed;
  return `${trimmed.slice(0, 147)}...`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formFromJob(job: DaycareJob): FormState {
  return {
    title: job.title,
    description: job.description,
    jobUrl: job.job_url ?? "",
    applicationEmailMode: job.application_email_mode,
    applicationEmailCustom: job.application_email_custom ?? "",
  };
}

export default function JobsHubClient({
  accountEmail,
  daycareName,
  initialJobs,
}: Props) {
  const router = useRouter();
  const [jobs, setJobs] = useState<DaycareJob[]>(initialJobs);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const editingJob = useMemo(
    () => jobs.find((job) => job.id === editingJobId) ?? null,
    [editingJobId, jobs],
  );

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingJobId(null);
    setError(null);
  }

  function startEditing(job: DaycareJob) {
    setEditingJobId(job.id);
    setForm(formFromJob(job));
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const result = editingJobId
      ? await updateJob(editingJobId, toInput(form))
      : await createJob(toInput(form));

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const savedJob = result.job;
    if (savedJob) {
      setJobs((current) => {
        if (editingJobId) {
          return current.map((job) => (job.id === savedJob.id ? savedJob : job));
        }

        return [savedJob, ...current];
      });
    }

    resetForm();
    router.refresh();
  }

  async function handleDelete(job: DaycareJob) {
    const confirmed = window.confirm(`Delete "${job.title}"?`);
    if (!confirmed) return;

    setDeletingJobId(job.id);
    setError(null);
    const result = await deleteJob(job.id);
    setDeletingJobId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setJobs((current) => current.filter((currentJob) => currentJob.id !== job.id));
    if (editingJobId === job.id) resetForm();
    router.refresh();
  }

  return (
    <div className="min-h-screen" style={{ background: cream }}>
      <section className="relative overflow-hidden px-6 pt-8 pb-10" style={{ background: "#D5E5E3" }}>
        <div className="relative z-10 mx-auto max-w-3xl">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: dark }}
          >
            Return to Dashboard
          </Link>
          <div className="flex items-start gap-4">
            <div
              className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "#FFFFFF", color: dark }}
            >
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: dark }}>
                Jobs Hub
              </h1>
              <p className="mt-2 text-sm font-semibold" style={{ color: `${dark}dd` }}>
                {daycareName}
              </p>
              <p className="text-xs" style={{ color: `${dark}88` }}>
                {accountEmail}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: `${dark}bb` }}>
                Post open child care roles for job seekers browsing Ohio Parent Hub.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="px-6 py-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <section
            className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
            style={{ borderColor: "#B8C5B255" }}
          >
            <div className="mb-5">
              <h2 className="font-serif text-xl font-semibold" style={{ color: dark }}>
                {editingJob ? "Edit Job" : "Create Job"}
              </h2>
              <p className="mt-1 text-sm" style={{ color: `${dark}99` }}>
                Jobs publish when you submit this form.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "#F59E0B55", background: "#FFFBEB", color: "#92400E" }}>
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="job-title" style={{ color: dark }}>Position title</Label>
                <Input
                  id="job-title"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  maxLength={120}
                  required
                  style={{ borderColor: "#B8C5B2", color: dark }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-description" style={{ color: dark }}>Job description</Label>
                <textarea
                  id="job-description"
                  value={form.description}
                  onChange={(event) => updateForm("description", event.target.value)}
                  maxLength={5000}
                  required
                  rows={9}
                  className="w-full rounded-lg border p-3 text-sm shadow-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: "#B8C5B2", color: dark }}
                />
                <p className="text-right text-xs" style={{ color: `${dark}88` }}>
                  {form.description.length} / 5,000
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-url" style={{ color: dark }}>Optional job description URL</Label>
                <Input
                  id="job-url"
                  type="url"
                  value={form.jobUrl}
                  onChange={(event) => updateForm("jobUrl", event.target.value)}
                  placeholder="https://"
                  style={{ borderColor: "#B8C5B2", color: dark }}
                />
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium" style={{ color: dark }}>
                  Application email
                </legend>
                <label className="flex items-start gap-3 rounded-xl border p-3 text-sm" style={{ borderColor: "#B8C5B255", color: dark }}>
                  <input
                    type="radio"
                    name="application-email-mode"
                    checked={form.applicationEmailMode === "default"}
                    onChange={() => updateForm("applicationEmailMode", "default")}
                    className="mt-1"
                  />
                  <span>Use account email: {accountEmail}</span>
                </label>
                <label className="flex items-start gap-3 rounded-xl border p-3 text-sm" style={{ borderColor: "#B8C5B255", color: dark }}>
                  <input
                    type="radio"
                    name="application-email-mode"
                    checked={form.applicationEmailMode === "custom"}
                    onChange={() => updateForm("applicationEmailMode", "custom")}
                    className="mt-1"
                  />
                  <span>Use a different hiring email</span>
                </label>
              </fieldset>

              {form.applicationEmailMode === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-email" style={{ color: dark }}>Custom hiring email</Label>
                  <Input
                    id="custom-email"
                    type="email"
                    value={form.applicationEmailCustom}
                    onChange={(event) => updateForm("applicationEmailCustom", event.target.value)}
                    required
                    style={{ borderColor: "#B8C5B2", color: dark }}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-11 rounded-xl px-5 text-sm font-semibold text-white"
                  style={{ backgroundColor: teal }}
                >
                  {saving ? "Saving..." : editingJob ? "Save Changes" : "Publish Job"}
                </Button>
                {editingJob && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={resetForm}
                    className="h-11 rounded-xl"
                    style={{ borderColor: "#B8C5B2", color: dark }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="font-serif text-xl font-semibold" style={{ color: dark }}>
                Open Jobs
              </h2>
              <p className="mt-1 text-sm" style={{ color: `${dark}99` }}>
                {jobs.length === 1 ? "1 published role" : `${jobs.length} published roles`}
              </p>
            </div>

            {jobs.length === 0 ? (
              <div className="rounded-2xl border bg-white p-5 text-sm shadow-sm" style={{ borderColor: "#B8C5B255", color: `${dark}aa` }}>
                No jobs posted yet.
              </div>
            ) : (
              jobs.map((job) => {
                const emailDestination =
                  job.application_email_mode === "custom"
                    ? job.application_email_custom ?? "Custom email"
                    : accountEmail;

                return (
                  <article
                    key={job.id}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                    style={{ borderColor: "#B8C5B255" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-lg font-semibold" style={{ color: dark }}>
                          {job.title}
                        </h3>
                        {job.created_at && (
                          <p className="mt-1 text-xs" style={{ color: `${dark}88` }}>
                            Posted {formatDate(job.created_at)}
                          </p>
                        )}
                      </div>
                      {job.job_url && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium" style={{ background: `${gold}18`, color: dark }}>
                          <ExternalLink className="h-3 w-3" />
                          URL
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: `${dark}aa` }}>
                      {descriptionPreview(job.description)}
                    </p>
                    <p className="mt-3 text-xs" style={{ color: `${dark}88` }}>
                      Applications: {emailDestination}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(job)}
                        style={{ borderColor: "#B8C5B2", color: dark }}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={deletingJobId === job.id}
                        onClick={() => handleDelete(job)}
                        style={{ borderColor: "#FCA5A5", color: "#B91C1C" }}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingJobId === job.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
