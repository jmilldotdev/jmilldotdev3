"use client";

import React from "react";
import Text from "./Text";

interface DataItem {
  label: string;
  value: string | number;
  valueVariant?: "value" | "warning" | "status";
}

interface DataGridProps {
  items: DataItem[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export const DataGrid: React.FC<DataGridProps> = ({
  items,
  className = "",
  columns = 2,
}) => {
  return (
    <div
      className={`
        grid gap-2 mb-4
        ${
          columns === 1
            ? "grid-cols-1"
            : columns === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : columns === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
        }
        ${className}
      `}
    >
      {items.map((item, index) => (
        <div key={index} className="flex justify-between">
          <Text variant="label">{item.label}:</Text>
          <Text variant={item.valueVariant || "value"}>{item.value}</Text>
        </div>
      ))}
    </div>
  );
};

export default DataGrid;
