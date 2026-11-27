// Bundle checked-in MDX as text so the same routes work without a host filesystem.
declare const require: {
  context(directory: string, recursive: boolean, pattern: RegExp): {
    keys(): string[];
    (key: string): string;
  };
};

const content = require.context("../../content", false, /\.mdx$/);
const contentKeys = new Set(content.keys());

export function contentSlugs(): string[] {
  return Array.from(contentKeys, (key) => key.slice(2, -4)).sort();
}

export function readContent(slug: string): string | undefined {
  const key = `./${slug}.mdx`;
  return contentKeys.has(key) ? content(key) : undefined;
}
