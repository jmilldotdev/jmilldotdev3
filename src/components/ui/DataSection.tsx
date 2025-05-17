"use client";

import React from "react";
import Text from "./Text";

interface DataSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const DataSection: React.FC<DataSectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <section className={`mb-5 ${className}`}>
      <Text variant="section">{title}</Text>
      {children}
    </section>
  );
};

export default DataSection;
