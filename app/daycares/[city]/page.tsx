import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SutqBadge } from "@/components/SutqBadge";
import type { Metadata } from "next";

type Props = { params: Promise<{ city?: string }> };

type DaycareRow = Record<string, string>;

function prettyCity(city: string) {
  return decodeURIComponent(city || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
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
  const cityDisplay = prettyCity(cityParam);
  const citySlug = cityParam.trim().toLowerCase();
  
  const all = loadDaycares();
  const matches = all.filter((d) => {
    const dataCitySlug = (d["CITY"] || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    return dataCitySlug === citySlug;
  });
  
  const count = matches.length;
  
  return {
    title: `${count} Licensed Daycares in ${cityDisplay}, Ohio | Ohio Parent Hub`,
    description: `Find ${count} licensed daycare and childcare programs in ${cityDisplay}, OH. Browse SUTQ-rated providers, view program details, addresses, and contact information.`,
    openGraph: {
      title: `Daycares in ${cityDisplay}, Ohio`,
      description: `${count} licensed childcare programs in ${cityDisplay}`,
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

  const results = matches.slice(0, 50);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <Breadcrumbs 
        items={[
          { label: "Home", href: "/" }, 
          { label: "Cities", href: "/cities" },
          { label: cityDisplay || "City", href: `/daycares/${citySlug}` }
        ]} 
        className="mb-6"
      />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Daycares in {cityDisplay || "Ohio"}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Showing {results.length}
          {matches.length > results.length ? ` of ${matches.length}` : ""} licensed programs.
        </p>

        <div className="mt-5 flex gap-2">
          <input
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Search name, address, program type… (next)"
            disabled
          />
          <button
            className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white opacity-60"
            disabled
          >
            Search
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-12">
        {/* Filters placeholder */}
        <aside className="lg:col-span-3">
          <div className="sticky top-6 rounded-2xl border p-4">
            <h2 className="text-sm font-semibold">Filters</h2>
            <p className="mt-2 text-sm text-neutral-600">Coming next.</p>
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border">
            <div className="border-b p-4">
              <h2 className="text-sm font-semibold">Results</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Data source: Ohio early care & education programs.
              </p>
            </div>

            <div className="p-4">
              {results.length === 0 ? (
                <div className="rounded-xl border p-4 text-sm text-neutral-600">
                  No results found for <b>{cityDisplay}</b>.
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((d) => {
                    const id = d["PROGRAM NUMBER"] || "";
                    const name = d["PROGRAM NAME"] || "";
                    const county = d["COUNTY"] || "";
                    const sutq = d["SUTQ RATING"] || "—";
                    const street = d["STREET ADDRESS"] || "";
                    const zip = d["ZIP CODE"] || "";
                    const programType = d["PROGRAM TYPE"] || "—";

                    const slug = `${id}-${slugify(name)}-${slugify(d["CITY"] || "")}`;

                    return (
                      <div key={id} className="rounded-xl border p-4 hover:bg-neutral-50">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">{name}</div>
                            <div className="mt-1 text-sm text-neutral-600">
                              {street}, {cityDisplay}, OH {zip}
                            </div>
                            <div className="mt-1 text-sm text-neutral-600">
                              {county} County • {programType}
                            </div>

                            <div className="mt-2 inline-flex gap-2">
                              <SutqBadge rating={sutq} />
                              <span className="inline-flex rounded-full border px-2 py-1 text-xs text-neutral-700">
                                ID: {id}
                              </span>
                            </div>
                          </div>

                          <Link
                            href={`/daycare/${slug}`}
                            className="shrink-0 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-white"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {matches.length > results.length && (
                <p className="mt-4 text-xs text-neutral-500">
                  Showing first {results.length} results. Pagination coming next.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 rounded-2xl border">
            <div className="border-b p-4">
              <h2 className="text-sm font-semibold">Map</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Map pins coming after geocoding.
              </p>
            </div>

            <div className="flex h-[420px] items-center justify-center p-6 text-sm text-neutral-500">
              Map placeholder
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
