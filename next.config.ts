import openpanel from "./src/config/openpanel.json";

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT:
      process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT ??
      (process.env.VERCEL_ENV === "production" ? "production" : ""),
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID:
      process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID ?? openpanel.clientId,
  },
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  devIndicators: false,
  experimental: {
    mdxRs: false,
  },
};

export default nextConfig;
