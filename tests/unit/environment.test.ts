import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { assertTestEnvironment, isolatedProcessEnv, assertLocalProjectConfig, API_URL, SITE_URL, INBOX_URL, PROJECT_ID, INERT_STRIPE_KEY } from "../support/environment.mjs";

const valid = {
  OPH_TEST_PROJECT: PROJECT_ID, NEXT_PUBLIC_SUPABASE_URL: API_URL,
  NEXT_PUBLIC_SITE_URL: SITE_URL, OPH_TEST_INBOX_URL: INBOX_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "local-anon", SUPABASE_SERVICE_ROLE_KEY: "local-service",
  STRIPE_SECRET_KEY: INERT_STRIPE_KEY, STRIPE_PRICE_ID: "price_oph_fixture",
  STRIPE_WEBHOOK_SECRET: "whsec_oph_fixture",
};

describe("test environment boundaries", () => {
  it("accepts the dedicated local setup", () => expect(assertTestEnvironment(valid)).toBe(valid));
  it.each([
    ["NEXT_PUBLIC_SUPABASE_URL", "https://production.supabase.co"],
    ["NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321"],
    ["NEXT_PUBLIC_SITE_URL", "https://ohioparenthub.com"],
    ["OPH_TEST_INBOX_URL", "https://mail.example.com"],
    ["STRIPE_SECRET_KEY", "sk_live_rejected"],
    ["STRIPE_SECRET_KEY", "sk_test_usable_keys_also_rejected"],
    ["STRIPE_WEBHOOK_SECRET", "whsec_unrelated"],
    ["OPH_TEST_PROJECT", "other-project"],
    ["NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-REAL"],
  ])("rejects unsafe %s", (name, value) => {
    expect(() => assertTestEnvironment({ ...valid, [name]: value })).toThrow();
  });
  it("strips inherited application credentials while preserving runtime proxy trust", () => {
    const env = isolatedProcessEnv(valid, {
      NODE_ENV: "production",
      STRIPE_SECRET_KEY: "sk_live_rejected", SUPABASE_ACCESS_TOKEN: "production-token",
      NEXT_PUBLIC_UNKNOWN_SERVICE: "https://production.example", VERCEL_URL: "production.example",
      HTTPS_PROXY: "http://proxy:8080", NODE_EXTRA_CA_CERTS: "/trusted-ca.pem",
    });
    expect(env.STRIPE_SECRET_KEY).toBe(INERT_STRIPE_KEY);
    expect(env).not.toHaveProperty("SUPABASE_ACCESS_TOKEN");
    expect(env).not.toHaveProperty("NEXT_PUBLIC_UNKNOWN_SERVICE");
    expect(env).not.toHaveProperty("VERCEL_URL");
    expect(env.HTTPS_PROXY).toBe("http://proxy:8080");
    expect(env.NODE_EXTRA_CA_CERTS).toBe("/trusted-ca.pem");
  });
});

describe("local lifecycle target", () => {
  const config = readFileSync(new URL("../../supabase/config.toml", import.meta.url), "utf8");
  it("accepts the checked-in dedicated project", () => expect(() => assertLocalProjectConfig(config)).not.toThrow());
  it("rejects another project even if comments mention the expected ID", () => {
    expect(() => assertLocalProjectConfig(config.replace('project_id = "ohio-parent-hub-test"',
      'project_id = "other-project"\n# project_id = "ohio-parent-hub-test"'))).toThrow();
  });
  it("rejects another API port even if the expected port appears elsewhere", () => {
    expect(() => assertLocalProjectConfig(config.replace("port = 55431", "port = 54321") + "\n# port = 55431")).toThrow();
  });
  it("rejects external SMTP delivery", () => {
    expect(() => assertLocalProjectConfig(config.replace("[auth.email.smtp]\nenabled = false", "[auth.email.smtp]\nenabled = true"))).toThrow();
  });
});
