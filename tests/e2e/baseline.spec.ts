import { test, expect } from "@playwright/test";

// One startup check for OPH-11/12; discovery flow coverage follows in OPH-13.
test("the built application serves its public about page", async ({ page, baseURL }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return url.origin === baseURL ? route.continue() : route.abort();
  });
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Ohio Parent Hub/i);
  expect(failures).toEqual([]);
});
