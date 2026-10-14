import { afterEach, describe, expect, it } from "vitest";
import { localClient, ownerClient } from "../support/clients.mjs";
import { providers, FIXTURE_PASSWORD } from "../fixtures/providers.mjs";
import { seedFixtures } from "../support/seed.mjs";

const ownerA = providers[0], ownerB = providers[1];
afterEach(async () => { await seedFixtures(); });

describe("profile grants and row policies through real Auth/Data API roles", () => {
  for (const [field, value] of Object.entries({
    program_number: "oph-stolen-program", verified: false, subscription_status: "active",
    stripe_customer_id: "cus_stolen", subscription_id: "sub_stolen", email: "stolen@example.test",
    billing_event_created: 9999999999, billing_event_priority: 40, billing_event_subscription_id: "sub_stolen",
    id: ownerB.id, created_at: "2000-01-01T00:00:00Z", updated_at: "2000-01-01T00:00:00Z",
  })) {
    it(`rejects authenticated updates to protected ${field}`, async () => {
      const owner = await ownerClient(ownerA);
      const before = await owner.from("profiles").select("*").single();
      const result = await owner.from("profiles").update({ [field]: value }).eq("id", ownerA.id).select("*");
      expect(result.error?.code).toBe("42501");
      const after = await owner.from("profiles").select("*").single();
      expect(after.data).toEqual(before.data);
    });
  }
  it("allows only the owner's own display-name update, with timestamp trigger", async () => {
    const owner = await ownerClient(ownerA);
    const result = await owner.from("profiles").update({ display_name: "Owner A display name" }).eq("id", ownerA.id).select("display_name, updated_at").single();
    expect(result.error).toBeNull();
    expect(result.data?.display_name).toBe("Owner A display name");
    expect(Date.parse(result.data!.updated_at)).toBeGreaterThan(Date.parse("2026-01-01T00:00:00Z"));
    const other = await owner.from("profiles").select("*").eq("id", ownerB.id);
    expect(other.error).toBeNull(); expect(other.data).toEqual([]);
    const updateOther = await owner.from("profiles").update({ display_name: "Stolen" }).eq("id", ownerB.id).select("id");
    expect(updateOther.error).toBeNull(); expect(updateOther.data).toEqual([]);
  });
  it("rejects anonymous and authenticated profile inserts, including defaults", async () => {
    const admin = localClient("service");
    const created = await admin.auth.admin.createUser({ email: "oph-profile-insert@example.test", password: FIXTURE_PASSWORD, email_confirm: true });
    expect(created.error).toBeNull();
    const user = created.data.user!;
    try {
      const owner = await ownerClient({ email: user.email });
      for (const client of [localClient(), owner]) {
        for (const extra of [{}, { verified: true, subscription_status: "active" }]) {
          const result = await client.from("profiles").insert({ id: user.id, email: user.email, program_number: "oph-unauthorized-insert", ...extra });
          expect(result.error?.code).toBe("42501");
        }
      }
      expect((await admin.from("profiles").select("id").eq("id", user.id)).data).toEqual([]);
      const pending = await admin.from("profiles").insert({ id: user.id, email: user.email, program_number: "oph-trusted-pending" }).select("verified").single();
      expect(pending.error).toBeNull(); expect(pending.data?.verified).toBe(false);
    } finally { expect((await admin.auth.admin.deleteUser(user.id)).error).toBeNull(); }
  });
  it("rejects client deletion and anonymous profile mutation", async () => {
    const owner = await ownerClient(ownerA);
    expect((await owner.from("profiles").delete().eq("id", ownerA.id)).error?.code).toBe("42501");
    expect((await localClient().from("profiles").update({ display_name: "anonymous" }).eq("id", ownerA.id)).error?.code).toBe("42501");
  });
  it("retains service-role Stripe updates without granting clients those fields", async () => {
    const admin = localClient("service");
    const result = await admin.from("profiles").update({ stripe_customer_id: "cus_trusted", subscription_id: "sub_trusted", subscription_status: "active" }).eq("id", ownerA.id).select("*").single();
    expect(result.error).toBeNull();
    expect(result.data?.subscription_status).toBe("active");
    expect(result.data?.stripe_customer_id).toBe("cus_trusted");
  });
  it("keeps private listings/jobs scoped to the owner and denies cross-owner mutations", async () => {
    const [paidOwner, otherOwner] = providers.filter(provider => provider.status === "active");
    const admin = localClient("service"), owner = await ownerClient(paidOwner);
    for (const table of ["premium_listings", "daycare_jobs"]) {
      expect((await admin.from(table).update({ published: false }).eq("program_number", otherOwner.programNumber)).error).toBeNull();
      const read = await owner.from(table).select("*").eq("program_number", otherOwner.programNumber);
      expect(read.error).toBeNull(); expect(read.data).toEqual([]);
      const update = await owner.from(table).update({ description: "stolen" }).eq("program_number", otherOwner.programNumber).select("*");
      expect(update.error).toBeNull(); expect(update.data).toEqual([]);
      const del = await owner.from(table).delete().eq("program_number", otherOwner.programNumber).select("*");
      expect(del.error).toBeNull(); expect(del.data).toEqual([]);
      const reassignment = await owner.from(table).update({ program_number: otherOwner.programNumber }).eq("program_number", paidOwner.programNumber);
      expect(reassignment.error?.code).toBe("42501");
      const ownUpdate = await owner.from(table).update({ description: "permitted owner edit" }).eq("program_number", paidOwner.programNumber).select("description");
      expect(ownUpdate.error).toBeNull(); expect(ownUpdate.data).toHaveLength(1);
      const remaining = await admin.from(table).select("description").eq("program_number", otherOwner.programNumber);
      expect(remaining.data).toHaveLength(1); expect(remaining.data![0].description).not.toBe("stolen");
    }
  });
});
