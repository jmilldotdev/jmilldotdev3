"use client";

import { MDXRemote } from "next-mdx-remote";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

interface PostClientProps {
  source: MDXRemoteSerializeResult;
  frontmatter: {
    title?: string;
    date?: string;
    tags?: string[];
    [key: string]: string | string[] | number | boolean | undefined;
  };
}

export default function PostClient({ source, frontmatter }: PostClientProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <article className="w-full px-4 md:px-8 lg:px-16 py-8">
      {/* Frontmatter Header */}
      <header className="mb-10 border-l-4 border-[var(--color-primary)] pl-4 py-2">
        {frontmatter.title && (
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-2">
            {frontmatter.title}
          </h1>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm opacity-80">
          {frontmatter.date && (
            <time className="text-[var(--color-secondary)]">
              {formatDate(frontmatter.date)}
            </time>
          )}

          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {frontmatter.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-black bg-opacity-30 px-2 py-1 rounded text-xs border border-[var(--color-secondary)] text-[var(--color-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="post-content w-full">
        <MDXRemote {...source} />
      </div>
    </article>
  );
}
