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
    ];
  },
};

export default nextConfig;
