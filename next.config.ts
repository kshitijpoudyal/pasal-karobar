import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import path from "path";
import { fileURLToPath } from "url";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: projectRoot,
};

export default withSerwist(nextConfig);
