import { test, expect } from "./public-fixtures";

test("the built application serves its public about page", async ({ page }) => {
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Ohio Parent Hub/i);
});
