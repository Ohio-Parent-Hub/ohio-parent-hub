import fs from "node:fs";
import path from "node:path";
import DraftDaycaresPageClient from "@/components/DraftDaycaresPageClient";

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export default function DraftGlobalSearchPage() {
  const daycares = loadDaycares();
  const cityCount = new Set(daycares.map((d) => d.CITY).filter(Boolean)).size;

  return (
    <DraftDaycaresPageClient
      daycareCount={daycares.length}
      cityCount={cityCount}
      basePath="/draft"
      homeHref="/draft"
      searchHref="/draft/daycares"
    />
  );
}
