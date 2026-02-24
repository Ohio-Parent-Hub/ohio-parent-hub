import fs from "node:fs";
import path from "node:path";
import DraftDaycaresPageClient from "@/components/DraftDaycaresPageClient";

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function getInitialDaycares(daycares: DaycareRow[]) {
  return [...daycares]
    .sort((a, b) => {
      const ratingA = Number.parseInt(a["SUTQ RATING"] || "0", 10) || 0;
      const ratingB = Number.parseInt(b["SUTQ RATING"] || "0", 10) || 0;
      if (ratingA !== ratingB) return ratingB - ratingA;

      const nameA = a["PROGRAM NAME"] || "";
      const nameB = b["PROGRAM NAME"] || "";
      return nameA.localeCompare(nameB);
    })
    .slice(0, 30);
}

export default function DraftGlobalSearchPage() {
  const daycares = loadDaycares();
  const cityCount = new Set(daycares.map((d) => d.CITY).filter(Boolean)).size;
  const initialDaycares = getInitialDaycares(daycares);

  return (
    <DraftDaycaresPageClient
      daycareCount={daycares.length}
      cityCount={cityCount}
      initialDaycares={initialDaycares}
      basePath="/draft"
      homeHref="/draft"
      searchHref="/draft/daycares"
    />
  );
}
