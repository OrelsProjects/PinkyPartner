// @ts-check
import * as PWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // async headers() {
  //   return [
  //     {
  //       source: "/service-worker.js",
  //       headers: [
  //         { key: "Access-Control-Allow-Origin", value: "*" },
  //         { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
  //         {
  //           key: "Access-Control-Allow-Headers",
  //           value: "X-Requested-With, Content-Type, Authorization",
  //         },
  //       ],
  //     },
  //     {
  //       source: "/_next/static/:path*",
  //       headers: [
  //         { key: "Access-Control-Allow-Origin", value: "*" },
  //         { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
  //         {
  //           key: "Access-Control-Allow-Headers",
  //           value: "X-Requested-With, Content-Type, Authorization",
  //         },
  //       ],
  //     },
  //   ];
  // },
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        {
          key: "Service-Worker-Allowed",
          value: "/",
        },
      ],
    },
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

const withPWA = PWA.default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
});

export default withPWA(nextConfig);
