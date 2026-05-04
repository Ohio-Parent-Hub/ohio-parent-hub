export type ApplicationEmailMode = "default" | "custom";

export type DaycareJob = {
  id: string;
  program_number: string;
  title: string;
  description: string;
  job_url: string | null;
  application_email_mode: ApplicationEmailMode;
  application_email_custom: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type PublicDaycareJob = {
  id: string;
  program_number: string;
  title: string;
  description: string;
  job_url: string | null;
  application_email: string;
  daycare_name: string;
  daycare_slug: string;
  city: string | null;
  county: string | null;
  created_at: string;
};

export type JobSummaryByProgramNumber = Record<
  string,
  { count: number; latestJobTitle: string | null }
>;
