"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "cookie-consent";

const teal = "#7EA8A4";
const dark = "#4A6B67";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "all");
    setVisible(false);
    // Dispatch event so Analytics component can pick it up immediately
    window.dispatchEvent(new Event("cookie-consent-update"));
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "necessary");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white px-4 py-4 shadow-lg sm:px-6"
      style={{ borderColor: `${teal}33` }}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm leading-relaxed" style={{ color: `${dark}cc` }}>
          We use cookies for essential site functionality and, with your consent, analytics to
          improve the experience.{" "}
          <Link
            href="/privacy#cookies"
            className="underline hover:no-underline"
            style={{ color: teal }}
          >
            Learn more
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={decline}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: `${teal}44`, color: dark }}
          >
            Necessary Only
          </button>
          <button
            onClick={accept}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: teal }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
