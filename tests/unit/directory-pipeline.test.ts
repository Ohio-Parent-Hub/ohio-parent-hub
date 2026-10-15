import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { SOURCE_FIELDS, addressHash, generateDirectory, parseSource, serialize } from "../../scripts/directory/pipeline.mjs";
import { loadRefresh, runRefresh } from "../../scripts/directory/refresh.mjs";
import { censusMatches, censusRequest } from "../../scripts/directory/geocoding.mjs";
import { resolveCanonicalCityName, resolveCanonicalCitySlugFromName, resolveCanonicalCitySlugFromSlug } from "@/lib/metroAreas";
import { isTestDaycare, slugify, toTitleCaseIfAllCaps } from "@/lib/utils";

const root = path.resolve(import.meta.dirname, "../..");
const record = (id = "00123", city = "COL") => Object.fromEntries(SOURCE_FIELDS.map(field => [field, ({
  "PROGRAM NUMBER": id, "PROGRAM NAME": 'YMCA "Learning, Together"', "STREET ADDRESS": "1 MAIN ST", CITY: city,
  STATE: "OH", "ZIP CODE": "43215", COUNTY: "FRANKLIN", "PROGRAM TYPE": "Licensed Child Care Center",
} as Record<string, string>)[field] ?? ""]));
const csv = (rows = [record()], fields = SOURCE_FIELDS) => fields.join(",") + "\n" + rows.map(row => fields.map(field =>
  `"${String(row[field]).replace(/"/g, '""')}"`).join(",")).join("\n") + "\n";
const geo = (row = record()) => ({ [row["PROGRAM NUMBER"]]: { addressSha256: addressHash(row), LAT: 39.9612, LNG: -82.9988 } });
const addition = () => ({ reason: "Intentional hidden test fixture", record: { ...record("00999"), _test: "true" } });
const temporary: string[] = [];
afterEach(() => { for (const dir of temporary.splice(0)) rmSync(dir, { recursive: true, force: true }); });
function workspace() {
  const dir = mkdtempSync(path.join(tmpdir(), "oph-directory-")); temporary.push(dir);
  for (const folder of ["data", "lib", "scripts/directory"]) mkdirSync(path.join(dir, folder), { recursive: true });
  for (const file of ["lib/metroAreas.ts", "lib/utils.ts", "scripts/directory/pipeline.mjs", "scripts/directory/refresh.mjs",
    "data/city-aliases.approved.json", "data/city-aliases.blocked.json"]) copyFileSync(path.join(root, file), path.join(dir, file));
  writeFileSync(path.join(dir, "data/ohio_daycares.csv"), csv());
  writeFileSync(path.join(dir, "data/daycare-geocoding.json"), serialize(geo()));
  writeFileSync(path.join(dir, "data/directory-additions.json"), serialize([addition()]));
  writeFileSync(path.join(dir, "data/daycares.json"), serialize(generateDirectory(csv(), geo(), [addition()]).rows));
  return dir;
}
const published = (dir: string) => readFileSync(path.join(dir, "data/daycares.json"), "utf8");

describe("strict source CSV parsing", () => {
  it("preserves quoted commas/escaped quotes, BOMs, CRLF and multiline cells with the existing trimming", () => {
    const row = { ...record(), "PROGRAM NAME": '  YMCA "Friends, Together"\nAFTER SCHOOL  ', EMAIL: "" };
    const text = "\uFEFF" + csv([row]).replace(/\n/g, "\r\n");
    expect(parseSource(text)).toEqual([{ ...row, "PROGRAM NAME": 'YMCA "Friends, Together"\r\nAFTER SCHOOL' }]);
  });
  it("preserves leading-zero identifiers and emits the same field order for reordered headers", () => {
    expect(parseSource(csv([record()], [...SOURCE_FIELDS].reverse()))).toEqual(parseSource(csv()));
    expect(parseSource(csv())[0]["PROGRAM NUMBER"]).toBe("00123");
  });
  it.each([
    ["missing column", () => csv([record()], SOURCE_FIELDS.slice(1))],
    ["duplicate header", () => csv().replace("PROGRAM NAME", "PROGRAM NUMBER")],
    ["unknown column", () => csv().replace("PFCC AGREEMENT", "_test")],
    ["short record", () => SOURCE_FIELDS.join(",") + '\n"123","short"\n'],
    ["long record", () => csv().trimEnd() + ',"unexpected"\n'],
    ["unclosed quote", () => csv().trimEnd() + '"'],
    ["duplicate identifier", () => csv([record(), record()])],
    ["missing identifier", () => csv([record("")])],
    ["non-digit identifier", () => csv([record("bad-id")])],
    ["blank city", () => csv([{ ...record(), CITY: " " }])],
    ["wrong state", () => csv([{ ...record(), STATE: "KY" }])],
    ["empty file", () => ""],
    ["header-only file", () => SOURCE_FIELDS.join(",")],
  ])("fails visibly for %s", (_label, input) => expect(() => parseSource(input())).toThrow());
});

describe("directory enrichment and identity", () => {
  it("keeps exact coordinates, source identifiers/values, and explicitly declared hidden additions", () => {
    const result = generateDirectory(csv(), geo(), [addition()]);
    expect(result.rows).toEqual([{ ...record(), LAT: 39.9612, LNG: -82.9988 }, addition().record]);
    expect(isTestDaycare(result.rows[1])).toBe(true);
    expect(result.invalidatedCoordinates).toEqual([]);
    expect(result.rows[0].CITY).toBe("COL"); // Runtime aliasing must not rewrite source data.
  });
  it.each(["STREET ADDRESS", "CITY", "STATE", "ZIP CODE"])("invalidates stale coordinates when %s changes", field => {
    const source = record();
    // STATE validation rejects a non-OH source; the cache can still reference an older address/state.
    const previous = { ...source, [field]: "old value" };
    const result = generateDirectory(csv([source]), geo(previous), []);
    expect(result.rows[0]).not.toHaveProperty("LAT");
    expect(result.rows[0]).not.toHaveProperty("LNG");
    expect(result.invalidatedCoordinates).toEqual(["00123"]);
  });
  it("retains coordinates for non-address updates and never imports a provider overlay into source fields", () => {
    const updated = { ...record(), "PROGRAM NAME": "New Name", PHONE: "614-555-0100" };
    expect(generateDirectory(csv([updated]), geo(), []).rows[0]).toEqual({ ...updated, LAT: 39.9612, LNG: -82.9988 });
    expect(() => generateDirectory(csv([updated]), { ...geo(), "00123": { ...geo()["00123"], description: "provider overlay" } }, [])).toThrow();
  });
  it("reports orphaned cache entries without reintroducing removed programs or transferring coordinates to a new ID", () => {
    const result = generateDirectory(csv([record("00234")]), geo(), []);
    expect(result.rows).toEqual([record("00234")]);
    expect(result.unusedGeocoding).toEqual(["00123"]);
  });
  it.each([
    { LAT: 91, LNG: -82 }, { LAT: 39, LNG: -181 }, { LAT: "39", LNG: -82 }, { LAT: 39 },
  ])("rejects invalid/partial coordinate pairs: %j", pair => {
    expect(() => generateDirectory(csv(), { "00123": { addressSha256: addressHash(record()), ...pair } }, [])).toThrow();
  });
  it("rejects invalid address fingerprints", () => {
    expect(() => generateDirectory(csv(), { "00123": { ...geo()["00123"], addressSha256: "bad" } }, [])).toThrow();
  });
  it.each([
    () => [{ ...addition(), reason: "" }],
    () => [{ ...addition(), record: record() }],
    () => [addition(), addition()],
    () => [{ ...addition(), record: { ...addition().record, _test: true } }],
    () => [{ ...addition(), record: { ...addition().record, arbitrary: "unsupported" } }],
  ])("rejects additions without explicit provenance or unambiguous preservation rules", additions => {
    expect(() => generateDirectory(csv(), geo(), additions())).toThrow();
  });
});

describe("staging, validation and explicit acceptance", () => {
  it("stages reproducibly without changing published data and validates without writing", () => {
    const dir = workspace(), before = published(dir);
    const first = runRefresh(dir, "stage"), second = runRefresh(dir, "stage");
    expect(first.candidate).toBe(second.candidate); expect(first.reportText).toBe(second.reportText);
    expect(first.report).toMatchObject({ added: [], removed: [], changed: [], orderChanged: false });
    expect(runRefresh(dir, "validate").candidate).toBe(before); expect(published(dir)).toBe(before);
  });
  it("reports added, removed, changed and URL-sensitive records, and applies only the reviewed candidate", () => {
    const dir = workspace(), before = published(dir);
    writeFileSync(path.join(dir, "data/ohio_daycares.csv"), csv([{ ...record(), CITY: "COLUMBUS" }, record("00456")]));
    writeFileSync(path.join(dir, "data/directory-additions.json"), "[]");
    const result = runRefresh(dir, "stage");
    expect(result.report).toMatchObject({ counts: { before: 2, after: 2, geocodedBefore: 1, geocodedAfter: 0 },
      added: ["00456"], removed: ["00999"], changed: [{ programNumber: "00123", fields: ["CITY", "LAT", "LNG"], urlReviewRequired: true }],
      invalidatedCoordinates: ["00123"], needsGeocoding: ["00123", "00456"] });
    expect(() => runRefresh(dir, "validate")).toThrow(/not reproducible/); expect(published(dir)).toBe(before);
    runRefresh(dir, "apply", result.reportHash); expect(published(dir)).toBe(result.candidate);
    expect(runRefresh(dir, "validate").candidate).toBe(result.candidate);
    expect(() => runRefresh(dir, "apply", result.reportHash)).toThrow(/changed/);
  });
  it("detects accidentally stripped geocoding and missing test additions in the published file", () => {
    const dir = workspace();
    writeFileSync(path.join(dir, "data/daycares.json"), serialize([record()]));
    expect(() => runRefresh(dir, "validate")).toThrow(/not reproducible/);
  });
  it.each(["missing hash", "wrong hash", "candidate tampering", "report tampering", "CSV changed", "geocoding changed", "additions changed", "aliases changed", "blocked list changed", "runtime changed"])("refuses %s without modifying the published file", mode => {
    const dir = workspace(), before = published(dir), staged = runRefresh(dir, "stage");
    if (mode === "candidate tampering") writeFileSync(path.join(dir, ".directory-refresh/candidate.json"), "[]");
    if (mode === "report tampering") writeFileSync(path.join(dir, ".directory-refresh/report.json"), "{}");
    if (mode === "CSV changed") writeFileSync(path.join(dir, "data/ohio_daycares.csv"), csv([{ ...record(), PHONE: "new phone" }]));
    if (mode === "geocoding changed") writeFileSync(path.join(dir, "data/daycare-geocoding.json"), "{}");
    if (mode === "additions changed") writeFileSync(path.join(dir, "data/directory-additions.json"), "[]");
    if (mode === "aliases changed") writeFileSync(path.join(dir, "data/city-aliases.approved.json"), "{}");
    if (mode === "blocked list changed") writeFileSync(path.join(dir, "data/city-aliases.blocked.json"), "{}");
    if (mode === "runtime changed") writeFileSync(path.join(dir, "lib/metroAreas.ts"), "changed runtime");
    const hash = mode === "missing hash" ? undefined : mode === "wrong hash" ? "0".repeat(64) : staged.reportHash;
    expect(() => runRefresh(dir, "apply", hash)).toThrow(); expect(published(dir)).toBe(before);
  });
});

describe("Census review candidates", () => {
  it("escapes request quotes, commas and multiline fields instead of altering addresses", () => {
    const row = { ...record(), "STREET ADDRESS": '1 "MAIN", ST\nSUITE A' };
    expect(censusRequest([row])).toContain('"1 ""MAIN"", ST\nSUITE A"');
  });
  it("accepts valid match/no-match rows and ties while binding coordinates to the requested address", () => {
    const first = record(), second = record("00234");
    const response = '00123,address,Match,Exact,matched,"-82.9988,39.9612",line,L\n00234,address,No_Match\n';
    expect(censusMatches(response, [first, second])).toEqual(geo());
    expect(censusMatches(response.replace(",Match,", ",Tie,"), [first, second])).toEqual(geo());
  });
  it.each([
    '00123,address,Match,Exact,matched,"-82,999"',
    '00123,address,Match,Exact,matched,",39"',
    '00123,address,Match,Exact,matched,"-82,39,0"',
    '00123,address,Match', '00123,address,unknown', '00234,address,No_Match',
    '00123,address,No_Match\n00123,address,No_Match', '', '00123,"unterminated',
  ])("rejects malformed/unknown/duplicate/missing results without silently dropping them", response => {
    expect(() => censusMatches(response, [record()])).toThrow();
  });
});

describe("checked-in directory and runtime normalization regression", () => {
  it("reproduces the full published file byte-for-byte with the two existing hidden test records", () => {
    const result = loadRefresh(root);
    expect(result.candidate).toBe(result.published);
    expect(result.report.counts).toEqual({ source: 8074, additions: 2, before: 8076, after: 8076, geocodedBefore: 7641, geocodedAfter: 7641 });
    expect(result.report.additions).toEqual(["9999999999", "9999999998"]);
    expect(result.rows.filter(isTestDaycare)).toHaveLength(2);
    expect(result.report).toMatchObject({ added: [], removed: [], changed: [], invalidatedCoordinates: [], unusedGeocoding: [] });
    const publishedRows = JSON.parse(result.published) as Record<string, string>[];
    // These identities key claims, premium listings and jobs in Supabase; refreshes never contact it.
    expect(result.rows.map((row: Record<string, string>) => row["PROGRAM NUMBER"])).toEqual(publishedRows.map(row => row["PROGRAM NUMBER"]));
    const publicIdentity = (row: Record<string, string>) => ({
      detailSlug: `${row["PROGRAM NUMBER"]}-${slugify(row["PROGRAM NAME"])}-${resolveCanonicalCitySlugFromName(row.CITY)}`,
      city: resolveCanonicalCityName(row.CITY), county: row.COUNTY,
      name: toTitleCaseIfAllCaps(row["PROGRAM NAME"]), address: toTitleCaseIfAllCaps(row["STREET ADDRESS"]),
    });
    expect(result.rows.map(publicIdentity)).toEqual(publishedRows.map(publicIdentity));
  });
  it.each([
    ["COL", "COLUMBUS", "columbus"], ["CIN", "CINCINNATI", "cincinnati"],
    ["N. CANTON", "NORTH CANTON", "north-canton"], ["LIBERTY TWP", "LIBERTY TOWNSHIP", "liberty-township"],
    ["MC ARTHUR", "MCARTHUR", "mcarthur"], ["LEWISBURG OH", "LEWISBURG", "lewisburg"],
    ["CLEVELAND HTS.", "CLEVELAND HEIGHTS", "cleveland-heights"],
  ])("preserves the existing canonical city resolution for %s", (raw, name, slug) => {
    expect(resolveCanonicalCityName(raw)).toBe(name);
    expect(resolveCanonicalCitySlugFromName(raw)).toBe(slug);
    expect(resolveCanonicalCitySlugFromSlug(slug)).toBe(slug);
  });
  it("keeps distinct cities separate and preserves display capitalization rules", () => {
    expect(resolveCanonicalCitySlugFromName("COLUMBIANA")).not.toBe(resolveCanonicalCitySlugFromName("COLUMBUS"));
    expect(toTitleCaseIfAllCaps("YMCA OF MCDONALD LLC")).toBe("YMCA Of McDonald LLC");
    expect(toTitleCaseIfAllCaps("Already Mixed CASE")).toBe("Already Mixed CASE");
    const blocked = JSON.parse(readFileSync(path.join(root, "data/city-aliases.blocked.json"), "utf8"));
    expect(blocked.blockedPairs).toEqual([]); // Current reviewed baseline; no fuzzy aliases are added here.
  });
});
