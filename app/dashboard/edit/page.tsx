import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PremiumEditorForm from "@/components/premium/PremiumEditorForm";
import { loadPublishedPremiumListing } from "@/app/actions/premium";

export default async function DashboardEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, program_number")
    .eq("id", user.id)
    .single();

  const isActive =
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "past_due";

  if (!isActive) {
    redirect("/dashboard");
  }

  const programNumber = profile?.program_number;
  const initialData = programNumber
    ? await loadPublishedPremiumListing(programNumber)
    : null;

  return (
    <main>
      <PremiumEditorForm
        programNumber={programNumber}
        initialData={initialData}
      />
    </main>
  );
}
