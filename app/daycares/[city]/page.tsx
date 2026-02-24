import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DraftCityDaycaresPageClient from "@/components/DraftCityDaycaresPageClient";
import { slugify, toTitleCaseIfAllCaps } from "@/lib/utils";

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

export async function generateStaticParams() {
  const citySlugs = Array.from(
    new Set(
      loadDaycares()
        .map((d) => slugify(d["CITY"] || ""))
        .filter(Boolean)
    )
  );

  return citySlugs.map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityParam = city ?? "";
  const citySlug = slugify(cityParam);
  const cityDisplay = prettyCity(cityParam);
  
  const all = loadDaycares();
  const matches = all.filter((d) => {
    const dataCitySlug = slugify(d["CITY"] || "");
    return dataCitySlug === citySlug;
  });
  
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
  
  return {
    title: `Best Daycares in ${cityDisplay}, Ohio`,
    description: `Compare ${count} licensed daycare and childcare programs in ${cityDisplay}, OH. Explore SUTQ ratings, locations, and key provider details.`,
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
      description: `Compare ${count} licensed childcare programs in ${cityDisplay}, Ohio.`,
      url: `https://ohioparenthub.com/daycares/${citySlug}`,
    },
  };
}

export default async function CityDaycaresPage({ params }: Props) {
  const { city } = await params;
  const cityParam = city ?? "";
  const citySlug = slugify(cityParam);
  const cityDisplay = prettyCity(cityParam);

  const all = loadDaycares();

  const matches = all.filter((d) => {
    const dataCitySlug = slugify(d["CITY"] || "");
    return dataCitySlug === citySlug;
  });

  if (!citySlug || matches.length === 0) {
    notFound();
  }

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
        initialDaycares={matches.slice(0, 15)}
        basePath=""
        homeHref="/"
        citiesHref="/cities"
      />
    </>
  );
}
