import { test, expect } from "@playwright/test";
import { localClient } from "../support/clients.mjs";
import { API_URL } from "../support/environment.mjs";
import { FIXTURE_PASSWORD, providers } from "../fixtures/providers.mjs";

test.beforeEach(async ({ page, baseURL }) => {
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "necessary"));
  await page.route("**/*", route => {
    const origin = new URL(route.request().url()).origin;
    return origin === baseURL || origin === API_URL ? route.continue() : route.abort();
  });
});

test("forged signup metadata is rejected by the built dashboard and shows an actionable error", async ({ page }) => {
  const email = "oph-browser-claim@example.test";
  const admin = localClient("service");
  const result = await admin.auth.admin.createUser({ email, password: FIXTURE_PASSWORD, email_confirm: true, user_metadata: { program_number: "400468" } });
  expect(result.error).toBeNull();
  try {
    await page.goto("/auth/login");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(FIXTURE_PASSWORD);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/login\?claim_error=email_mismatch/);
    await expect(page.getByRole("alert").filter({ hasText: /confirmed email|save your claim/ })).toContainText("does not match the email on the childcare license");
    await expect(page.getByRole("alert").filter({ hasText: /confirmed email|save your claim/ })).toContainText("info@ohioparenthub.com");
    const profile = await admin.from("profiles").select("id").eq("id", result.data.user!.id);
    expect(profile.error).toBeNull(); expect(profile.data).toEqual([]);
  } finally { expect((await admin.auth.admin.deleteUser(result.data.user!.id)).error).toBeNull(); }
});

test("an established owner can still sign in and reach their dashboard", async ({ page, baseURL }) => {
  await page.goto("/auth/login");
  await page.getByLabel("Email", { exact: true }).fill(providers[0].email);
  await page.getByLabel("Password", { exact: true }).fill(FIXTURE_PASSWORD);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(`${baseURL}/dashboard`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dashboard");
  await expect(page.getByText(providers[0].email, { exact: true })).toBeVisible();
});

test("claim persistence failures are visible on the login screen", async ({ page }) => {
  await page.goto("/auth/login?claim_error=persistence");
  await expect(page.getByRole("alert").filter({ hasText: /confirmed email|save your claim/ })).toContainText("We could not save your claim");
});
