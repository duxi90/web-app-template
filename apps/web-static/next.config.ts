import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  typedRoutes: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@repo/ui", "@repo/content"],
};

export default config;
