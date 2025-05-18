"use client";

import { useMemo } from "react";
import { getMDXComponent } from "mdx-bundler/client";

const shakeAnimation = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
`;

interface PostClientProps {
  code: string;
  frontmatter: {
    title?: string;
    date?: string;
    created?: string;
    URL?: string;
    tags?: string[];
    [key: string]: string | string[] | number | boolean | undefined;
  };
}

export default function PostClient({ code, frontmatter }: PostClientProps) {
  // Convert the MDX string into a React component
  const Component = useMemo(() => {
    if (!code) return null;
    return getMDXComponent(code);
  }, [code]);

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

        <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-4 text-sm opacity-80">
          {frontmatter.date && (
            <time className="text-[var(--color-secondary)] flex items-center">
              {formatDate(frontmatter.date)}
            </time>
          )}

          {frontmatter.created && (
            <time className="text-[var(--color-secondary)] flex items-center">
              Created: {formatDate(frontmatter.created)}
            </time>
          )}

          {frontmatter.URL && (
            <a
              href={frontmatter.URL as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-secondary)] hover:underline break-all flex items-center"
            >
              {frontmatter.URL}
            </a>
          )}

          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center self-center md:self-auto">
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
      <style>{shakeAnimation}</style>
      <div className="post-content w-full">{Component && <Component />}</div>
    </article>
  );
}
