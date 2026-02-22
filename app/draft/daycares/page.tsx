import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import GlobalDashboard from "@/components/GlobalDashboard";

export default function DraftGlobalSearchPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Draft Home", href: "/draft" },
          { label: "Draft Daycare Search", href: "/draft/daycares" },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Draft: Best Daycares in Ohio</h1>
        <p className="text-neutral-500 max-w-2xl">
          Sandbox page for redesigning the global daycare search experience. Changes here do not affect live routes.
        </p>
      </div>

      <GlobalDashboard basePath="/draft" />
    </main>
  );
}
