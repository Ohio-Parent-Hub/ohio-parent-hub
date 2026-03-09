"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { trackUplinkClick } from "@/lib/trackUplink";

type BackToResultsButtonProps = {
  fallbackHref: string;
  label: string;
  trackingContext?: "state" | "county" | "city" | "unknown";
};

export default function BackToResultsButton({
  fallbackHref,
  label,
  trackingContext = "unknown",
}: BackToResultsButtonProps) {
  const router = useRouter();
  const [resolvedHref, setResolvedHref] = useState(fallbackHref);
  const [resolvedContext, setResolvedContext] = useState(trackingContext);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("ohph_nav_context");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.returnTo && typeof parsed.returnTo === "string" && parsed.returnTo.startsWith("/") && !parsed.returnTo.startsWith("//")) {
          setResolvedHref(parsed.returnTo);
        }
        if (["state", "county", "city"].includes(parsed.context)) {
          setResolvedContext(parsed.context);
        }
      }
    } catch {
      // sessionStorage unavailable — use fallback props
    }
  }, []);

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
