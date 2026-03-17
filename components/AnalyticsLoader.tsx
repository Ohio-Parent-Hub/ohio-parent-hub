"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "cookie-consent";

export default function AnalyticsLoader({ gaId }: { gaId: string }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function check() {
      setAllowed(localStorage.getItem(CONSENT_KEY) === "all");
    }
    check();
    window.addEventListener("cookie-consent-update", check);
    return () => window.removeEventListener("cookie-consent-update", check);
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
