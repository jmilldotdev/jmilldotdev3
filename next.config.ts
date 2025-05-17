import withMDX from "@next/mdx";

export default withMDX({
  extension: /\.mdx?$/,
})({
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  devIndicators: false,
});
