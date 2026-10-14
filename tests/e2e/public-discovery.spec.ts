import { test, expect, provider } from "./public-fixtures";

async function canonical(page: import("@playwright/test").Page, path: string) {
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://ohioparenthub.com${path === "/" ? "" : path}`);
}

test("homepage location search reaches real statewide results and provider detail", async ({ page, baseURL }) => {
  expect((await page.goto("/"))?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await canonical(page, "/");
  await page.getByRole("textbox", { name: "Search for a daycare" }).fill("Columbus");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/daycares\?lat=.*q=Columbus/);
  await expect(page.getByText("Showing results near", { exact: false }).filter({ visible: true })).toContainText("Columbus");
  await page.getByPlaceholder("Daycare name").fill(provider.name);
  await page.getByRole("link", { name: provider.name, exact: true }).filter({ visible: true }).click();
  await expect(page).toHaveURL(new URL(provider.path, baseURL).href);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(provider.name);
  await canonical(page, provider.path);
  await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
  await expect(page.locator('a[href^="tel:"]')).toHaveAttribute("href", /614[- ]?268[- ]?8503/);
  await page.getByRole("button", { name: "Back to results" }).click();
  // Return uses the canonical pathname; filters and location restore from session storage.
  await expect(page).toHaveURL(new URL("/daycares", baseURL).href);
  await expect(page.getByText("Showing results near", { exact: false }).filter({ visible: true })).toContainText("Columbus");
  await expect(page.getByRole("link", { name: provider.name, exact: true }).filter({ visible: true })).toBeVisible();
});

test("unknown homepage location has a useful retry message", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Search for a daycare" }).fill("No such location");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByText("Address not found. Try a city name or ZIP code.")).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test("statewide name and rating filters change real results", async ({ page }) => {
  expect((await page.goto("/daycares"))?.status()).toBe(200);
  await canonical(page, "/daycares");
  await page.getByPlaceholder("Daycare name").fill(provider.name);
  const result = page.getByRole("link", { name: provider.name, exact: true }).filter({ visible: true });
  await expect(result).toBeVisible();
  await page.getByRole("button", { name: "Rating", exact: true }).filter({ visible: true }).click();
  await page.getByRole("checkbox", { name: /Gold/i }).check();
  await expect(result).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Rating/ }).filter({ visible: true }).click();
  await page.getByRole("checkbox", { name: /Gold/i }).uncheck();
  await page.keyboard.press("Escape");
  await expect(result).toBeVisible();
});

for (const route of [
  { index: "/cities", path: "/daycares/columbus", heading: /Columbus/i },
  { index: "/counties", path: "/daycares/county/franklin", heading: /Franklin County/i },
]) {
  test(`${route.path} supports discovery and back navigation`, async ({ page, baseURL }) => {
    expect((await page.goto(route.index))?.status()).toBe(200);
    await page.locator(`a[href="${route.path}"]`).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(new URL(route.path, baseURL).href);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(route.heading);
    await canonical(page, route.path);
    await page.getByPlaceholder("Daycare name").fill(provider.name);
    const link = page.getByRole("link", { name: provider.name, exact: true }).filter({ visible: true });
    await expect(link).toHaveAttribute("href", provider.path);
    await link.click();
    await expect(page).toHaveURL(new URL(provider.path, baseURL).href);
    await page.getByRole("button", { name: "Back to results" }).click();
    await expect(page).toHaveURL(new URL(route.path, baseURL).href);
    await expect(page.getByRole("link", { name: provider.name, exact: true }).filter({ visible: true })).toBeVisible();
  });
}

test("map markers and results survive unavailable third-party tiles", async ({ page }) => {
  await page.goto(`/daycares?lat=${provider.lat}&lng=${provider.lon}&q=Columbus`);
  await page.getByPlaceholder("Daycare name").fill(provider.name);
  await expect(page.locator(".leaflet-container").filter({ visible: true })).toBeVisible();
  await expect(page.locator(".leaflet-marker-icon").filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /1 Results in Map View/ }).filter({ visible: true })).toBeVisible();
  await expect(page.getByRole("link", { name: provider.name, exact: true }).filter({ visible: true })).toBeVisible();
});

test("missing public routes and production-only draft blocking return 404", async ({ page }) => {
  for (const path of ["/daycare/0000000000-missing", "/daycares/not-a-real-ohio-city", "/daycares/county/not-a-real-county", "/draft", "/draft/daycares", "/draft/daycare/400468", "/design-preview", "/design-preview/exact"]) {
    expect((await page.goto(path))?.status(), path).toBe(404);
  }
});

test("legacy detail query and outdated slugs redirect to canonical detail", async ({ page, baseURL }) => {
  await page.goto(`${provider.path}?context=city&returnTo=%2Fdaycares%2Fcolumbus`);
  await expect(page).toHaveURL(new URL(provider.path, baseURL).href);
  await page.goto("/daycare/400468-old-name");
  await expect(page).toHaveURL(new URL(provider.path, baseURL).href);
  await canonical(page, provider.path);
});
