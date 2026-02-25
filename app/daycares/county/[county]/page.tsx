import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CountyDaycaresPageClient from "@/components/CountyDaycaresPageClient";
import { slugify } from "@/lib/utils";

type Props = { params: Promise<{ county?: string }> };

type DaycareRow = Record<string, string>;

export const revalidate = 86400;

function prettyCounty(county: string) {
  return decodeURIComponent(county || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function buildCountySnippetCopy(countyDisplay: string, count: number) {
  return `Compare ${count} licensed daycare programs in ${countyDisplay} County, OH. Review SUTQ ratings, locations, and contact details.`;
}

export async function generateStaticParams() {
  const countySlugs = Array.from(
    new Set(
      loadDaycares()
        .map((d) => slugify(d["COUNTY"] || ""))
        .filter(Boolean)
    )
  );

  return countySlugs.map((county) => ({ county }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { county } = await params;
  const countyParam = county ?? "";
  const countySlug = slugify(countyParam);
  const countyDisplay = prettyCounty(countyParam);

  const all = loadDaycares();
  const matches = all.filter((d) => {
    const dataCountySlug = slugify(d["COUNTY"] || "");
    return dataCountySlug === countySlug;
  });

  const count = matches.length;

  if (!countySlug || count === 0) {
    return {
      title: "County Not Found",
      description: "The requested county page was not found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const countySnippetCopy = buildCountySnippetCopy(countyDisplay, count);

  return {
    title: `Best Daycares in ${countyDisplay} County, Ohio`,
    description: countySnippetCopy,
    keywords: [
      `best daycares in ${countyDisplay} county`,
      `${countyDisplay} county daycare`,
      `${countyDisplay} county childcare`,
      `licensed daycare ${countyDisplay} county ohio`,
      `top rated daycare ${countyDisplay} county`,
    ],
    alternates: {
      canonical: `/daycares/county/${countySlug}`,
    },
    openGraph: {
      title: `Best Daycares in ${countyDisplay} County, Ohio`,
      description: countySnippetCopy,
      url: `https://ohioparenthub.com/daycares/county/${countySlug}`,
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: `Best Daycares in ${countyDisplay} County, Ohio | Ohio Parent Hub`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Best Daycares in ${countyDisplay} County, Ohio`,
      description: countySnippetCopy,
      images: ["/og-default.png"],
    },
  };
}

export default async function CountyDaycaresPage({ params }: Props) {
  const { county } = await params;
  const countyParam = county ?? "";
  const countySlug = slugify(countyParam);
  const countyDisplay = prettyCounty(countyParam);

  const all = loadDaycares();

  const matches = all.filter((d) => {
    const dataCountySlug = slugify(d["COUNTY"] || "");
    return dataCountySlug === countySlug;
  });

  if (!countySlug || matches.length === 0) {
    notFound();
  }

  const countySnippetCopy = buildCountySnippetCopy(countyDisplay, matches.length);

  return (
    <CountyDaycaresPageClient
      countyDisplay={countyDisplay}
      countySlug={countySlug}
      countyCount={matches.length}
      countySnippetCopy={countySnippetCopy}
      initialDaycares={matches.slice(0, 15)}
      basePath=""
      homeHref="/"
      countiesHref="/counties"
    />
  );
}
