import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { bundleMDX } from "mdx-bundler";
import PostClient from "@/components/PostClient";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const filePath = path.join(process.cwd(), "content", `${slug}.mdx`);
    const source = fs.readFileSync(filePath, "utf8");
    const { data } = matter(source);

    return {
      title: data.title || "jmill",
      description:
        data.description ||
        data.excerpt ||
        "jmill's digital shrine to himself.",
      keywords: data.tags?.join(", ") || data.keywords,
      authors: data.author ? [{ name: data.author }] : [{ name: "jmill" }],
      openGraph: {
        title: data.title || "jmill",
        description:
          data.description ||
          data.excerpt ||
          "jmill's digital shrine to himself.",
        type: "article",
        publishedTime: data.date,
        authors: data.author || "jmill",
        tags: data.tags,
        siteName: "jmill.dev",
      },
      twitter: {
        card: "summary_large_image",
        title: data.title || "jmill",
        description:
          data.description ||
          data.excerpt ||
          "jmill's digital shrine to himself.",
        creator: "@jmilldotdev",
      },
    };
  } catch {
    return {
      title: "jmill",
      description: "jmill's digital shrine to himself.",
    };
  }
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "content", `${slug}.mdx`);
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
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({
      slug: file.replace(/\.mdx?$/, ""),
    }));
}
