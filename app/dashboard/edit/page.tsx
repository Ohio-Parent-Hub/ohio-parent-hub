import { hasPremiumAccess } from "@/lib/premiumAccess";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PremiumEditorForm from "@/components/premium/PremiumEditorForm";
import { loadPremiumListing } from "@/app/actions/premium";

export default async function DashboardEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, program_number, verified")
    .eq("id", user.id)
    .single();

  const isActive = hasPremiumAccess(profile?.subscription_status, profile?.verified ?? false);

  if (!isActive) {
    redirect("/dashboard");
  }

  const programNumber = profile?.program_number;
  const initialData = programNumber
    ? await loadPremiumListing(programNumber)
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
