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

  const citySnippetCopy = `Browse all ${matches.length.toLocaleString()} licensed daycares in ${cityDisplay}, Ohio. Compare program type, SUTQ status, and key details to find childcare that fits your family.`;
  const cityIntroCopy = `Choosing childcare in ${cityDisplay} can feel overwhelming, especially when every family's needs are different. This page includes all ${matches.length.toLocaleString()} licensed daycares in ${cityDisplay}, Ohio, so you can compare program type, SUTQ status, and core listing details in one place.`;
  const citySutqCopy = "Step Up To Quality (SUTQ) is Ohio's quality rating system for licensed early care and education programs. Ratings shown are Gold, Silver, Bronze, or Not Rated. In general, higher tiers indicate programs meeting additional quality standards beyond baseline licensing.";
  const cityChoosingCareCopy = `Use SUTQ as a starting filter, then confirm day-to-day fit directly with each program in ${cityDisplay}. Compare program type, call to confirm openings and waitlist timing, ask about teacher consistency and daily communication, and schedule a tour before deciding.`;
  const cityTransparencyCopy = "Ohio Parent Hub does not currently include parent reviews. We focus on licensing details, SUTQ status, program type, and core program information to support your research.";
  const cityNotRatedCopy = "Not Rated does not automatically mean low quality—it means no SUTQ tier is currently shown. Use tours, licensing details, and direct questions to evaluate fit.";
  const countyLinks = Array.from(
    new Map(
      matches
        .map((daycare) => (daycare["COUNTY"] || "").trim())
        .filter(Boolean)
        .map((countyName) => {
          const countySlug = countyName
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
          const countyLabel = `${prettyCity(countyName)} County`;
          return [countySlug, { label: countyLabel, href: `/daycares/county/${countySlug}` }];
        }),
    ).values(),
  ).slice(0, 5);

  return (
    <DraftCityDaycaresPageClient
      cityDisplay={cityDisplay}
      citySlug={citySlug}
      cityCount={matches.length}
      citySnippetCopy={citySnippetCopy}
      countyLinks={countyLinks}
      initialDaycares={matches.slice(0, 15)}
      basePath="/draft"
      homeHref="/draft"
      citiesHref="/draft/cities"
    />
  );
}
