"use client";

import React, { useState, useEffect, useRef } from "react";
import { BaseWindow } from "./BaseWindow";
import Image from "next/image";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { unlockAchievement } from "@/lib/achievements";

interface ProjectWindowProps {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent, windowId: string) => void;
  isClosing?: boolean;
}

interface Project {
  id: string;
  title: string;
  cover: string;
  fallbackCover?: string;
  artist?: string;
  year?: string;
  genre?: string;
  tagline?: string | null;
  url?: string | null;
  project_tags?: string[];
}

// Import generated projects data
import projectsData from "@/config/projects.json";

// Parse date from year field (MM-YYYY or YYYY format)
const parseProjectDate = (yearStr: string | undefined): Date => {
  if (!yearStr) return new Date("2000-01-01");

  if (yearStr.includes("-")) {
    // MM-YYYY format
    const [month, year] = yearStr.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  } else {
    // YYYY format - assume January (month 0)
    return new Date(parseInt(yearStr), 0, 1);
  }
};

// Sort projects by date (newest first)
const allProjects: Project[] = projectsData.sort((a, b) => {
  const dateA = parseProjectDate((a as Project).year);
  const dateB = parseProjectDate((b as Project).year);
  return dateB.getTime() - dateA.getTime();
});

// Get unique genres from projects data
const getUniqueGenres = (): string[] => {
  const genres = new Set<string>();
  allProjects.forEach((project) => {
    if (project.genre) {
      genres.add(project.genre);
    }
  });
  return Array.from(genres).sort();
};

const uniqueGenres = getUniqueGenres();
const libraryFilters = ["All Projects", ...uniqueGenres];
const playlistFilters = ["Featured", "Recent", "Favorites"];

// Filter projects based on active filter
const getFilteredProjects = (filter: string): Project[] => {
  switch (filter) {
    case "All Projects":
      return allProjects;
    case "Featured":
      return allProjects.filter((p) => p.url !== null).slice(0, 6);
    case "Recent":
      return allProjects.slice(0, 8);
    case "Favorites":
      return allProjects.filter(
        (p) => p.tagline !== null && p.tagline !== undefined
      );
    default:
      // Filter by genre
      return allProjects.filter((p) => p.genre === filter);
  }
};

// Component to handle fallback images
const ProjectImage: React.FC<{
  project: Project;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}> = ({ project, className = "", fill = false, sizes, priority = false }) => {
  const [imageSrc, setImageSrc] = React.useState(project.cover);

  // Update image source when project changes
  React.useEffect(() => {
    setImageSrc(project.cover);
  }, [project.cover]);

  const handleError = () => {
    if (imageSrc === project.cover && project.fallbackCover) {
      setImageSrc(project.fallbackCover);
    } else if (imageSrc === project.fallbackCover) {
      // Final fallback to jellyfish.webp
      setImageSrc("/project-covers/jellyfish.webp");
    }
  };

  return (
    <Image
      src={imageSrc}
      alt={project.title}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={handleError}
    />
  );
};

const DetailImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({
  className = "",
  ...props
}) => (
  <img
    {...props}
    className={`mx-auto my-4 w-full max-w-[220px] sm:max-w-[260px] lg:max-w-[320px] max-h-[220px] sm:max-h-[260px] rounded-lg shadow-lg border border-gray-700 object-contain ${className}`}
  />
);

export const ProjectsWindow: React.FC<ProjectWindowProps> = ({
  id,
  title,
  x,
  y,
  width,
  height,
  isMaximized,
  zIndex,
  onClose,
  onMouseDown,
  onResizeStart,
  isClosing = false,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All Projects");
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");
  const [projectContent, setProjectContent] = useState<{
    source: MDXRemoteSerializeResult | null;
    frontmatter: Record<string, unknown>;
  } | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const achievementUnlockedRef = useRef(false);

  const loadProjectContent = async (projectId: string) => {
    setIsLoadingContent(true);
    try {
      const response = await fetch(`/api/wiki/${projectId}`);
      if (response.ok) {
        const {
          serializedContent,
          frontmatter,
        }: {
          serializedContent: MDXRemoteSerializeResult;
          frontmatter: Record<string, unknown>;
        } = await response.json();
        setProjectContent({
          source: serializedContent,
          frontmatter: frontmatter,
        });
      } else {
        setProjectContent(null);
      }
    } catch (error) {
      console.error("Error loading project content:", error);
      setProjectContent(null);
    }
    setIsLoadingContent(false);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsPlaying(true);
    setViewMode("detail");
    // Disable animation, reset progress, then re-enable animation
    setShouldAnimate(false);
    setProgress(0);
    setElapsedSeconds(0);
    setTimeout(() => setShouldAnimate(true), 50);
    // Generate random duration between 180-300 seconds (3-5 minutes)
    setTotalDuration(Math.floor(Math.random() * (300 - 180 + 1)) + 180);
    loadProjectContent(project.id);
  };

  const handleBackToGrid = () => {
    setViewMode("grid");
  };

  const handlePreviousProject = () => {
    if (!selectedProject) return;
    const filteredProjects = getFilteredProjects(activeFilter);
    const currentIndex = filteredProjects.findIndex(
      (p) => p.id === selectedProject.id
    );
    if (currentIndex > 0) {
      handleProjectClick(filteredProjects[currentIndex - 1]);
    }
  };

  const handleNextProject = () => {
    if (!selectedProject) return;
    const filteredProjects = getFilteredProjects(activeFilter);
    const currentIndex = filteredProjects.findIndex(
      (p) => p.id === selectedProject.id
    );
    if (currentIndex < filteredProjects.length - 1) {
      handleProjectClick(filteredProjects[currentIndex + 1]);
    }
  };

  const canGoPrevious = () => {
    if (!selectedProject) return false;
    const filteredProjects = getFilteredProjects(activeFilter);
    const currentIndex = filteredProjects.findIndex(
      (p) => p.id === selectedProject.id
    );
    return currentIndex > 0;
  };

  const canGoNext = () => {
    if (!selectedProject) return false;
    const filteredProjects = getFilteredProjects(activeFilter);
    const currentIndex = filteredProjects.findIndex(
      (p) => p.id === selectedProject.id
    );
    return currentIndex < filteredProjects.length - 1;
  };

  // Progress timer effect - fills the bar based on totalDuration
  useEffect(() => {
    if (!selectedProject || !isPlaying || elapsedSeconds >= totalDuration) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newElapsed = prev + 1;
        setProgress((newElapsed / totalDuration) * 100);
        return newElapsed;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedProject, isPlaying, elapsedSeconds, totalDuration]);

  // Achievement unlock when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && !achievementUnlockedRef.current) {
      achievementUnlockedRef.current = true;
      unlockAchievement("good-listener");
    }
  }, [progress]);

  // Format seconds as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <BaseWindow
      id={id}
      title={title}
      x={x}
      y={y}
      width={width}
      height={height}
      minWidth={600}
      maxWidth={1200}
      minHeight={500}
      maxHeight={900}
      isMaximized={isMaximized}
      zIndex={zIndex}
      onClose={onClose}
      onMouseDown={onMouseDown}
      onResizeStart={onResizeStart}
      isClosing={isClosing}
      data-window="true"
    >
      <div className="flex h-full min-w-0 flex-col bg-[color:var(--palette-surface)] text-foreground md:flex-row">
        <div className="flex max-h-28 shrink-0 overflow-x-auto border-b border-[color:var(--palette-border-soft)] bg-[color:var(--palette-surface-muted)] md:max-h-none md:w-48 md:flex-col md:overflow-x-visible md:border-b-0 md:border-r">
          <div className="min-w-max border-r border-[color:var(--palette-border-soft)] p-3 md:min-w-0 md:border-r-0 md:border-b md:p-4">
            <h2 className="mb-2 text-xs font-bold text-accent md:mb-3 md:text-sm">
              LIBRARY
            </h2>
            <ul className="flex gap-2 text-xs md:block md:space-y-2">
              {libraryFilters.map((filter) => (
                <li
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`cursor-pointer whitespace-nowrap border border-transparent px-2 py-1 transition-colors md:border-0 md:px-0 md:py-0 ${
                    activeFilter === filter
                      ? "border-[color:var(--palette-border-soft)] text-accent md:border-transparent"
                      : "text-accent-muted hover:text-warm"
                  }`}
                >
                  {filter}
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-max p-3 md:min-w-0 md:flex-grow md:p-4">
            <h3 className="mb-2 text-xs font-bold text-accent md:mb-3 md:text-sm">
              PLAYLISTS
            </h3>
            <ul className="flex gap-2 text-xs md:block md:space-y-2">
              {playlistFilters.map((playlist) => (
                <li
                  key={playlist}
                  onClick={() => setActiveFilter(playlist)}
                  className={`cursor-pointer whitespace-nowrap border border-transparent px-2 py-1 transition-colors md:border-0 md:px-0 md:py-0 ${
                    activeFilter === playlist
                      ? "border-[color:var(--palette-border-soft)] text-accent md:border-transparent"
                      : "text-accent-muted hover:text-warm"
                  }`}
                >
                  {playlist}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-[color:var(--palette-border-soft)] bg-[color:var(--palette-surface-muted)]">
            <div className="flex min-h-20 items-center gap-3 p-3 md:h-20 md:min-h-20 md:gap-4 md:px-4 md:py-3">
              <div className="relative h-10 w-10 flex-shrink-0 rounded bg-[color:var(--palette-surface)] md:h-12 md:w-12">
                {selectedProject && (
                  <ProjectImage
                    project={selectedProject}
                    fill
                    sizes="48px"
                    className="object-cover rounded"
                    priority
                  />
                )}
              </div>
              <div className="flex h-full min-w-0 flex-1 flex-col justify-center">
                {selectedProject ? (
                  <>
                    <div className="text-accent font-semibold text-sm truncate">
                      {selectedProject.title}
                    </div>
                    <div className="text-zinc-500 text-xs truncate">
                      {selectedProject.artist} • {selectedProject.year}
                    </div>
                    <div className="text-zinc-600 text-xs mt-1 truncate">
                      {selectedProject.tagline || "\u00A0"}
                    </div>
                  </>
                ) : (
                  <div className="text-sm leading-snug text-zinc-500">
                    Nothing currently playing
                  </div>
                )}
              </div>
              <div className="flex flex-shrink-0 items-center gap-1 md:gap-2">
                <button className="text-zinc-500 hover:text-accent transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-full bg-[color:var(--palette-accent)] p-2 text-[color:var(--palette-background)] transition-colors hover:bg-[color:var(--palette-warm)] disabled:opacity-50"
                  disabled={!selectedProject}
                >
                  {isPlaying ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      />
                    </svg>
                  )}
                </button>
                {selectedProject?.url && (
                  <button
                    onClick={() =>
                      selectedProject.url &&
                      window.open(selectedProject.url, "_blank")
                    }
                    className="text-zinc-500 hover:text-warm transition-colors"
                    title="Open project"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="flex h-7 items-center px-3 md:px-4">
              <button
                onClick={handleBackToGrid}
                tabIndex={viewMode === "detail" ? 0 : -1}
                aria-hidden={viewMode !== "detail"}
                className={`flex items-center gap-2 text-sm text-accent transition-colors hover:text-warm ${
                  viewMode === "detail"
                    ? "visible pointer-events-auto"
                    : "invisible pointer-events-none"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Projects
              </button>
            </div>
          </div>

          {/* Content Area */}
          {viewMode === "grid" ? (
            /* Project Grid */
            <div className="flex-1 overflow-y-auto p-3 md:p-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {getFilteredProjects(activeFilter).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="group cursor-pointer"
                  >
                    <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-md bg-zinc-900 md:rounded-lg">
                      <ProjectImage
                        project={project}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority
                      />
                    </div>
                    <div className="rounded bg-[color:var(--palette-surface)] p-1.5 md:p-2">
                      <div className="truncate text-xs font-medium text-accent transition-colors group-hover:text-warm md:text-sm">
                        {project.title}
                      </div>
                      <div className="truncate text-[11px] text-zinc-300 md:text-xs">
                        {project.artist} • {project.year}
                      </div>
                      {project.tagline && (
                        <div className="mt-1 line-clamp-2 text-[11px] text-zinc-400 md:text-xs">
                          {project.tagline}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Project Detail View */
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
              {isLoadingContent ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="relative">
                    <div className="w-8 h-8 border-2 border-[color:var(--palette-border)] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-accent text-sm font-mono animate-pulse">
                    LOADING PROJECT...
                  </div>
                </div>
              ) : projectContent?.source ? (
                <article className="w-full max-w-full overflow-visible">
                  <div className="text-foreground leading-relaxed tracking-[0.3px] font-mono prose prose-invert prose-headings:text-[color:var(--palette-warm)] prose-h1:text-2xl prose-h1:border-b prose-h1:border-[color:var(--palette-warm-soft)] prose-h1:pb-1 prose-h1:mt-4 prose-h1:mb-2 prose-h2:text-xl prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-p:text-sm prose-p:mb-3 prose-a:text-[color:var(--palette-accent)] prose-a:no-underline prose-a:border-b prose-a:border-dotted prose-a:border-[color:var(--palette-border)] hover:prose-a:text-foreground hover:prose-a:border-[color:var(--palette-text)] prose-ul:ml-4 prose-ul:mb-3 prose-ul:text-sm prose-ol:ml-4 prose-ol:mb-3 prose-ol:text-sm prose-li:mb-1 prose-code:bg-[color:var(--palette-surface-muted)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-[color:var(--palette-surface-muted)] prose-pre:p-4 prose-pre:rounded prose-pre:border-l-2 prose-pre:border-[color:var(--palette-border)] prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-[color:var(--palette-border)] prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-3 prose-blockquote:italic prose-blockquote:text-muted prose-blockquote:bg-[color:var(--palette-surface-muted)] prose-table:w-full prose-table:border-collapse prose-table:mb-3 prose-th:border prose-th:border-[color:var(--palette-border-soft)] prose-th:p-2 prose-th:text-left prose-th:bg-[color:var(--palette-surface-muted)] prose-th:text-[color:var(--palette-warm)] prose-td:border prose-td:border-[color:var(--palette-border-soft)] prose-td:p-2 prose-sm">
                    <MDXRemote
                      {...(projectContent.source as MDXRemoteSerializeResult)}
                      components={{
                        a: ({
                          href,
                          children,
                          ...props
                        }: {
                          href?: string;
                          children: React.ReactNode;
                          [key: string]: unknown;
                        }) => {
                          if (
                            href &&
                            (href.startsWith("http://") ||
                            href.startsWith("https://"))
                          ) {
                            return (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-warm no-underline border-b border-solid border-[color:var(--palette-warm)] hover:text-accent hover:border-[color:var(--palette-border)] inline-flex items-center gap-1"
                                {...props}
                              >
                                {children}
                                <span className="text-xs opacity-60">↗</span>
                              </a>
                            );
                          }
                          return (
                            <a
                              href={href || "#"}
                              className="text-accent no-underline border-b border-dotted border-[color:var(--palette-border)] hover:text-foreground hover:border-[color:var(--palette-text)]"
                              {...props}
                            >
                              {children}
                            </a>
                          );
                        },
                        img: ({
                          className,
                          ...imgProps
                        }: React.ImgHTMLAttributes<HTMLImageElement>) => (
                          <DetailImage
                            {...imgProps}
                            className={className ? className : ""}
                          />
                        ),
                      }}
                    />
                  </div>
                </article>
              ) : (
                <div className="text-accent opacity-60 italic text-sm">
                  No content available for this project.
                </div>
              )}
            </div>
          )}

          {/* Player Controls */}
          <div className="border-t border-[color:var(--palette-border-soft)] bg-[color:var(--palette-surface-muted)] p-2 md:p-3">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousProject}
                  disabled={!canGoPrevious()}
                  className={`transition-colors ${
                    canGoPrevious()
                      ? "text-accent-muted hover:text-accent"
                      : "text-zinc-700 cursor-not-allowed"
                  }`}
                  title="Previous project"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                  </svg>
                </button>
                <button
                  onClick={handleNextProject}
                  disabled={!canGoNext()}
                  className={`transition-colors ${
                    canGoNext()
                      ? "text-accent-muted hover:text-accent"
                      : "text-zinc-700 cursor-not-allowed"
                  }`}
                  title="Next project"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
                  </svg>
                </button>
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="text-zinc-500 text-xs">
                  {selectedProject ? formatTime(elapsedSeconds) : "0:00"}
                </span>
                <div className="flex-1 h-1 bg-zinc-800 rounded-full relative">
                  <div
                    className={`absolute inset-y-0 left-0 bg-[color:var(--palette-accent)] rounded-full ${
                      shouldAnimate
                        ? "transition-all duration-1000 ease-linear"
                        : ""
                    }`}
                    style={{ width: selectedProject ? `${progress}%` : "0%" }}
                  ></div>
                </div>
                <span className="text-zinc-500 text-xs">
                  {selectedProject ? formatTime(totalDuration) : "0:00"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button className="text-zinc-500 hover:text-accent transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseWindow>
  );
};
