import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 is for the landing page's template screenshots (small text blurs at the default 75).
    qualities: [75, 90],
  },
  experimental: {
    // Profile photo and logo uploads go through Server Actions (up to 5 MB + form overhead).
    serverActions: { bodySizeLimit: "6mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
