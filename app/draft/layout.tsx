import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Homepage Draft | Ohio Parent Hub",
  description: "Draft preview of the redesigned homepage.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function DraftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
