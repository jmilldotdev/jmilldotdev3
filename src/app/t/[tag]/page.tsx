import fs from "fs";
import path from "path";
import Link from "next/link";
import { Metadata } from "next";

interface PageMetadata {
  slug: string;
  title: string;
  created?: string;
  date?: string;
  tags?: string[];
  url?: string;
  path: string;
}

type TagData = Record<string, PageMetadata[]>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `jmill | ${decodedTag}`,
    description: `Posts tagged with ${decodedTag}`,
    openGraph: {
      title: `jmill | ${decodedTag}`,
      description: `Posts tagged with ${decodedTag}`,
      type: "website",
      siteName: "jmill.dev",
    },
    twitter: {
      card: "summary",
      title: `jmill | ${decodedTag}`,
      description: `Posts tagged with ${decodedTag}`,
      creator: "@jmilldotdev",
    },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  let tagData: TagData = {};
  let posts: PageMetadata[] = [];

  try {
    const tagDataPath = path.join(process.cwd(), "src", "config", "tags.json");
    const tagDataContent = fs.readFileSync(tagDataPath, "utf8");
    tagData = JSON.parse(tagDataContent);
    posts = tagData[decodedTag] || [];
  } catch (error) {
    console.error("Error loading tag data:", error);
  }

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-8">
      <header className="mb-10 border-l-4 border-[var(--color-primary)] pl-4 py-2">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-2">
          {decodedTag}
        </h1>
        <p className="text-[var(--color-secondary)] opacity-80">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-secondary)] opacity-60">
            No posts found for this tag.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-[var(--color-primary)] hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="hover:bg-black hover:bg-opacity-10 rounded px-3 py-2 transition-colors"
            >
              <Link href={post.path} className="block group">
                <h2 className="text-lg font-medium text-[var(--color-primary)] group-hover:underline">
                  {post.title}
                </h2>

                {post.tags && post.tags.length > 1 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {post.tags
                      .filter(
                        (t) =>
                          t.replace(/^sources\//, "").replace(/^[^\w]*/, "") !==
                          decodedTag
                      )
                      .slice(0, 3)
                      .map((t) => {
                        const cleanTag = t
                          .replace(/^sources\//, "")
                          .replace(/^[^\w]*/, "");
                        return (
                          <span
                            key={t}
                            className="text-xs text-[var(--color-secondary)] opacity-60"
                          >
                            {cleanTag}
                          </span>
                        );
                      })}
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-block text-[var(--color-primary)] hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  let tagData: TagData = {};

  try {
    const tagDataPath = path.join(process.cwd(), "src", "config", "tags.json");
    const tagDataContent = fs.readFileSync(tagDataPath, "utf8");
    tagData = JSON.parse(tagDataContent);
  } catch (error) {
    console.error("Error loading tag data for static params:", error);
    return [];
  }

  return Object.keys(tagData).map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}
