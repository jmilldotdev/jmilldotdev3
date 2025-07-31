"use client";

import React, { useState, useEffect } from "react";
import { MDXRemote } from "next-mdx-remote";
import Link from "next/link";

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
  onMouseDown 
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
          frontmatter: frontmatter
        });
      } else {
        // Handle 404 gracefully - show that the page doesn't exist
        const errorData = await response.json().catch(() => ({}));
        console.log(`Page not found: ${fileName}`, errorData);
        
        setCurrentContent({
          source: null,
          frontmatter: { 
            title: `${fileName} (not found)`,
            error: `The page "${fileName}" does not exist or could not be loaded.`
          }
        });
      }
    } catch (error) {
      console.error("Error loading MDX content:", error);
      setCurrentContent({
        source: null,
        frontmatter: { 
          title: "Error",
          error: `Failed to load content: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      });
    }
    
    setIsLoading(false);
  };

  const loadTagPage = async (tagName: string) => {
    setIsLoading(true);
    setCurrentFile(`tag:${tagName}`);
    
    try {
      const response = await fetch(`/api/wiki-tag/${encodeURIComponent(tagName)}`);
      if (response.ok) {
        const { serializedContent, frontmatter } = await response.json();
        setCurrentContent({
          source: serializedContent,
          frontmatter: frontmatter
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
        const response = await fetch('/api/wiki-pages');
        if (response.ok) {
          const { pages } = await response.json();
          MDX_FILES = pages;
        } else {
          // Fallback to a basic list if API fails
          MDX_FILES = ['index', 'projects', 'oblique-strategies', 'wicked-problems', 'multipolar-traps'];
        }
        
        // Then load a random page
        const randomFile = MDX_FILES[Math.floor(Math.random() * MDX_FILES.length)];
        await loadSpecificPage(randomFile);
      } catch (error) {
        console.error('Error initializing wiki:', error);
        // Fallback
        MDX_FILES = ['index', 'projects', 'oblique-strategies', 'wicked-problems', 'multipolar-traps'];
        await loadSpecificPage('index');
      }
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
  const WikiLink = ({ href, children, className, ...props }: { href?: string; children: React.ReactNode; className?: string; [key: string]: unknown }) => {
    // Check if it's an internal content link (starts with /c/)
    if (href && href.startsWith('/c/')) {
      const slug = href.replace('/c/', '');
      // Check if this slug exists in our MDX_FILES
      if (MDX_FILES.includes(slug)) {
        return (
          <button 
            onClick={() => loadSpecificPage(slug)}
            className={className || "text-[#00FFFF] no-underline border-b border-dotted border-[#00FFFF] hover:text-white hover:border-white cursor-pointer bg-transparent font-inherit"}
            {...props}
          >
            {children}
          </button>
        );
      }
    }
    
    // For external links or non-wiki internal links, use regular Link
    return <Link href={href || '#'} className={className} {...props}>{children}</Link>;
  };

  const components = {
    Link: WikiLink,
  };

  return (
    <div
      className={`window-container absolute border-2 border-[#00FFFF] bg-black ${
        isMaximized ? 'inset-4' : ''
      }`}
      style={isMaximized ? {} : {
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: zIndex
      }}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between bg-[#00FFFF] bg-opacity-20 px-3 py-2 cursor-move"
        onMouseDown={!isMaximized ? onMouseDown : undefined}
      >
        <span className="text-black font-mono text-sm font-bold">
          WIKI.MD {currentFile && `- ${currentFile.toUpperCase()}`}
        </span>
        <div className="flex gap-2">
          <button
            onClick={loadRandomPage}
            className="text-black hover:bg-black hover:text-[#00FFFF] px-2 py-1 border border-black text-xs font-mono transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "..." : "RND"}
          </button>
          <button
            onClick={onToggleMaximize}
            className="text-black hover:bg-black hover:text-[#00FFFF] w-6 h-6 border border-black text-xs font-mono transition-colors"
          >
            {isMaximized ? '□' : '■'}
          </button>
          <button
            onClick={onClose}
            className="text-black hover:bg-black hover:text-[#00FFFF] w-6 h-6 border border-black text-xs font-mono transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 40px)' }}>
        {isLoading ? (
          <div className="text-[#00FFFF] font-mono text-sm animate-pulse">
            Loading wiki content...
          </div>
        ) : currentContent ? (
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
                  
                  {currentContent.frontmatter.tags && Array.isArray(currentContent.frontmatter.tags) && currentContent.frontmatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(currentContent.frontmatter.tags as string[]).map((tag: string) => {
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
                      })}
                    </div>
                  )}
                </div>
              </header>
            )}

            {/* MDX Content */}
            <div className="text-[#eef2ff] leading-relaxed tracking-[0.3px] font-mono prose prose-invert prose-headings:text-[#FF4800] prose-h1:text-2xl prose-h1:border-b prose-h1:border-[#FF4800]/30 prose-h1:pb-1 prose-h1:mt-4 prose-h1:mb-2 prose-h2:text-xl prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-p:text-sm prose-p:mb-3 prose-a:text-[#00FFFF] prose-a:no-underline prose-a:border-b prose-a:border-dotted prose-a:border-[#00FFFF] hover:prose-a:text-white hover:prose-a:border-white prose-ul:ml-4 prose-ul:mb-3 prose-ul:text-sm prose-ol:ml-4 prose-ol:mb-3 prose-ol:text-sm prose-li:mb-1 prose-code:bg-black/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-black/50 prose-pre:p-4 prose-pre:rounded prose-pre:border-l-2 prose-pre:border-[#00FFFF] prose-blockquote:border-l-4 prose-blockquote:border-[#00FFFF] prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-3 prose-blockquote:italic prose-blockquote:text-gray-400 prose-blockquote:bg-black/20 prose-img:border prose-img:border-gray-700 prose-img:my-3 prose-table:w-full prose-table:border-collapse prose-table:mb-3 prose-th:border prose-th:border-gray-700 prose-th:p-2 prose-th:text-left prose-th:bg-black/50 prose-th:text-[#FF4800] prose-td:border prose-td:border-gray-700 prose-td:p-2 max-w-none prose-sm">
              {currentContent.source ? (
                <MDXRemote 
                  {...(currentContent.source as any)} 
                  components={components} 
                />
              ) : (
                <div className="text-[#00FFFF] opacity-60 italic text-sm">
                  {currentContent.frontmatter.error ? (
                    <div>
                      <div className="mb-2">❌ {String(currentContent.frontmatter.error)}</div>
                      <div className="text-xs opacity-40">
                        Try clicking the "RND" button to load a different page.
                      </div>
                    </div>
                  ) : (
                    <>Content not found: {currentFile}. This page may not exist yet.</>
                  )}
                </div>
              )}
            </div>
          </article>
        ) : (
          <div className="text-[#00FFFF] opacity-60 italic text-sm">
            Failed to load content.
          </div>
        )}
      </div>
    </div>
  );
}