import { loadOwnerJobs } from "@/app/actions/jobs";
import JobsHubClient from "@/components/jobs/JobsHubClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, program_number, subscription_status")
    .eq("id", user.id)
    .single();

  const isActive =
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "past_due";

  if (!isActive) redirect("/dashboard");

  const ownerJobs = await loadOwnerJobs();
  if (!ownerJobs.success) redirect("/dashboard");

  return (
    <JobsHubClient
      accountEmail={ownerJobs.profile.email}
      daycareName={ownerJobs.profile.daycare_name}
      daycareSlug={ownerJobs.profile.daycare_slug}
      initialJobs={ownerJobs.jobs}
    />
  );
}
