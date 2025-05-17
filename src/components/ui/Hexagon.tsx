"use client";

import React, { useState, useEffect } from "react";

interface HexagonProps {
  active?: boolean;
  toggleable?: boolean;
  onClick?: () => void;
  className?: string;
  randomToggle?: boolean;
}

export const Hexagon: React.FC<HexagonProps> = ({
  active: initialActive = false,
  toggleable = false,
  onClick,
  className = "",
  randomToggle = false,
}) => {
  const [active, setActive] = useState(initialActive);

  const handleClick = () => {
    if (toggleable) {
      setActive(!active);
      if (onClick) onClick();
    } else if (onClick) {
      onClick();
    }
  };

  useEffect(() => {
    if (randomToggle) {
      const interval = setInterval(() => {
        setActive((prev) => (Math.random() > 0.5 ? !prev : prev));
      }, 2000 + Math.random() * 2000);

      return () => clearInterval(interval);
    }
  }, [randomToggle]);

  return (
    <div
      className={`
        w-8 h-9 relative
        clip-path-hexagon
        border border-secondary
        transition-all duration-300
        ${active ? "bg-secondary bg-opacity-30" : "bg-transparent"}
        ${toggleable ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={handleClick}
    />
  );
};

export default Hexagon;
