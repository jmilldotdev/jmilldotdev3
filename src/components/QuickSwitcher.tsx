"use client";

import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
  ActionImpl,
  Action,
  useKBar,
} from "kbar";
import {
  ReactNode,
  useMemo,
  useEffect,
  createContext,
  useContext,
} from "react";
import { useRouter } from "next/navigation";

interface PageMetadata {
  slug: string;
  title: string;
  created?: string;
  date?: string;
  tags?: string[];
  url?: string;
  path: string;
}

interface QuickSwitcherProps {
  children: ReactNode;
  pageMetadata: PageMetadata[];
  tagData: Record<string, PageMetadata[]>;
}

// Create a context for the quick switcher
const QuickSwitcherContext = createContext<{
  toggle: () => void;
} | null>(null);

export const useQuickSwitcher = () => {
  const context = useContext(QuickSwitcherContext);
  if (!context) {
    throw new Error("useQuickSwitcher must be used within QuickSwitcher");
  }
  return context;
};

function QuickSwitcherProvider({ children }: { children: ReactNode }) {
  const { query } = useKBar();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        query.toggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [query]);

  const contextValue = {
    toggle: () => query.toggle(),
  };

  return (
    <QuickSwitcherContext.Provider value={contextValue}>
      {children}
    </QuickSwitcherContext.Provider>
  );
}

export default function QuickSwitcher({
  children,
  pageMetadata,
  tagData,
}: QuickSwitcherProps) {
  const router = useRouter();

  const actions = useMemo(() => {
    const contentActions: Action[] = pageMetadata.map((page) => ({
      id: `content-${page.slug}`,
      name: page.title,
      shortcut: [],
      keywords: [page.title, ...(page.tags || []), "content", "page"].join(" "),
      section: "Content",
      perform: () => router.push(page.path),
      subtitle: page.url ? new URL(page.url).hostname : undefined,
    }));

    const tagActions: Action[] = Object.keys(tagData).map((tag) => {
      const cleanTag = tag
        .replace(/^sources\//, "")
        .replace(/^c\/entity$/, "entity")
        .replace(/^[^\w]*/, "");
      const pageCount = tagData[tag].length;

      return {
        id: `tag-${cleanTag}`,
        name: cleanTag,
        shortcut: [],
        keywords: [cleanTag, "tag", "category"].join(" "),
        section: "Tags",
        perform: () => router.push(`/t/${encodeURIComponent(cleanTag)}`),
        subtitle: `${pageCount} ${pageCount === 1 ? "page" : "pages"}`,
      };
    });

    const homeAction: Action = {
      id: "home",
      name: "Home",
      shortcut: ["h"],
      keywords: "home index",
      section: "Navigation",
      perform: () => router.push("/"),
    };

    const projectsAction: Action = {
      id: "projects",
      name: "Projects",
      shortcut: ["p"],
      keywords: "projects work portfolio",
      section: "Navigation",
      perform: () => router.push("/c/projects"),
    };

    const entityAction: Action = {
      id: "entity",
      name: "Entity",
      shortcut: ["e"],
      keywords: "entity",
      section: "Navigation",
      perform: () => router.push("/c/entity"),
    };

    return [
      homeAction,
      projectsAction,
      entityAction,
      ...contentActions,
      ...tagActions,
    ];
  }, [pageMetadata, tagData, router]);

  return (
    <KBarProvider actions={actions}>
      <QuickSwitcherProvider>
        <KBarPortal>
          <KBarPositioner className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm">
            <KBarAnimator
              className="w-full max-w-2xl mx-auto mt-20 overflow-hidden bg-black border border-gray-700 rounded-none shadow-2xl"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.95)",
                borderColor: "#333",
                fontFamily: '"Courier New", monospace',
              }}
            >
              <div
                className="p-4 border-b border-gray-700"
                style={{ borderColor: "#333" }}
              >
                <KBarSearch
                  className="w-full bg-transparent text-white placeholder-gray-400 text-lg outline-none"
                  placeholder="SEARCH PAGES AND TAGS..."
                  style={{ color: "var(--color-secondary)" }}
                />
              </div>
              <RenderResults />
            </KBarAnimator>
          </KBarPositioner>
        </KBarPortal>
        {children}
      </QuickSwitcherProvider>
    </KBarProvider>
  );
}

function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) => {
        if (typeof item === "string") {
          return (
            <div
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{
                color: "var(--color-primary)",
                backgroundColor: "rgba(20, 20, 20, 0.7)",
                fontFamily: '"Courier New", monospace',
              }}
            >
              {item}
            </div>
          );
        }

        const action = item as ActionImpl;

        return (
          <div
            className={`px-4 py-3 cursor-pointer transition-colors border-l-4 ${
              active
                ? "bg-gray-800 text-white border-l-4"
                : "text-gray-300 hover:bg-gray-900 border-l-transparent"
            }`}
            style={{
              backgroundColor: active ? "rgba(20, 20, 20, 0.9)" : "transparent",
              borderLeftColor: active ? "var(--color-primary)" : "transparent",
              fontFamily: '"Courier New", monospace',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div
                  className="font-medium truncate"
                  style={{ color: active ? "var(--color-secondary)" : "white" }}
                >
                  {action.name}
                </div>
                {action.subtitle && (
                  <div className="text-sm text-gray-500 truncate">
                    {action.subtitle}
                  </div>
                )}
              </div>
              {action.shortcut && action.shortcut.length > 0 && (
                <div className="flex gap-1 ml-2">
                  {action.shortcut.map((key) => (
                    <kbd
                      key={key}
                      className="px-1.5 py-0.5 text-xs font-mono border rounded-none"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        borderColor: "#333",
                        color: "var(--color-secondary)",
                        fontFamily: '"Courier New", monospace',
                      }}
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
