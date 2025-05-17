"use client";

import React from "react";

type TextVariant =
  | "title"
  | "label"
  | "value"
  | "warning"
  | "status"
  | "terminal"
  | "command"
  | "section";

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  className?: string;
  blink?: boolean;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = "value",
  className = "",
  blink = false,
}) => {
  const baseClasses = "font-mono";

  const variantClasses = {
    title: "text-primary font-bold text-2xl",
    section: "text-primary border-b border-primary pb-1 text-base mb-2.5",
    label: "text-gray-400 text-sm",
    value: "text-secondary text-sm",
    warning: "text-primary text-sm",
    status: "text-secondary text-sm",
    terminal: "text-secondary text-xs leading-tight",
    command: "text-secondary",
  };

  const blinkClass = blink ? "animate-blink" : "";

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${blinkClass} ${className}`}
    >
      {children}
    </span>
  );
};

export default Text;
