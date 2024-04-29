// @ts-check
// import withPWAInit from "@ducanh2912/next-pwa";
import * as PWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
});

export default withPWA(nextConfig);
