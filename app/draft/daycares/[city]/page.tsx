import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import DraftCityDaycaresPageClient from "@/components/DraftCityDaycaresPageClient";

type Props = { params: Promise<{ city?: string }> };
type DaycareRow = Record<string, string>;

function prettyCity(city: string) {
  return decodeURIComponent(city || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

export default async function DraftCityDaycaresPage({ params }: Props) {
  const { city } = await params;
  const cityParam = city ?? "";
  const citySlug = cityParam.trim().toLowerCase();
  const cityDisplay = prettyCity(cityParam);

  const all = loadDaycares();
  const matches = all.filter((d) => {
    const dataCitySlug = (d["CITY"] || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    return dataCitySlug === citySlug;
  });

  if (!citySlug || matches.length === 0) {
    notFound();
  }

  return <DraftCityDaycaresPageClient cityDisplay={cityDisplay} citySlug={citySlug} cityCount={matches.length} daycares={matches} />;
}
