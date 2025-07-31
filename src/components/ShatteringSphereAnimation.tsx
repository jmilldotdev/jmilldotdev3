"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ShatteringSphereAnimationProps {
  className?: string;
  onShatterComplete?: () => void;
}

export const ShatteringSphereAnimation: React.FC<ShatteringSphereAnimationProps> = ({
  className = "",
  onShatterComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereGroupRef = useRef<THREE.Group | null>(null);
  const fragmentsRef = useRef<THREE.Mesh[]>([]);
  const isShatteredRef = useRef(false);
  const [isShattered, setIsShattered] = useState(false);

  const handleEnterClick = () => {
    if (!isShatteredRef.current) {
      isShatteredRef.current = true;
      setIsShattered(true);
      createFragments();
    }
  };

  const createFragments = () => {
    if (!sceneRef.current || !sphereGroupRef.current) return;

    // Hide original sphere
    sphereGroupRef.current.visible = false;

    // Create fragments
    const fragments: THREE.Mesh[] = [];
    const fragmentGeometry = new THREE.TetrahedronGeometry(0.15);
    
    // Create fragments in a sphere pattern
    for (let i = 0; i < 100; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0x00ffff : 0x0077ff,
        emissive: 0x001133,
        transparent: true,
        opacity: 0.8,
      });
      
      const fragment = new THREE.Mesh(fragmentGeometry, material);
      
      // Position fragments on sphere surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 2;
      
      fragment.position.x = radius * Math.sin(phi) * Math.cos(theta);
      fragment.position.y = radius * Math.sin(phi) * Math.sin(theta);
      fragment.position.z = radius * Math.cos(phi);
      
      // Random rotation
      fragment.rotation.x = Math.random() * Math.PI * 2;
      fragment.rotation.y = Math.random() * Math.PI * 2;
      fragment.rotation.z = Math.random() * Math.PI * 2;
      
      // Store velocity for animation
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      (fragment as any).velocity = velocity;
      
      // Store rotation velocity
      (fragment as any).rotationVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );
      
      sceneRef.current.add(fragment);
      fragments.push(fragment);
    }
    
    fragmentsRef.current = fragments;

    // Call completion callback after animation
    setTimeout(() => {
      if (onShatterComplete) {
        onShatterComplete();
      }
    }, 3000);
  };

  useEffect(() => {
    if (!canvasContainerRef.current) {
      console.error("Canvas container ref is null");
      return;
    }

    console.log("Initializing THREE.js scene");

    // Initialize 3D scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      (containerRef.current?.clientWidth || window.innerWidth) /
        (containerRef.current?.clientHeight || window.innerHeight),
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer with explicit size
    const width = containerRef.current?.clientWidth || window.innerWidth;
    const height = containerRef.current?.clientHeight || window.innerHeight;
    console.log("Container dimensions:", width, height);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    // Set explicit styles to ensure correct rendering
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "1";

    // Store canvas container ref for cleanup
    const canvasContainer = canvasContainerRef.current;

    // Ensure any existing canvas is removed first
    while (canvasContainer.firstChild) {
      canvasContainer.removeChild(canvasContainer.firstChild);
    }

    canvasContainer.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add blue point light for that A.T. field glow
    const blueLight = new THREE.PointLight(0x00ffff, 0.5);
    blueLight.position.set(-2, 1, 3);
    scene.add(blueLight);

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(2, 32, 32);

    // Create wireframe geometry
    const wireframe = new THREE.WireframeGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.4,
    });
    const wireframeMesh = new THREE.LineSegments(wireframe, lineMaterial);

    // Create inner sphere
    const innerMaterial = new THREE.MeshPhongMaterial({
      color: 0x0077ff,
      emissive: 0x001133,
      transparent: true,
      opacity: 0.2,
      shininess: 100,
    });
    const sphere = new THREE.Mesh(geometry, innerMaterial);
    sphere.scale.set(0.95, 0.95, 0.95);

    // Create group to hold both
    const sphereGroup = new THREE.Group();
    sphereGroup.add(wireframeMesh);
    sphereGroup.add(sphere);
    scene.add(sphereGroup);
    sphereGroupRef.current = sphereGroup;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      if (!isShatteredRef.current && sphereGroupRef.current) {
        // Rotate sphere
        sphereGroupRef.current.rotation.x += 0.002;
        sphereGroupRef.current.rotation.y += 0.004;

        // Pulsate inner sphere
        const pulseScale = 0.95 + 0.03 * Math.sin(Date.now() * 0.001);
        sphere.scale.set(pulseScale, pulseScale, pulseScale);

        // Vary wireframe opacity for glitch effect
        if (Math.random() > 0.98) {
          lineMaterial.opacity = 0.1 + Math.random() * 0.5;
        }
      }

      // Animate fragments
      if (isShatteredRef.current && fragmentsRef.current.length > 0) {
        fragmentsRef.current.forEach((fragment) => {
          const velocity = (fragment as any).velocity;
          const rotationVelocity = (fragment as any).rotationVelocity;
          
          // Update position
          fragment.position.x += velocity.x;
          fragment.position.y += velocity.y;
          fragment.position.z += velocity.z;
          
          // Update rotation
          fragment.rotation.x += rotationVelocity.x;
          fragment.rotation.y += rotationVelocity.y;
          fragment.rotation.z += rotationVelocity.z;
          
          // Add gravity
          velocity.y -= 0.005;
          
          // Fade out
          const material = fragment.material as THREE.MeshPhongMaterial;
          material.opacity *= 0.99;
        });
      }

      renderer.render(scene, camera);
    }

    // Initial render to make sure something shows up
    console.log("Initial render");
    renderer.render(scene, camera);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const newWidth = containerRef.current.clientWidth || window.innerWidth;
      const newHeight = containerRef.current.clientHeight || window.innerHeight;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Start animation
    console.log("Starting animation");
    animate();

    // Cleanup
    return () => {
      console.log("Cleaning up THREE.js scene");
      window.removeEventListener("resize", handleResize);
      if (canvasContainer && rendererRef.current) {
        canvasContainer.removeChild(rendererRef.current.domElement);
      }
      scene.clear();
    };
  }, []);

  return (
    <div
      id="sphere-container"
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center ${className}`}
    >
      {/* Canvas container with lower z-index */}
      <div ref={canvasContainerRef} className="absolute inset-0 z-[1]" />

      {/* Enter button */}
      <button
        onClick={handleEnterClick}
        disabled={isShattered}
        className="absolute bottom-10 z-[60] px-6 py-3 bg-[#FF4800]/80 hover:bg-[#FF4800] text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
      >
        ENTER
      </button>
    </div>
  );
};

export default ShatteringSphereAnimation;