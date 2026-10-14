import { createClient } from "@supabase/supabase-js";
import { loadTestEnvironment, API_URL } from "./environment.mjs";
import { FIXTURE_PASSWORD } from "../fixtures/providers.mjs";

export function localClient(role = "anon") {
  const env = loadTestEnvironment();
  const key = role === "service" ? env.SUPABASE_SERVICE_ROLE_KEY : env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => {
        const url = new URL(input instanceof Request ? input.url : String(input));
        if (url.origin !== API_URL) throw new Error("Refusing nonlocal Supabase request.");
        return fetch(input, { ...init, redirect: "error", signal: AbortSignal.timeout(10_000) });
      },
    },
  });
}

export async function ownerClient(provider) {
  const client = localClient();
  const { error } = await client.auth.signInWithPassword({ email: provider.email, password: FIXTURE_PASSWORD });
  if (error) throw new Error(`Local fixture sign-in failed: ${error.message}`);
  return client;
}

export async function inboxMessages(email) {
  const env = loadTestEnvironment();
  if (!/^[a-z0-9-]+@example\.test$/.test(email)) throw new Error("Invalid test mailbox.");
  const response = await fetch(`${env.OPH_TEST_INBOX_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`, {
    redirect: "error", signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Unable to read the local email inbox.");
  return (await response.json()).messages;
}

export async function inboxMessage(id) {
  const env = loadTestEnvironment();
  // Mailpit uses URL-safe NanoIDs, rather than UUIDs.
  if (typeof id !== "string" || !/^[a-z0-9_-]{1,128}$/i.test(id)) throw new Error("Invalid test message ID.");
  const response = await fetch(`${env.OPH_TEST_INBOX_URL}/api/v1/message/${id}`, {
    redirect: "error", signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Unable to read the local email message.");
  return response.json();
}
