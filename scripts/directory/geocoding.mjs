import { parse } from "csv-parse/sync";
import { addressHash } from "./pipeline.mjs";

const escapeCsv = value => `"${String(value).replace(/"/g, '""')}"`;
export function censusRequest(rows) {
  return rows.map(row => [row["PROGRAM NUMBER"], row["STREET ADDRESS"], row.CITY, row.STATE, row["ZIP CODE"].slice(0, 5)].map(escapeCsv).join(",")).join("\n") + "\n";
}

export function censusMatches(response, requested) {
  // Census No_Match responses can have fewer columns than successful matches.
  const records = parse(response, { bom: true, trim: true, skip_empty_lines: true, relax_column_count: true });
  const byId = new Map(requested.map(row => [row["PROGRAM NUMBER"], row]));
  const seen = new Set(), matches = {};
  for (const columns of records) {
    const [id, , status] = columns;
    if (!byId.has(id) || seen.has(id)) throw new Error("Census returned an unknown or duplicate program identifier");
    seen.add(id);
    if (status === "No_Match") continue;
    if (!["Match", "Tie"].includes(status) || !columns[5]) throw new Error(`Census ${id}: invalid match response`);
    const parts = columns[5].split(",").map(value => value.trim());
    const [lng, lat] = parts.map(Number);
    if (parts.length !== 2 || parts.some(value => !value) || !Number.isFinite(lat) || !Number.isFinite(lng) ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180) throw new Error(`Census ${id}: invalid coordinates`);
    matches[id] = { addressSha256: addressHash(byId.get(id)), LAT: lat, LNG: lng };
  }
  if (seen.size !== byId.size) throw new Error("Census response omitted requested programs");
  return matches;
}
