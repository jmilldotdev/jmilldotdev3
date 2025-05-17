"use client";

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "warning";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}) => {
  const baseClasses =
    "font-mono px-4 py-2 border transition-all duration-200 focus:outline-none";

  const variantClasses = {
    primary: "border-primary text-primary hover:bg-primary hover:bg-opacity-20",
    secondary:
      "border-secondary text-secondary hover:bg-secondary hover:bg-opacity-20",
    warning: "border-red-500 text-red-500 hover:bg-red-500 hover:bg-opacity-20",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
