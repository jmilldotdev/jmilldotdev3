import { contentSlugs, readContent } from "@/lib/content";
import matter from "gray-matter";
import Link from "next/link";
import PostClient from "@/components/PostClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";

const mdxComponents = { Link };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const source = readContent(slug);
    if (source === undefined) throw new Error("Content not found");
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
  const source = readContent(slug);
  if (source === undefined) notFound();

  const { content, data } = matter(source);

  const hasContent = content.replace(/import\s+.*?from\s+["'].*?["'];?\s*/g, "").trim();
  // Resolve the build-compiled MDX module for this slug; Workers cannot evaluate MDX at runtime.
  const Content = hasContent
    ? (await import(`../../../../content/${slug}.mdx?component`)).default
    : null;

  return (
    <PostClient frontmatter={data}>
      {Content && <Content components={mdxComponents} />}
    </PostClient>
  );
}

export async function generateStaticParams() {
  return contentSlugs().map((slug) => ({ slug }));
}
