import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This repo lives in a directory whose parent also contains a stray lockfile
  // (e.g. `/Users/<name>/package-lock.json`). Turbopack can incorrectly infer
  // the workspace root from that lockfile, which breaks module resolution.
  turbopack: {
    root: __dirname,
  },
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
    ];
  },
};

export default nextConfig;
