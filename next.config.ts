import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.ohioparenthub.com",
          },
        ],
        destination: "https://ohioparenthub.com/:path*",
        permanent: true,
      },
      // Strip query-string nav context from detail pages (SEO: TICKET-001)
      {
        source: "/daycare/:slug",
        has: [{ type: "query", key: "context" }],
        destination: "/daycare/:slug",
        permanent: true,
      },
      {
        source: "/daycare/:slug",
        has: [{ type: "query", key: "returnTo" }],
        destination: "/daycare/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
