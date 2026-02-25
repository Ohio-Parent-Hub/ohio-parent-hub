"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackUplinkClick } from "@/lib/trackUplink";

type TrackedUplinkLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  linkType?: "browse_more";
  target: string;
  context: "state" | "county" | "city" | "unknown";
};

export default function TrackedUplinkLink({
  href,
  className,
  children,
  linkType = "browse_more",
  target,
  context,
}: TrackedUplinkLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackUplinkClick({ linkType, target, context });
      }}
    >
      {children}
    </Link>
  );
}
