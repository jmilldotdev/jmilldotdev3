"use client";

import { useState, useRef, useEffect } from "react";
import * as THREE from "three";

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

interface WindowShatterEffect {
  id: string;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  fragments: THREE.LineSegments[];
  container: HTMLDivElement;
}

export const VectorDesktop: React.FC<VectorDesktopProps> = ({ isVisible }) => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [dragState, setDragState] = useState<{
    windowId: string | null;
    offsetX: number;
    offsetY: number;
  }>({ windowId: null, offsetX: 0, offsetY: 0 });
  const [windowShatterEffects, setWindowShatterEffects] = useState<WindowShatterEffect[]>([]);

  const desktopIcons: DesktopIcon[] = [
    {
      id: "about",
      name: "ABOUT.SYS",
      x: 50,
      y: 80,
      content: "JMILL OPERATING SYSTEM v2.1\n\nCopyright (c) 2024 JMILL Industries\nAll rights reserved.\n\nSYSTEM SPECIFICATIONS:\n- Neural Processing Unit: Active\n- Memory Core: 64GB Quantum RAM\n- Storage: 2TB Holographic Drive\n- Network: Quantum Entanglement Enabled\n\nSTATUS: OPERATIONAL",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9,9h6v6H9z"/>
          <path d="M12,6v3"/>
          <path d="M12,15v3"/>
          <path d="M6,12h3"/>
          <path d="M15,12h3"/>
        </svg>
      )
    },
    {
      id: "files",
      name: "FILES.EXE",
      x: 50,
      y: 180,
      content: "FILE SYSTEM ACCESS\n\n/home/jmill/\n├── projects/\n│   ├── neural_net.py\n│   ├── quantum_sim.cpp\n│   └── ai_research/\n├── documents/\n│   ├── README.md\n│   └── notes.txt\n└── system/\n    ├── kernel.sys\n    └── drivers/\n\nACCESS LEVEL: ADMINISTRATOR\nENCRYPTION: AES-256 QUANTUM",
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z"/>
          <path d="M14,2V8H20"/>
          <path d="M16,13H8"/>
          <path d="M16,17H8"/>
          <path d="M10,9H8"/>
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
          <path d="M13,13H17"/>
        </svg>
      )
    }
  ];

  const createWindow = (icon: DesktopIcon) => {
    const newWindow: Window = {
      id: `window-${Date.now()}`,
      title: icon.name,
      content: icon.content,
      x: Math.random() * 200 + 100,
      y: Math.random() * 100 + 100,
      width: 600,
      height: 400,
      isMaximized: false,
      zIndex: nextZIndex
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
  };

  const createWindowShatterEffect = (window: Window) => {
    // Create container for the 3D effect
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = `${window.x}px`;
    container.style.top = `${window.y}px`;
    container.style.width = `${window.width}px`;
    container.style.height = `${window.height}px`;
    container.style.zIndex = '30';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    // Create 3D scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.width / window.height, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.width, window.height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create wireframe rectangle geometry for the window
    const rectangleGeometry = new THREE.PlaneGeometry(2, 1.5, 12, 8);
    const wireframe = new THREE.WireframeGeometry(rectangleGeometry);
    
    // Break into fragments similar to sphere
    const fragments: THREE.LineSegments[] = [];
    const positions = wireframe.attributes.position.array;
    const fragmentCount = Math.floor(positions.length / 6);
    const totalFragments = 10;
    const usedIndices = new Set<number>();

    for (let fragIndex = 0; fragIndex < totalFragments; fragIndex++) {
      const fragmentGeometry = new THREE.BufferGeometry();
      const fragmentPositions = [];

      // Create varied fragment sizes
      const fragmentType = Math.floor(Math.random() * 4);
      let fragmentSize;

      switch (fragmentType) {
        case 0: fragmentSize = Math.floor(Math.random() * 8) + 3; break;
        case 1: fragmentSize = Math.floor(Math.random() * 15) + 8; break;
        case 2: fragmentSize = Math.floor(Math.random() * 25) + 15; break;
        case 3: fragmentSize = Math.floor(Math.random() * 12) + 5; break;
        default: fragmentSize = Math.floor(Math.random() * 10) + 5;
      }

      for (let segCount = 0; segCount < fragmentSize && usedIndices.size < fragmentCount; segCount++) {
        let randomIndex;
        let attempts = 0;
        do {
          randomIndex = Math.floor(Math.random() * fragmentCount);
          attempts++;
        } while (usedIndices.has(randomIndex) && attempts < 50);

        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          const startIdx = randomIndex * 6;
          if (startIdx + 5 < positions.length) {
            fragmentPositions.push(
              positions[startIdx], positions[startIdx + 1], positions[startIdx + 2],
              positions[startIdx + 3], positions[startIdx + 4], positions[startIdx + 5]
            );
          }
        }
      }

      if (fragmentPositions.length > 0) {
        fragmentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(fragmentPositions, 3));
        
        const material = new THREE.LineBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.8,
        });

        const fragment = new THREE.LineSegments(fragmentGeometry, material);
        
        // Position fragments in a larger emission area
        fragment.position.x = (Math.random() - 0.5) * 1.5; // Larger spread
        fragment.position.y = (Math.random() - 0.5) * 1.2; // Larger spread
        fragment.position.z = (Math.random() - 0.5) * 0.2;

        // Store velocities
        (fragment as any).velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        );
        
        (fragment as any).rotationVelocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        );

        scene.add(fragment);
        fragments.push(fragment);
      }
    }

    const shatterEffect: WindowShatterEffect = {
      id: window.id,
      scene,
      renderer,
      camera,
      fragments,
      container
    };

    setWindowShatterEffects(prev => [...prev, shatterEffect]);

    // Animation and cleanup
    let startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      fragments.forEach(fragment => {
        const velocity = (fragment as any).velocity;
        const rotationVelocity = (fragment as any).rotationVelocity;
        
        fragment.position.x += velocity.x;
        fragment.position.y += velocity.y;
        fragment.position.z += velocity.z;
        
        fragment.rotation.x += rotationVelocity.x;
        fragment.rotation.y += rotationVelocity.y;
        fragment.rotation.z += rotationVelocity.z;
        
        // Fade out
        const material = fragment.material as THREE.LineBasicMaterial;
        material.opacity *= 0.995;
      });

      renderer.render(scene, camera);

      if (elapsed < 4000) {
        requestAnimationFrame(animate);
      } else {
        // Cleanup
        container.remove();
        setWindowShatterEffects(prev => prev.filter(effect => effect.id !== window.id));
      }
    };

    animate();
  };

  const closeWindow = (windowId: string) => {
    const windowToClose = windows.find(w => w.id === windowId);
    if (windowToClose) {
      createWindowShatterEffect(windowToClose);
    }
    setWindows(prev => prev.filter(w => w.id !== windowId));
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
    if (window) {
      setDragState({
        windowId,
        offsetX: e.clientX - window.x,
        offsetY: e.clientY - window.y
      });
    }
    bringToFront(windowId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragState.windowId) {
      setWindows(prev => prev.map(w => 
        w.id === dragState.windowId
          ? {
              ...w,
              x: e.clientX - dragState.offsetX,
              y: e.clientY - dragState.offsetY
            }
          : w
      ));
    }
  };

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
  }, [dragState]);


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
        >
          <div className="text-[#00FFFF] p-2 border border-[#00FFFF] border-opacity-50 group-hover:border-opacity-100 group-hover:bg-[#00FFFF] group-hover:bg-opacity-10 transition-all">
            {icon.icon}
          </div>
          <span className="text-[#00FFFF] text-xs mt-1 text-center font-mono">{icon.name}</span>
        </div>
      ))}

      {/* Windows */}
      {windows.map(window => (
        <div
          key={window.id}
          className={`window-container absolute border-2 border-[#00FFFF] bg-black bg-opacity-90 ${
            window.isMaximized ? 'inset-4' : ''
          }`}
          style={window.isMaximized ? {} : {
            left: window.x,
            top: window.y,
            width: window.width,
            height: window.height,
            zIndex: window.zIndex
          }}
        >
          {/* Title Bar */}
          <div
            className="flex items-center justify-between bg-[#00FFFF] bg-opacity-20 px-3 py-2 cursor-move"
            onMouseDown={(e) => !window.isMaximized && handleMouseDown(e, window.id)}
          >
            <span className="text-[#00FFFF] font-mono text-sm">{window.title}</span>
            <div className="flex gap-2">
              <button
                onClick={() => toggleMaximize(window.id)}
                className="text-[#FF4800] hover:bg-[#FF4800] hover:text-black w-6 h-6 border border-[#FF4800] text-xs font-mono transition-colors"
              >
                {window.isMaximized ? '□' : '■'}
              </button>
              <button
                onClick={() => closeWindow(window.id)}
                className="text-[#FF4800] hover:bg-[#FF4800] hover:text-black w-6 h-6 border border-[#FF4800] text-xs font-mono transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 40px)' }}>
            <pre className="text-[#00FFFF] font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {window.content}
            </pre>
          </div>
        </div>
      ))}


    </div>
  );
};

export default VectorDesktop;