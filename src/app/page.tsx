"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SphereAnimation, {
  SphereAnimationRef,
} from "@/components/SphereAnimation";
import VectorDesktop from "@/components/VectorDesktop";
import Button from "@/components/ui/Button";
import { AchievementsManager, unlockAchievement, type Achievement } from "@/lib/achievements";
import { useDesktop } from "@/contexts/DesktopContext";

export default function Home() {
  const [buttonClicked, setButtonClicked] = useState(false);
  const { showDesktop, setShowDesktop } = useDesktop();
  const [currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);
  const [sphereResetKey, setSphereResetKey] = useState(0);
  const [isShortViewport, setIsShortViewport] = useState(false);
  const sphereRef = useRef<SphereAnimationRef>(null);
  const achievementsManager = useRef<AchievementsManager | null>(null);

  useEffect(() => {
    achievementsManager.current = AchievementsManager.getInstance();

    // Listen for achievement unlocks
    const unsubscribe = achievementsManager.current.onAchievementUnlocked(
      (achievement) => {
        setCurrentAchievement(achievement);
      }
    );

    return unsubscribe;
  }, []);

  // Monitor viewport height to adjust button layout
  useEffect(() => {
    const checkViewportHeight = () => {
      setIsShortViewport(window.innerHeight < 900);
    };

    checkViewportHeight();
    window.addEventListener("resize", checkViewportHeight);

    return () => window.removeEventListener("resize", checkViewportHeight);
  }, []);

  // Reset state when desktop is hidden (logout)
  useEffect(() => {
    if (!showDesktop) {
      setButtonClicked(false);
      setSphereResetKey((prev) => prev + 1);
    }
  }, [showDesktop]);

  const handleLoginClick = () => {
    setButtonClicked(true);
    sphereRef.current?.triggerShatter();

    // Show desktop during shatter animation, then unlock achievement
    setTimeout(() => {
      setShowDesktop(true);
      // Unlock first login achievement after desktop is shown
      setTimeout(() => {
        unlockAchievement("first-login");
      }, 100);
    }, 1500);
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <SphereAnimation
          key={sphereResetKey}
          ref={sphereRef}
          className="w-full h-full"
          onShatter={() => {
            // Optional: do something after shatter starts
          }}
        />
      </div>

      <div className={`absolute bottom-8 left-0 right-0 flex ${isShortViewport ? 'flex-row' : 'flex-col'} items-center justify-center gap-4 z-30 transition-opacity duration-500 ${
        showDesktop ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}>
        <Button
          variant="secondary"
          onClick={handleLoginClick}
          className={`!border-[#00FFFF] !text-[#00FFFF] transition-opacity duration-500 ${
            buttonClicked ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          Login
        </Button>
        <Link href="/about">
          <Button
            variant="secondary"
            className={`transition-opacity duration-300 ${
              buttonClicked
                ? "opacity-0 pointer-events-none"
                : "opacity-60 hover:!opacity-100"
            }`}
          >
            Static
          </Button>
        </Link>
      </div>

      {showDesktop && (
        <VectorDesktop
          isVisible={showDesktop}
          currentAchievement={currentAchievement}
          onAchievementClose={() => setCurrentAchievement(null)}
        />
      )}
    </div>
  );
}
