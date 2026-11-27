import { resolve } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT:
      process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT ??
      (process.env.VERCEL_ENV === "production" ? "production" : ""),
  },
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  devIndicators: false,
  experimental: {
    mdxRs: false,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.mdx$/,
      include: resolve(process.cwd(), "content"),
      oneOf: [
        {
          resourceQuery: /^\?component$/,
          use: ["@mdx-js/loader", resolve(process.cwd(), "scripts/strip-frontmatter.cjs")],
        },
        { type: "asset/source" },
      ],
    });
    return config;
  },
};

export default nextConfig;
