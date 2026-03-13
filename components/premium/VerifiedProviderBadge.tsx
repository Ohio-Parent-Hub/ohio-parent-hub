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
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide text-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{ backgroundColor: "#4A6B67" }}
        aria-label="Provider Verified — this listing includes photos, hours, pricing, and more"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip((prev) => !prev)}
      >
        {/* Shield with checkmark — gold accent */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 1L3 4.5V9.5C3 14.15 5.96 18.49 10 19.5C14.04 18.49 17 14.15 17 9.5V4.5L10 1Z"
            fill="#DCB346"
          />
          <path
            d="M7 10.5L9 12.5L13 8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Provider Verified
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
