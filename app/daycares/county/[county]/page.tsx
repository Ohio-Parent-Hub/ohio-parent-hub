import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CountyDaycaresPageClient from "@/components/CountyDaycaresPageClient";
import { slugify } from "@/lib/utils";
import { projectDaycareListRows } from "@/lib/daycareProjection";

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
  return `Browse all ${count.toLocaleString()} licensed daycares in ${countyDisplay} County, Ohio. Compare program type, SUTQ status, and key details to find childcare that fits your family.`;
}

function buildCountyEditorialCopy(countyDisplay: string, count: number) {
  return {
    intro:
      `Choosing childcare in ${countyDisplay} County can feel overwhelming, especially when every family's needs are different. ` +
      `This page includes all ${count.toLocaleString()} licensed daycares in ${countyDisplay} County, Ohio, so you can compare program type, SUTQ status, and core listing details in one place.`,
    sutq:
      "Step Up To Quality (SUTQ) is Ohio's quality rating system for licensed early care and education programs. " +
      "Ratings shown are Gold, Silver, Bronze, or Not Rated. In general, higher tiers indicate programs meeting additional quality standards beyond baseline licensing.",
    choosingCare:
      `Use SUTQ as a starting filter, then confirm day-to-day fit directly with each program in ${countyDisplay} County. ` +
      "Compare program type, call to confirm openings and waitlist timing, ask about teacher consistency and daily communication, and schedule a tour before deciding.",
    transparency:
      "Ohio Parent Hub does not currently include parent reviews. We focus on licensing details, SUTQ status, program type, and core program information to support your research.",
    notRated:
      "Not Rated does not automatically mean low quality—it means no SUTQ tier is currently shown. Use tours, licensing details, and direct questions to evaluate fit.",
  };
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
  const countyEditorialCopy = buildCountyEditorialCopy(countyDisplay, matches.length);

  return (
    <CountyDaycaresPageClient
      countyDisplay={countyDisplay}
      countySlug={countySlug}
      countyCount={matches.length}
      countySnippetCopy={countySnippetCopy}
      countyIntroCopy={countyEditorialCopy.intro}
      countySutqCopy={countyEditorialCopy.sutq}
      countyChoosingCareCopy={countyEditorialCopy.choosingCare}
      countyTransparencyCopy={countyEditorialCopy.transparency}
      countyNotRatedCopy={countyEditorialCopy.notRated}
      initialDaycares={projectDaycareListRows(matches.slice(0, 15))}
      basePath=""
      homeHref="/"
      countiesHref="/counties"
    />
  );
}
