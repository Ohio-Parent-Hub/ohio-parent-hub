import type { ApplicationEmailMode } from "@/lib/jobTypes";
import { slugify } from "@/lib/utils";

export const JOB_TITLE_MAX_LENGTH = 120;
export const JOB_DESCRIPTION_MAX_LENGTH = 5000;

type ApplicationEmailJob = {
  application_email_mode: ApplicationEmailMode;
  application_email_custom: string | null;
};

const UUID_PATTERN =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildJobSlug(jobId: string, title: string): string {
  const titleSlug = slugify(title);
  return titleSlug ? `${titleSlug}-${jobId}` : jobId;
}

export function parseJobIdFromSlug(jobSlug: string): string | null {
  const trimmed = jobSlug.trim();
  const match = trimmed.match(new RegExp(`(?:^|-)(${UUID_PATTERN})$`));
  return match?.[1] ?? null;
}

export function buildJobApplyMailto(
  applicationEmail: string,
  daycareName: string,
  jobTitle: string,
): string {
  const subject = `${daycareName} | ${jobTitle} Application`;
  return `mailto:${applicationEmail}?subject=${encodeURIComponent(subject)}`;
}

export function resolveApplicationEmail(
  job: ApplicationEmailJob,
  profileEmail: string,
): string {
  if (job.application_email_mode === "custom" && job.application_email_custom) {
    return job.application_email_custom.trim();
  }

  return profileEmail.trim();
}

export function validateJobTitle(title: string): string | null {
  const trimmed = title.trim();

  if (!trimmed) return "Job title is required.";
  if (trimmed.length > JOB_TITLE_MAX_LENGTH) {
    return `Job title must be ${JOB_TITLE_MAX_LENGTH} characters or fewer.`;
  }

  return null;
}

export function validateJobDescription(description: string): string | null {
  const trimmed = description.trim();

  if (!trimmed) return "Job description is required.";
  if (trimmed.length > JOB_DESCRIPTION_MAX_LENGTH) {
    return `Job description must be ${JOB_DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  }

  return null;
}

export function validateOptionalJobUrl(jobUrl: string | null | undefined): string | null {
  const trimmed = jobUrl?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return null;
  } catch {
    return "Job URL must be a valid http:// or https:// URL.";
  }

  return "Job URL must be a valid http:// or https:// URL.";
}

export function validateApplicationEmail(email: string | null | undefined): string | null {
  const trimmed = email?.trim();

  if (!trimmed) return "Application email is required.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Application email must be a valid email address.";

  return null;
}

export function validateApplicationEmailMode(mode: string): string | null {
  if (mode === "default" || mode === "custom") return null;
  return "Application email mode must be default or custom.";
}
