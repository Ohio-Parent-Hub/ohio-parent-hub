import { loadAllPublishedJobs } from "@/app/actions/jobs";
import { loadPremiumLogos } from "@/app/actions/premium";
import JobsPageClient from "@/components/jobs/JobsPageClient";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Ohio Daycare Jobs | Ohio Parent Hub",
  description:
    "Find open roles at licensed child care providers across Ohio. Browse daycare jobs and apply directly by email.",
  alternates: {
    canonical: "/jobs",
  },
  openGraph: {
    title: "Ohio Daycare Jobs | Ohio Parent Hub",
    description:
      "Find open roles at licensed child care providers across Ohio. Browse daycare jobs and apply directly by email.",
    url: "https://ohioparenthub.com/jobs",
    siteName: "Ohio Parent Hub",
    type: "website",
  },
};

export default async function JobsPage() {
  const [jobs, premiumLogos] = await Promise.all([
    loadAllPublishedJobs(),
    loadPremiumLogos(),
  ]);

  return <JobsPageClient jobs={jobs} premiumLogos={premiumLogos} />;
}
