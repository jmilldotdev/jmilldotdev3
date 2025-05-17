"use client";

import React from "react";
import Hexagon from "./Hexagon";

interface HexagonGridProps {
  count?: number;
  activeIndexes?: number[];
  className?: string;
  randomToggle?: boolean;
}

export const HexagonGrid: React.FC<HexagonGridProps> = ({
  count = 5,
  activeIndexes = [],
  className = "",
  randomToggle = false,
}) => {
  return (
    <div className={`flex justify-between my-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Hexagon
          key={index}
          active={activeIndexes.includes(index)}
          randomToggle={randomToggle}
        />
      ))}
    </div>
  );
};

export default HexagonGrid;
