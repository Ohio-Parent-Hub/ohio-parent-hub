// Explicit, optional Census batch request. Writes a review candidate, never published data.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import axios from "axios";
import FormData from "form-data";
import { loadRefresh } from "./directory/refresh.mjs";
import { serialize } from "./directory/pipeline.mjs";
import { censusRequest, censusMatches } from "./directory/geocoding.mjs";

async function main() {
  if (process.argv.length !== 2) throw new Error("This command accepts no arguments");
  const root = fileURLToPath(new URL("../", import.meta.url));
  const current = loadRefresh(root);
  const pending = current.rows.filter(row => row.LAT === undefined && !current.additionIds.includes(row["PROGRAM NUMBER"]));
  console.log(`${pending.length} source programs need geocoding; published data will not be changed.`);
  if (!pending.length) return;
  const candidate = { ...current.geocoding };
  const output = path.join(root, ".directory-refresh", "geocoding-candidate.json");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  for (let start = 0; start < pending.length; start += 1000) {
    const chunk = pending.slice(start, start + 1000);
    const form = new FormData();
    form.append("addressFile", Buffer.from(censusRequest(chunk), "utf8"), { filename: "addresses.csv", contentType: "text/csv" });
    form.append("benchmark", "Public_AR_Current");
    const response = await axios.post("https://geocoding.geo.census.gov/geocoder/locations/addressbatch", form, {
      headers: { ...form.getHeaders(), "User-Agent": "OhioParentHub/1.0 (https://ohioparenthub.com/; contact@ohioparenthub.com)" },
      timeout: 300000,
    });
    // Validate the whole response before accepting any result from this chunk.
    const matches = censusMatches(response.data, chunk);
    Object.assign(candidate, matches);
    fs.writeFileSync(output, serialize(candidate) + "\n");
    console.log(`Batch ${Math.floor(start / 1000) + 1}: ${Object.keys(matches).length}/${chunk.length} matches saved to .directory-refresh/geocoding-candidate.json for review.`);
    if (start + 1000 < pending.length) await new Promise(resolve => setTimeout(resolve, 2000));
  }
  console.log("Review the coordinate candidate before replacing data/daycare-geocoding.json, then stage and review a directory refresh. No published files were changed.");
}
main().catch(() => {
  // HTTP errors can contain request bodies/headers; report no raw transport details.
  console.error("Geocoding failed. Any completed batches remain in the review candidate; published files are unchanged. Validate the input and Census response before retrying.");
  process.exitCode = 1;
});
