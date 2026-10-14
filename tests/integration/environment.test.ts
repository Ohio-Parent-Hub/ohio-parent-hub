import { describe, expect, it } from "vitest";
import { localClient, ownerClient, inboxMessages, inboxMessage } from "../support/clients.mjs";
import { providers, SUBSCRIPTION_STATUSES } from "../fixtures/providers.mjs";
import { seedFixtures } from "../support/seed.mjs";

// Verifies the harness, not the pending ownership/entitlement fixes in OPH-14/15.
describe("isolated Supabase fixture environment", () => {
  it("seeds two distinct owners for every subscription status", async () => {
    const { data, error } = await localClient("service").from("profiles").select("id, subscription_status")
      .in("id", providers.map((provider) => provider.id));
    expect(error).toBeNull();
    expect(data).toHaveLength(8);
    for (const status of SUBSCRIPTION_STATUSES) {
      expect(data!.filter((row) => row.subscription_status === status)).toHaveLength(2);
    }
  });
  it("uses an authenticated owner token and actual row policies", async () => {
    const owner = await ownerClient(providers[0]);
    const { data, error } = await owner.from("profiles").select("id");
    expect(error).toBeNull();
    expect(data).toEqual([{ id: providers[0].id }]);
    const anonymous = await localClient().from("profiles").select("id");
    expect(anonymous.error).toBeNull();
    expect(anonymous.data).toEqual([]);
  });
  it("contains listing and job fixtures and a local image bucket", async () => {
    const admin = localClient("service");
    const listings = await admin.from("premium_listings").select("program_number")
      .in("program_number", providers.map((provider) => provider.programNumber));
    const jobs = await admin.from("daycare_jobs").select("id").in("id", providers.map((provider) => provider.jobId));
    expect(listings.error).toBeNull(); expect(listings.data).toHaveLength(8);
    expect(jobs.error).toBeNull(); expect(jobs.data).toHaveLength(8);
    expect((await admin.storage.getBucket("listings")).error).toBeNull();
  });
  it("restores credentials and mutable fixture fields after another test changes them", async () => {
    const provider = providers[0];
    const admin = localClient("service");
    const changes = [
      await admin.auth.admin.updateUserById(provider.id, { password: "Changed-local-fixture-password!" }),
      await admin.from("profiles").update({ stripe_customer_id: "cus_changed_fixture", subscription_id: "sub_changed_fixture" }).eq("id", provider.id),
      await admin.from("premium_listings").update({ hours: { changed: true }, photos: ["http://127.0.0.1/changed"] }).eq("program_number", provider.programNumber),
      await admin.from("daycare_jobs").update({ job_url: "http://127.0.0.1/changed", application_email_custom: "changed@example.test" }).eq("id", provider.jobId),
    ];
    for (const result of changes) expect(result.error).toBeNull();
    await seedFixtures();
    const owner = await ownerClient(provider);
    const profile = await owner.from("profiles").select("stripe_customer_id, subscription_id").single();
    const listing = await admin.from("premium_listings").select("hours, photos").eq("program_number", provider.programNumber).single();
    const job = await admin.from("daycare_jobs").select("job_url, application_email_custom").eq("id", provider.jobId).single();
    expect(profile.error).toBeNull(); expect(profile.data).toEqual({ stripe_customer_id: null, subscription_id: null });
    expect(listing.error).toBeNull(); expect(listing.data).toEqual({ hours: null, photos: [] });
    expect(job.error).toBeNull(); expect(job.data).toEqual({ job_url: null, application_email_custom: null });
  });
  it("captures recovery email in the local inbox", async () => {
    const provider = providers[0];
    const previousCount = (await inboxMessages(provider.email)).length;
    const { error } = await localClient().auth.resetPasswordForEmail(provider.email);
    expect(error).toBeNull();
    await expect.poll(async () => (await inboxMessages(provider.email)).length,
      { timeout: 10_000 }).toBeGreaterThan(previousCount);
    const messages = await inboxMessages(provider.email);
    const message = await inboxMessage(messages[0].ID);
    expect((message.HTML || message.Text).includes("token")).toBe(true);
  });
  it("captures confirmation email without confirming the new account", async () => {
    const email = "oph-signup-inbox@example.test";
    const previousCount = (await inboxMessages(email)).length;
    const { data, error } = await localClient().auth.signUp({ email, password: "OPH-local-signup-only-2026!" });
    expect(error).toBeNull();
    expect(data.session).toBeNull();
    try {
      await expect.poll(async () => (await inboxMessages(email)).length, { timeout: 10_000 }).toBeGreaterThan(previousCount);
    } finally {
      if (data.user) {
        const cleanup = await localClient("service").auth.admin.deleteUser(data.user.id);
        expect(cleanup.error).toBeNull();
      }
    }
  });
});
