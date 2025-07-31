"use client";

import { useState } from "react";
import CommandLine from "@/components/CommandLine";

export default function Footer() {
  const [isInvalid, setIsInvalid] = useState(false);

  return (
    <footer
      className={`w-full p-2.5 h-20 border border-gray-700 bg-gray-900/70 flex justify-between items-center transition-colors duration-200 ${
        isInvalid ? "animate-flash-red" : ""
      }`}
    >
      <CommandLine
        onInvalidCommand={() => {
          setIsInvalid(true);
          setTimeout(() => setIsInvalid(false), 800);
        }}
      />
    </footer>
  );
}
