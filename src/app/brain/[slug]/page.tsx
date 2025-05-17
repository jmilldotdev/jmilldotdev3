import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { bundleMDX } from "mdx-bundler";
import PostClient from "@/components/PostClient";

interface PostProps {
  params: { slug: string };
}

export default async function Post({ params }: PostProps) {
  const filePath = path.join(process.cwd(), "content", `${params.slug}.mdx`);
  const source = fs.readFileSync(filePath, "utf8");

  const { content, data } = matter(source);

  // Use mdx-bundler instead of next-mdx-remote
  const { code } = await bundleMDX({
    source: content,
    mdxOptions(options) {
      // This is the recommended way to add custom remark/rehype plugins:
      // The syntax might look weird, but it protects you in case we add/remove
      // plugins in the future.
      options.remarkPlugins = [...(options.remarkPlugins ?? [])];
      options.rehypePlugins = [...(options.rehypePlugins ?? [])];
      return options;
    },
    esbuildOptions(options) {
      options.target = ["es2020"];
      return options;
    },
  });

  return <PostClient code={code} frontmatter={data} />;
}

export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), "content"));
  return files.map((file) => ({
    slug: file.replace(/\\.mdx?$/, ""),
  }));
}
