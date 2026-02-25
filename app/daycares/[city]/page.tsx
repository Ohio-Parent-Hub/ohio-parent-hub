import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DraftCityDaycaresPageClient from "@/components/DraftCityDaycaresPageClient";
import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";
import {
  getDaycaresForCitySlug,
  getMetroCitySlugs,
  getMetroDisplayNameBySlug,
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
  const city = daycare["CITY"] || "";
  return `${programNumber}-${slugify(name)}-${slugify(city)}`;
}

function daycareDisplayName(daycare: DaycareRow) {
  return toTitleCaseIfAllCaps(daycare["PROGRAM NAME"] || "") || "Licensed Daycare";
}

function buildCitySnippetCopy(cityDisplay: string, count: number) {
  return `Compare ${count} licensed daycare programs in ${cityDisplay}, OH. Review SUTQ ratings, locations, and contact details.`;
}

export async function generateStaticParams() {
  const allDaycares = loadDaycares();
  const citySlugs = Array.from(
    new Set(
      allDaycares
        .map((d) => slugify(d["CITY"] || ""))
        .filter(Boolean)
    )
  );

  citySlugs.push(...getMetroCitySlugs(allDaycares));

  return Array.from(new Set(citySlugs)).map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityParam = city ?? "";
  const citySlug = slugify(cityParam);
  const cityDisplay = getMetroDisplayNameBySlug(citySlug) || prettyCity(cityParam);
  
  const all = loadDaycares();
  const matches = getDaycaresForCitySlug(all, citySlug);
  
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
  const citySlug = slugify(cityParam);
  const cityDisplay = getMetroDisplayNameBySlug(citySlug) || prettyCity(cityParam);

  const all = loadDaycares();
  const matches = getDaycaresForCitySlug(all, citySlug);

  if (!citySlug || matches.length === 0) {
    notFound();
  }

  const citySnippetCopy = buildCitySnippetCopy(cityDisplay, matches.length);
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
        countyLinks={countyLinks}
        initialDaycares={matches.slice(0, 15)}
        basePath=""
        homeHref="/"
        citiesHref="/cities"
      />
    </>
  );
}
