import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { slugify } from "@/lib/utils";
import { isTestDaycare } from "@/lib/utils";
import { resolveCanonicalCitySlugFromName } from "@/lib/metroAreas";

type DaycareRow = Record<string, string>;

let cachedData: DaycareRow[] | null = null;

function loadDaycares(): DaycareRow[] {
  if (cachedData) return cachedData;
  const filePath = path.join(process.cwd(), "data", "daycares.json");
  const raw = fs.readFileSync(filePath, "utf8");
  cachedData = JSON.parse(raw).filter((d: DaycareRow) => !isTestDaycare(d));
  return cachedData!;
}

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Normalize curly/smart quotes and backticks to straight apostrophes */
function normalizeApostrophes(s: string): string {
  return s.replace(/[\u2018\u2019\u201A\u201B\u0060\u00B4]/g, "'");
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const daycares = loadDaycares();
  const lower = normalizeApostrophes(q).toLowerCase();

  const matches = daycares
    .filter((d) => {
      const name = normalizeApostrophes(d["PROGRAM NAME"] || "").toLowerCase();
      return name.includes(lower);
    })
    .map((d) => {
      const programNumber = d["PROGRAM NUMBER"] || "";
      const name = d["PROGRAM NAME"] || "";
      const city = d["CITY"] || "";
      const citySlug = resolveCanonicalCitySlugFromName(city);
      const slug = `${programNumber}-${slugify(name)}-${citySlug}`;
      return {
        name: toTitleCase(name),
        city: toTitleCase(city),
        street: toTitleCase(d["STREET ADDRESS"] || ""),
        programType: toTitleCase(d["PROGRAM TYPE"] || ""),
        href: `/daycare/${slug}`,
      };
    });

  return NextResponse.json(matches);
}
