import fs from "fs";
import path from "path";
import matter from "gray-matter";
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
      title: `jmill | ${data.title}` || "jmill",
      description:
        data.description ||
        data.excerpt ||
        "jmill's digital shrine to himself.",
      keywords: data.tags?.join(", ") || data.keywords,
      authors: data.author ? [{ name: data.author }] : [{ name: "jmill" }],
      openGraph: {
        title: `jmill | ${data.title}` || "jmill",
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
        title: `jmill | ${data.title}` || "jmill",
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

  return <PostClient source={content} frontmatter={data} />;
}

export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), "content"));
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({
      slug: file.replace(/\.mdx?$/, ""),
    }));
}
