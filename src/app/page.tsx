"use client";

import SphereAnimation from "@/components/SphereAnimation";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex-1 w-full">
        <SphereAnimation className="w-full h-full" />
      </div>
      <div className="mb-8 mt-4">
        <Button variant="primary" onClick={() => console.log("Login clicked")}>
          Enter
        </Button>
      </div>
    </div>
  );
}
