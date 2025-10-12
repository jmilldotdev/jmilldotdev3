"use client";

import { useState, useEffect, useCallback } from "react";
import { Achievement } from "@/lib/achievements";

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
  onOpenAchievements?: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  achievement,
  onClose,
  onOpenAchievements,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (achievement) {
      // Small delay for smooth entrance after desktop icons appear
      const showTimer = setTimeout(() => {
        setIsVisible(true);
        setIsClosing(false);
      }, 800); // Delay to let desktop settle

      // Auto-close after 5 seconds
      const closeTimer = setTimeout(() => {
        handleClose();
      }, 6000); // 800ms delay + 5000ms display

      return () => {
        clearTimeout(showTimer);
        clearTimeout(closeTimer);
      };
    } else {
      setIsVisible(false);
    }
  }, [achievement, handleClose]);

  const handleClick = () => {
    handleClose();
    if (onOpenAchievements) {
      onOpenAchievements();
    }
  };

  if (!achievement || !isVisible) return null;

  const IconComponent = achievement.icon;

  return (
    <div
      className={`absolute top-4 right-4 z-50 bg-black border-2 border-[#00FFFF] p-4 min-w-[280px] max-w-[320px] transition-all duration-500 ease-out transform cursor-pointer hover:border-[#00FFFF]/80 ${
        !isVisible 
          ? 'translate-x-full opacity-0 scale-95' 
          : isClosing 
            ? 'translate-x-full opacity-0 scale-95' 
            : 'translate-x-0 opacity-100 scale-100'
      }`}
      style={{
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
      }}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[#00FFFF] text-sm font-mono font-bold">
          ACHIEVEMENT UNLOCKED
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="text-[#00FFFF] hover:text-white transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Achievement Content */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 border border-[#00FFFF] flex items-center justify-center bg-black/50">
          <IconComponent className="w-8 h-8 text-[#00FFFF]" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-[#00FFFF] font-mono font-bold text-lg mb-1">
            {achievement.title}
          </h3>
          <p className="text-[#00FFFF]/80 font-mono text-sm leading-relaxed">
            {achievement.description}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-3 pt-3 border-t border-[#00FFFF]/30">
        <div className="text-[#00FFFF]/60 font-mono text-xs">
          {achievement.unlockedAt && 
            `Unlocked: ${achievement.unlockedAt.toLocaleDateString()} ${achievement.unlockedAt.toLocaleTimeString()}`
          }
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 border-2 border-[#00FFFF] opacity-20 animate-pulse pointer-events-none" />
    </div>
  );
};