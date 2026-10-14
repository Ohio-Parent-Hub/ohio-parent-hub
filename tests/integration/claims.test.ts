import { afterEach, describe, expect, it, vi } from "vitest";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { localClient, inboxMessages, inboxMessage, ownerClient } from "../support/clients.mjs";
import { loadTestEnvironment, API_URL, SITE_URL } from "../support/environment.mjs";
import { FIXTURE_PASSWORD, providers } from "../fixtures/providers.mjs";

const state = vi.hoisted(() => ({ session: null as unknown as SupabaseClient, service: null as SupabaseClient | null }));
vi.mock("@/lib/supabase/server", async () => ({
  createClient: async () => state.session,
  createServiceClient: () => state.service ?? localClient("service"),
}));
vi.mock("@/data/daycares.json", async () => ({ default: (await import("../fixtures/claims")).claimListings }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));

import { completeVerifiedClaim, safeNextPath } from "@/lib/claims/verification";
import { submitClaim, checkClaimStatus } from "@/app/actions/claims";
import { GET as callback } from "@/app/auth/callback/route";
import { GET as confirm } from "@/app/auth/confirm/route";
import DashboardPage from "@/app/dashboard/page";

const createdUsers: string[] = [];
function sessionClient() {
  const env = loadTestEnvironment();
  const jar = new Map<string, string>();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: values => { for (const c of values) jar.set(c.name, c.value); } },
    global: { fetch: (input, init) => {
      if (new URL(input instanceof Request ? input.url : String(input)).origin !== API_URL) throw new Error("Nonlocal Auth request rejected");
      return fetch(input, { ...init, redirect: "error", signal: AbortSignal.timeout(10_000) });
    } },
  });
}
async function confirmedUser(name: string, programNumber = `oph-claim-${name}`) {
  const email = `oph-claim-${name}@example.test`;
  const created = await localClient("service").auth.admin.createUser({ email, password: FIXTURE_PASSWORD, email_confirm: true, user_metadata: { program_number: programNumber } });
  expect(created.error).toBeNull(); createdUsers.push(created.data.user!.id);
  const client = sessionClient();
  expect((await client.auth.signInWithPassword({ email, password: FIXTURE_PASSWORD })).error).toBeNull();
  state.session = client;
  return client;
}
async function profileFor(client: SupabaseClient) {
  const user = (await client.auth.getUser()).data.user!;
  return localClient("service").from("profiles").select("*").eq("id", user.id).maybeSingle();
}
afterEach(async () => {
  state.service = null;
  for (const id of createdUsers.splice(0)) expect((await localClient("service").auth.admin.deleteUser(id)).error).toBeNull();
});

describe("trusted claims using real local Auth and database, with synthetic authoritative emails", () => {
  it("completes the actual signup email/PKCE callback flow", async () => {
    state.session = sessionClient();
    const email = "oph-claim-pkce@example.test";
    const before = (await inboxMessages(email)).length;
    expect(await submitClaim("oph-claim-pkce", email.toUpperCase(), FIXTURE_PASSWORD)).toEqual({ status: "confirmation_email_sent" });
    const unconfirmed = await localClient("service").auth.admin.listUsers();
    const user = unconfirmed.data.users.find(u => u.email === email)!;
    createdUsers.push(user.id);
    expect(user.email_confirmed_at).toBeUndefined();
    expect((await localClient("service").from("profiles").select("id").eq("id", user.id)).data).toEqual([]);
    await expect.poll(async () => (await inboxMessages(email)).length).toBeGreaterThan(before);
    const message = await inboxMessage((await inboxMessages(email))[0].ID);
    const text = (message.HTML || message.Text).replaceAll("&amp;", "&");
    const link = text.match(/https?:\/\/[^\s"<>]+\/auth\/v1\/verify\?[^\s"<>]+/)?.[0];
    expect(link).toBeTruthy(); expect(new URL(link!).origin).toBe(API_URL);
    const response = await fetch(link!, { redirect: "manual" });
    expect(response.status).toBe(303);
    const code = new URL(response.headers.get("location")!).searchParams.get("code");
    expect(code).toBeTruthy();
    const result = await callback(new Request(`${SITE_URL}/auth/callback?code=${code}&next=/dashboard`));
    expect(result.headers.get("location")).toBe(`${SITE_URL}/dashboard`);
    const profile = await profileFor(state.session);
    expect(profile.error).toBeNull(); expect(profile.data?.program_number).toBe("oph-claim-pkce"); expect(profile.data?.verified).toBe(true);
    const reused = await callback(new Request(`${SITE_URL}/auth/callback?code=${code}`));
    expect(reused.headers.get("location")).toContain("error=Could+not+verify+email");
  });
  it("rejects direct public signup with forged metadata through the PKCE callback", async () => {
    state.session = sessionClient();
    const email = "oph-claim-mismatch@example.test";
    const before = (await inboxMessages(email)).length;
    const signup = await state.session.auth.signUp({ email, password: FIXTURE_PASSWORD, options: { data: { program_number: "oph-claim-otp" }, emailRedirectTo: `${SITE_URL}/auth/callback` } });
    expect(signup.error).toBeNull(); createdUsers.push(signup.data.user!.id);
    await expect.poll(async () => (await inboxMessages(email)).length).toBeGreaterThan(before);
    const message = await inboxMessage((await inboxMessages(email))[0].ID);
    const link = (message.HTML || message.Text).replaceAll("&amp;", "&").match(/https?:\/\/[^\s"<>]+\/auth\/v1\/verify\?[^\s"<>]+/)![0];
    expect(new URL(link).origin).toBe(API_URL);
    const response = await fetch(link, { redirect: "manual" });
    const code = new URL(response.headers.get("location")!).searchParams.get("code");
    expect(code).toBeTruthy();
    const result = await callback(new Request(`${SITE_URL}/auth/callback?code=${code}`));
    expect(result.headers.get("location")).toBe(`${SITE_URL}/auth/login?claim_error=email_mismatch`);
    expect((await profileFor(state.session)).data).toBeNull();
  });
  it("completes the actual token-hash confirmation route", async () => {
    state.session = sessionClient();
    const link = await localClient("service").auth.admin.generateLink({ type: "signup", email: "oph-claim-otp@example.test", password: FIXTURE_PASSWORD, options: { data: { program_number: "oph-claim-otp" } } });
    expect(link.error).toBeNull(); createdUsers.push(link.data.user!.id);
    const hash = link.data.properties!.hashed_token;
    const result = await confirm(new Request(`${SITE_URL}/auth/confirm?token_hash=${hash}&type=signup`));
    expect(result.headers.get("location")).toBe(`${SITE_URL}/dashboard?checkout=true`);
    const profile = await profileFor(state.session);
    expect(profile.data?.program_number).toBe("oph-claim-otp"); expect(profile.data?.verified).toBe(true);
    expect(await checkClaimStatus("oph-claim-otp")).toBe(true);
    const reused = await confirm(new Request(`${SITE_URL}/auth/confirm?token_hash=${hash}&type=signup`));
    expect(reused.headers.get("location")).toContain("error=Could+not+verify+email");
  });
  it("rejects anonymous and unconfirmed signup sessions", async () => {
    const client = sessionClient(); state.session = client;
    const result = await client.auth.signUp({ email: "oph-claim-unconfirmed@example.test", password: FIXTURE_PASSWORD, options: { data: { program_number: "oph-claim-unconfirmed" } } });
    expect(result.error).toBeNull(); createdUsers.push(result.data.user!.id); expect(result.data.session).toBeNull();
    expect(await completeVerifiedClaim(client)).toEqual({ status: "error", reason: "unconfirmed" });
    expect((await client.auth.signInWithPassword({ email: "oph-claim-unconfirmed@example.test", password: FIXTURE_PASSWORD })).error).not.toBeNull();
    expect((await localClient("service").from("profiles").select("id").eq("id", result.data.user!.id)).data).toEqual([]);
  });
  it("rejects a direct Auth signup with a forged listing through the confirmation handler", async () => {
    state.session = sessionClient();
    const link = await localClient("service").auth.admin.generateLink({ type: "signup", email: "oph-claim-mismatch@example.test", password: FIXTURE_PASSWORD, options: { data: { program_number: "oph-claim-otp" } } });
    expect(link.error).toBeNull(); createdUsers.push(link.data.user!.id);
    const result = await confirm(new Request(`${SITE_URL}/auth/confirm?token_hash=${link.data.properties!.hashed_token}&type=signup`));
    expect(result.headers.get("location")).toBe(`${SITE_URL}/auth/login?claim_error=email_mismatch`);
    expect((await profileFor(state.session)).data).toBeNull();
  });
  it("rejects metadata edits that point to another or missing program", async () => {
    const client = await confirmedUser("missing", "does-not-exist");
    expect(await completeVerifiedClaim(client)).toEqual({ status: "error", reason: "no_listing" });
    expect((await client.auth.updateUser({ data: { program_number: "oph-claim-otp" } })).error).toBeNull();
    expect(await completeVerifiedClaim(client)).toEqual({ status: "error", reason: "email_mismatch" });
    expect((await profileFor(client)).data).toBeNull();
  });
  it("never overwrites an existing claim, including a concurrent legitimate and forged request", async () => {
    const legitimate = await confirmedUser("race");
    const attacker = await confirmedUser("conflict", "oph-claim-race");
    const results = await Promise.all([completeVerifiedClaim(legitimate), completeVerifiedClaim(attacker), completeVerifiedClaim(legitimate)]);
    expect(results[0].status).toBe("verified"); expect(results[1]).toEqual({ status: "error", reason: "email_mismatch" }); expect(results[2].status).toBe("verified");
    const owner = (await legitimate.auth.getUser()).data.user!;
    const rows = await localClient("service").from("profiles").select("id").eq("program_number", "oph-claim-race");
    expect(rows.data).toEqual([{ id: owner.id }]);
  });
  it("rejects a matching email when the listing is already owned by a different user", async () => {
    const client = await confirmedUser("conflict");
    const other = await confirmedUser("existing", "oph-claim-conflict");
    const otherUser = (await other.auth.getUser()).data.user!;
    expect((await localClient("service").from("profiles").insert({ id: otherUser.id, email: otherUser.email, program_number: "oph-claim-conflict", verified: true })).error).toBeNull();
    expect(await completeVerifiedClaim(client)).toEqual({ status: "error", reason: "already_claimed" });
    expect((await profileFor(other)).data?.program_number).toBe("oph-claim-conflict");
  });
  it("preserves established ownership/billing when metadata changes", async () => {
    const owner = await ownerClient(providers[0]);
    expect((await owner.auth.updateUser({ data: { program_number: "oph-claim-otp" } })).error).toBeNull();
    const result = await completeVerifiedClaim(owner);
    expect(result.status).toBe("verified");
    if (result.status === "verified") { expect(result.profile.program_number).toBe(providers[0].programNumber); expect(result.profile.subscription_status).toBe("none"); }
    await owner.auth.updateUser({ data: { program_number: providers[0].programNumber } });
  });
  it("surfaces a failed profile INSERT rather than pretending a claim succeeded", async () => {
    state.session = sessionClient();
    const link = await localClient("service").auth.admin.generateLink({ type: "signup", email: "oph-claim-failure@example.test", password: FIXTURE_PASSWORD, options: { data: { program_number: "oph-claim-failure" } } });
    expect(link.error).toBeNull(); createdUsers.push(link.data.user!.id);
    const admin = localClient("service");
    const realFrom = admin.from.bind(admin);
    state.service = Object.assign(admin, { from: (table: string) => {
      const query = realFrom(table);
      if (table === "profiles") query.insert = () => ({ select: () => ({ single: async () => ({ data: null, error: { code: "XX000", message: "Injected local persistence failure" } }) }) }) as never;
      return query;
    } });
    const result = await confirm(new Request(`${SITE_URL}/auth/confirm?token_hash=${link.data.properties!.hashed_token}&type=signup`));
    expect(result.headers.get("location")).toBe(`${SITE_URL}/auth/login?claim_error=persistence`);
    expect((await profileFor(state.session)).data).toBeNull();
  });
  it("does not silently promote an existing unverified profile", async () => {
    const client = await confirmedUser("existing");
    const user = (await client.auth.getUser()).data.user!;
    expect((await localClient("service").from("profiles").insert({ id: user.id, email: user.email, program_number: "oph-claim-existing" })).error).toBeNull();
    expect(await completeVerifiedClaim(client)).toEqual({ status: "error", reason: "unverified_profile" });
    expect((await profileFor(client)).data?.verified).toBe(false);
    expect(await checkClaimStatus("oph-claim-existing")).toBe(false);
  });
  it("rejects the dashboard fallback attack before checkout or profile creation", async () => {
    const client = await confirmedUser("dashboard", "oph-claim-otp");
    await expect(DashboardPage({ searchParams: Promise.resolve({ checkout: "true" }) })).rejects.toThrow("REDIRECT:/auth/login?claim_error=email_mismatch");
    expect((await profileFor(client)).data).toBeNull();
  });
  it("rejects mismatched submitClaim before sending signup mail", async () => {
    state.session = sessionClient();
    const result = await submitClaim("oph-claim-signup", "oph-not-owner@example.test", FIXTURE_PASSWORD);
    expect(result.status).toBe("no_match");
  });
  it("keeps recovery links independent of claim creation", async () => {
    const client = await confirmedUser("failure");
    const recovery = await localClient("service").auth.admin.generateLink({ type: "recovery", email: "oph-claim-failure@example.test" });
    expect(recovery.error).toBeNull(); state.session = sessionClient();
    const result = await confirm(new Request(`${SITE_URL}/auth/confirm?token_hash=${recovery.data.properties!.hashed_token}&type=recovery`));
    expect(result.headers.get("location")).toBe(`${SITE_URL}/auth/reset-password`);
    expect((await profileFor(client)).data).toBeNull();
  });
  it("rejects external callback destinations", () => {
    for (const path of ["https://example.test", "//example.test", "/\\example.test", null]) expect(safeNextPath(path)).toBe("/dashboard?checkout=true");
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
  });
});
