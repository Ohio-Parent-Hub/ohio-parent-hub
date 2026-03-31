import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "For Providers — Claim Your Listing | Ohio Parent Hub" },
  description:
    "Own a daycare in Ohio? Claim your listing on Ohio Parent Hub to add photos, hours, pricing, amenities, and more. Stand out to parents searching for childcare.",
  openGraph: {
    title: "For Providers — Claim Your Listing | Ohio Parent Hub",
    description:
      "Own a daycare in Ohio? Claim your listing to add photos, hours, pricing, amenities, and more. Stand out to parents searching for childcare.",
    url: "https://ohioparenthub.com/for-providers",
    siteName: "Ohio Parent Hub",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Ohio Parent Hub — For Providers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "For Providers — Claim Your Listing | Ohio Parent Hub",
    description: "Own a daycare in Ohio? Claim your listing to add photos, hours, pricing, amenities, and more. Stand out to parents searching for childcare.",
    images: ["/og-default.png"],
  },
};

export default function ForProvidersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
