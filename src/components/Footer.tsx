"use client";

import { useState } from "react";
import CommandLine from "@/components/CommandLine";

export default function Footer() {
  const [isInvalid, setIsInvalid] = useState(false);

  return (
    <footer
      className={`w-full p-2.5 h-20 ${isInvalid ? "animate-flash-red" : ""}`}
    >
      <CommandLine
        onInvalidCommand={() => {
          setIsInvalid(true);
          setTimeout(() => setIsInvalid(false), 500);
        }}
      />
    </footer>
  );
}
