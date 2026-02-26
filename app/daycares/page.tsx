import type { Metadata } from "next";
import DraftDaycaresPageClient from "@/components/DraftDaycaresPageClient";
import fs from "node:fs";
import path from "node:path";
import { resolveCanonicalCityName } from "@/lib/metroAreas";

export const metadata: Metadata = {
  title: "Best Daycares in Ohio | Search Licensed Child Care Near You",
  description: "Search and filter over 8,000 licensed daycare and childcare programs in Ohio. Compare providers by city, county, SUTQ rating, and program type.",
  keywords: [
    "best daycares in ohio",
    "licensed daycare ohio",
    "childcare near me",
    "ohio childcare search",
    "top rated daycare ohio",
  ],
  alternates: {
    canonical: "/daycares",
  },
  openGraph: {
    title: "Best Daycares in Ohio | Search Licensed Child Care",
    description: "Search and compare licensed childcare providers across Ohio with city and quality filters.",
    url: "https://ohioparenthub.com/daycares",
  },
};

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

function buildStatewideSnippetCopy(count: number) {
  return `Browse all ${count.toLocaleString()} licensed daycares in Ohio. Compare program type, SUTQ status, and key details to find childcare that fits your family.`;
}

function buildStatewideEditorialCopy(count: number) {
  return {
    intro:
      `Choosing childcare in Ohio can feel overwhelming, especially when every family's needs are different. ` +
      `This page includes all ${count.toLocaleString()} licensed daycares in Ohio, so you can compare program type, SUTQ status, and core listing details in one place.`,
    sutq:
      "Step Up To Quality (SUTQ) is Ohio's quality rating system for licensed early care and education programs. " +
      "Ratings shown are Gold, Silver, Bronze, or Not Rated. In general, higher tiers indicate programs meeting additional quality standards beyond baseline licensing.",
    choosingCare:
      "Use SUTQ as a starting filter, then confirm day-to-day fit directly with each program. " +
      "Compare program type, call to confirm openings and waitlist timing, ask about teacher consistency and daily communication, and schedule a tour before deciding.",
    transparency:
      "Ohio Parent Hub does not currently include parent reviews. We focus on licensing details, SUTQ status, program type, and core program information to support your research.",
    notRated:
      "Not Rated does not automatically mean low quality—it means no SUTQ tier is currently shown. Use tours, licensing details, and direct questions to evaluate fit.",
  };
}

export default function GlobalSearchPage() {
  const daycares = loadDaycares();
  const cityCount = new Set(daycares.map((d) => resolveCanonicalCityName(d.CITY || "")).filter(Boolean)).size;
  const initialDaycares = getInitialDaycares(daycares);
  const statewideSnippetCopy = buildStatewideSnippetCopy(daycares.length);
  const statewideEditorialCopy = buildStatewideEditorialCopy(daycares.length);

  return (
    <DraftDaycaresPageClient
      daycareCount={daycares.length}
      cityCount={cityCount}
      statewideSnippetCopy={statewideSnippetCopy}
      statewideIntroCopy={statewideEditorialCopy.intro}
      statewideSutqCopy={statewideEditorialCopy.sutq}
      statewideChoosingCareCopy={statewideEditorialCopy.choosingCare}
      statewideTransparencyCopy={statewideEditorialCopy.transparency}
      statewideNotRatedCopy={statewideEditorialCopy.notRated}
      initialDaycares={initialDaycares}
      basePath=""
      homeHref="/"
      searchHref="/daycares"
    />
  );
}
