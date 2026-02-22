
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import GlobalDashboard from "@/components/GlobalDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Daycares in Ohio | Search Licensed Child Care Near You",
  description: "Search and filter over 8,000 licensed daycare and childcare programs in Ohio. Compare providers by city, county, SUTQ rating, and program type.",
  keywords: [
    "best daycares in ohio",
    "licensed daycare ohio",
    "childcare near me",
    "ohio childcare search",
    "top rated daycare ohio",
  ],
  alternates: {
    canonical: "/daycares",
  },
  openGraph: {
    title: "Best Daycares in Ohio | Search Licensed Child Care",
    description: "Search and compare licensed childcare providers across Ohio with city and quality filters.",
    url: "https://ohioparenthub.com/daycares",
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Best Daycares in Ohio</h1>
        <p className="text-neutral-500 max-w-2xl">
          Search our complete database of licensed childcare providers. Use the map and filters to compare locations, quality ratings, and program types near you.
        </p>
      </div>

      <GlobalDashboard />
    </main>
  );
}
