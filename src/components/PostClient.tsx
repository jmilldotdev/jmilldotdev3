import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";

const shakeAnimation = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
`;

interface PostClientProps {
  source: string;
  frontmatter: {
    title?: string;
    date?: string;
    created?: string;
    URL?: string;
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

  const getRootUrl = (url?: string) => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url; // fallback to original if URL parsing fails
    }
  };

  const components = {
    Link,
  };

  // Check if there's actual content beyond imports
  const hasContent =
    source
      .replace(/import\s+.*?from\s+["'].*?["'];?\s*/g, "") // Remove import statements
      .trim().length > 0;

  return (
    <article className="w-full px-4 md:px-8 lg:px-16 py-8">
      {/* Frontmatter Header */}
      <header className="post-header mb-10 border-l-4 border-[var(--color-primary)] pl-4 py-2">
        {frontmatter.title && (
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">
            {frontmatter.title}
          </h1>
        )}

        <div className="space-y-2 text-sm opacity-80">
          {frontmatter.date && (
            <div className="text-[var(--color-secondary)]">
              {formatDate(frontmatter.date)}
            </div>
          )}

          {frontmatter.URL && (
            <div>
              <a
                href={frontmatter.URL as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-secondary)] hover:underline"
              >
                {getRootUrl(frontmatter.URL as string)}
              </a>
            </div>
          )}

          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {frontmatter.tags.map((tag: string) => {
                const cleanTag = tag
                  .replace(/^sources\//, "")
                  .replace(/^c\/entity$/, "entity")
                  .replace(/^[^\w]*/, "");
                if (!cleanTag) return null;

                return (
                  <Link
                    key={tag}
                    href={`/t/${encodeURIComponent(cleanTag)}`}
                    className="bg-black bg-opacity-30 px-2 py-1 rounded text-xs border border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-opacity-50 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {cleanTag}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <style>{shakeAnimation}</style>
      <div className="post-content w-full">
        {hasContent ? (
          <MDXRemote source={source} components={components} />
        ) : (
          <div className="text-[var(--color-secondary)] opacity-60 italic">
            No content available.
          </div>
        )}
      </div>
    </article>
  );
}
