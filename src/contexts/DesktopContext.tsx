"use client";

import React, { createContext, useContext, useState } from "react";

interface DesktopContextType {
  showDesktop: boolean;
  setShowDesktop: (show: boolean) => void;
}

const DesktopContext = createContext<DesktopContextType | undefined>(undefined);

export function DesktopProvider({ children }: { children: React.ReactNode }) {
  const [showDesktop, setShowDesktop] = useState(false);

  return (
    <DesktopContext.Provider value={{ showDesktop, setShowDesktop }}>
      {children}
    </DesktopContext.Provider>
  );
}

export function useDesktop() {
  const context = useContext(DesktopContext);
  if (context === undefined) {
    throw new Error("useDesktop must be used within a DesktopProvider");
  }
  return context;
}
