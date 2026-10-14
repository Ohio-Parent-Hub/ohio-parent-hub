import { describe, expect, it } from "vitest";
import { localClient, ownerClient, inboxMessages, inboxMessage } from "../support/clients.mjs";
import { providers, SUBSCRIPTION_STATUSES } from "../fixtures/providers.mjs";

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
