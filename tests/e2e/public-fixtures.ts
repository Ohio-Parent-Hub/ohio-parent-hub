import { test as base, expect } from "@playwright/test";

// Stable checked-in directory record, independent of synthetic account fixtures.
export const provider = {
  name: "A Better Choice Childcare",
  path: "/daycare/400468-a-better-choice-childcare-columbus",
  lat: "40.019751773542",
  lon: "-82.964895378398",
};

export const test = base.extend<{ publicNetwork: void }>({
  publicNetwork: [async ({ page, baseURL }, use, testInfo) => {
    await page.addInitScript(() => localStorage.setItem("cookie-consent", "necessary"));
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("response", (response) => {
      if (new URL(response.url()).origin === baseURL && response.status() >= 500) {
        failures.push(`${response.status()} ${new URL(response.url()).pathname}`);
      }
    });
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== baseURL) return route.abort();
      // Simulate only the geocoding boundary; directory API, worker, map and navigation are real.
      if (url.pathname === "/api/geocode") {
        const q = url.searchParams.get("q") ?? "";
        return route.fulfill({ json: /Columbus/i.test(q) ? [{ lat: provider.lat, lon: provider.lon }] : [] });
      }
      return route.continue();
    });
    await use();
    if (failures.length) await testInfo.attach("public-errors", { body: failures.join("\n"), contentType: "text/plain" });
    expect(failures, "Fatal browser errors or local HTTP 5xx responses").toEqual([]);
  }, { auto: true }],
});
export { expect };
