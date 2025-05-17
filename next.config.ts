/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  devIndicators: false,
  experimental: {
    mdxRs: false,
  },
};

export default nextConfig;
