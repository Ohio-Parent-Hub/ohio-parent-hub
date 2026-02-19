import Link from "next/link";
import fs from "node:fs";
import path from "node:path";

type DaycareRow = Record<string, string>;

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), "data", "daycares.json");
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function HomePage() {
  const daycares = loadDaycares();
  
  // Get city counts
  const cityCounts = new Map<string, number>();
  daycares.forEach((d) => {
    const city = d["CITY"];
    if (city) {
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    }
  });
  
  // Sort by count and get top cities
  const topCities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([city, count]) => ({ city, count, slug: slugify(city) }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight">
          Ohio Parent Hub
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-600">
          Find licensed daycares and early childhood programs across Ohio. 
          Browse by city and view detailed program information.
        </p>

        <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border bg-neutral-50 px-6 py-4">
          <div className="text-sm">
            <span className="text-3xl font-bold text-black">{daycares.length.toLocaleString()}</span>
            <span className="ml-2 text-neutral-600">licensed programs</span>
          </div>
          <div className="h-8 w-px bg-neutral-300"></div>
          <div className="text-sm">
            <span className="text-3xl font-bold text-black">{cityCounts.size}</span>
            <span className="ml-2 text-neutral-600">cities</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Browse by City</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {topCities.map(({ city, count, slug }) => (
            <Link
              key={city}
              href={`/daycares/${slug}`}
              className="group rounded-xl border p-4 hover:border-black hover:bg-neutral-50 transition-colors"
            >
              <div className="font-medium group-hover:underline">{city}</div>
              <div className="mt-1 text-sm text-neutral-600">
                {count} {count === 1 ? 'program' : 'programs'}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Can't find your city? Browse all {cityCounts.size} cities in our{" "}
            <Link href="/sitemap.xml" className="underline hover:text-black">
              sitemap
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border p-6">
          <div className="text-lg font-semibold">Licensed Programs</div>
          <div className="mt-2 text-sm text-neutral-600">
            All programs are licensed by the Ohio Department of Job and Family Services.
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <div className="text-lg font-semibold">SUTQ Ratings</div>
          <div className="mt-2 text-sm text-neutral-600">
            View Step Up to Quality (SUTQ) ratings for participating programs.
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <div className="text-lg font-semibold">Detailed Info</div>
          <div className="mt-2 text-sm text-neutral-600">
            See addresses, contact information, capacity, and license details.
          </div>
        </div>
      </section>
    </main>
  );
}
