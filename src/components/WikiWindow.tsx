"use client";

import React, { useState, useEffect } from "react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Link from "next/link";
import { BaseWindow } from "./BaseWindow";

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("WikiWindow MDX Error:", error, errorInfo);
    console.error("Error stack:", error.stack);
    console.error("Component stack trace:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-[#FF4800] bg-black/30 p-4 rounded border border-[#FF4800]/30">
          <div className="font-bold mb-2">⚠️ Content Error</div>
          <div className="text-sm opacity-80 mb-2">
            There was an error rendering this content.
          </div>
          <div className="text-xs opacity-60">
            {this.state.error?.message || "Unknown error occurred"}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface WikiWindowProps {
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, windowId: string) => void;
}

interface Frontmatter {
  title?: string;
  date?: string;
  URL?: string;
  tags?: string[];
  error?: string;
  [key: string]: unknown;
}

// We'll fetch the pages list dynamically
let MDX_FILES: string[] = [];

export default function WikiWindow({
  onClose,
  isMaximized,
  onToggleMaximize,
  x,
  y,
  width,
  height,
  zIndex,
  onMouseDown,
  onResizeStart,
}: WikiWindowProps) {
  const [currentContent, setCurrentContent] = useState<{
    source: unknown;
    frontmatter: Frontmatter;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFile, setCurrentFile] = useState<string>("");

  const loadSpecificPage = async (fileName: string) => {
    setIsLoading(true);
    setCurrentFile(fileName);

    try {
      const response = await fetch(`/api/wiki/${fileName}`);
      if (response.ok) {
        const { serializedContent, frontmatter } = await response.json();
        setCurrentContent({
          source: serializedContent,
          frontmatter: frontmatter,
        });
      } else {
        // Handle 404 gracefully - show that the page doesn't exist
        const errorData = await response.json().catch(() => ({}));
        console.log(`Page not found: ${fileName}`, errorData);

        setCurrentContent({
          source: null,
          frontmatter: {
            title: `${fileName} (not found)`,
            error: `The page "${fileName}" does not exist or could not be loaded.`,
          },
        });
      }
    } catch (error) {
      console.error("Error loading MDX content:", error);
      setCurrentContent({
        source: null,
        frontmatter: {
          title: "Error",
          error: `Failed to load content: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      });
    }

    setIsLoading(false);
  };

  const loadTagPage = async (tagName: string) => {
    setIsLoading(true);
    setCurrentFile(`tag:${tagName}`);

    try {
      const response = await fetch(
        `/api/wiki-tag/${encodeURIComponent(tagName)}`
      );
      if (response.ok) {
        const { serializedContent, frontmatter } = await response.json();
        setCurrentContent({
          source: serializedContent,
          frontmatter: frontmatter,
        });
      } else {
        // If tag page doesn't exist, load a random page with that tag
        console.log(`Tag page not found: ${tagName}, loading random page`);
        loadRandomPage();
      }
    } catch (error) {
      console.error("Error loading tag page:", error);
      loadRandomPage();
    }

    setIsLoading(false);
  };

  const loadRandomPage = async () => {
    const randomFile = MDX_FILES[Math.floor(Math.random() * MDX_FILES.length)];
    await loadSpecificPage(randomFile);
  };

  useEffect(() => {
    const initializeWiki = async () => {
      try {
        // First fetch the pages list
        const response = await fetch("/api/wiki-pages");
        if (response.ok) {
          const { pages } = await response.json();
          MDX_FILES = pages;
        } else {
          // Fallback to a basic list if API fails
          MDX_FILES = [
            "index",
            "projects",
            "oblique-strategies",
            "wicked-problems",
            "multipolar-traps",
          ];
        }

        // Then load a random page
        const randomFile =
          MDX_FILES[Math.floor(Math.random() * MDX_FILES.length)];
        await loadSpecificPage(randomFile);
      } catch (error) {
        console.error("Error initializing wiki:", error);
        // Fallback
        MDX_FILES = [
          "index",
          "projects",
          "oblique-strategies",
          "wicked-problems",
          "multipolar-traps",
        ];
        await loadSpecificPage("index");
      }
      setIsLoading(false);
    };
    initializeWiki();
  }, []);

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
      return url;
    }
  };

  // Custom Link component that intercepts internal wiki links
  const WikiLink = ({
    href,
    children,
    className,
    ...props
  }: {
    href?: string;
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => {
    // Check if it's an internal content link (starts with /c/)
    if (href && href.startsWith("/c/")) {
      const slug = href.replace("/c/", "");
      // Check if this slug exists in our MDX_FILES
      if (MDX_FILES.includes(slug)) {
        return (
          <button
            onClick={() => loadSpecificPage(slug)}
            className={
              className ||
              "text-[#00FFFF] no-underline border-b border-dotted border-[#00FFFF] hover:text-white hover:border-white cursor-pointer bg-transparent font-inherit"
            }
            {...props}
          >
            {children}
          </button>
        );
      }
    }

    // Check if it's an external link (starts with http)
    if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={
            className ||
            "text-[#FF4800] no-underline border-b border-solid border-[#FF4800] hover:text-[#FF6600] hover:border-[#FF6600] inline-flex items-center gap-1"
          }
          {...props}
        >
          {children}
          <span className="text-xs opacity-60">↗</span>
        </a>
      );
    }

    // For other internal links, use regular Link
    return (
      <Link href={href || "#"} className={className} {...props}>
        {children}
      </Link>
    );
  };

  const components = {
    Link: WikiLink,
    // Handle regular anchor tags with proper styling
    a: ({
      href,
      children,
      className,
      ...props
    }: {
      href?: string;
      children: React.ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => {
      // Check if it's an external link (starts with http)
      if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={
              className ||
              "text-[#FF4800] no-underline border-b border-solid border-[#FF4800] hover:text-[#FF6600] hover:border-[#FF6600] inline-flex items-center gap-1"
            }
            {...props}
          >
            {children}
            <span className="text-xs opacity-60">↗</span>
          </a>
        );
      }

      // For internal links, use wiki styling
      return (
        <a
          href={href || "#"}
          className={
            className ||
            "text-[#00FFFF] no-underline border-b border-dotted border-[#00FFFF] hover:text-white hover:border-white"
          }
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <BaseWindow
      id="wiki-window"
      title={`WIKI.MD${currentFile ? ` - ${currentFile.toUpperCase()}` : ""}`}
      x={x}
      y={y}
      width={width}
      height={height}
      isMaximized={isMaximized}
      zIndex={zIndex}
      onClose={onClose}
      onToggleMaximize={onToggleMaximize}
      onMouseDown={onMouseDown}
      onResizeStart={onResizeStart}
      titleBarButtons={
        <button
          onClick={loadRandomPage}
          className="text-black hover:bg-black hover:text-[#00FFFF] px-2 py-1 border border-black text-xs font-mono transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "..." : "RND"}
        </button>
      }
    >
      <div className="p-4 overflow-auto h-full">
        {currentContent ? (
          <article className="w-full">
            {/* Frontmatter Header */}
            {currentContent.frontmatter.title && (
              <header className="mb-6 border-l-4 border-[#FF4800] pl-4 py-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[#FF4800] mb-2">
                  {currentContent.frontmatter.title}
                </h1>

                <div className="space-y-1 text-xs opacity-80">
                  {currentContent.frontmatter.date && (
                    <div className="text-[#00FFFF]">
                      {formatDate(currentContent.frontmatter.date as string)}
                    </div>
                  )}

                  {currentContent.frontmatter.URL && (
                    <div>
                      <a
                        href={String(currentContent.frontmatter.URL)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00FFFF] hover:underline"
                      >
                        {getRootUrl(String(currentContent.frontmatter.URL))}
                      </a>
                    </div>
                  )}

                  {currentContent.frontmatter.tags &&
                    Array.isArray(currentContent.frontmatter.tags) &&
                    currentContent.frontmatter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(currentContent.frontmatter.tags as string[]).map(
                          (tag: string) => {
                            const cleanTag = tag
                              .replace(/^sources\//, "")
                              .replace(/^c\/entity$/, "entity")
                              .replace(/^[^\w]*/, "");
                            if (!cleanTag) return null;

                            return (
                              <button
                                key={tag}
                                onClick={() => {
                                  // Load the actual tag page which lists all posts with this tag
                                  loadTagPage(cleanTag);
                                }}
                                className="bg-black/30 px-1 py-0.5 rounded text-xs border border-[#00FFFF] text-[#00FFFF] hover:bg-black/50 hover:border-[#FF4800] hover:text-[#FF4800] transition-colors cursor-pointer"
                              >
                                {cleanTag}
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}
                </div>
              </header>
            )}

            {/* MDX Content */}
            <div className="text-[#eef2ff] leading-relaxed tracking-[0.3px] font-mono prose prose-invert prose-headings:text-[#FF4800] prose-h1:text-2xl prose-h1:border-b prose-h1:border-[#FF4800]/30 prose-h1:pb-1 prose-h1:mt-4 prose-h1:mb-2 prose-h2:text-xl prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-p:text-sm prose-p:mb-3 prose-a:text-[#00FFFF] prose-a:no-underline prose-a:border-b prose-a:border-dotted prose-a:border-[#00FFFF] hover:prose-a:text-white hover:prose-a:border-white prose-ul:ml-4 prose-ul:mb-3 prose-ul:text-sm prose-ol:ml-4 prose-ol:mb-3 prose-ol:text-sm prose-li:mb-1 prose-code:bg-black/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-black/50 prose-pre:p-4 prose-pre:rounded prose-pre:border-l-2 prose-pre:border-[#00FFFF] prose-blockquote:border-l-4 prose-blockquote:border-[#00FFFF] prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-3 prose-blockquote:italic prose-blockquote:text-gray-400 prose-blockquote:bg-black/20 prose-img:border prose-img:border-gray-700 prose-img:my-3 prose-img:max-w-full prose-img:h-auto prose-table:w-full prose-table:border-collapse prose-table:mb-3 prose-th:border prose-th:border-gray-700 prose-th:p-2 prose-th:text-left prose-th:bg-black/50 prose-th:text-[#FF4800] prose-td:border prose-td:border-gray-700 prose-td:p-2 max-w-none prose-sm [&_iframe]:max-w-full [&_iframe]:h-auto [&_iframe]:max-h-96 [&_video]:max-w-full [&_video]:h-auto [&_embed]:max-w-full [&_embed]:h-auto [&_object]:max-w-full [&_object]:h-auto">
              {currentContent.source ? (
                <ErrorBoundary>
                  <MDXRemote
                    {...(currentContent.source as MDXRemoteSerializeResult)}
                    components={components}
                  />
                </ErrorBoundary>
              ) : (
                <div className="text-[#00FFFF] opacity-60 italic text-sm">
                  {currentContent.frontmatter.error ? (
                    <div>
                      <div className="mb-2">
                        ❌ {String(currentContent.frontmatter.error)}
                      </div>
                      <div className="text-xs opacity-40">
                        Try clicking the &quot;RND&quot; button to load a
                        different page.
                      </div>
                    </div>
                  ) : (
                    <>
                      Content not found: {currentFile}. This page may not exist
                      yet.
                    </>
                  )}
                </div>
              )}
            </div>
          </article>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-8 h-8 border-2 border-[#FF4800] border-r-transparent rounded-full animate-spin animate-reverse" style={{animationDuration: '1.5s'}}></div>
            </div>
            <div className="text-[#00FFFF] text-sm font-mono animate-pulse">
              LOADING WIKI.MD
              <span className="animate-pulse">...</span>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#FF4800] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-[#00FFFF] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-[#FF4800] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        ) : (
          <div className="text-[#00FFFF] opacity-60 italic text-sm">
            Failed to load content.
          </div>
        )}
      </div>
    </BaseWindow>
  );
}
