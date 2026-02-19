import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL('https://ohioparenthub.com'),
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ohio Parent Hub',
    description:
      'Find licensed daycares and trusted parenting resources across Ohio.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSerif.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
