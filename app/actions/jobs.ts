"use server";

import daycares from "@/data/daycares.json";
import {
  resolveApplicationEmail,
  validateApplicationEmail,
  validateApplicationEmailMode,
  validateJobDescription,
  validateJobTitle,
  validateOptionalJobUrl,
} from "@/lib/jobUtils";
import type {
  ApplicationEmailMode,
  DaycareJob,
  JobSummaryByProgramNumber,
  PublicDaycareJob,
  PublicDaycareJobDetail,
} from "@/lib/jobTypes";
import { resolveCanonicalCitySlugFromName } from "@/lib/metroAreas";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

type DaycareRow = Record<string, unknown>;

export type JobInput = {
  title: string;
  description: string;
  job_url?: string | null;
  application_email_mode: ApplicationEmailMode;
  application_email_custom?: string | null;
};

type OwnerJobProfile = {
  email: string;
  program_number: string;
  daycare_name: string;
};

type OwnerJobsResult =
  | {
      success: true;
      jobs: DaycareJob[];
      profile: OwnerJobProfile;
    }
  | { success: false; error: string };

type JobMutationResult =
  | { success: true; job?: DaycareJob }
  | { success: false; error: string };

type DeleteJobResult = { success: true } | { success: false; error: string };

type OwnerContext = {
  userId: string;
  email: string;
  programNumber: string;
  subscriptionStatus: string;
};

type JobRow = DaycareJob;

const daycareRows = daycares as DaycareRow[];

function field(row: DaycareRow, key: string): string {
  const value = row[key];
  return value == null ? "" : String(value);
}

function nullableField(row: DaycareRow, key: string): string | null {
  const value = field(row, key).trim();
  return value || null;
}

function nullableNumberField(row: DaycareRow, key: string): number | null {
  const value = Number(row[key]);
  return Number.isFinite(value) ? value : null;
}

function findDaycareByProgramNumber(programNumber: string): DaycareRow | null {
  return (
    daycareRows.find((row) => field(row, "PROGRAM NUMBER") === programNumber) ??
    null
  );
}

function buildDaycareSlug(daycare: DaycareRow): string {
  const programNumber = field(daycare, "PROGRAM NUMBER");
  const name = field(daycare, "PROGRAM NAME");
  const citySlug = resolveCanonicalCitySlugFromName(field(daycare, "CITY"));
  return `${programNumber}-${slugify(name)}-${citySlug}`;
}

function getDaycareName(programNumber: string): string {
  const daycare = findDaycareByProgramNumber(programNumber);
  return nullableField(daycare ?? {}, "PROGRAM NAME") ?? "Your Daycare";
}

function isPremiumStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "past_due";
}

function validateJobInput(input: JobInput): string | null {
  return (
    validateJobTitle(input.title) ??
    validateJobDescription(input.description) ??
    validateOptionalJobUrl(input.job_url) ??
    validateApplicationEmailMode(input.application_email_mode) ??
    (input.application_email_mode === "custom"
      ? validateApplicationEmail(input.application_email_custom)
      : null)
  );
}

function normalizeJobInput(input: JobInput) {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    job_url: input.job_url?.trim() || null,
    application_email_mode: input.application_email_mode,
    application_email_custom:
      input.application_email_mode === "custom"
        ? input.application_email_custom?.trim() || null
        : null,
    published: true,
  };
}

async function loadOwnerContext(): Promise<
  { success: true; context: OwnerContext } | { success: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email, program_number, subscription_status")
    .eq("id", user.id)
    .single();

  if (error || !profile) return { success: false, error: "Profile not found" };

  if (!isPremiumStatus(profile.subscription_status)) {
    return { success: false, error: "Premium subscription required" };
  }

  return {
    success: true,
    context: {
      userId: user.id,
      email: profile.email,
      programNumber: profile.program_number,
      subscriptionStatus: profile.subscription_status,
    },
  };
}

function toPublicJob(
  job: JobRow,
  daycare: DaycareRow,
  profileEmail: string,
): PublicDaycareJob {
  return {
    id: job.id,
    program_number: job.program_number,
    title: job.title,
    description: job.description,
    job_url: job.job_url,
    application_email: resolveApplicationEmail(job, profileEmail),
    daycare_name: field(daycare, "PROGRAM NAME"),
    daycare_slug: buildDaycareSlug(daycare),
    city: nullableField(daycare, "CITY"),
    county: nullableField(daycare, "COUNTY"),
    created_at: job.created_at,
  };
}

function toPublicJobDetail(
  job: JobRow,
  daycare: DaycareRow,
  profileEmail: string,
): PublicDaycareJobDetail {
  return {
    ...toPublicJob(job, daycare, profileEmail),
    street_address: nullableField(daycare, "STREET ADDRESS"),
    state: nullableField(daycare, "STATE"),
    zip_code: nullableField(daycare, "ZIP CODE"),
    phone: nullableField(daycare, "PHONE"),
    latitude: nullableNumberField(daycare, "LAT"),
    longitude: nullableNumberField(daycare, "LNG"),
  };
}

async function loadProfileEmails(
  programNumbers: string[],
): Promise<Record<string, string>> {
  const uniqueProgramNumbers = Array.from(new Set(programNumbers)).filter(Boolean);
  if (uniqueProgramNumbers.length === 0) return {};

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("program_number, email")
    .in("program_number", uniqueProgramNumbers);

  if (error || !data) return {};

  const emails: Record<string, string> = {};
  for (const profile of data) {
    emails[profile.program_number] = profile.email;
  }

  return emails;
}

export async function loadOwnerJobs(): Promise<OwnerJobsResult> {
  const owner = await loadOwnerContext();
  if (!owner.success) return owner;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daycare_jobs")
    .select("*")
    .eq("program_number", owner.context.programNumber)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    jobs: (data ?? []) as DaycareJob[],
    profile: {
      email: owner.context.email,
      program_number: owner.context.programNumber,
      daycare_name: getDaycareName(owner.context.programNumber),
    },
  };
}

export async function createJob(input: JobInput): Promise<JobMutationResult> {
  const owner = await loadOwnerContext();
  if (!owner.success) return owner;

  const validationError = validateJobInput(input);
  if (validationError) return { success: false, error: validationError };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daycare_jobs")
    .insert({
      ...normalizeJobInput(input),
      program_number: owner.context.programNumber,
    })
    .select("*")
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, job: data as DaycareJob };
}

export async function updateJob(
  jobId: string,
  input: JobInput,
): Promise<JobMutationResult> {
  const owner = await loadOwnerContext();
  if (!owner.success) return owner;

  const validationError = validateJobInput(input);
  if (validationError) return { success: false, error: validationError };

  const supabase = await createClient();
  const { data: existingJob, error: loadError } = await supabase
    .from("daycare_jobs")
    .select("id, program_number")
    .eq("id", jobId)
    .single();

  if (loadError || !existingJob) return { success: false, error: "Job not found" };

  if (existingJob.program_number !== owner.context.programNumber) {
    return { success: false, error: "Not authorized for this job" };
  }

  const { data, error } = await supabase
    .from("daycare_jobs")
    .update(normalizeJobInput(input))
    .eq("id", jobId)
    .eq("program_number", owner.context.programNumber)
    .select("*")
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, job: data as DaycareJob };
}

export async function deleteJob(jobId: string): Promise<DeleteJobResult> {
  const owner = await loadOwnerContext();
  if (!owner.success) return owner;

  const supabase = await createClient();
  const { data: existingJob, error: loadError } = await supabase
    .from("daycare_jobs")
    .select("id, program_number")
    .eq("id", jobId)
    .single();

  if (loadError || !existingJob) return { success: false, error: "Job not found" };

  if (existingJob.program_number !== owner.context.programNumber) {
    return { success: false, error: "Not authorized for this job" };
  }

  const { error } = await supabase
    .from("daycare_jobs")
    .delete()
    .eq("id", jobId)
    .eq("program_number", owner.context.programNumber);

  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function loadPublishedJobsForProgram(
  programNumber: string,
): Promise<PublicDaycareJob[]> {
  const daycare = findDaycareByProgramNumber(programNumber);
  if (!daycare) return [];

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("daycare_jobs")
    .select("*")
    .eq("program_number", programNumber)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const profileEmails = await loadProfileEmails([programNumber]);
  const profileEmail = profileEmails[programNumber] ?? "";

  return (data as DaycareJob[]).map((job) => toPublicJob(job, daycare, profileEmail));
}

export async function loadAllPublishedJobs(): Promise<PublicDaycareJob[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("daycare_jobs")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const jobs = data as DaycareJob[];
  const profileEmails = await loadProfileEmails(
    jobs.map((job) => job.program_number),
  );
  const publicJobs: PublicDaycareJob[] = [];

  for (const job of jobs) {
    const daycare = findDaycareByProgramNumber(job.program_number);
    if (!daycare) continue;

    publicJobs.push(
      toPublicJob(job, daycare, profileEmails[job.program_number] ?? ""),
    );
  }

  return publicJobs;
}

export async function loadPublishedJobById(
  jobId: string,
): Promise<PublicDaycareJobDetail | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("daycare_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;

  const job = data as DaycareJob;
  const daycare = findDaycareByProgramNumber(job.program_number);
  if (!daycare) return null;

  const profileEmails = await loadProfileEmails([job.program_number]);
  return toPublicJobDetail(job, daycare, profileEmails[job.program_number] ?? "");
}

export async function loadHiringSummaries(): Promise<JobSummaryByProgramNumber> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("daycare_jobs")
    .select("program_number, title, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return {};

  const summaries: JobSummaryByProgramNumber = {};

  for (const job of data) {
    if (!summaries[job.program_number]) {
      summaries[job.program_number] = {
        count: 0,
        latestJobTitle: job.title ?? null,
      };
    }

    summaries[job.program_number].count += 1;
  }

  return summaries;
}
