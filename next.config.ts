import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir: "next-live",
  output: "export",
  images: {
    unoptimized: true
  },
  allowedDevOrigins: ["100.122.30.95"],
  outputFileTracingRoot: __dirname
};

export default nextConfig;
