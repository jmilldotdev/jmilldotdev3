"use client";

import SphereAnimation from "@/components/SphereAnimation";

export default function Home() {
  return (
    <main className="flex-grow h-full flex flex-col items-center justify-center">
      <div className="w-full h-full">
        <SphereAnimation className="h-[80vh]" />
      </div>
    </main>
  );
}
