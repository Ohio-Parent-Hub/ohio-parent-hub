import { afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { localClient, ownerClient } from "../support/clients.mjs";
import { providers } from "../fixtures/providers.mjs";
import { seedFixtures } from "../support/seed.mjs";
import { API_URL } from "../support/environment.mjs";

const state = vi.hoisted(() => ({ session: null as unknown as SupabaseClient }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => state.session, createServiceClient: () => localClient("service") }));
vi.mock("@/data/daycares.json", async () => ({ default: (await import("../fixtures/providers.mjs")).providers.map(p => ({ "PROGRAM NUMBER": p.programNumber, "PROGRAM NAME": `Fixture ${p.programNumber}`, CITY: "COLUMBUS", EMAIL: p.email })) }));
import { savePremiumListing, uploadListingImage, deleteListingImage, loadPremiumListing, loadPublishedPremiumListing, loadPremiumLogos, loadPremiumFilterSummaries, loadVerifiedProgramNumbers } from "@/app/actions/premium";
import { createJob, updateJob, deleteJob, loadOwnerJobs, loadAllPublishedJobs, loadPublishedJobsForProgram, loadPublishedJobById, loadHiringSummaries } from "@/app/actions/jobs";

const input = { title: "Fixture educator", description: "Synthetic educator opportunity for local tests", application_email_mode: "default" as const };
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/WuoAAAAASUVORK5CYII=", "base64");
const uploads: string[] = [];
afterEach(async () => {
  if (uploads.length) expect((await localClient("service").storage.from("listings").remove(uploads.splice(0))).error).toBeNull();
  await seedFixtures();
});

describe("premium entitlement across server actions, Data API and Storage", () => {
  for (const provider of providers.filter(p => p.programNumber.endsWith("-a"))) {
    const entitled = ["active", "past_due"].includes(provider.status);
    it(`${provider.status}: listing/job server actions and direct policies agree`, async () => {
      const owner = await ownerClient(provider); state.session = owner;
      const listing = await savePremiumListing(provider.programNumber, { description: "Permitted fixture change", photos: [], custom_faqs: [] });
      expect(listing.success).toBe(entitled);
      const job = await createJob(input); expect(job.success).toBe(entitled);
      const update = await updateJob(provider.jobId, input); expect(update.success).toBe(entitled);
      const directListing = await owner.from("premium_listings").update({ description: "Direct update" }).eq("program_number", provider.programNumber).select("id");
      expect(directListing.error).toBeNull(); expect(directListing.data).toHaveLength(entitled ? 1 : 0);
      const directJobUpdate = await owner.from("daycare_jobs").update({ title: "Republished fixture", published: true }).eq("id", provider.jobId).select("id");
      expect(directJobUpdate.error).toBeNull(); expect(directJobUpdate.data).toHaveLength(entitled ? 1 : 0);
      const directJob = await owner.from("daycare_jobs").insert({ ...input, program_number: provider.programNumber }).select("id");
      expect(Boolean(directJob.error)).toBe(!entitled);
      if (directJob.data?.length) expect((await localClient("service").from("daycare_jobs").delete().eq("id", directJob.data[0].id)).error).toBeNull();
      if (job.success && job.job) expect((await localClient("service").from("daycare_jobs").delete().eq("id", job.job.id)).error).toBeNull();
      // INSERT/upsert is also checked after removing the existing own listing.
      expect((await owner.from("premium_listings").delete().eq("program_number", provider.programNumber)).error).toBeNull();
      const insert = await owner.from("premium_listings").insert({ program_number: provider.programNumber, published: true });
      expect(Boolean(insert.error)).toBe(!entitled);
    });
    it(`${provider.status}: image upload is paid, cleanup and private reads remain allowed`, async () => {
      const owner = await ownerClient(provider); state.session = owner;
      const path = `${provider.programNumber}/photos/direct-fixture.png`; uploads.push(path);
      const direct = await owner.storage.from("listings").upload(path, png, { contentType: "image/png" });
      expect(Boolean(direct.error)).toBe(!entitled);
      const form = new FormData(); form.set("kind", "photo"); form.set("file", new File([png], "fixture.png", { type: "image/png" }));
      const uploaded = await uploadListingImage(form);
      expect(Boolean(uploaded.url)).toBe(entitled);
      if (uploaded.url) uploads.push(decodeURIComponent(new URL(uploaded.url).pathname.split("/listings/")[1]));
      if (!entitled) expect(uploaded.error).toBe("Premium subscription required");
      // Seed an old image; unsubscribed owners may delete their own retained asset.
      const cleanupPath = `${provider.programNumber}/photos/cleanup-fixture.png`; uploads.push(cleanupPath);
      expect((await localClient("service").storage.from("listings").upload(cleanupPath, png, { contentType: "image/png", upsert: true })).error).toBeNull();
      expect(await deleteListingImage(`${API_URL}/storage/v1/object/public/listings/${cleanupPath}`)).toEqual({ success: true });
      expect(await loadPremiumListing(provider.programNumber)).not.toBeNull();
      expect((await loadOwnerJobs()).success).toBe(true);
      expect(await deleteJob(provider.jobId)).toEqual({ success: true });
    });
  }
  it("rejects cross-provider listing, job and image mutations", async () => {
    const [a,b] = providers.filter(p => p.status === "active"); state.session = await ownerClient(a);
    expect((await savePremiumListing(b.programNumber, { description: "Stolen", photos: [], custom_faqs: [] })).success).toBe(false);
    expect(await loadPremiumListing(b.programNumber)).toBeNull();
    expect((await updateJob(b.jobId, input)).success).toBe(false);
    expect((await deleteJob(b.jobId)).success).toBe(false);
    expect((await state.session.from("premium_listings").update({ description: "Stolen", photos: [], custom_faqs: [] }).eq("program_number", b.programNumber).select("id")).data).toEqual([]);
    expect((await state.session.storage.from("listings").upload(`${b.programNumber}/photos/stolen.png`, png, { contentType: "image/png" })).error).not.toBeNull();
    expect((await deleteListingImage(`${API_URL}/storage/v1/object/public/listings/${b.programNumber}/photos/no.png`)).success).toBe(false);
    expect((await deleteListingImage(`https://example.test/storage/v1/object/public/listings/${a.programNumber}/photos/no.png`)).success).toBe(false);
  });
  it("hides cancelled content across direct reads and every public loader without deleting saved data", async () => {
    const provider = providers.find(p => p.status === "active")!; const admin = localClient("service");
    expect((await admin.from("premium_listings").update({ logo_url: `${API_URL}/fixture.png`, pricing: { tiers: [] }, photos: [`${API_URL}/fixture.png`] }).eq("program_number", provider.programNumber)).error).toBeNull();
    expect(await loadPublishedPremiumListing(provider.programNumber)).not.toBeNull();
    expect((await loadPremiumLogos())[provider.programNumber]).toBeTruthy();
    expect((await loadPremiumFilterSummaries())[provider.programNumber]).toBeTruthy();
    expect((await loadHiringSummaries())[provider.programNumber]).toBeTruthy();
    expect((await admin.from("profiles").update({ subscription_status: "cancelled" }).eq("id", provider.id)).error).toBeNull();
    const anon = localClient();
    for (const table of ["premium_listings", "daycare_jobs"]) {
      const result = await anon.from(table).select("*").eq("program_number", provider.programNumber);
      expect(result.error).toBeNull(); expect(result.data).toEqual([]);
      expect((await admin.from(table).select("id").eq("program_number", provider.programNumber)).data).toHaveLength(1);
    }
    expect(await loadPublishedPremiumListing(provider.programNumber)).toBeNull();
    expect((await loadPremiumLogos())[provider.programNumber]).toBeUndefined();
    expect((await loadPremiumFilterSummaries())[provider.programNumber]).toBeUndefined();
    expect((await loadHiringSummaries())[provider.programNumber]).toBeUndefined();
    expect(await loadPublishedJobsForProgram(provider.programNumber)).toEqual([]);
    expect(await loadPublishedJobById(provider.jobId)).toBeNull();
    expect((await loadAllPublishedJobs()).some(job => job.program_number === provider.programNumber)).toBe(false);
    // Verification is a free ownership benefit, not a premium entitlement.
    expect((await loadVerifiedProgramNumbers()).has(provider.programNumber)).toBe(true);
    state.session = await ownerClient(provider); expect(await loadPremiumListing(provider.programNumber)).not.toBeNull();
    expect((await admin.from("profiles").update({ subscription_status: "past_due" }).eq("id", provider.id)).error).toBeNull();
    expect(await loadPublishedPremiumListing(provider.programNumber)).not.toBeNull();
    expect(await loadPublishedJobById(provider.jobId)).not.toBeNull();
  });
  it("never exposes unpublished content, and denies unverified paid accounts new capabilities", async () => {
    const provider = providers.find(p => p.status === "active")!; const admin = localClient("service");
    expect((await admin.from("premium_listings").update({ published: false }).eq("program_number", provider.programNumber)).error).toBeNull();
    expect(await loadPublishedPremiumListing(provider.programNumber)).toBeNull();
    state.session = await ownerClient(provider); expect(await loadPremiumListing(provider.programNumber)).not.toBeNull();
    expect((await admin.from("profiles").update({ verified: false }).eq("id", provider.id)).error).toBeNull();
    expect((await savePremiumListing(provider.programNumber, { description: "Unverified", photos: [], custom_faqs: [] })).success).toBe(false);
    expect((await createJob(input)).success).toBe(false);
    expect((await localClient().from("daycare_jobs").select("id").eq("program_number", provider.programNumber)).data).toEqual([]);
  });
  it("does not let clients forge public eligibility", async () => {
    state.session = await ownerClient(providers[0]);
    const result = await state.session.from("premium_entitlements").update({ enabled: true }).eq("program_number", providers[0].programNumber);
    expect(result.error?.code).toBe("42501");
    expect((await localClient().from("premium_entitlements").select("program_number").eq("program_number", providers[0].programNumber)).data).toEqual([]);
  });
  it("rejects anonymous paid mutations", async () => {
    state.session = localClient();
    expect((await savePremiumListing(providers[0].programNumber, { photos: [], custom_faqs: [] })).success).toBe(false);
    expect((await createJob(input)).success).toBe(false);
  });
});
