import React from "react";

interface ProjectsIconProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
}

export const ProjectsIcon: React.FC<ProjectsIconProps> = ({
  className = "",
  width = 48,
  height = 48,
  color = "#00FFFF",
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
      {/* Album/Record shape */}
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      
      {/* Inner circle (record label) */}
      <circle
        cx="24"
        cy="24"
        r="8"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Center hole */}
      <circle
        cx="24"
        cy="24"
        r="2"
        fill={color}
      />
      
      {/* Record grooves */}
      <circle
        cx="24"
        cy="24"
        r="13"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.5"
        fill="none"
      />
      
      {/* Play button overlay */}
      <path
        d="M 20 18 L 20 30 L 30 24 Z"
        fill={color}
        opacity="0.8"
      />
    </svg>
  );
};