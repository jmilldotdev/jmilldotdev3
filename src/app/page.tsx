"use client";

import { useState, useRef } from "react";
import SphereAnimation, {
  SphereAnimationRef,
} from "@/components/SphereAnimation";
import VectorDesktop from "@/components/VectorDesktop";
import Button from "@/components/ui/Button";

export default function Home() {
  const [buttonClicked, setButtonClicked] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const sphereRef = useRef<SphereAnimationRef>(null);

  const handleEnterClick = () => {
    setButtonClicked(true);
    sphereRef.current?.triggerShatter();
    // Show desktop immediately when shatter starts
    setTimeout(() => {
      setShowDesktop(true);
    }, 1500);
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 relative">
        <SphereAnimation
          ref={sphereRef}
          className="w-full h-full"
          onShatter={() => {
            // Optional: do something after shatter starts
          }}
        />
      </div>

      <div className="flex items-center justify-center pb-8 relative z-30">
        <Button
          variant="primary"
          onClick={handleEnterClick}
          className={`transition-opacity duration-1000 ${
            buttonClicked ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          Enter
        </Button>
      </div>

      {showDesktop && <VectorDesktop isVisible={showDesktop} />}
    </div>
  );
}
