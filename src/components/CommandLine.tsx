"use client";

import { useRouter } from "next/navigation";
import { useState, KeyboardEvent, useEffect, useRef } from "react";
import pages from "@/config/pages.json";
import { AchievementsManager } from "@/lib/achievements";

type Command = {
  name: string;
  alias?: string[];
  description: string;
  execute: () => string;
  private?: boolean;
};

interface CommandLineProps {
  onInvalidCommand?: () => void;
  onOpenWikiWindow?: (slug?: string) => void;
}

export default function CommandLine({ onInvalidCommand, onOpenWikiWindow }: CommandLineProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Array<{command: string, response: string}>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const commands: Command[] = [
    {
      name: "random",
      alias: ["r"],
      description: "Open a random wiki page in window",
      execute: () => {
        if (onOpenWikiWindow) {
          const randomPage = pages[Math.floor(Math.random() * pages.length)];
          const slug = randomPage.replace('/c/', '');
          onOpenWikiWindow(slug);
          return `opened wiki page: ${slug}`;
        } else {
          const randomPage = pages[Math.floor(Math.random() * pages.length)];
          router.push(randomPage);
          return `navigating to ${randomPage}`;
        }
      },
    },
    {
      name: "help",
      alias: ["?"],
      description: "Show available commands",
      execute: () => {
        const helpText = commands
          .filter(cmd => !cmd.private)
          .map(cmd => {
            const aliases = cmd.alias ? ` (${cmd.alias.join(", ")})` : "";
            return `  ${cmd.name}${aliases} - ${cmd.description}`;
          }).join("\n");
        return `Available commands:\n${helpText}`;
      },
    },
    {
      name: "clear",
      alias: ["c"],
      description: "Clear the terminal history",
      execute: () => {
        setHistory([]);
        return "";
      },
    },
    {
      name: "reset-achievements",
      alias: ["ra"],
      description: "Reset all achievements (clears localStorage)",
      private: true,
      execute: () => {
        const manager = AchievementsManager.getInstance();
        manager.resetAll();
        return "achievements reset successfully";
      },
    },
  ];

  const handleCommand = (command: string) => {
    const cmd = commands.find(
      (c) =>
        c.name === command.toLowerCase() ||
        c.alias?.includes(command.toLowerCase())
    );
    if (cmd) {
      console.log(`Executing command: ${cmd.name}`);
      const response = cmd.execute();
      // Only add to history if response is not empty (for clear command)
      if (response !== "") {
        setHistory(prev => [...prev, { command, response }]);
      }
    } else {
      setHistory(prev => [...prev, { command, response: `unknown command: ${command}` }]);
      onInvalidCommand?.();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log(`Input via form submit: ${input}`);
    handleCommand(input);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!input.trim()) return;

      console.log(`Input via keydown: ${input}`);
      handleCommand(input);
      setInput("");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* History */}
      <div ref={historyRef} className="flex-1 overflow-auto mb-4 space-y-2">
        {history.map((entry, index) => (
          <div key={index} className="text-sm">
            <div className="text-[#FF4800]">CMD&gt; <span className="text-[#00FFFF]">{entry.command}</span></div>
            <div className="text-[#00FFFF] whitespace-pre-wrap pl-6">{entry.response}</div>
          </div>
        ))}
      </div>

      {/* Current command input */}
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={`flex items-center w-full cursor-text`}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName !== "INPUT") {
              const input = target.querySelector("input");
              input?.focus();
            }
          }}
        >
          <span className="text-[#FF4800] mr-2.5">CMD&gt;</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-[#00FFFF] font-mono text-base outline-none border border-transparent transition-colors duration-200 placeholder-[#00FFFF]/50"
            placeholder=""
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </form>
    </div>
  );
}
