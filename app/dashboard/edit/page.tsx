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
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1
        className="mb-2 font-serif text-3xl font-bold"
        style={{ color: "#4A6B67" }}
      >
        Edit Your Listing
      </h1>
      <p className="mb-8 text-sm" style={{ color: "#6B8A86" }}>
        All fields are optional. Fill in what you&apos;d like parents to see on
        your public page.
      </p>
      <PremiumEditorForm
        programNumber={programNumber}
        initialData={initialData}
      />
    </main>
  );
}
