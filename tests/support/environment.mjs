import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const PROJECT_ID = "ohio-parent-hub-test";
export const API_URL = "http://127.0.0.1:55431";
export const SITE_URL = "http://127.0.0.1:3100";
export const INBOX_URL = "http://127.0.0.1:55434";
export const RUNTIME_FILE = fileURLToPath(new URL("../.runtime/local.json", import.meta.url));
export const INERT_STRIPE_KEY = "sk_test_oph_inert_placeholder";

export function unitEnvironment() {
  return localConfigFromStatus({
    API_URL, INBUCKET_URL: INBOX_URL, ANON_KEY: "local-unit-placeholder", SERVICE_ROLE_KEY: "local-unit-placeholder",
  });
}

export function assertLocalProjectConfig(config) {
  // Validate active declarations in their own sections, not matching text in
  // comments or a different section. Fail closed on multiline TOML values.
  if (/"""|'''/.test(config)) throw new Error("Unsupported local test configuration.");
  const sections = [...config.matchAll(/^\[([^\]]+)\]\s*(?:#.*)?$/gm)];
  const section = (name) => {
    const index = sections.findIndex((match) => match[1] === name);
    if (index < 0) return "";
    return config.slice(sections[index].index + sections[index][0].length, sections[index + 1]?.index ?? config.length);
  };
  const top = config.slice(0, sections[0]?.index ?? config.length);
  if (!/^project_id\s*=\s*"ohio-parent-hub-test"\s*(?:#.*)?$/m.test(top) ||
      !/^port\s*=\s*55431\s*(?:#.*)?$/m.test(section("api")) ||
      !/^port\s*=\s*55432\s*(?:#.*)?$/m.test(section("db")) ||
      !/^site_url\s*=\s*"http:\/\/127\.0\.0\.1:3100"\s*(?:#.*)?$/m.test(section("auth")) ||
      !/^enabled\s*=\s*false\s*(?:#.*)?$/m.test(section("auth.email.smtp"))) {
    throw new Error("Local test project configuration changed; refusing lifecycle operation.");
  }
}

function exactUrl(value, expected, name) {
  if (value !== expected) throw new Error(`${name} must use the dedicated local test endpoint.`);
}

export function assertTestEnvironment(env) {
  if (env.OPH_TEST_PROJECT !== PROJECT_ID) throw new Error("Missing dedicated test project marker.");
  exactUrl(env.NEXT_PUBLIC_SUPABASE_URL, API_URL, "Supabase URL");
  exactUrl(env.NEXT_PUBLIC_SITE_URL, SITE_URL, "Site URL");
  exactUrl(env.OPH_TEST_INBOX_URL, INBOX_URL, "Inbox URL");
  // No usable Stripe credential is accepted: these tests cannot make payments.
  if (env.STRIPE_SECRET_KEY !== INERT_STRIPE_KEY || env.STRIPE_PRICE_ID !== "price_oph_fixture" ||
      env.STRIPE_WEBHOOK_SECRET !== "whsec_oph_fixture") {
    throw new Error("Tests require the inert Stripe fixture configuration.");
  }
  for (const name of ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]) {
    if (typeof env[name] !== "string" || !env[name]) throw new Error(`Missing local ${name}.`);
  }
  if (env.NEXT_PUBLIC_GA_MEASUREMENT_ID) throw new Error("Analytics must be disabled in tests.");
  return env;
}

export function loadTestEnvironment() {
  let local;
  try { local = JSON.parse(readFileSync(RUNTIME_FILE, "utf8")); }
  catch { throw new Error("Local test configuration is missing. Run npm run test:setup first."); }
  return assertTestEnvironment(local);
}

export function isolatedProcessEnv(local, inherited = process.env) {
  assertTestEnvironment(local);
  // Preserve runtime proxy/CA settings, but never inherit application credentials
  // or a production Next.js public variable from the developer's shell.
  const env = Object.fromEntries(Object.entries(inherited).filter(([name]) =>
    !/^(NEXT_PUBLIC_|SUPABASE_|STRIPE_|VERCEL_|OPH_TEST_)/.test(name)
  ));
  return { ...env, ...local, NEXT_PUBLIC_GA_MEASUREMENT_ID: "", NODE_ENV: "production" };
}

export function localConfigFromStatus(status) {
  return assertTestEnvironment({
    OPH_TEST_PROJECT: PROJECT_ID,
    NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: SITE_URL,
    OPH_TEST_INBOX_URL: status.INBUCKET_URL,
    STRIPE_SECRET_KEY: INERT_STRIPE_KEY,
    STRIPE_PRICE_ID: "price_oph_fixture",
    STRIPE_WEBHOOK_SECRET: "whsec_oph_fixture",
    NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
  });
}
