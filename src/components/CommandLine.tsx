"use client";

import { useRouter } from "next/navigation";
import { useState, KeyboardEvent } from "react";
import pages from "@/config/pages.json";
import { Modal } from "./ui";

type Command = {
  name: string;
  alias?: string[];
  description: string;
  execute: () => void;
};

interface CommandLineProps {
  onInvalidCommand?: () => void;
}

export default function CommandLine({ onInvalidCommand }: CommandLineProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const commands: Command[] = [
    {
      name: "home",
      alias: ["~", "root", "h"],
      description: "Navigate to the home page",
      execute: () => router.push("/"),
    },
    {
      name: "random",
      alias: ["r"],
      description: "Navigate to a random page",
      execute: () => {
        const randomPage = pages[Math.floor(Math.random() * pages.length)];
        router.push(randomPage);
      },
    },
    {
      name: "help",
      alias: ["?"],
      description: "Show available commands",
      execute: () => setShowHelp(true),
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
      cmd.execute();
    } else {
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
    <>
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={`command-line flex w-full cursor-text`}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName !== "INPUT") {
              const input = target.querySelector("input");
              input?.focus();
            }
          }}
        >
          <span className="command-prompt">CMD&gt;</span>
          <input
            type="text"
            className="command-input flex-1 bg-transparent outline-none"
            placeholder="ENTER COMMAND"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </form>

      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Available Commands"
      >
        <div className="space-y-4">
          {commands.map((cmd) => (
            <div key={cmd.name} className="flex items-baseline gap-2">
              <div className="font-mono text-white">
                {cmd.name}
                {cmd.alias && (
                  <span className="ml-2 text-gray-400">
                    ({cmd.alias.join(", ")})
                  </span>
                )}
              </div>
              <div className="text-gray-400">— {cmd.description}</div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
