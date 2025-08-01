"use client";

interface AchievementsIconProps {
  className?: string;
}

export const AchievementsIcon: React.FC<AchievementsIconProps> = ({ className = "" }) => {
  return (
    <svg viewBox="0 0 24 24" className={`w-8 h-8 ${className}`} fill="none" stroke="currentColor" strokeWidth="1">
      {/* Trophy base - moved up and centered */}
      <rect x="9" y="15" width="6" height="3" />
      <rect x="8" y="14" width="8" height="2" />
      
      {/* Trophy cup - moved up and centered */}
      <path d="M6 10c0 3 2 5 6 5s6-2 6-5V4H6v6z" />
      
      {/* Trophy handles - moved up */}
      <path d="M4 6h2v4c-1 0-2-1-2-2v-2z" />
      <path d="M18 6h2v2c0 1-1 2-2 2v-4z" />
      
      {/* Achievement stars - moved up */}
      <g opacity="0.8">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 12 8;360 12 8"
          dur="8s"
          repeatCount="indefinite"
        />
        <circle cx="10" cy="6" r="0.5" fill="currentColor" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="14" cy="6" r="0.5" fill="currentColor" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="12" cy="8" r="0.5" fill="currentColor" opacity="0.7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* Center emblem - moved up */}
      <circle cx="12" cy="8" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.8" />
      <path d="M11 8l1 1 2-2" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.8" />
    </svg>
  );
};