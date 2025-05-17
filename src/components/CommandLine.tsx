"use client";

import { useRouter } from "next/navigation";
import { useState, KeyboardEvent } from "react";
import pages from "@/config/pages.json";

type Command = {
  name: string;
  alias?: string[];
  description: string;
  execute: () => void;
};

export default function CommandLine() {
  const router = useRouter();
  const [input, setInput] = useState("");

  const commands: Command[] = [
    {
      name: "random",
      alias: ["r"],
      description: "Navigate to a random page",
      execute: () => {
        const randomPage = pages[Math.floor(Math.random() * pages.length)];
        router.push(randomPage);
      },
    },
  ];

  const handleCommand = (command: string) => {
    const cmd = commands.find(
      (c) => c.name === command.toLowerCase() || c.alias?.includes(command)
    );
    if (cmd) {
      console.log(`Executing command: ${cmd.name}`);
      cmd.execute();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    console.log(`Key pressed: ${e.key}`);
    if (e.key === "Enter") {
      console.log(`Input: ${input}`);
      handleCommand(input);
      setInput("");
    }
  };

  return (
    <div className="command-line">
      <span className="command-prompt">CMD&gt;</span>
      <input
        type="text"
        className="command-input"
        placeholder="ENTER COMMAND"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
