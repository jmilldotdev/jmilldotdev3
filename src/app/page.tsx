"use client";

import { useState } from "react";
import SphereAnimation from "@/components/SphereAnimation";
import Button from "@/components/ui/Button";

export default function Home() {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex-1 w-full">
        <SphereAnimation className="w-full h-full" />
      </div>
      <div className="mb-8 mt-4 flex flex-col items-center gap-4">
        {showMessage && (
          <p className="text-center text-gray-300">
            OS Under Construction. Type &apos;help&apos; in the command line to
            show available commands.
          </p>
        )}
        <Button variant="primary" onClick={() => setShowMessage(true)}>
          Enter
        </Button>
      </div>
    </div>
  );
}
