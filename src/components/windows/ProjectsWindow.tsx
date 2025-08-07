"use client";

import React, { useState } from "react";
import { BaseWindow } from "./BaseWindow";
import Image from "next/image";

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
  onToggleMaximize: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent, windowId: string) => void;
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
}

// Import generated projects data
import projectsData from "@/config/projects.json";

// Parse date from year field (MM-YYYY or YYYY format)
const parseProjectDate = (yearStr: string | undefined): Date => {
  if (!yearStr) return new Date('2000-01-01');
  
  if (yearStr.includes('-')) {
    // MM-YYYY format
    const [month, year] = yearStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  } else {
    // YYYY format - assume January (month 0)
    return new Date(parseInt(yearStr), 0, 1);
  }
};

// Sort projects by date (newest first)
const allProjects: Project[] = projectsData.sort((a, b) => {
  const dateA = parseProjectDate(a.year);
  const dateB = parseProjectDate(b.year);
  return dateB.getTime() - dateA.getTime();
});

// Get unique genres from projects data
const getUniqueGenres = (): string[] => {
  const genres = new Set<string>();
  allProjects.forEach(project => {
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
      return allProjects.filter(p => p.url !== null).slice(0, 6);
    case "Recent":
      return allProjects.slice(0, 8);
    case "Favorites":
      return allProjects.filter(p => p.tagline !== null && p.tagline !== undefined);
    default:
      // Filter by genre
      return allProjects.filter(p => p.genre === filter);
  }
};

// Component to handle fallback images
const ProjectImage: React.FC<{ project: Project; className?: string; fill?: boolean; sizes?: string; priority?: boolean }> = ({ 
  project, 
  className = "", 
  fill = false, 
  sizes,
  priority = false 
}) => {
  const [imageSrc, setImageSrc] = React.useState(project.cover);

  const handleError = () => {
    if (imageSrc === project.cover && project.fallbackCover) {
      setImageSrc(project.fallbackCover);
    } else if (imageSrc === project.fallbackCover) {
      // Final fallback to jellyfish.webp
      setImageSrc('/project-covers/jellyfish.webp');
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
  onToggleMaximize,
  onMouseDown,
  onResizeStart,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All Projects");

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
      onToggleMaximize={onToggleMaximize}
      onMouseDown={onMouseDown}
      onResizeStart={onResizeStart}
      data-window="true"
    >
      <div className="flex h-full bg-black">
        {/* Sidebar */}
        <div className="w-48 bg-zinc-900 border-r border-zinc-800 flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-[#00FFFF] font-bold text-sm mb-3">LIBRARY</h2>
            <ul className="space-y-2 text-xs">
              {libraryFilters.map((filter) => (
                <li 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`cursor-pointer transition-colors ${
                    activeFilter === filter 
                      ? "text-[#00FFFF]" 
                      : "text-zinc-500 hover:text-[#ff4800]"
                  }`}
                >
                  {filter}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 flex-grow">
            <h3 className="text-[#00FFFF] font-bold text-sm mb-3">PLAYLISTS</h3>
            <ul className="space-y-2 text-xs">
              {playlistFilters.map((playlist) => (
                <li 
                  key={playlist}
                  onClick={() => setActiveFilter(playlist)}
                  className={`cursor-pointer transition-colors ${
                    activeFilter === playlist 
                      ? "text-[#00FFFF]" 
                      : "text-zinc-500 hover:text-[#ff4800]"
                  }`}
                >
                  {playlist}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Now Playing Bar */}
          <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center gap-4">
            {selectedProject ? (
              <>
                <div className="w-12 h-12 relative bg-zinc-800 rounded">
                  <ProjectImage
                    project={selectedProject}
                    fill
                    sizes="48px"
                    className="object-cover rounded"
                    priority
                  />
                </div>
                <div className="flex-1">
                  <div className="text-[#00FFFF] font-semibold text-sm">{selectedProject.title}</div>
                  <div className="text-zinc-500 text-xs">{selectedProject.artist} • {selectedProject.year}</div>
                  {selectedProject.tagline && (
                    <div className="text-zinc-600 text-xs mt-1">{selectedProject.tagline}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-zinc-500 hover:text-[#00FFFF] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-[#00FFFF] text-black rounded-full p-2 hover:bg-[#ff4800] transition-colors"
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    )}
                  </button>
                  {selectedProject.url && (
                    <button 
                      onClick={() => selectedProject.url && window.open(selectedProject.url, '_blank')}
                      className="text-zinc-500 hover:text-[#ff4800] transition-colors"
                      title="Open project"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-zinc-500 text-sm">Select a project to view details</div>
            )}
          </div>

          {/* Project Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {getFilteredProjects(activeFilter).map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setIsPlaying(true);
                  }}
                  className="group cursor-pointer"
                >
                  <div className="relative w-full aspect-square bg-zinc-900 rounded-lg overflow-hidden mb-2">
                    <ProjectImage
                      project={project}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority
                    />
                  </div>
                  <div className="bg-black bg-opacity-75 p-2 rounded">
                    <div className="text-[#00FFFF] text-sm font-medium group-hover:text-[#ff4800] transition-colors truncate">
                      {project.title}
                    </div>
                    <div className="text-zinc-300 text-xs truncate">
                      {project.genre} • {project.year}
                    </div>
                    {project.tagline && (
                      <div className="text-zinc-400 text-xs mt-1 line-clamp-2">
                        {project.tagline}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player Controls */}
          <div className="bg-zinc-900 border-t border-zinc-800 p-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="text-zinc-500 hover:text-[#00FFFF] transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.445 14.832A1 1 0 0010 14v-4a1 1 0 00-1.555-.832L5 11.528V9a1 1 0 00-2 0v6a1 1 0 002 0v-2.528l3.445 2.36z" />
                  </svg>
                </button>
                <button className="text-zinc-500 hover:text-[#00FFFF] transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 002 0V6a1 1 0 00-2 0v2.798L4.555 5.168z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 flex items-center gap-2">
                <span className="text-zinc-500 text-xs">0:00</span>
                <div className="flex-1 h-1 bg-zinc-800 rounded-full relative">
                  <div className="absolute inset-y-0 left-0 w-1/3 bg-[#00FFFF] rounded-full"></div>
                </div>
                <span className="text-zinc-500 text-xs">3:45</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="text-zinc-500 hover:text-[#00FFFF] transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
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