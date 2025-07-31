"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";

interface SphereAnimationProps {
  className?: string;
  onShatter?: () => void;
}

export interface SphereAnimationRef {
  triggerShatter: () => void;
}

export const SphereAnimation = forwardRef<SphereAnimationRef, SphereAnimationProps>(({
  className = "",
  onShatter,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereGroupRef = useRef<THREE.Group | null>(null);
  const redSphereRef = useRef<THREE.LineSegments | null>(null);
  const wireframeFragmentsRef = useRef<THREE.LineSegments[]>([]);
  const isShatteredRef = useRef(false);

  const triggerShatter = () => {
    if (!isShatteredRef.current && sphereGroupRef.current && sceneRef.current) {
      isShatteredRef.current = true;
      createWireframeFragments();
      if (onShatter) onShatter();
    }
  };

  useImperativeHandle(ref, () => ({
    triggerShatter,
  }));

  const createWireframeFragments = () => {
    if (!sceneRef.current || !sphereGroupRef.current) return;

    // Hide original sphere group
    sphereGroupRef.current.visible = false;

    // Break the original sphere wireframe into varied fragments
    const fragments: THREE.LineSegments[] = [];
    const originalGeometry = new THREE.SphereGeometry(2, 32, 32);
    const originalWireframe = new THREE.WireframeGeometry(originalGeometry);
    
    // Get the line segments from the original wireframe
    const positions = originalWireframe.attributes.position.array;
    const fragmentCount = Math.floor(positions.length / 6);
    
    const totalFragments = 16;
    const usedIndices = new Set<number>();
    
    for (let fragIndex = 0; fragIndex < totalFragments; fragIndex++) {
      const fragmentGeometry = new THREE.BufferGeometry();
      const fragmentPositions = [];
      
      // Create varied fragment types
      const fragmentType = Math.floor(Math.random() * 4);
      let fragmentSize;
      
      switch (fragmentType) {
        case 0: // Small scattered pieces
          fragmentSize = Math.floor(Math.random() * 15) + 5;
          break;
        case 1: // Medium chunks
          fragmentSize = Math.floor(Math.random() * 30) + 20;
          break;
        case 2: // Large sections
          fragmentSize = Math.floor(Math.random() * 80) + 60;
          break;
        case 3: // Thin strips (create connected segments)
          fragmentSize = Math.floor(Math.random() * 20) + 10;
          break;
        default:
          fragmentSize = Math.floor(Math.random() * 25) + 15;
      }
      
      if (fragmentType === 3) {
        // Create strips by selecting segments that are spatially close
        const seedIndex = Math.floor(Math.random() * fragmentCount);
        if (!usedIndices.has(seedIndex)) {
          const seedStartIdx = seedIndex * 6;
          const seedX = positions[seedStartIdx];
          const seedY = positions[seedStartIdx + 1];
          const seedZ = positions[seedStartIdx + 2];
          
          // Find nearby segments to create strip-like fragments
          const nearbyIndices = [];
          for (let i = 0; i < fragmentCount; i++) {
            if (usedIndices.has(i)) continue;
            
            const startIdx = i * 6;
            const x = positions[startIdx];
            const y = positions[startIdx + 1];
            const z = positions[startIdx + 2];
            
            const distance = Math.sqrt((x - seedX) ** 2 + (y - seedY) ** 2 + (z - seedZ) ** 2);
            if (distance < 0.8) { // Adjust threshold for strip width
              nearbyIndices.push(i);
            }
          }
          
          // Take up to fragmentSize segments from nearby ones
          const stripSegments = nearbyIndices.slice(0, Math.min(fragmentSize, nearbyIndices.length));
          
          for (const segIndex of stripSegments) {
            usedIndices.add(segIndex);
            const startIdx = segIndex * 6;
            
            if (startIdx + 5 < positions.length) {
              fragmentPositions.push(
                positions[startIdx], positions[startIdx + 1], positions[startIdx + 2],
                positions[startIdx + 3], positions[startIdx + 4], positions[startIdx + 5]
              );
            }
          }
        }
      } else {
        // Random selection for other fragment types
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
      }
      
      if (fragmentPositions.length > 0) {
        fragmentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(fragmentPositions, 3));
        
        const material = new THREE.LineBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.7,
        });
        
        const fragment = new THREE.LineSegments(fragmentGeometry, material);
        
        // Position fragments with slight offset from center
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const offset = 0.2;
        
        fragment.position.x = offset * Math.sin(phi) * Math.cos(theta);
        fragment.position.y = offset * Math.sin(phi) * Math.sin(theta);
        fragment.position.z = offset * Math.cos(phi);
        
        // Inherit rotation from the original sphere group
        if (sphereGroupRef.current) {
          fragment.rotation.x = sphereGroupRef.current.rotation.x;
          fragment.rotation.y = sphereGroupRef.current.rotation.y;
          fragment.rotation.z = sphereGroupRef.current.rotation.z;
        }
        
        // Store velocity for slow movement outward
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        );
        (fragment as any).velocity = velocity;
        
        // Store rotation velocity - inherit the sphere's rotation momentum plus some variation
        const baseRotationSpeed = { x: 0.002, y: 0.004, z: 0 };
        (fragment as any).rotationVelocity = new THREE.Vector3(
          baseRotationSpeed.x + (Math.random() - 0.5) * 0.002,
          baseRotationSpeed.y + (Math.random() - 0.5) * 0.002,
          baseRotationSpeed.z + (Math.random() - 0.5) * 0.003
        );
        
        sceneRef.current.add(fragment);
        fragments.push(fragment);
      }
    }
    
    wireframeFragmentsRef.current = fragments;
  };

  useEffect(() => {
    // Check if container exists
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

    // Ensure any existing canvas is removed first
    while (canvasContainerRef.current.firstChild) {
      canvasContainerRef.current.removeChild(
        canvasContainerRef.current.firstChild
      );
    }

    canvasContainerRef.current.appendChild(renderer.domElement);
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

    // Create red inner wireframe sphere
    const redSphereGeometry = new THREE.SphereGeometry(0.8, 20, 20);
    const redWireframe = new THREE.WireframeGeometry(redSphereGeometry);
    const redLineMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    });
    const redSphere = new THREE.LineSegments(redWireframe, redLineMaterial);
    redSphereRef.current = redSphere;

    // Create group to hold all elements
    const sphereGroup = new THREE.Group();
    sphereGroup.add(wireframeMesh);
    sphereGroup.add(sphere);
    sphereGroup.add(redSphere);
    scene.add(sphereGroup);
    sphereGroupRef.current = sphereGroup;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      if (!isShatteredRef.current && sphereGroupRef.current) {
        // Rotate sphere
        sphereGroupRef.current.rotation.x += 0.002;
        sphereGroupRef.current.rotation.y += 0.004;

        // Rotate red sphere with different speeds
        if (redSphereRef.current) {
          redSphereRef.current.rotation.x += 0.003;
          redSphereRef.current.rotation.y += 0.001;
          redSphereRef.current.rotation.z += 0.002;
        }

        // Pulsate inner sphere only (not red sphere)
        const pulseScale = 0.95 + 0.03 * Math.sin(Date.now() * 0.001);
        sphere.scale.set(pulseScale, pulseScale, pulseScale);

        // Vary wireframe opacity for glitch effect
        if (Math.random() > 0.98) {
          lineMaterial.opacity = 0.1 + Math.random() * 0.5;
        }
      }

      // Animate wireframe fragments slowly
      if (isShatteredRef.current && wireframeFragmentsRef.current.length > 0) {
        wireframeFragmentsRef.current.forEach((fragment) => {
          const velocity = (fragment as any).velocity;
          const rotationVelocity = (fragment as any).rotationVelocity;
          
          // Update position slowly
          fragment.position.x += velocity.x;
          fragment.position.y += velocity.y;
          fragment.position.z += velocity.z;
          
          // Update rotation slowly
          fragment.rotation.x += rotationVelocity.x;
          fragment.rotation.y += rotationVelocity.y;
          fragment.rotation.z += rotationVelocity.z;
          
          // Fade out slowly
          const material = fragment.material as THREE.LineBasicMaterial;
          material.opacity *= 0.998;
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
      if (canvasContainerRef.current && rendererRef.current) {
        canvasContainerRef.current.removeChild(rendererRef.current.domElement);
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

    </div>
  );
});

export default SphereAnimation;
