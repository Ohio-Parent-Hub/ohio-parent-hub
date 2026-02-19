
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import GlobalDashboard from "@/components/GlobalDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Daycares in Ohio | Search All Licensed Providers",
  description: "Search and filter over 8,000 licensed daycare and childcare programs in Ohio. Filter by city, county, SUTQ rating, and more.",
  openGraph: {
    title: "Find Licensed Daycares in Ohio",
    description: "Search tool for all licensed childcare providers in Ohio.",
  },
};

export default function GlobalSearchPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <Breadcrumbs 
        items={[
          { label: "Home", href: "/" }, 
          { label: "Find a Daycare", href: "/daycares" }
        ]} 
        className="mb-6"
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Find a Daycare in Ohio</h1>
        <p className="text-neutral-500 max-w-2xl">
          Search our complete database of licensed childcare providers. Use the map and filters to narrow down results by location, quality rating, and program type.
        </p>
      </div>

      <GlobalDashboard />
    </main>
  );
}
