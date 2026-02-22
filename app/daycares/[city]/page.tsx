import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
  
  const count = matches.length;

  if (!citySlug || count === 0) {
    return {
      title: "City Not Found | Ohio Parent Hub",
      description: "The requested city page was not found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  
  return {
    title: `Best Daycares in ${cityDisplay}, Ohio | Ohio Parent Hub`,
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

  return (
    <DraftCityDaycaresPageClient
      cityDisplay={cityDisplay}
      citySlug={citySlug}
      cityCount={matches.length}
      daycares={matches}
      basePath=""
      homeHref="/"
      citiesHref="/cities"
    />
  );
}
