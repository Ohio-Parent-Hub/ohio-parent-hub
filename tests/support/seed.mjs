import { localClient } from "./clients.mjs";
import { providers, FIXTURE_PASSWORD } from "../fixtures/providers.mjs";

export async function seedFixtures() {
  const admin = localClient("service");
  for (const provider of providers) {
    const { data: existing, error: lookupError } = await admin.auth.admin.getUserById(provider.id);
    if (lookupError && lookupError.status !== 404) throw lookupError;
    if (!existing?.user) {
      const { error } = await admin.auth.admin.createUser({
        id: provider.id, email: provider.email, password: FIXTURE_PASSWORD,
        email_confirm: true, user_metadata: { program_number: provider.programNumber },
      });
      if (error) throw error;
    }
    const { error: profileError } = await admin.from("profiles").upsert({
      id: provider.id, email: provider.email, program_number: provider.programNumber,
      display_name: `Local fixture ${provider.programNumber}`, verified: true,
      subscription_status: provider.status,
      created_at: provider.createdAt,
    });
    if (profileError) throw profileError;
    const { error: listingError } = await admin.from("premium_listings").upsert({
      program_number: provider.programNumber, description: "Synthetic local test listing",
      published: provider.status === "active" || provider.status === "past_due",
      created_at: provider.createdAt,
    }, { onConflict: "program_number" });
    if (listingError) throw listingError;
    const { error: jobError } = await admin.from("daycare_jobs").upsert({
      id: provider.jobId, program_number: provider.programNumber,
      title: "Local fixture educator", description: "Synthetic role for isolated tests only.",
      published: true, application_email_mode: "default", created_at: provider.createdAt,
    });
    if (jobError) throw jobError;
  }
  const { data: buckets, error: bucketError } = await admin.storage.listBuckets();
  if (bucketError) throw bucketError;
  if (!buckets.some((bucket) => bucket.id === "listings")) {
    const { error } = await admin.storage.createBucket("listings", {
      public: true, allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      fileSizeLimit: 3 * 1024 * 1024,
    });
    if (error) throw error;
  }
}
