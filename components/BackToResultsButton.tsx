"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
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

  const canNavigateBackInternally = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (!document.referrer) return false;

    try {
      const referrerUrl = new URL(document.referrer);
      return referrerUrl.origin === window.location.origin;
    } catch {
      return false;
    }
  }, []);

  function handleClick() {
    trackUplinkClick({
      linkType: "back_to_results",
      target: canNavigateBackInternally ? "history" : fallbackHref,
      context: trackingContext,
    });

    if (canNavigateBackInternally) {
      router.back();
      return;
    }

    router.push(fallbackHref);
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
