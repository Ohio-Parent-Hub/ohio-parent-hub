import { localClient } from "./clients.mjs";
import { providers, FIXTURE_PASSWORD } from "../fixtures/providers.mjs";

export async function seedFixtures() {
  const admin = localClient("service");
  const receipts = await admin.from("billing_event_receipts").delete().neq("event_id", "");
  if (receipts.error) throw receipts.error;
  for (const provider of providers) {
    const { data: existing, error: lookupError } = await admin.auth.admin.getUserById(provider.id);
    if (lookupError && lookupError.status !== 404) throw lookupError;
    const attributes = {
      email: provider.email, password: FIXTURE_PASSWORD,
      email_confirm: true, user_metadata: { program_number: provider.programNumber },
    };
    const { error: authError } = existing?.user
      ? await admin.auth.admin.updateUserById(provider.id, attributes)
      : await admin.auth.admin.createUser({ id: provider.id, ...attributes });
    if (authError) throw authError;
    const { error: profileError } = await admin.from("profiles").upsert({
      id: provider.id, email: provider.email, program_number: provider.programNumber,
      display_name: `Local fixture ${provider.programNumber}`, verified: true,
      subscription_status: provider.status,
      stripe_customer_id: null, subscription_id: null,
      billing_event_created: 0, billing_event_priority: 0, billing_event_subscription_id: null,
      created_at: provider.createdAt,
    });
    if (profileError) throw profileError;
    const { error: listingError } = await admin.from("premium_listings").upsert({
      program_number: provider.programNumber, description: "Synthetic local test listing",
      published: provider.status === "active" || provider.status === "past_due",
      hours: null, pricing: null, amenities: null, custom_faqs: null,
      website_url: null, logo_url: null, photos: [],
      created_at: provider.createdAt,
    }, { onConflict: "program_number" });
    if (listingError) throw listingError;
    const { error: jobError } = await admin.from("daycare_jobs").upsert({
      id: provider.jobId, program_number: provider.programNumber,
      title: "Local fixture educator", description: "Synthetic role for isolated tests only.",
      published: true, application_email_mode: "default", created_at: provider.createdAt,
      job_url: null, application_email_custom: null,
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
