import Link from "next/link";

type Props = {
  params: { city: string };
};

function prettyCity(city: string) {
  return decodeURIComponent(city).replace(/-/g, " ");
}

export default function CityDaycaresPage({ params }: Props) {
  const cityName = prettyCity(params.city);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Daycares in {cityName}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Browse licensed programs. Filters and map coming next.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Home
            </Link>
            <Link
              href={`/daycare/12345-example-daycare-${params.city}`}
              className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Example Listing
            </Link>
          </div>
        </div>

        {/* Search bar (UI only for now) */}
        <div className="mt-5 flex gap-2">
          <input
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Search name, address, program type… (coming soon)"
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

      {/* Split layout */}
      <section className="grid gap-6 lg:grid-cols-12">
        {/* Filters */}
        <aside className="lg:col-span-3">
          <div className="sticky top-6 rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Filters</h2>
              <button
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
                disabled
              >
                Reset
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-700">
                  County
                </label>
                <div className="mt-2 rounded-xl border px-3 py-2 text-sm text-neutral-500">
                  Coming soon
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700">
                  Program type
                </label>
                <div className="mt-2 rounded-xl border px-3 py-2 text-sm text-neutral-500">
                  Coming soon
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700">
                  SUTQ rating
                </label>
                <div className="mt-2 rounded-xl border px-3 py-2 text-sm text-neutral-500">
                  Coming soon
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border">
            <div className="border-b p-4">
              <h2 className="text-sm font-semibold">Results</h2>
              <p className="mt-1 text-sm text-neutral-600">
                We’ll load real listings here next.
              </p>
            </div>

            <div className="p-4">
              {/* Placeholder cards */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-4 hover:bg-neutral-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">
                          Example Daycare #{i}
                        </div>
                        <div className="mt-1 text-sm text-neutral-600">
                          {cityName}, OH • Franklin County
                        </div>
                        <div className="mt-2 inline-flex rounded-full border px-2 py-1 text-xs text-neutral-700">
                          SUTQ: Pending
                        </div>
                      </div>

                      <Link
                        href={`/daycare/1234${i}-example-daycare-${params.city}`}
                        className="shrink-0 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-white"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-neutral-500">
                Tip: Once data is wired up, we’ll add pagination and map-bound
                filtering.
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 rounded-2xl border">
            <div className="border-b p-4">
              <h2 className="text-sm font-semibold">Map</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Map pins coming next.
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
