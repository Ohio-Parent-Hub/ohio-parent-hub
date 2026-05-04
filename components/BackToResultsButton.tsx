"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { trackUplinkClick } from "@/lib/trackUplink";

type BackToResultsButtonProps = {
  fallbackHref: string;
  label: string;
  trackingContext?: "state" | "county" | "city" | "unknown";
};

function resolveNavContext(
  fallbackHref: string,
  trackingContext: "state" | "county" | "city" | "unknown",
) {
  if (typeof window === "undefined") {
    return { href: fallbackHref, context: trackingContext };
  }

  try {
    const stored = sessionStorage.getItem("ohph_nav_context");
    if (!stored) return { href: fallbackHref, context: trackingContext };

    const parsed = JSON.parse(stored);
    const href =
      parsed.returnTo &&
      typeof parsed.returnTo === "string" &&
      parsed.returnTo.startsWith("/") &&
      !parsed.returnTo.startsWith("//")
        ? parsed.returnTo
        : fallbackHref;
    const context = ["state", "county", "city"].includes(parsed.context)
      ? parsed.context
      : trackingContext;

    return { href, context };
  } catch {
    return { href: fallbackHref, context: trackingContext };
  }
}

export default function BackToResultsButton({
  fallbackHref,
  label,
  trackingContext = "unknown",
}: BackToResultsButtonProps) {
  const router = useRouter();
  const [{ href: resolvedHref, context: resolvedContext }] = useState(() =>
    resolveNavContext(fallbackHref, trackingContext)
  );

  function handleClick() {
    trackUplinkClick({
      linkType: "back_to_results",
      target: resolvedHref,
      context: resolvedContext,
    });

    router.push(resolvedHref);
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="border-primary/40 text-primary hover:bg-primary/10"
      onClick={handleClick}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
