import { createHash } from "node:crypto";
import { parse } from "csv-parse/sync";

export const SOURCE_FIELDS = [
  "PROGRAM NUMBER", "PROGRAM NAME", "STREET ADDRESS", "CITY", "STATE", "ZIP CODE", "COUNTY",
  "PHONE", "EMAIL", "PROGRAM TYPE", "SUTQ RATING",
  "LICENSE/CERTIFICATION/REGISTRATION BEGIN DATE", "LICENSE/CERTIFICATION/REGISTRATION END DATE",
  "ADMINISTRATOR 1 NAME", "ADMINISTRATOR 2 NAME", "ADMINISTRATOR 3 NAME", "PFCC AGREEMENT",
];
const REQUIRED_VALUES = ["PROGRAM NAME", "STREET ADDRESS", "CITY", "STATE", "ZIP CODE", "COUNTY", "PROGRAM TYPE"];
const ADDRESS_FIELDS = ["STREET ADDRESS", "CITY", "STATE", "ZIP CODE"];
export const sha256 = value => createHash("sha256").update(value).digest("hex");
export const serialize = value => JSON.stringify(value, null, 2);
export const addressHash = row => sha256(JSON.stringify(ADDRESS_FIELDS.map(field => row[field])));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function programId(id, context) {
  assert(typeof id === "string" && /^\d+$/.test(id), `${context}: missing or invalid PROGRAM NUMBER (must be a digit string)`);
}
function object(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function coordinates(row, context) {
  assert(typeof row.LAT === "number" && Number.isFinite(row.LAT) && row.LAT >= -90 && row.LAT <= 90 &&
    typeof row.LNG === "number" && Number.isFinite(row.LNG) && row.LNG >= -180 && row.LNG <= 180,
  `${context}: invalid LAT/LNG pair`);
}
function record(row, context) {
  assert(object(row), `${context}: expected a record`);
  programId(row["PROGRAM NUMBER"], context);
  for (const field of SOURCE_FIELDS) assert(typeof row[field] === "string", `${context}: missing/string required column ${field}`);
  for (const field of REQUIRED_VALUES) assert(row[field].trim().length > 0, `${context}: empty ${field}`);
  assert(row.STATE === "OH", `${context}: STATE must be OH`);
  if (Object.hasOwn(row, "LAT") || Object.hasOwn(row, "LNG")) coordinates(row, context);
  if (Object.hasOwn(row, "_test")) assert(row._test === "true", `${context}: _test must be the string true`);
  for (const field of Object.keys(row)) assert([...SOURCE_FIELDS, "LAT", "LNG", "_test"].includes(field), `${context}: unsupported field ${field}; define its preservation rule first`);
}
export function indexRecords(rows, context) {
  assert(Array.isArray(rows) && rows.length > 0, `${context}: expected a nonempty array`);
  const indexed = new Map();
  rows.forEach((row, index) => {
    record(row, `${context} record ${index + 1}`);
    const id = row["PROGRAM NUMBER"];
    assert(!indexed.has(id), `${context}: duplicate PROGRAM NUMBER ${id}`);
    indexed.set(id, row);
  });
  return indexed;
}

export function parseSource(csv) {
  // Strict column counts/quotes: never silently skip a malformed record.
  const records = parse(csv, { bom: true, skip_empty_lines: true, trim: true, columns: headers => {
    const names = headers.map(header => header.trim());
    assert(new Set(names).size === names.length, "CSV: duplicate header");
    assert(names.length === SOURCE_FIELDS.length && SOURCE_FIELDS.every(field => names.includes(field)), "CSV: required columns changed; expected " + SOURCE_FIELDS.join(", "));
    return names;
  } });
  // Match the previous builder's trimming, including spaces inside quoted cells.
  const rows = records.map(row => Object.fromEntries(SOURCE_FIELDS.map(field => [field, row[field].trim()])));
  indexRecords(rows, "CSV");
  return rows;
}

export function generateDirectory(csv, geocoding, additions) {
  const source = parseSource(csv);
  assert(object(geocoding), "Geocoding: expected an object keyed by PROGRAM NUMBER");
  for (const [id, entry] of Object.entries(geocoding)) {
    programId(id, "Geocoding");
    assert(object(entry) && /^[a-f0-9]{64}$/.test(entry.addressSha256) &&
      Object.keys(entry).sort().join(",") === "LAT,LNG,addressSha256", `Geocoding ${id}: invalid entry`);
    coordinates(entry, `Geocoding ${id}`);
  }
  assert(Array.isArray(additions), "Additions: expected an array");
  const sourceIds = new Set(source.map(row => row["PROGRAM NUMBER"]));
  const additionIds = new Set();
  const extraRows = additions.map((entry, index) => {
    assert(object(entry) && typeof entry.reason === "string" && entry.reason.trim(), `Addition ${index + 1}: reason required`);
    record(entry.record, `Addition ${index + 1}`);
    const id = entry.record["PROGRAM NUMBER"];
    assert(!sourceIds.has(id) && !additionIds.has(id), `Addition ${id}: duplicate/source collision`);
    assert(!Object.hasOwn(geocoding, id), `Addition ${id}: coordinates must live with the addition`);
    additionIds.add(id);
    return { ...entry.record };
  });
  const invalidatedCoordinates = [];
  const rows = source.map(row => {
    const saved = geocoding[row["PROGRAM NUMBER"]];
    if (!saved) return row;
    if (saved.addressSha256 !== addressHash(row)) {
      invalidatedCoordinates.push(row["PROGRAM NUMBER"]);
      return row;
    }
    return { ...row, LAT: saved.LAT, LNG: saved.LNG };
  }).concat(extraRows);
  indexRecords(rows, "Candidate");
  return { rows, sourceCount: source.length, additionIds: [...additionIds], invalidatedCoordinates,
    unusedGeocoding: Object.keys(geocoding).filter(id => !sourceIds.has(id)).sort() };
}

export function directoryDiff(before, after) {
  const old = indexRecords(before, "Published directory"), next = indexRecords(after, "Candidate");
  const added = [], removed = [], changed = [];
  for (const [id, row] of next) {
    if (!old.has(id)) { added.push(id); continue; }
    const prior = old.get(id);
    const fields = [...new Set([...Object.keys(prior), ...Object.keys(row)])].filter(field => prior[field] !== row[field]).sort();
    if (fields.length) changed.push({ programNumber: id, fields,
      urlReviewRequired: fields.some(field => ["PROGRAM NAME", "CITY"].includes(field)) });
  }
  for (const id of old.keys()) if (!next.has(id)) removed.push(id);
  return { added, removed, changed, orderChanged: [...old.keys()].join(",") !== [...next.keys()].join(",") };
}
