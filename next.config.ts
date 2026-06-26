import type { NextConfig } from "next";

const isVercelBuild = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir: "next-live",
  ...(isVercelBuild ? {} : { output: "export" as const }),
  images: {
    unoptimized: true
  },
  allowedDevOrigins: ["100.122.30.95"],
  outputFileTracingRoot: __dirname
};

export default nextConfig;
