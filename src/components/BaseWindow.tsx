"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";

interface BaseWindowProps {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number | "auto";
  height: number | "auto";
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onToggleMaximize: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, windowId: string) => void;
  onPositionChange?: (id: string, x: number, y: number, width: number, height: number) => void;
  children: React.ReactNode;
  className?: string;
  titleBarButtons?: React.ReactNode;
  "data-window"?: string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export const BaseWindow: React.FC<BaseWindowProps> = ({
  id,
  title,
  x,
  y,
  width,
  height,
  isMaximized,
  zIndex,
  onClose,
  onToggleMaximize,
  onMouseDown,
  onResizeStart,
  onPositionChange,
  children,
  className = "",
  titleBarButtons,
  minWidth = 300,
  maxWidth,
  minHeight = 200,
  maxHeight,
  ...props
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [computedDimensions, setComputedDimensions] = useState<{width: number; height: number; x: number; y: number} | null>(null);
  // Calculate robust viewport boundaries
  const getViewportBounds = useCallback(() => {
    const container = document.querySelector("main");
    const viewportWidth = container ? container.clientWidth : window.innerWidth;
    const viewportHeight = container ? container.clientHeight : window.innerHeight;
    const actionBarHeight = 60;
    const margin = 10;
    
    return {
      width: viewportWidth,
      height: viewportHeight,
      availableWidth: Math.max(0, viewportWidth - 2 * margin),
      availableHeight: Math.max(0, viewportHeight - actionBarHeight - 2 * margin),
      margin,
      actionBarHeight
    };
  }, []);

  // Calculate optimal dimensions for auto-sizing
  const calculateOptimalDimensions = useCallback(() => {
    const bounds = getViewportBounds();
    
    let finalWidth: number;
    let finalHeight: number;
    
    if (width === "auto") {
      // Progressive sizing based on available space
      let targetRatio: number;
      if (bounds.availableWidth >= 1400) {
        targetRatio = 0.65; // Large screens: don't overwhelm
      } else if (bounds.availableWidth >= 1000) {
        targetRatio = 0.75; // Desktop: use most space
      } else if (bounds.availableWidth >= 600) {
        targetRatio = 0.9;  // Tablet: nearly full width
      } else {
        targetRatio = 0.95; // Mobile: almost full width
      }
      
      finalWidth = Math.min(
        Math.max(minWidth, bounds.availableWidth * targetRatio),
        maxWidth || bounds.availableWidth
      );
    } else {
      finalWidth = typeof width === "number" ? width : minWidth;
    }
    
    if (height === "auto") {
      // Height is more conservative to allow for content scrolling
      let targetRatio: number;
      if (bounds.availableHeight >= 800) {
        targetRatio = 0.75;
      } else if (bounds.availableHeight >= 600) {
        targetRatio = 0.85;
      } else {
        targetRatio = 0.9;
      }
      
      finalHeight = Math.min(
        Math.max(minHeight, bounds.availableHeight * targetRatio),
        maxHeight || bounds.availableHeight
      );
    } else {
      finalHeight = typeof height === "number" ? height : minHeight;
    }
    
    // Ensure window fits in viewport
    finalWidth = Math.min(finalWidth, bounds.availableWidth);
    finalHeight = Math.min(finalHeight, bounds.availableHeight);
    
    // Calculate safe position
    let finalX = x;
    let finalY = y;
    
    // Keep window within bounds
    if (finalX + finalWidth > bounds.width - bounds.margin) {
      finalX = Math.max(bounds.margin, bounds.width - finalWidth - bounds.margin);
    }
    if (finalY + finalHeight > bounds.height - bounds.actionBarHeight - bounds.margin) {
      finalY = Math.max(bounds.margin, bounds.height - finalHeight - bounds.actionBarHeight - bounds.margin);
    }
    
    return { width: finalWidth, height: finalHeight, x: finalX, y: finalY };
  }, [width, height, x, y, minWidth, maxWidth, minHeight, maxHeight, getViewportBounds]);

  const getAutoStyle = () => {
    if (isMaximized) {
      return { zIndex };
    }

    // Use computed dimensions if available, otherwise calculate on the fly
    const dimensions = computedDimensions || calculateOptimalDimensions();

    return {
      left: dimensions.x,
      top: dimensions.y,
      width: dimensions.width,
      height: dimensions.height,
      zIndex,
    };
  };

  // Recalculate dimensions when viewport changes
  const updateDimensions = useCallback(() => {
    if (isMaximized) return;
    
    const newDimensions = calculateOptimalDimensions();
    
    // Only update if dimensions actually changed
    if (!computedDimensions || 
        newDimensions.width !== computedDimensions.width ||
        newDimensions.height !== computedDimensions.height ||
        newDimensions.x !== computedDimensions.x ||
        newDimensions.y !== computedDimensions.y) {
      
      setComputedDimensions(newDimensions);
      
      // Notify parent component of position/size changes
      if (onPositionChange) {
        onPositionChange(id, newDimensions.x, newDimensions.y, newDimensions.width, newDimensions.height);
      }
    }
  }, [isMaximized, calculateOptimalDimensions, computedDimensions, onPositionChange, id]);

  // Initialize dimensions on mount and when auto-sizing props change
  useEffect(() => {
    if (width === "auto" || height === "auto") {
      updateDimensions();
    }
  }, [width, height, x, y, minWidth, maxWidth, minHeight, maxHeight, updateDimensions]);

  // Set up resize observer for viewport changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleResize = () => {
      // Debounce rapid resize events
      const timeoutId = setTimeout(updateDimensions, 16); // ~60fps
      return () => clearTimeout(timeoutId);
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    
    const container = document.querySelector("main");
    if (container) {
      resizeObserver.observe(container);
    }
    
    // Also listen to window resize for keyboard shortcuts that change viewport
    window.addEventListener("resize", handleResize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [updateDimensions]);

  return (
    <div
      ref={windowRef}
      className={`window-container absolute border-2 border-[#00FFFF] bg-black/40 backdrop-blur-sm ${
        isMaximized ? "inset-4" : ""
      } ${className}`}
      key={id}
      {...props}
      style={getAutoStyle()}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between bg-[#00FFFF] bg-opacity-20 px-3 py-2 cursor-move"
        onMouseDown={!isMaximized ? onMouseDown : undefined}
      >
        <span className="text-black font-mono text-sm font-bold">{title}</span>
        <div className="flex gap-2 items-center">
          {titleBarButtons}
          <button
            onClick={onToggleMaximize}
            className="text-black hover:bg-black hover:text-[#00FFFF] w-6 h-6 border border-black text-xs font-mono transition-colors"
          >
            {isMaximized ? "□" : "■"}
          </button>
          <button
            onClick={onClose}
            className="text-black hover:bg-black hover:text-[#00FFFF] w-6 h-6 border border-black text-xs font-mono transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-auto" style={{ height: "calc(100% - 40px)" }}>
        {children}
      </div>

      {/* Resize Handle - Bottom Right Corner */}
      {!isMaximized && onResizeStart && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity z-50"
          onMouseDown={(e) => onResizeStart(e, id)}
          style={{
            background: 'linear-gradient(-45deg, transparent 30%, #00FFFF 30%, #00FFFF 35%, transparent 35%, transparent 65%, #00FFFF 65%, #00FFFF 70%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
};
