import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Providers — Claim & Upgrade Your Listing | Ohio Parent Hub",
  description:
    "Own a daycare in Ohio? Claim your listing on Ohio Parent Hub to add photos, hours, pricing, amenities, and more. Stand out to parents searching for childcare.",
  openGraph: {
    title: "For Providers — Claim & Upgrade Your Listing | Ohio Parent Hub",
    description:
      "Own a daycare in Ohio? Claim your listing to add photos, hours, pricing, amenities, and more. Stand out to parents searching for childcare.",
    url: "https://ohioparenthub.com/for-providers",
    siteName: "Ohio Parent Hub",
    type: "website",
  },
};

export default function ForProvidersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
