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
    <article className="w-full px-4 md:px-8 lg:px-16 py-8">
      {/* Frontmatter Header */}
      <header className="mb-10 border-l-4 border-[#FF4800] pl-4 py-2">
        {frontmatter.title && (
          <h1 className="text-3xl md:text-4xl font-bold text-[#FF4800] mb-4">
            {frontmatter.title}
          </h1>
        )}

        <div className="space-y-2 text-sm opacity-80">
          {frontmatter.date && (
            <div className="text-[#00FFFF]">
              {formatDate(frontmatter.date)}
            </div>
          )}

          {frontmatter.URL && (
            <div>
              <a
                href={frontmatter.URL as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FFFF] hover:underline"
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
                    className="bg-black/30 px-2 py-1 rounded text-xs border border-[#00FFFF] text-[#00FFFF] hover:bg-black/50 hover:border-[#FF4800] hover:text-[#FF4800] transition-colors"
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
      <div className="w-full text-[#eef2ff] leading-relaxed tracking-[0.3px] font-mono overflow-y-auto prose prose-invert prose-headings:text-[#FF4800] prose-h1:text-4xl prose-h1:border-b prose-h1:border-[#FF4800]/30 prose-h1:pb-2 prose-h1:mt-6 prose-h1:mb-3 prose-h2:text-3xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-lg prose-p:mb-6 prose-a:text-[#00FFFF] prose-a:no-underline prose-a:border-b prose-a:border-dotted prose-a:border-[#00FFFF] hover:prose-a:text-white hover:prose-a:border-white prose-ul:ml-6 prose-ul:mb-6 prose-ul:text-lg prose-ol:ml-6 prose-ol:mb-6 prose-ol:text-lg prose-li:mb-3 prose-code:bg-black/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-black/50 prose-pre:p-6 prose-pre:rounded prose-pre:border-l-2 prose-pre:border-[#00FFFF] prose-blockquote:border-l-4 prose-blockquote:border-[#00FFFF] prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-gray-400 prose-blockquote:bg-black/20 prose-img:border prose-img:border-gray-700 prose-img:my-6 prose-table:w-full prose-table:border-collapse prose-table:mb-6 prose-th:border prose-th:border-gray-700 prose-th:p-3 prose-th:text-left prose-th:bg-black/50 prose-th:text-[#FF4800] prose-td:border prose-td:border-gray-700 prose-td:p-3 max-w-none">
        {hasContent ? (
          <MDXRemote source={source} components={components} />
        ) : (
          <div className="text-[#00FFFF] opacity-60 italic">
            No content available.
          </div>
        )}
      </div>
    </article>
  );
}
