import fs from "node:fs";
import path from "node:path";

function parseCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

const csvPath = path.join(process.cwd(), "data", "ohio_daycares.csv");
const outPath = path.join(process.cwd(), "data", "daycares.json");

const raw = fs.readFileSync(csvPath, "utf8");
const lines = raw.split(/\r?\n/).filter(Boolean);

const headers = parseCSVLine(lines[0]).map((h) => h.trim());
const rows = [];

for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  if (cols.length !== headers.length) continue;

  const row = {};
  for (let j = 0; j < headers.length; j++) {
    row[headers[j]] = (cols[j] ?? "").trim();
  }
  rows.push(row);
}

fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
console.log(`Wrote ${rows.length} records to ${outPath}`);
