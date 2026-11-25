/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
