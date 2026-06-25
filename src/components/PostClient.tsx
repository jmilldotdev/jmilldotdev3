import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";

// Shake animation is now defined in Tailwind config

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
    <article className="w-full px-4 md:px-8 lg:px-16 py-8 text-foreground">
      {/* Frontmatter Header */}
      <header className="mb-10 border-l-4 border-[color:var(--palette-warm)] pl-4 py-2">
        {frontmatter.title && (
          <h1 className="text-3xl md:text-4xl font-bold text-warm mb-4">
            {frontmatter.title}
          </h1>
        )}

        <div className="space-y-2 text-sm opacity-80">
          {frontmatter.date && (
            <div className="text-accent">{formatDate(frontmatter.date)}</div>
          )}

          {frontmatter.URL && (
            <div>
              <a
                href={frontmatter.URL as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
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
                    className="bg-[color:var(--palette-surface-muted)] px-2 py-1 rounded text-xs border border-[color:var(--palette-border)] text-accent hover:border-[color:var(--palette-warm)] hover:text-warm transition-colors"
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
      <div className="w-full text-foreground leading-relaxed tracking-[0.3px] font-mono overflow-y-auto prose prose-invert prose-headings:text-[color:var(--palette-warm)] prose-h1:text-4xl prose-h1:border-b prose-h1:border-[color:var(--palette-warm-soft)] prose-h1:pb-2 prose-h1:mt-6 prose-h1:mb-3 prose-h2:text-3xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-lg prose-p:mb-6 prose-a:text-[color:var(--palette-accent)] prose-a:no-underline prose-a:border-b prose-a:border-dotted prose-a:border-[color:var(--palette-border)] hover:prose-a:text-foreground hover:prose-a:border-[color:var(--palette-text)] prose-ul:ml-6 prose-ul:mb-6 prose-ul:text-lg prose-ol:ml-6 prose-ol:mb-6 prose-ol:text-lg prose-li:mb-3 prose-code:bg-[color:var(--palette-surface-muted)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-[color:var(--palette-surface-muted)] prose-pre:p-6 prose-pre:rounded prose-pre:border-l-2 prose-pre:border-[color:var(--palette-border)] prose-blockquote:border-l-4 prose-blockquote:border-[color:var(--palette-border)] prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-muted prose-blockquote:bg-[color:var(--palette-surface-muted)] prose-img:border prose-img:border-[color:var(--palette-border-soft)] prose-img:my-6 prose-table:w-full prose-table:border-collapse prose-table:mb-6 prose-th:border prose-th:border-[color:var(--palette-border-soft)] prose-th:p-3 prose-th:text-left prose-th:bg-[color:var(--palette-surface-muted)] prose-th:text-[color:var(--palette-warm)] prose-td:border prose-td:border-[color:var(--palette-border-soft)] prose-td:p-3 max-w-none">
        {hasContent ? (
          <MDXRemote source={source} components={components} />
        ) : (
          <div className="text-accent opacity-60 italic">
            No content available.
          </div>
        )}
      </div>
    </article>
  );
}
