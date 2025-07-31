"use client";

import { useState, useRef } from "react";
import SphereAnimation, {
  SphereAnimationRef,
} from "@/components/SphereAnimation";
import Button from "@/components/ui/Button";

export default function Home() {
  const [showMessage, setShowMessage] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const sphereRef = useRef<SphereAnimationRef>(null);

  const handleEnterClick = () => {
    setButtonClicked(true);
    setShowMessage(true);
    sphereRef.current?.triggerShatter();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex-1 w-full">
        <SphereAnimation
          ref={sphereRef}
          className="w-full h-full"
          onShatter={() => {
            // Optional: do something after shatter starts
          }}
        />
      </div>

      <div className="h-12 flex items-center justify-center">
        {!buttonClicked && (
          <Button variant="primary" onClick={handleEnterClick}>
            Enter
          </Button>
        )}
      </div>
    </div>
  );
}
