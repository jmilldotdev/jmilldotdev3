"use client";

import { useState, useEffect, useCallback } from "react";
import WikiWindow from "./WikiWindow";
import { BaseWindow } from "./BaseWindow";

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
  x: number;
  y: number;
  content: string;
}

interface VectorDesktopProps {
  isVisible: boolean;
}


export const VectorDesktop: React.FC<VectorDesktopProps> = ({ isVisible }) => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [nextZIndex, setNextZIndex] = useState(20);
  const [dragState, setDragState] = useState<{
    windowId: string | null;
    offsetX: number;
    offsetY: number;
  }>({ windowId: null, offsetX: 0, offsetY: 0 });

  const desktopIcons: DesktopIcon[] = [
    {
      id: "about",
      name: "ABOUT.SYS",
      x: 50,
      y: 80,
      content: "JMILL OPERATING SYSTEM v2.1\n\nCopyright (c) 2024 JMILL Industries\nAll rights reserved.\n\nSYSTEM SPECIFICATIONS:\n- Neural Processing Unit: Active\n- Memory Core: 64GB Quantum RAM\n- Storage: 2TB Holographic Drive\n- Network: Quantum Entanglement Enabled\n\nSTATUS: OPERATIONAL",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="12" cy="12" r="10">
            <animate attributeName="stroke-dasharray" values="0 63;63 0" dur="2s" begin="indefinite" repeatCount="indefinite" id="about-circle-about"/>
          </circle>
          <path d="M9,9h6v6H9z"/>
          <path d="M12,6v3"/>
          <path d="M12,15v3"/>
          <path d="M6,12h3"/>
          <path d="M15,12h3"/>
        </svg>
      )
    },
    {
      id: "wiki",
      name: "WIKI.MD",
      x: 50,
      y: 180,
      content: "WIKI SYSTEM ACCESS\n\nBrowse random pages from the knowledge base:\n\n• Projects & Creative Works\n• Concepts & Theories\n• Tools & Resources\n• Bookmarks & References\n\nClick 'RND' to load a random page\nContent rendered with MDX\nInteractive links enabled",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z"/>
          <path d="M14,2V8H20"/>
          <path d="M16,13H8" strokeDasharray="8 0">
            <animate attributeName="stroke-dasharray" values="8 0;0 8;8 0" dur="1.5s" begin="indefinite" repeatCount="indefinite" id="wiki-line1-wiki"/>
          </path>
          <path d="M16,17H8" strokeDasharray="8 0">
            <animate attributeName="stroke-dasharray" values="8 0;0 8;8 0" dur="1.5s" begin="indefinite" repeatCount="indefinite" id="wiki-line2-wiki"/>
          </path>
          <path d="M10,9H8" strokeDasharray="2 0">
            <animate attributeName="stroke-dasharray" values="2 0;0 2;2 0" dur="1.5s" begin="indefinite" repeatCount="indefinite" id="wiki-line3-wiki"/>
          </path>
        </svg>
      )
    },
    {
      id: "terminal",
      name: "TERM.CMD",
      x: 50,
      y: 280,
      content: "JMILL OS TERMINAL v2.1\n\njmill@quantum:~$ whoami\njmill\n\njmill@quantum:~$ uname -a\nJMILL OS 2.1.0 quantum-kernel #1 SMP\n\njmill@quantum:~$ ps aux\nPID  TTY  STAT  TIME  COMMAND\n001  tty1 Ssl   0:01  /sbin/init\n002  tty1 R     0:00  neural_proc\n003  tty1 S     0:03  quantum_sim\n004  tty1 R     0:00  vector_ui\n\njmill@quantum:~$ █",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <path d="M8,21H16"/>
          <path d="M12,17V21"/>
          <path d="M6,7L10,10L6,13"/>
          <path d="M13,13H17">
            <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" begin="indefinite" id="terminal-cursor-terminal"/>
          </path>
        </svg>
      )
    }
  ];

  const createWindow = (icon: DesktopIcon) => {
    // Get the actual container dimensions instead of window dimensions
    const container = document.querySelector('main');
    const viewportWidth = container ? container.clientWidth : window.innerWidth;
    const viewportHeight = container ? container.clientHeight : window.innerHeight;
    
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
      windowWidth = Math.max(300, Math.min(viewportWidth - (2 * margin), icon.id === 'wiki' ? 600 : 480));
      windowHeight = Math.max(250, Math.min(viewportHeight - actionBarHeight - (2 * margin), icon.id === 'wiki' ? 600 : 400));
      windowX = margin;
      windowY = margin;
    } else if (viewportWidth <= 1024) {
      // Tablet landscape: reasonable proportions
      windowWidth = Math.max(400, Math.min(viewportWidth - (2 * margin), icon.id === 'wiki' ? 680 : 480));
      windowHeight = Math.max(300, Math.min(viewportHeight - actionBarHeight - (2 * margin), icon.id === 'wiki' ? 620 : 400));
      windowX = margin + Math.random() * Math.max(0, viewportWidth - windowWidth - (2 * margin));
      windowY = margin + Math.random() * Math.max(0, viewportHeight - windowHeight - actionBarHeight - (2 * margin));
    } else {
      // Desktop: ensure windows fit within bounds
      windowWidth = Math.min(viewportWidth - (2 * margin), icon.id === 'wiki' ? 700 : 500);
      windowHeight = Math.min(viewportHeight - actionBarHeight - (2 * margin), icon.id === 'wiki' ? 550 : 350);
      windowX = margin + Math.random() * Math.max(0, viewportWidth - windowWidth - (2 * margin));
      windowY = margin + Math.random() * Math.max(0, viewportHeight - windowHeight - actionBarHeight - (2 * margin));
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
      type: icon.id === 'wiki' ? 'wiki' : 'default'
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);

    // Start animation for the corresponding icon
    if (icon.id === 'about') {
      (document.getElementById('about-circle-about') as unknown as SVGAnimateElement)?.beginElement();
    } else if (icon.id === 'wiki') {
      setTimeout(() => (document.getElementById('wiki-line3-wiki') as unknown as SVGAnimateElement)?.beginElement(), 0);
      setTimeout(() => (document.getElementById('wiki-line1-wiki') as unknown as SVGAnimateElement)?.beginElement(), 500);
      setTimeout(() => (document.getElementById('wiki-line2-wiki') as unknown as SVGAnimateElement)?.beginElement(), 1000);
    } else if (icon.id === 'terminal') {
      (document.getElementById('terminal-cursor-terminal') as unknown as SVGAnimateElement)?.beginElement();
    }
  };

  const closeWindow = (windowId: string) => {
    const windowToClose = windows.find(w => w.id === windowId);
    setWindows(prev => prev.filter(w => w.id !== windowId));
    
    // Stop animation for the corresponding icon if no more windows of this type are open
    if (windowToClose) {
      const remainingWindowsOfSameType = windows.filter(w => w.id !== windowId && w.title === windowToClose.title);
      if (remainingWindowsOfSameType.length === 0) {
        // Find the icon by matching window title to icon name
        const correspondingIcon = desktopIcons.find(icon => icon.name === windowToClose.title);
        if (correspondingIcon) {
          if (correspondingIcon.id === 'about') {
            (document.getElementById('about-circle-about') as unknown as SVGAnimateElement)?.endElement();
          } else if (correspondingIcon.id === 'wiki') {
            (document.getElementById('wiki-line1-wiki') as unknown as SVGAnimateElement)?.endElement();
            (document.getElementById('wiki-line2-wiki') as unknown as SVGAnimateElement)?.endElement();
            (document.getElementById('wiki-line3-wiki') as unknown as SVGAnimateElement)?.endElement();
          } else if (correspondingIcon.id === 'terminal') {
            (document.getElementById('terminal-cursor-terminal') as unknown as SVGAnimateElement)?.endElement();
          }
        }
      }
    }
  };

  const toggleMaximize = (windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId 
        ? { ...w, isMaximized: !w.isMaximized }
        : w
    ));
  };

  const bringToFront = (windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId 
        ? { ...w, zIndex: nextZIndex }
        : w
    ));
    setNextZIndex(prev => prev + 1);
  };

  const handleMouseDown = (e: React.MouseEvent, windowId: string) => {
    e.preventDefault();
    const window = windows.find(w => w.id === windowId);
    const container = document.querySelector('main');
    const containerRect = container?.getBoundingClientRect();
    
    if (window) {
      // Adjust mouse coordinates relative to container
      const adjustedX = containerRect ? e.clientX - containerRect.left : e.clientX;
      const adjustedY = containerRect ? e.clientY - containerRect.top : e.clientY;
      
      setDragState({
        windowId,
        offsetX: adjustedX - window.x,
        offsetY: adjustedY - window.y
      });
    }
    bringToFront(windowId);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.windowId) {
      const margin = 10;
      const container = document.querySelector('main');
      const containerWidth = container ? container.clientWidth : window.innerWidth;
      const containerHeight = container ? container.clientHeight : window.innerHeight;
      const containerRect = container?.getBoundingClientRect();
      
      // Adjust mouse coordinates relative to container
      const adjustedX = containerRect ? e.clientX - containerRect.left : e.clientX;
      const adjustedY = containerRect ? e.clientY - containerRect.top : e.clientY;
      
      setWindows(prev => prev.map(w => 
        w.id === dragState.windowId
          ? {
              ...w,
              x: Math.max(margin, Math.min(containerWidth - w.width - margin, adjustedX - dragState.offsetX)),
              y: Math.max(margin, Math.min(containerHeight - w.height - margin, adjustedY - dragState.offsetY))
            }
          : w
      ));
    }
  }, [dragState.windowId, dragState.offsetX, dragState.offsetY]);

  const handleMouseUp = () => {
    setDragState({ windowId: null, offsetX: 0, offsetY: 0 });
  };

  useEffect(() => {
    if (dragState.windowId) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove]);


  if (!isVisible) return null;

  return (
    <div className={`absolute inset-0 bg-black transition-opacity duration-2000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 15 }}>
      {/* Subtle CRT Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full opacity-5 bg-gradient-to-b from-transparent via-[#00FFFF] to-transparent bg-[length:100%_8px]"></div>
      </div>

      {/* Desktop Icons */}
      {desktopIcons.map(icon => (
        <div
          key={icon.id}
          className="absolute flex flex-col items-center cursor-pointer group z-20"
          style={{ left: icon.x, top: icon.y }}
          onDoubleClick={() => createWindow(icon)}
          onMouseEnter={() => {
            const isWindowOpen = windows.some(w => w.title === icon.name);
            if (!isWindowOpen) {
              if (icon.id === 'about') {
                (document.getElementById('about-circle-about') as unknown as SVGAnimateElement)?.beginElement();
              } else if (icon.id === 'wiki') {
                setTimeout(() => (document.getElementById('wiki-line3-wiki') as unknown as SVGAnimateElement)?.beginElement(), 0);
                setTimeout(() => (document.getElementById('wiki-line1-wiki') as unknown as SVGAnimateElement)?.beginElement(), 500);
                setTimeout(() => (document.getElementById('wiki-line2-wiki') as unknown as SVGAnimateElement)?.beginElement(), 1000);
              } else if (icon.id === 'terminal') {
                (document.getElementById('terminal-cursor-terminal') as unknown as SVGAnimateElement)?.beginElement();
              }
            }
          }}
          onMouseLeave={() => {
            const isWindowOpen = windows.some(w => w.title === icon.name);
            if (!isWindowOpen) {
              if (icon.id === 'about') {
                (document.getElementById('about-circle-about') as unknown as SVGAnimateElement)?.endElement();
              } else if (icon.id === 'wiki') {
                (document.getElementById('wiki-line1-wiki') as unknown as SVGAnimateElement)?.endElement();
                (document.getElementById('wiki-line2-wiki') as unknown as SVGAnimateElement)?.endElement();
                (document.getElementById('wiki-line3-wiki') as unknown as SVGAnimateElement)?.endElement();
              } else if (icon.id === 'terminal') {
                (document.getElementById('terminal-cursor-terminal') as unknown as SVGAnimateElement)?.endElement();
              }
            }
          }}
        >
          <div className={`text-[#00FFFF] p-3 border border-[#00FFFF] transition-all flex items-center justify-center w-16 h-16 ${
            windows.some(w => w.title === icon.name) 
              ? 'border-opacity-100 shadow-[0_0_10px_#00FFFF]' 
              : 'border-opacity-50 group-hover:border-opacity-100 group-hover:shadow-[0_0_10px_#00FFFF]'
          }`}>
            {icon.icon}
          </div>
          <span className="text-[#00FFFF] text-xs mt-1 text-center font-mono">{icon.name}</span>
        </div>
      ))}

      {/* Windows */}
      {windows.map(window => (
        window.type === 'wiki' ? (
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
          >
            <div className="p-4 overflow-auto h-full">
              <pre className="text-[#00FFFF] font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {window.content}
              </pre>
            </div>
          </BaseWindow>
        )
      ))}


    </div>
  );
};

export default VectorDesktop;