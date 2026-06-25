import React from "react";

interface SettingsIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const SettingsIcon: React.FC<SettingsIconProps> = ({
  className = "",
  width = 48,
  height = 48,
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="24" cy="24" r="7" fill="none" />
        <path d="M24 10v4" />
        <path d="M24 34v4" />
        <path d="M14.2 14.2l2.8 2.8" />
        <path d="M31 31l2.8 2.8" />
        <path d="M10 24h4" />
        <path d="M34 24h4" />
        <path d="M14.2 33.8l2.8-2.8" />
        <path d="M31 17l2.8-2.8" />
      </g>
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 3"
        opacity="0.8"
        fill="none"
      />
    </svg>
  );
};
