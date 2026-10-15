import { readFileSync, writeFileSync, mkdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { generateDirectory, directoryDiff, serialize, sha256 } from "./pipeline.mjs";

const INPUTS = ["data/ohio_daycares.csv", "data/daycare-geocoding.json", "data/directory-additions.json",
  "data/daycares.json", "data/city-aliases.approved.json", "data/city-aliases.blocked.json",
  "lib/metroAreas.ts", "lib/utils.ts", "scripts/directory/pipeline.mjs", "scripts/directory/refresh.mjs"];

export function loadRefresh(root) {
  const files = Object.fromEntries(INPUTS.map(file => [file, readFileSync(path.join(root, file), "utf8")]));
  const geocoding = JSON.parse(files["data/daycare-geocoding.json"]);
  const result = generateDirectory(files["data/ohio_daycares.csv"], geocoding, JSON.parse(files["data/directory-additions.json"]));
  const before = JSON.parse(files["data/daycares.json"]);
  const candidate = serialize(result.rows);
  const report = {
    version: 1,
    inputs: Object.fromEntries(INPUTS.map(file => [file, sha256(files[file])])),
    candidateSha256: sha256(candidate),
    counts: { source: result.sourceCount, additions: result.additionIds.length, before: before.length, after: result.rows.length,
      geocodedBefore: before.filter(row => row.LAT !== undefined && row.LNG !== undefined).length,
      geocodedAfter: result.rows.filter(row => row.LAT !== undefined && row.LNG !== undefined).length },
    additions: result.additionIds,
    ...directoryDiff(before, result.rows),
    invalidatedCoordinates: result.invalidatedCoordinates,
    needsGeocoding: result.rows.filter(row => row.LAT === undefined).map(row => row["PROGRAM NUMBER"]),
    unusedGeocoding: result.unusedGeocoding,
  };
  const reportText = serialize(report) + "\n";
  return { ...result, geocoding, candidate, report, reportText, reportHash: sha256(reportText), published: files["data/daycares.json"] };
}

export function runRefresh(root, action, expectedReportHash) {
  const staged = path.join(root, ".directory-refresh");
  if (!["stage", "validate", "apply"].includes(action)) throw new Error("Expected stage, validate, or apply");
  const current = loadRefresh(root);
  if (action === "validate") {
    if (current.candidate !== current.published) {
      throw new Error("Directory is not reproducible from its inputs. Run npm run data:refresh, review the report, and explicitly apply the candidate. No data was written.");
    }
    return current;
  }
  if (action === "stage") {
    mkdirSync(staged, { recursive: true });
    writeFileSync(path.join(staged, "candidate.json"), current.candidate);
    writeFileSync(path.join(staged, "report.json"), current.reportText);
    return current;
  }
  // Bind explicit acceptance to both the reviewed report and the still-current inputs.
  if (!expectedReportHash || !/^[a-f0-9]{64}$/.test(expectedReportHash)) throw new Error("Apply requires --report-sha256=<reviewed report SHA256>");
  const savedReport = readFileSync(path.join(staged, "report.json"), "utf8");
  const savedCandidate = readFileSync(path.join(staged, "candidate.json"), "utf8");
  if (sha256(savedReport) !== expectedReportHash || current.reportHash !== expectedReportHash || savedCandidate !== current.candidate) {
    throw new Error("Staged report/candidate or inputs changed. Stage again and review the new report before applying. No data was written.");
  }
  const temporary = path.join(root, "data", `.daycares-${process.pid}.tmp`);
  try {
    writeFileSync(temporary, current.candidate, { flag: "wx" });
    renameSync(temporary, path.join(root, "data", "daycares.json"));
  } finally { rmSync(temporary, { force: true }); }
  return current;
}
