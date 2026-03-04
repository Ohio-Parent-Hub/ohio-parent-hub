import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import DraftCityDaycaresPageClient from "@/components/DraftCityDaycaresPageClient";
import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";
import { projectDaycareListRows } from "@/lib/daycareProjection";
import {
  getDaycaresForCitySlug,
  getMetroCitySlugs,
  getMetroDisplayNameBySlug,
  resolveCanonicalCityName,
  resolveCanonicalCitySlugFromName,
  resolveCanonicalCitySlugFromSlug,
} from "@/lib/metroAreas";

type Props = { params: Promise<{ city?: string }> };

type DaycareRow = Record<string, string>;

export const revalidate = 86400;

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

function canonicalDaycareSlug(daycare: DaycareRow) {
  const programNumber = daycare["PROGRAM NUMBER"] || "";
  const name = daycare["PROGRAM NAME"] || "";
  const citySlug = resolveCanonicalCitySlugFromName(daycare["CITY"] || "");
  return `${programNumber}-${slugify(name)}-${citySlug}`;
}

function daycareDisplayName(daycare: DaycareRow) {
  return toTitleCaseIfAllCaps(daycare["PROGRAM NAME"] || "") || "Licensed Daycare";
}

function buildCitySnippetCopy(cityDisplay: string, count: number) {
  return `Browse all ${count.toLocaleString()} licensed daycares in ${cityDisplay}, Ohio. Compare program type, SUTQ status, and key details to find childcare that fits your family.`;
}

type CitySutqStats = {
  gold: number;
  silver: number;
  bronze: number;
  notRated: number;
  total: number;
};

function buildCitySutqStats(daycares: DaycareRow[]): CitySutqStats {
  let gold = 0;
  let silver = 0;
  let bronze = 0;
  let notRated = 0;
  for (const d of daycares) {
    const r = (d["SUTQ RATING"] || "").trim();
    if (r === "3") gold++;
    else if (r === "2") silver++;
    else if (r === "1") bronze++;
    else notRated++;
  }
  return { gold, silver, bronze, notRated, total: daycares.length };
}

function buildCityEditorialCopy(cityDisplay: string, count: number) {
  return {
    intro:
      `Choosing childcare in ${cityDisplay} can feel overwhelming, especially when every family's needs are different. ` +
      `This page includes all ${count.toLocaleString()} licensed daycares in ${cityDisplay}, Ohio, so you can compare program type, SUTQ status, and core listing details in one place.`,
    sutq:
      "Step Up To Quality (SUTQ) is Ohio's quality rating system for licensed early care and education programs. " +
      "Ratings shown are Gold, Silver, Bronze, or Not Rated. In general, higher tiers indicate programs meeting additional quality standards beyond baseline licensing.",
    choosingCare:
      `Use SUTQ as a starting filter, then confirm day-to-day fit directly with each program in ${cityDisplay}. ` +
      "Compare program type, call to confirm openings and waitlist timing, ask about teacher consistency and daily communication, and schedule a tour before deciding.",
    transparency:
      "Ohio Parent Hub does not currently include parent reviews. We focus on licensing details, SUTQ status, program type, and core program information to support your research.",
    notRated:
      "Not Rated does not automatically mean low quality—it means no SUTQ tier is currently shown. Use tours, licensing details, and direct questions to evaluate fit.",
  };
}

export async function generateStaticParams() {
  const allDaycares = loadDaycares();
  const citySlugs = Array.from(
    new Set(
      allDaycares
        .map((d) => resolveCanonicalCitySlugFromName(d["CITY"] || ""))
        .filter(Boolean)
    )
  );

  citySlugs.push(...getMetroCitySlugs(allDaycares));

  return Array.from(new Set(citySlugs)).map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityParam = city ?? "";
  const requestedCitySlug = slugify(cityParam);
  const citySlug = resolveCanonicalCitySlugFromSlug(requestedCitySlug);
  
  const all = loadDaycares();
  const matches = getDaycaresForCitySlug(all, citySlug);
  const cityDisplay =
    getMetroDisplayNameBySlug(citySlug)
    || toTitleCaseIfAllCaps(resolveCanonicalCityName(matches[0]?.["CITY"] || cityParam))
    || prettyCity(cityParam);
  
  const count = matches.length;

  if (!citySlug || count === 0) {
    return {
      title: "City Not Found",
      description: "The requested city page was not found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const citySnippetCopy = buildCitySnippetCopy(cityDisplay, count);
  
  return {
    title: `Best Daycares in ${cityDisplay}, Ohio`,
    description: citySnippetCopy,
    keywords: [
      `best daycares in ${cityDisplay}`,
      `${cityDisplay} daycare`,
      `${cityDisplay} childcare`,
      `licensed daycare ${cityDisplay} ohio`,
      `top rated daycare ${cityDisplay}`,
    ],
    alternates: {
      canonical: `/daycares/${citySlug}`,
    },
    openGraph: {
      title: `Best Daycares in ${cityDisplay}, Ohio`,
      description: citySnippetCopy,
      url: `https://ohioparenthub.com/daycares/${citySlug}`,
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: `Best Daycares in ${cityDisplay}, Ohio | Ohio Parent Hub`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Best Daycares in ${cityDisplay}, Ohio`,
      description: citySnippetCopy,
      images: ["/og-default.png"],
    },
  };
}

export default async function CityDaycaresPage({ params }: Props) {
  const { city } = await params;
  const cityParam = city ?? "";
  const requestedCitySlug = slugify(cityParam);
  const citySlug = resolveCanonicalCitySlugFromSlug(requestedCitySlug);

  if (requestedCitySlug && citySlug && requestedCitySlug !== citySlug) {
    permanentRedirect(`/daycares/${citySlug}`);
  }

  const all = loadDaycares();
  const matches = getDaycaresForCitySlug(all, citySlug);
  const cityDisplay =
    getMetroDisplayNameBySlug(citySlug)
    || toTitleCaseIfAllCaps(resolveCanonicalCityName(matches[0]?.["CITY"] || cityParam))
    || prettyCity(cityParam);

  if (!citySlug || matches.length === 0) {
    notFound();
  }

  const citySnippetCopy = buildCitySnippetCopy(cityDisplay, matches.length);
  const cityEditorialCopy = buildCityEditorialCopy(cityDisplay, matches.length);
  const sutqStats = buildCitySutqStats(matches);
  const countyLinks = Array.from(
    new Map(
      matches
        .map((daycare) => (daycare["COUNTY"] || "").trim())
        .filter(Boolean)
        .map((countyName) => {
          const countyLabel = `${toTitleCaseIfAllCaps(countyName)} County`;
          return [slugify(countyName), { label: countyLabel, href: `/daycares/county/${slugify(countyName)}` }];
        }),
    ).values(),
  ).slice(0, 5);

  const alphabeticalMatches = [...matches].sort((a, b) => {
    const aName = daycareDisplayName(a);
    const bName = daycareDisplayName(b);
    return aName.localeCompare(bName, undefined, { sensitivity: "base" });
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Licensed Daycares in ${cityDisplay}, Ohio`,
    numberOfItems: Math.min(10, alphabeticalMatches.length),
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: alphabeticalMatches.slice(0, 10).map((daycare, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: daycareDisplayName(daycare),
      url: `https://ohioparenthub.com/daycare/${canonicalDaycareSlug(daycare)}`,
    })),
  };
  const itemListJson = JSON.stringify(itemListSchema).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: itemListJson }}
      />
      <DraftCityDaycaresPageClient
        cityDisplay={cityDisplay}
        citySlug={citySlug}
        cityCount={matches.length}
        citySnippetCopy={citySnippetCopy}
        cityIntroCopy={cityEditorialCopy.intro}
        citySutqCopy={cityEditorialCopy.sutq}
        cityChoosingCareCopy={cityEditorialCopy.choosingCare}
        cityTransparencyCopy={cityEditorialCopy.transparency}
        cityNotRatedCopy={cityEditorialCopy.notRated}
        sutqStats={sutqStats}
        countyLinks={countyLinks}
        initialDaycares={projectDaycareListRows(matches.slice(0, 15))}
        basePath=""
        homeHref="/"
        citiesHref="/cities"
      />
    </>
  );
}
