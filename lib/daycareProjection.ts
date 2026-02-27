type DaycareRow = Record<string, string>;

const LIST_FIELDS = [
  "PROGRAM NUMBER",
  "PROGRAM NAME",
  "CITY",
  "COUNTY",
  "LAT",
  "LNG",
  "STREET ADDRESS",
  "ZIP CODE",
  "SUTQ RATING",
  "PFCC AGREEMENT",
  "PFCC",
  "PROGRAM TYPE",
  "wPROGRAM TYPE",
] as const;

export function projectDaycareListRow(row: DaycareRow): DaycareRow {
  const projected: DaycareRow = {};

  for (const field of LIST_FIELDS) {
    const value = row[field] as unknown;
    if (typeof value === "string" && value.length > 0) {
      projected[field] = value;
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      projected[field] = String(value);
    }
  }

  return projected;
}

export function projectDaycareListRows(rows: DaycareRow[]): DaycareRow[] {
  return rows.map(projectDaycareListRow);
}
