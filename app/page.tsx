import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <section className="rounded-2xl border p-10">
        <h1 className="text-4xl font-semibold tracking-tight">
          Ohio Parent Hub
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-neutral-600">
          Find licensed daycares and early childhood programs across Ohio. Browse
          by city and view program details.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/daycares/columbus"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            Browse Daycares
          </Link>

          <Link
            href="/daycare/12345-example-daycare-columbus"
            className="rounded-xl border px-5 py-3 text-sm font-medium hover:bg-neutral-50"
          >
            Example Daycare Page
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <div className="text-sm font-medium">Search by city</div>
            <div className="mt-1 text-sm text-neutral-600">
              Browse daycare listings by city.
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-sm font-medium">View program details</div>
            <div className="mt-1 text-sm text-neutral-600">
              See key attributes for each licensed program.
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-sm font-medium">Map view</div>
            <div className="mt-1 text-sm text-neutral-600">
              Find providers near you (coming soon).
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
