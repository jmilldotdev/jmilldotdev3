"use client";

import { useQuickSwitcher } from "./QuickSwitcher";

export default function QuickSwitcherTrigger() {
  const { toggle } = useQuickSwitcher();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-md transition-colors bg-gray-800 hover:bg-gray-700"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="21 21l-4.35-4.35" />
      </svg>
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs font-mono bg-gray-700 rounded border border-gray-600">
        ⌘K
      </kbd>
    </button>
  );
}
