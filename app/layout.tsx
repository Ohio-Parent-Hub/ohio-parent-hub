import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
