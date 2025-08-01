"use client";

interface AchievementsIconProps {
  className?: string;
}

export const AchievementsIcon: React.FC<AchievementsIconProps> = ({ className = "" }) => {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Trophy base */}
      <rect x="18" y="34" width="12" height="8" />
      <rect x="16" y="32" width="16" height="4" />
      
      {/* Trophy cup */}
      <path d="M12 24c0 6 4 10 12 10s12-4 12-10V12H12v12z" />
      
      {/* Trophy handles */}
      <path d="M8 16h4v8c-2 0-4-2-4-4v-4z" />
      <path d="M36 16h4v4c0 2-2 4-4 4v-8z" />
      
      {/* Achievement stars */}
      <g opacity="0.8">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 24 20;360 24 20"
          dur="8s"
          repeatCount="indefinite"
        />
        <circle cx="20" cy="16" r="1" fill="currentColor" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="28" cy="16" r="1" fill="currentColor" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="24" cy="20" r="1" fill="currentColor" opacity="0.7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* Center emblem */}
      <circle cx="24" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      <path d="M22 20l2 2 4-4" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8" />
    </svg>
  );
};