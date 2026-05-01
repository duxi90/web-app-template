import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["{{PACKAGE_SCOPE}}/ui", "{{PACKAGE_SCOPE}}/content"],
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default config;
