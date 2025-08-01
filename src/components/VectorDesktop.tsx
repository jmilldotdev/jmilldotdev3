"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import * as THREE from "three";
import Image from "next/image";
import WikiWindow from "./WikiWindow";
import { BaseWindow } from "./BaseWindow";
import { AboutIcon } from "./icons/AboutIcon";
import { WikiIcon } from "./icons/WikiIcon";
import { TerminalIcon } from "./icons/TerminalIcon";
import { JazzIcon } from "./icons/JazzIcon";
import { AchievementsIcon } from "./icons/AchievementsIcon";
import {
  createMiniSphereEffect,
  type MiniSphereEffectEmitter,
} from "./ui/MiniSphereEffect";
import { AchievementsWindow } from "./AchievementsWindow";
import { AchievementPopup } from "./AchievementPopup";
import { Achievement } from "@/lib/achievements";

interface Window {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  zIndex: number;
  type?: string;
}

interface DesktopIcon {
  id: string;
  name: string;
  icon: React.ReactNode;
  gridX: number; // Grid column (0-based)
  gridY: number; // Grid row (0-based)
  content: string;
  x?: number; // Absolute position override
  y?: number; // Absolute position override
}

interface VectorDesktopProps {
  isVisible: boolean;
  currentAchievement?: Achievement | null;
  onAchievementClose?: () => void;
}

export const VectorDesktop: React.FC<VectorDesktopProps> = ({
  isVisible,
  currentAchievement,
  onAchievementClose,
}) => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [nextZIndex, setNextZIndex] = useState(20);
  const [dragState, setDragState] = useState<{
    windowId: string | null;
    offsetX: number;
    offsetY: number;
  }>({ windowId: null, offsetX: 0, offsetY: 0 });

  const [resizeState, setResizeState] = useState<{
    windowId: string | null;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  }>({ windowId: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

  const [iconDragState, setIconDragState] = useState<{
    iconId: string | null;
    offsetX: number;
    offsetY: number;
    isDragging: boolean;
    startX: number;
    startY: number;
  }>({
    iconId: null,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  const [iconPositions, setIconPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const miniSphereEffectRef = useRef<MiniSphereEffectEmitter | null>(null);

  // Grid configuration
  const ICON_GRID = {
    startX: 50, // Left margin
    startY: 80, // Top margin
    iconSize: 100, // Icon + label height spacing
    iconWidth: 120, // Icon + label width spacing
    columns: 5, // Max icons per row
  };

  // Helper function to calculate absolute position from grid coordinates or custom position
  const getIconPosition = (icon: DesktopIcon) => {
    const customPos = iconPositions[icon.id];
    if (customPos) {
      return customPos;
    }
    // Use absolute position if set, otherwise calculate from grid
    if (icon.x !== undefined && icon.y !== undefined) {
      return { x: icon.x, y: icon.y };
    }
    return {
      x: ICON_GRID.startX + icon.gridX * ICON_GRID.iconWidth,
      y: ICON_GRID.startY + icon.gridY * ICON_GRID.iconSize,
    };
  };

  const desktopIcons: DesktopIcon[] = useMemo(
    () => [
      {
        id: "about",
        name: "ABOUT.SYS",
        gridX: 0, // Column 0
        gridY: 0, // Row 0
        content:
          "JMILL OPERATING SYSTEM v2.1\n\nCopyright (c) 2024 JMILL Industries\nAll rights reserved.\n\nSYSTEM SPECIFICATIONS:\n- Neural Processing Unit: Active\n- Memory Core: 64GB Quantum RAM\n- Storage: 2TB Holographic Drive\n- Network: Quantum Entanglement Enabled\n\nSTATUS: OPERATIONAL",
        icon: <AboutIcon />,
      },
      {
        id: "jazz",
        name: "JAZZ.ASAR",
        gridX: 0, // Column 1
        gridY: 4, // Row 0
        content: "JAZZ_GIF",
        icon: <JazzIcon />,
      },
      {
        id: "wiki",
        name: "WIKI.MD",
        gridX: 0, // Column 0
        gridY: 1, // Row 1
        content:
          "WIKI SYSTEM ACCESS\n\nBrowse random pages from the knowledge base:\n\n• Projects & Creative Works\n• Concepts & Theories\n• Tools & Resources\n• Bookmarks & References\n\nClick 'RND' to load a random page\nContent rendered with MDX\nInteractive links enabled",
        icon: <WikiIcon />,
      },
      {
        id: "achievements",
        name: "ACHEIVE.M",
        gridX: 0, // Column 1
        gridY: 3, // Row 1
        content: "ACHIEVEMENT_WINDOW",
        icon: <AchievementsIcon />,
      },
      {
        id: "terminal",
        name: "TERM.CMD",
        gridX: 0, // Column 0
        gridY: 2, // Row 2
        content:
          "JMILL OS TERMINAL v2.1\n\njmill@quantum:~$ whoami\njmill\n\njmill@quantum:~$ uname -a\nJMILL OS 2.1.0 quantum-kernel #1 SMP\n\njmill@quantum:~$ ps aux\nPID  TTY  STAT  TIME  COMMAND\n001  tty1 Ssl   0:01  /sbin/init\n002  tty1 R     0:00  neural_proc\n003  tty1 S     0:03  quantum_sim\n004  tty1 R     0:00  vector_ui\n\njmill@quantum:~$ █",
        icon: <TerminalIcon />,
      },
    ],
    []
  );

  const createWindow = useCallback(
    (icon: DesktopIcon) => {
      // Get the actual container dimensions instead of window dimensions
      const container = document.querySelector("main");
      const viewportWidth = container
        ? container.clientWidth
        : window.innerWidth;
      const viewportHeight = container
        ? container.clientHeight
        : window.innerHeight;

      // Action bar height (approximate)
      const actionBarHeight = 60;
      const margin = 10;

      // Calculate responsive dimensions
      let windowWidth: number;
      let windowHeight: number;
      let windowX: number;
      let windowY: number;

      if (viewportWidth <= 768) {
        // Mobile: use reasonable proportions, not full screen
        windowWidth = Math.max(
          300,
          Math.min(viewportWidth - 2 * margin, icon.id === "wiki" ? 600 : 480)
        );
        windowHeight = Math.max(
          250,
          Math.min(
            viewportHeight - actionBarHeight - 2 * margin,
            icon.id === "wiki" ? 600 : 400
          )
        );
        windowX = margin;
        windowY = margin;
      } else if (viewportWidth <= 1024) {
        // Tablet landscape: reasonable proportions
        windowWidth = Math.max(
          400,
          Math.min(viewportWidth - 2 * margin, icon.id === "wiki" ? 680 : 480)
        );
        windowHeight = Math.max(
          300,
          Math.min(
            viewportHeight - actionBarHeight - 2 * margin,
            icon.id === "wiki" ? 620 : 400
          )
        );
        windowX =
          margin +
          Math.random() * Math.max(0, viewportWidth - windowWidth - 2 * margin);
        windowY =
          margin +
          Math.random() *
            Math.max(
              0,
              viewportHeight - windowHeight - actionBarHeight - 2 * margin
            );
      } else {
        // Desktop: ensure windows fit within bounds
        if (icon.id === "achievements") {
          windowWidth = Math.min(viewportWidth - 2 * margin, 900);
          windowHeight = Math.min(
            viewportHeight - actionBarHeight - 2 * margin,
            600
          );
        } else {
          windowWidth = Math.min(
            viewportWidth - 2 * margin,
            icon.id === "wiki" ? 700 : 500
          );
          windowHeight = Math.min(
            viewportHeight - actionBarHeight - 2 * margin,
            icon.id === "wiki" ? 550 : 350
          );
        }
        windowX =
          margin +
          Math.random() * Math.max(0, viewportWidth - windowWidth - 2 * margin);
        windowY =
          margin +
          Math.random() *
            Math.max(
              0,
              viewportHeight - windowHeight - actionBarHeight - 2 * margin
            );
      }

      const newWindow: Window = {
        id: `window-${Date.now()}`,
        title: icon.name,
        content: icon.content,
        x: windowX,
        y: windowY,
        width: windowWidth,
        height: windowHeight,
        isMaximized: false,
        zIndex: nextZIndex,
        type:
          icon.id === "wiki"
            ? "wiki"
            : icon.id === "jazz"
            ? "jazz"
            : icon.id === "achievements"
            ? "achievements"
            : "default",
      };

      setWindows((prev) => [...prev, newWindow]);
      setNextZIndex((prev) => prev + 1);

      // Start animation for the corresponding icon
      if (icon.id === "about") {
        (
          document.getElementById(
            "about-circle-about"
          ) as unknown as SVGAnimateElement
        )?.beginElement();
      } else if (icon.id === "wiki") {
        setTimeout(
          () =>
            (
              document.getElementById(
                "wiki-line3-wiki"
              ) as unknown as SVGAnimateElement
            )?.beginElement(),
          0
        );
        setTimeout(
          () =>
            (
              document.getElementById(
                "wiki-line1-wiki"
              ) as unknown as SVGAnimateElement
            )?.beginElement(),
          500
        );
        setTimeout(
          () =>
            (
              document.getElementById(
                "wiki-line2-wiki"
              ) as unknown as SVGAnimateElement
            )?.beginElement(),
          1000
        );
      } else if (icon.id === "terminal") {
        (
          document.getElementById(
            "terminal-cursor-terminal"
          ) as unknown as SVGAnimateElement
        )?.beginElement();
      } else if (icon.id === "jazz") {
        (
          document.getElementById(
            "jazz-body-jazz"
          ) as unknown as SVGAnimateElement
        )?.beginElement();
      } else if (icon.id === "achievements") {
        // Achievements icon animation can be added here if needed
      }
    },
    [nextZIndex]
  );

  const closeWindow = useCallback(
    (windowId: string) => {
      const windowToClose = windows.find((w) => w.id === windowId);
      setWindows((prev) => prev.filter((w) => w.id !== windowId));

      // Stop animation for the corresponding icon if no more windows of this type are open
      if (windowToClose) {
        const remainingWindowsOfSameType = windows.filter(
          (w) => w.id !== windowId && w.title === windowToClose.title
        );
        if (remainingWindowsOfSameType.length === 0) {
          // Find the icon by matching window title to icon name
          const correspondingIcon = desktopIcons.find(
            (icon) => icon.name === windowToClose.title
          );
          if (correspondingIcon) {
            if (correspondingIcon.id === "about") {
              (
                document.getElementById(
                  "about-circle-about"
                ) as unknown as SVGAnimateElement
              )?.endElement();
            } else if (correspondingIcon.id === "wiki") {
              (
                document.getElementById(
                  "wiki-line1-wiki"
                ) as unknown as SVGAnimateElement
              )?.endElement();
              (
                document.getElementById(
                  "wiki-line2-wiki"
                ) as unknown as SVGAnimateElement
              )?.endElement();
              (
                document.getElementById(
                  "wiki-line3-wiki"
                ) as unknown as SVGAnimateElement
              )?.endElement();
            } else if (correspondingIcon.id === "terminal") {
              (
                document.getElementById(
                  "terminal-cursor-terminal"
                ) as unknown as SVGAnimateElement
              )?.endElement();
            }
          }
        }
      }
    },
    [windows, desktopIcons]
  );

  const toggleMaximize = (windowId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
  };

  const bringToFront = (windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, zIndex: nextZIndex } : w))
    );
    setNextZIndex((prev) => prev + 1);
  };

  const openAchievementsWindow = () => {
    // Find achievements icon
    const achievementsIcon = desktopIcons.find(
      (icon) => icon.id === "achievements"
    );
    if (achievementsIcon) {
      createWindow(achievementsIcon);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, windowId: string) => {
    e.preventDefault();
    const window = windows.find((w) => w.id === windowId);
    const container = document.querySelector("main");
    const containerRect = container?.getBoundingClientRect();

    if (window) {
      // Adjust mouse coordinates relative to container
      const adjustedX = containerRect
        ? e.clientX - containerRect.left
        : e.clientX;
      const adjustedY = containerRect
        ? e.clientY - containerRect.top
        : e.clientY;

      setDragState({
        windowId,
        offsetX: adjustedX - window.x,
        offsetY: adjustedY - window.y,
      });
    }
    bringToFront(windowId);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const margin = 10;
      const container = document.querySelector("main");
      const containerWidth = container
        ? container.clientWidth
        : window.innerWidth;
      const containerHeight = container
        ? container.clientHeight
        : window.innerHeight;
      const containerRect = container?.getBoundingClientRect();

      // Adjust mouse coordinates relative to container
      const adjustedX = containerRect
        ? e.clientX - containerRect.left
        : e.clientX;
      const adjustedY = containerRect
        ? e.clientY - containerRect.top
        : e.clientY;

      if (dragState.windowId) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === dragState.windowId
              ? {
                  ...w,
                  x: Math.max(
                    margin,
                    Math.min(
                      containerWidth - w.width - margin,
                      adjustedX - dragState.offsetX
                    )
                  ),
                  y: Math.max(
                    margin,
                    Math.min(
                      containerHeight - w.height - margin,
                      adjustedY - dragState.offsetY
                    )
                  ),
                }
              : w
          )
        );
      } else if (resizeState.windowId) {
        const deltaX = adjustedX - resizeState.startX;
        const deltaY = adjustedY - resizeState.startY;

        setWindows((prev) =>
          prev.map((w) =>
            w.id === resizeState.windowId
              ? {
                  ...w,
                  width: Math.max(
                    300,
                    Math.min(
                      containerWidth - w.x - margin,
                      resizeState.startWidth + deltaX
                    )
                  ),
                  height: Math.max(
                    200,
                    Math.min(
                      containerHeight - w.y - margin,
                      resizeState.startHeight + deltaY
                    )
                  ),
                }
              : w
          )
        );
      } else if (iconDragState.iconId) {
        const deltaX = adjustedX - iconDragState.startX;
        const deltaY = adjustedY - iconDragState.startY;
        const dragThreshold = 5; // pixels

        // Check if we've moved beyond the drag threshold
        if (
          !iconDragState.isDragging &&
          (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)
        ) {
          setIconDragState((prev) => ({ ...prev, isDragging: true }));
        }

        // Only update position if we're actually dragging
        if (iconDragState.isDragging) {
          const margin = 20;
          const newX = Math.max(
            margin,
            Math.min(
              containerWidth - 120 - margin, // Account for icon width
              adjustedX - iconDragState.offsetX
            )
          );
          const newY = Math.max(
            margin,
            Math.min(
              containerHeight - 100 - margin, // Account for icon height
              adjustedY - iconDragState.offsetY
            )
          );

          setIconPositions((prev) => ({
            ...prev,
            [iconDragState.iconId!]: { x: newX, y: newY },
          }));
        }
      }
    },
    [
      dragState.windowId,
      dragState.offsetX,
      dragState.offsetY,
      resizeState.windowId,
      resizeState.startX,
      resizeState.startY,
      resizeState.startWidth,
      resizeState.startHeight,
      iconDragState.iconId,
      iconDragState.offsetX,
      iconDragState.offsetY,
      iconDragState.isDragging,
      iconDragState.startX,
      iconDragState.startY,
    ]
  );

  const handleMouseUp = useCallback(() => {
    // Handle icon click vs drag
    if (iconDragState.iconId && !iconDragState.isDragging) {
      // This was a click, not a drag - open the window
      const icon = desktopIcons.find((i) => i.id === iconDragState.iconId);
      if (icon) {
        createWindow(icon);
      }
    }

    setDragState({ windowId: null, offsetX: 0, offsetY: 0 });
    setResizeState({
      windowId: null,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
    });
    setIconDragState({
      iconId: null,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      startX: 0,
      startY: 0,
    });
  }, [
    iconDragState.iconId,
    iconDragState.isDragging,
    desktopIcons,
    createWindow,
  ]);

  const handleIconMouseDown = (e: React.MouseEvent, iconId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const container = document.querySelector("main");
    const containerRect = container?.getBoundingClientRect();
    const iconPosition = getIconPosition(
      desktopIcons.find((i) => i.id === iconId)!
    );

    const adjustedX = containerRect
      ? e.clientX - containerRect.left
      : e.clientX;
    const adjustedY = containerRect ? e.clientY - containerRect.top : e.clientY;

    // Set initial drag state but don't start dragging until mouse moves beyond threshold
    setIconDragState({
      iconId,
      offsetX: adjustedX - iconPosition.x,
      offsetY: adjustedY - iconPosition.y,
      isDragging: false,
      startX: adjustedX,
      startY: adjustedY,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, windowId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const window = windows.find((w) => w.id === windowId);
    const container = document.querySelector("main");
    const containerRect = container?.getBoundingClientRect();

    if (window) {
      const adjustedX = containerRect
        ? e.clientX - containerRect.left
        : e.clientX;
      const adjustedY = containerRect
        ? e.clientY - containerRect.top
        : e.clientY;

      setResizeState({
        windowId,
        startX: adjustedX,
        startY: adjustedY,
        startWidth: window.width,
        startHeight: window.height,
      });
    }
    bringToFront(windowId);
  };

  useEffect(() => {
    if (dragState.windowId || resizeState.windowId || iconDragState.iconId) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState, resizeState, iconDragState, handleMouseMove, handleMouseUp]);

  // Initialize THREE.js scene for sphere effects
  useEffect(() => {
    if (!isVisible) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Add some ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // Get container dimensions
      const container = document.querySelector(
        "[data-desktop-container]"
      ) as HTMLElement;
      if (!container) {
        console.error("Desktop container not found");
        return;
      }

      const width = container.clientWidth;
      const height = container.clientHeight;

      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.top = "0";
      renderer.domElement.style.left = "0";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.zIndex = "50"; // Higher z-index to be visible
      renderer.domElement.style.pointerEvents = "none";

      // Append to the desktop container
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      canvasRef.current = renderer.domElement;

      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (cameraRef.current && rendererRef.current) {
          const container = document.querySelector(
            "[data-desktop-container]"
          ) as HTMLElement;
          const width = container?.clientWidth || window.innerWidth;
          const height = container?.clientHeight || window.innerHeight;

          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      };

      window.addEventListener("resize", handleResize);

      // Create mini sphere effect emitter here, after scene is ready
      const emitter = createMiniSphereEffect(scene);
      miniSphereEffectRef.current = emitter;
    }, 100); // 100ms delay

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", () => {});
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
      if (miniSphereEffectRef.current) {
        miniSphereEffectRef.current.cleanup();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [isVisible]);

  // Handle desktop mouse up for mini sphere effect
  const handleDesktopMouseUp = useCallback(
    (e: React.MouseEvent) => {
      // Only trigger on direct desktop clicks, not on icons or windows
      if (
        (e.target as HTMLElement).closest(".cursor-pointer") ||
        (e.target as HTMLElement).closest("[data-window]") ||
        (e.target as HTMLElement).closest(".window-container") ||
        (e.target as HTMLElement).closest("input") ||
        (e.target as HTMLElement).closest("button") ||
        (e.target as HTMLElement).closest("a")
      ) {
        return;
      }

      // Also check if we're currently dragging or resizing a window or icon
      if (dragState.windowId || resizeState.windowId || iconDragState.iconId) {
        return;
      }

      if (!miniSphereEffectRef.current || !cameraRef.current) {
        return;
      }

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

      // Convert mouse coordinates to normalized device coordinates (-1 to +1)
      const mouse = new THREE.Vector2();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Use raycaster to get proper world position
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      // Project onto a plane at z=0 (same depth as original sphere)
      const intersectPoint = raycaster.ray.origin
        .clone()
        .add(
          raycaster.ray.direction
            .clone()
            .multiplyScalar(-raycaster.ray.origin.z / raycaster.ray.direction.z)
        );

      miniSphereEffectRef.current.trigger({
        position: intersectPoint,
        scale: 0.15,
      });
    },
    [dragState.windowId, resizeState.windowId, iconDragState.iconId]
  );

  // Handle escape key to close active window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && windows.length > 0) {
        // Find the window with the highest z-index (active window)
        const activeWindow = windows.reduce((prev, current) =>
          current.zIndex > prev.zIndex ? current : prev
        );
        closeWindow(activeWindow.id);
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isVisible, windows, closeWindow]);

  if (!isVisible) return null;

  return (
    <div
      className={`absolute inset-0 bg-black transition-opacity duration-2000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ zIndex: 15 }}
      onMouseUp={handleDesktopMouseUp}
      data-desktop-container
    >
      {/* Subtle CRT Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full opacity-5 bg-gradient-to-b from-transparent via-[#00FFFF] to-transparent bg-[length:100%_8px]"></div>
      </div>

      {/* Desktop Icons */}
      {desktopIcons.map((icon) => {
        const position = getIconPosition(icon);
        const isDragging =
          iconDragState.iconId === icon.id && iconDragState.isDragging;
        return (
          <div
            key={icon.id}
            className={`absolute flex flex-col items-center group z-20 ${
              isDragging ? "cursor-grabbing select-none" : "cursor-pointer"
            }`}
            style={{
              left: position.x,
              top: position.y,
              userSelect: "none",
              transition: isDragging ? "none" : "all 0.2s ease-out",
            }}
            onMouseDown={(e) => {
              if (e.button === 0) {
                // Left mouse button only
                handleIconMouseDown(e, icon.id);
              }
            }}
            onMouseEnter={() => {
              const isWindowOpen = windows.some((w) => w.title === icon.name);
              if (!isWindowOpen) {
                if (icon.id === "about") {
                  (
                    document.getElementById(
                      "about-circle-about"
                    ) as unknown as SVGAnimateElement
                  )?.beginElement();
                } else if (icon.id === "wiki") {
                  setTimeout(
                    () =>
                      (
                        document.getElementById(
                          "wiki-line3-wiki"
                        ) as unknown as SVGAnimateElement
                      )?.beginElement(),
                    0
                  );
                  setTimeout(
                    () =>
                      (
                        document.getElementById(
                          "wiki-line1-wiki"
                        ) as unknown as SVGAnimateElement
                      )?.beginElement(),
                    500
                  );
                  setTimeout(
                    () =>
                      (
                        document.getElementById(
                          "wiki-line2-wiki"
                        ) as unknown as SVGAnimateElement
                      )?.beginElement(),
                    1000
                  );
                } else if (icon.id === "terminal") {
                  (
                    document.getElementById(
                      "terminal-cursor-terminal"
                    ) as unknown as SVGAnimateElement
                  )?.beginElement();
                } else if (icon.id === "jazz") {
                  (
                    document.getElementById(
                      "jazz-body-jazz"
                    ) as unknown as SVGAnimateElement
                  )?.beginElement();
                }
              }
            }}
            onMouseLeave={() => {
              const isWindowOpen = windows.some((w) => w.title === icon.name);
              if (!isWindowOpen) {
                if (icon.id === "about") {
                  (
                    document.getElementById(
                      "about-circle-about"
                    ) as unknown as SVGAnimateElement
                  )?.endElement();
                } else if (icon.id === "wiki") {
                  (
                    document.getElementById(
                      "wiki-line1-wiki"
                    ) as unknown as SVGAnimateElement
                  )?.endElement();
                  (
                    document.getElementById(
                      "wiki-line2-wiki"
                    ) as unknown as SVGAnimateElement
                  )?.endElement();
                  (
                    document.getElementById(
                      "wiki-line3-wiki"
                    ) as unknown as SVGAnimateElement
                  )?.endElement();
                } else if (icon.id === "terminal") {
                  (
                    document.getElementById(
                      "terminal-cursor-terminal"
                    ) as unknown as SVGAnimateElement
                  )?.endElement();
                } else if (icon.id === "jazz") {
                  (
                    document.getElementById(
                      "jazz-body-jazz"
                    ) as unknown as SVGAnimateElement
                  )?.endElement();
                }
              }
            }}
          >
            <div
              className={`text-[#00FFFF] p-3 border border-[#00FFFF] transition-all flex items-center justify-center w-16 h-16 ${
                windows.some((w) => w.title === icon.name)
                  ? "border-opacity-100 shadow-[0_0_10px_#00FFFF]"
                  : "border-opacity-50 group-hover:border-opacity-100 group-hover:shadow-[0_0_10px_#00FFFF]"
              }`}
            >
              {icon.icon}
            </div>
            <span className="text-[#00FFFF] text-xs mt-1 text-center font-mono">
              {icon.name}
            </span>
          </div>
        );
      })}

      {/* Windows */}
      {windows.map((window) =>
        window.type === "jazz" ? (
          <BaseWindow
            key={window.id}
            id={window.id}
            title={"🚗🎷"}
            x={window.x}
            y={window.y}
            width={window.width}
            height={window.height}
            isMaximized={window.isMaximized}
            zIndex={window.zIndex}
            onClose={() => closeWindow(window.id)}
            onToggleMaximize={() => toggleMaximize(window.id)}
            onMouseDown={(e) => handleMouseDown(e, window.id)}
            onResizeStart={handleResizeStart}
          >
            <div
              className="p-4 overflow-auto h-full flex items-center justify-center cursor-pointer"
              onClick={() =>
                globalThis.open("https://selfdrivingjazz.com", "_blank")
              }
            >
              <Image
                src="/IO5M.gif"
                alt="Jazz"
                width={400}
                height={300}
                className="max-w-full max-h-full object-contain"
                unoptimized
              />
            </div>
          </BaseWindow>
        ) : window.type === "wiki" ? (
          <WikiWindow
            key={window.id}
            onClose={() => closeWindow(window.id)}
            isMaximized={window.isMaximized}
            onToggleMaximize={() => toggleMaximize(window.id)}
            x={window.x}
            y={window.y}
            width={window.width}
            height={window.height}
            zIndex={window.zIndex}
            onMouseDown={(e) => handleMouseDown(e, window.id)}
            onResizeStart={handleResizeStart}
          />
        ) : window.type === "achievements" ? (
          <AchievementsWindow
            key={window.id}
            id={window.id}
            title={window.title}
            onClose={() => closeWindow(window.id)}
            isMaximized={window.isMaximized}
            onToggleMaximize={() => toggleMaximize(window.id)}
            x={window.x}
            y={window.y}
            width={window.width}
            height={window.height}
            zIndex={window.zIndex}
            onMouseDown={(e) => handleMouseDown(e, window.id)}
            onResizeStart={handleResizeStart}
          />
        ) : (
          <BaseWindow
            key={window.id}
            id={window.id}
            title={window.title}
            x={window.x}
            y={window.y}
            width={window.width}
            height={window.height}
            isMaximized={window.isMaximized}
            zIndex={window.zIndex}
            onClose={() => closeWindow(window.id)}
            onToggleMaximize={() => toggleMaximize(window.id)}
            onMouseDown={(e) => handleMouseDown(e, window.id)}
            onResizeStart={handleResizeStart}
            data-window="true"
          >
            <div className="p-4 overflow-auto h-full">
              <pre className="text-[#00FFFF] font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {window.content}
              </pre>
            </div>
          </BaseWindow>
        )
      )}

      {/* Achievement Popup within desktop */}
      <AchievementPopup
        achievement={currentAchievement || null}
        onClose={onAchievementClose || (() => {})}
        onOpenAchievements={openAchievementsWindow}
      />
    </div>
  );
};

export default VectorDesktop;
