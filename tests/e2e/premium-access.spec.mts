import { test, expect } from "@playwright/test";
import { API_URL } from "../support/environment.mjs";
import { FIXTURE_PASSWORD, providers } from "../fixtures/providers.mjs";

test.beforeEach(async ({ page, baseURL }) => {
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "necessary"));
  await page.route("**/*", route => {
    const origin = new URL(route.request().url()).origin;
    return origin === baseURL || origin === API_URL ? route.continue() : route.abort();
  });
});
for (const provider of providers.filter(p => p.programNumber.endsWith("-a"))) {
  test(`${provider.status}: editor and jobs access follow the subscription rule`, async ({ page, baseURL }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Email", { exact: true }).fill(provider.email);
    await page.getByLabel("Password", { exact: true }).fill(FIXTURE_PASSWORD);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page).toHaveURL(`${baseURL}/dashboard`);
    const entitled = ["active", "past_due"].includes(provider.status);
    for (const path of ["/dashboard/edit", "/dashboard/jobs"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(`${baseURL}${entitled ? path : "/dashboard"}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
}
