import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { runRefresh } from "./directory/refresh.mjs";

try {
  const { values, positionals } = parseArgs({ options: { "report-sha256": { type: "string" } }, allowPositionals: true });
  const action = positionals[0] ?? "stage";
  if (positionals.length > 1 || (values["report-sha256"] && action !== "apply")) throw new Error("Unexpected refresh arguments");
  const result = runRefresh(fileURLToPath(new URL("../", import.meta.url)), action, values["report-sha256"]);
  console.log(`Directory ${action}: ${result.report.counts.source} CSV + ${result.report.counts.additions} additions = ${result.rows.length} programs; ${result.report.counts.geocodedAfter} coordinate pairs.`);
  if (action === "stage") {
    console.log(`Review .directory-refresh/report.json and candidate.json: ${result.report.added.length} added, ${result.report.removed.length} removed, ${result.report.changed.length} changed; ${result.report.invalidatedCoordinates.length} invalidated coordinate pairs.`);
    console.log(`After review: npm run data:apply -- --report-sha256=${result.reportHash}`);
  }
} catch (error) {
  console.error(`Directory refresh failed: ${error.message}`);
  process.exitCode = 1;
}
