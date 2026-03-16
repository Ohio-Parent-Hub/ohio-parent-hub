"use client";

import { useState, useRef, useEffect } from "react";

export default function VerifiedProviderBadge({ className = "" }: { className?: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showTooltip) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowTooltip(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{ backgroundColor: "#7EA8A420", color: "#4A6B67" }}
        aria-label="Owner Verified — this listing includes photos, hours, pricing, and more"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip((prev) => !prev)}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm3.78 4.97a.75.75 0 0 0-1.06 0L7 8.69 5.28 6.97a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.25-4.25a.75.75 0 0 0 0-1.06Z"/>
        </svg>
        Owner Verified
      </button>
      {showTooltip && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border bg-white px-3 py-2 text-xs shadow-lg"
          style={{ color: "#4A6B67", borderColor: "#B8C5B255" }}
        >
          This provider has verified their listing with photos, hours, pricing &amp; more
          <div
            className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t bg-white"
            style={{ borderColor: "#B8C5B255" }}
          />
        </div>
      )}
    </span>
  );
}
