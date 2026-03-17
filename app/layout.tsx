import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CookieConsent from "@/components/CookieConsent";
import AnalyticsLoader from "@/components/AnalyticsLoader";

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://ohioparenthub.com";
const siteName = "Ohio Parent Hub";
const siteDescription =
  "Find licensed daycares, preschools, and trusted parenting resources across Ohio.";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  publisher: {
    "@id": `${siteUrl}/#organization`,
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Ohio Parent Hub | Daycare & Family Resources',
    template: '%s | Ohio Parent Hub',
  },
  description:
    'Find licensed daycares, preschools, and trusted parenting resources across Ohio. Search by city, county, and program details.',
  openGraph: {
    title: 'Ohio Parent Hub',
    description:
      'Find licensed daycares, preschools, and trusted parenting resources across Ohio.',
    url: 'https://ohioparenthub.com',
    siteName: 'Ohio Parent Hub',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Ohio Parent Hub — Licensed Daycare & Family Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ohio Parent Hub',
    description:
      'Find licensed daycares and trusted parenting resources across Ohio.',
    images: ['/og-default.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSerif.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Script id="site-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify([organizationSchema, websiteSchema])}
        </Script>
        {gaMeasurementId && <AnalyticsLoader gaId={gaMeasurementId} />}
        <TooltipProvider>
          <ToastProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </ToastProvider>
        </TooltipProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
