"use client";

import {
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import { usePalette } from "@/contexts/PaletteContext";

interface SphereAnimationProps {
  className?: string;
  onShatter?: () => void;
  onShatterReveal?: () => void;
  onShatterComplete?: () => void;
}

export interface SphereAnimationRef {
  triggerShatter: () => void;
}

const disposeObject = (object: THREE.Object3D) => {
  const disposable = object as THREE.Object3D & {
    geometry?: THREE.BufferGeometry;
    material?: THREE.Material | THREE.Material[];
  };

  disposable.geometry?.dispose();

  if (Array.isArray(disposable.material)) {
    disposable.material.forEach((material) => material.dispose());
  } else {
    disposable.material?.dispose();
  }
};

const FRAGMENT_VISIBLE_OPACITY = 0.01;
const SHATTER_SHAKE_DURATION_MS = 500;

export const SphereAnimation = forwardRef<
  SphereAnimationRef,
  SphereAnimationProps
>(
  (
    {
      className = "",
      onShatter,
      onShatterReveal,
      onShatterComplete,
    },
    ref
  ) => {
  const { palette } = usePalette();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const shakeFrameRef = useRef<number | null>(null);
  const sphereGroupRef = useRef<THREE.Group | null>(null);
  const redSphereRef = useRef<THREE.LineSegments | null>(null);
  const wireframeFragmentsRef = useRef<THREE.LineSegments[]>([]);
  const redFragmentsRef = useRef<THREE.LineSegments[]>([]);
  const isShatteredRef = useRef(false);
  const pendingFragmentGroupsRef = useRef(0);
  const shatterRevealSentRef = useRef(false);
  const shatterCompleteSentRef = useRef(false);
  const onShatterRevealRef = useRef(onShatterReveal);
  const onShatterCompleteRef = useRef(onShatterComplete);
  const targetSphereScaleRef = useRef(1);
  const paletteColorsRef = useRef({
    accent: new THREE.Color(palette.accent),
    warm: new THREE.Color(palette.warm),
  });
  const lineMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const redLineMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const blueLightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    onShatterRevealRef.current = onShatterReveal;
    onShatterCompleteRef.current = onShatterComplete;
  }, [onShatterReveal, onShatterComplete]);

  useEffect(() => {
    paletteColorsRef.current.accent.set(palette.accent);
    paletteColorsRef.current.warm.set(palette.warm);
    lineMaterialRef.current?.color.copy(paletteColorsRef.current.accent);
    redLineMaterialRef.current?.color.copy(paletteColorsRef.current.warm);
    blueLightRef.current?.color.copy(paletteColorsRef.current.accent);
  }, [palette.accent, palette.warm]);

  const getResponsiveSphereScale = useCallback(
    (width: number, height: number, camera: THREE.PerspectiveCamera) => {
      const visibleHeight =
        2 *
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
        camera.position.z;
      const visibleWidth = visibleHeight * (width / height);
      const outerSphereDiameter = 4;
      const widthFitScale = (visibleWidth * 0.86) / outerSphereDiameter;

      return Math.min(1, widthFitScale);
    },
    []
  );

  const applyResponsiveSphereScale = useCallback(
    (width: number, height: number, camera: THREE.PerspectiveCamera) => {
      const scale = getResponsiveSphereScale(width, height, camera);
      targetSphereScaleRef.current = scale;

      if (sphereGroupRef.current && !isShatteredRef.current) {
        sphereGroupRef.current.scale.setScalar(scale);
      }
    },
    [getResponsiveSphereScale]
  );

  const triggerShatter = () => {
    if (!isShatteredRef.current && sphereGroupRef.current && sceneRef.current) {
      isShatteredRef.current = true;
      pendingFragmentGroupsRef.current = 2;
      shatterRevealSentRef.current = false;
      shatterCompleteSentRef.current = false;
      startShatterSequence();
      if (onShatter) onShatter();
    }
  };

  useImperativeHandle(ref, () => ({
    triggerShatter,
  }));

  const markFragmentGroupReady = () => {
    pendingFragmentGroupsRef.current = Math.max(
      0,
      pendingFragmentGroupsRef.current - 1
    );

    if (
      pendingFragmentGroupsRef.current === 0 &&
      !shatterRevealSentRef.current
    ) {
      shatterRevealSentRef.current = true;
      onShatterRevealRef.current?.();
    }
  };

  const removeFinishedFragments = (fragments: THREE.LineSegments[]) =>
    fragments.filter((fragment) => {
      const material = fragment.material as THREE.LineBasicMaterial;
      if (material.opacity > FRAGMENT_VISIBLE_OPACITY) return true;

      sceneRef.current?.remove(fragment);
      disposeObject(fragment);
      return false;
    });

  const startShatterSequence = () => {
    if (!sceneRef.current || !sphereGroupRef.current) return;

    const startTime = performance.now();
    const shakeIntensity = 0.005;
    const pulseIntensity = 0.005;

    const shakeEffect = (now: number) => {
      if (!sphereGroupRef.current) return;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / SHATTER_SHAKE_DURATION_MS, 1);

      if (progress < 1) {
        // Gentle, slow shake using sine waves instead of random
        const shakeFreq = 8; // Lower frequency for slower movement
        const shake = shakeIntensity * progress;
        sphereGroupRef.current.position.x =
          Math.sin(elapsed * shakeFreq * 0.01) * shake;
        sphereGroupRef.current.position.y =
          Math.cos(elapsed * shakeFreq * 0.013) * shake;
        sphereGroupRef.current.position.z =
          Math.sin(elapsed * shakeFreq * 0.007) * shake;

        // Gentle pulsing scale
        const pulseSpeed = 10 + progress * 15; // Slower pulse acceleration
        const pulse =
          1 + Math.sin(elapsed * pulseSpeed * 0.01) * pulseIntensity * progress;
        sphereGroupRef.current.scale.setScalar(
          targetSphereScaleRef.current * pulse
        );

        // Speed up rotation as it gets more unstable
        const rotationMultiplier = 1 + progress * 2;
        sphereGroupRef.current.rotation.x += 0.002 * rotationMultiplier;
        sphereGroupRef.current.rotation.y += 0.004 * rotationMultiplier;

        shakeFrameRef.current = window.requestAnimationFrame(shakeEffect);
      } else {
        sphereGroupRef.current.position.set(0, 0, 0);
        sphereGroupRef.current.scale.setScalar(targetSphereScaleRef.current);
        sphereGroupRef.current.visible = false;
        createWireframeFragments();
        createRedFragments();
      }
    };

    shakeFrameRef.current = window.requestAnimationFrame(shakeEffect);
  };

  const createWireframeFragments = () => {
    if (!sceneRef.current || !sphereGroupRef.current) return;

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

              const distance = Math.sqrt(
                (x - seedX) ** 2 + (y - seedY) ** 2 + (z - seedZ) ** 2
              );
              if (distance < 0.8) {
                // Adjust threshold for strip width
                nearbyIndices.push(i);
              }
            }

            // Take up to fragmentSize segments from nearby ones
            const stripSegments = nearbyIndices.slice(
              0,
              Math.min(fragmentSize, nearbyIndices.length)
            );

            for (const segIndex of stripSegments) {
              usedIndices.add(segIndex);
              const startIdx = segIndex * 6;

              if (startIdx + 5 < positions.length) {
                fragmentPositions.push(
                  positions[startIdx],
                  positions[startIdx + 1],
                  positions[startIdx + 2],
                  positions[startIdx + 3],
                  positions[startIdx + 4],
                  positions[startIdx + 5]
                );
              }
            }
          }
        } else {
          // Random selection for other fragment types
          for (
            let segCount = 0;
            segCount < fragmentSize && usedIndices.size < fragmentCount;
            segCount++
          ) {
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
                  positions[startIdx],
                  positions[startIdx + 1],
                  positions[startIdx + 2],
                  positions[startIdx + 3],
                  positions[startIdx + 4],
                  positions[startIdx + 5]
                );
              }
            }
          }
        }

        if (fragmentPositions.length > 0) {
          fragmentGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(fragmentPositions, 3)
          );

          const material = new THREE.LineBasicMaterial({
            color: paletteColorsRef.current.accent,
            transparent: true,
            opacity: 0.7,
          });

          const fragment = new THREE.LineSegments(fragmentGeometry, material);
          fragment.scale.setScalar(targetSphereScaleRef.current);

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
          (
            fragment as unknown as THREE.LineSegments & {
              velocity: THREE.Vector3;
            }
          ).velocity = velocity;

          // Store rotation velocity - inherit the sphere's rotation momentum plus some variation
          const baseRotationSpeed = { x: 0.002, y: 0.004, z: 0 };
          (
            fragment as unknown as THREE.LineSegments & {
              rotationVelocity: THREE.Vector3;
            }
          ).rotationVelocity = new THREE.Vector3(
            baseRotationSpeed.x + (Math.random() - 0.5) * 0.002,
            baseRotationSpeed.y + (Math.random() - 0.5) * 0.002,
            baseRotationSpeed.z + (Math.random() - 0.5) * 0.003
          );

          sceneRef.current?.add(fragment);
          fragments.push(fragment);
        }
      }

      originalWireframe.dispose();
      originalGeometry.dispose();
      wireframeFragmentsRef.current = fragments;
      markFragmentGroupReady();
  };

  const createRedFragments = () => {
    if (!sceneRef.current || !redSphereRef.current) return;

      const fragments: THREE.LineSegments[] = [];
      const redGeometry = new THREE.SphereGeometry(1.2, 32, 32);
      const redWireframe = new THREE.WireframeGeometry(redGeometry);

      const positions = redWireframe.attributes.position.array;
      const fragmentCount = Math.floor(positions.length / 6);

      const totalFragments = 12; // Fewer fragments for inner sphere
      const usedIndices = new Set<number>();

      for (let fragIndex = 0; fragIndex < totalFragments; fragIndex++) {
        const fragmentGeometry = new THREE.BufferGeometry();
        const fragmentPositions = [];

        // Smaller fragment sizes for red sphere
        const fragmentSize = Math.floor(Math.random() * 30) + 10;

        for (
          let segCount = 0;
          segCount < fragmentSize && usedIndices.size < fragmentCount;
          segCount++
        ) {
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
                positions[startIdx],
                positions[startIdx + 1],
                positions[startIdx + 2],
                positions[startIdx + 3],
                positions[startIdx + 4],
                positions[startIdx + 5]
              );
            }
          }
        }

        if (fragmentPositions.length > 0) {
          fragmentGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(fragmentPositions, 3)
          );

          const material = new THREE.LineBasicMaterial({
            color: paletteColorsRef.current.warm,
            transparent: true,
            opacity: 0.4,
          });

          const fragment = new THREE.LineSegments(fragmentGeometry, material);
          fragment.scale.setScalar(targetSphereScaleRef.current);

          // Position fragments with slight offset from center
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const offset = 0.15;

          fragment.position.x = offset * Math.sin(phi) * Math.cos(theta);
          fragment.position.y = offset * Math.sin(phi) * Math.sin(theta);
          fragment.position.z = offset * Math.cos(phi);

          // Inherit rotation from the red sphere
          if (redSphereRef.current) {
            fragment.rotation.x = redSphereRef.current.rotation.x;
            fragment.rotation.y = redSphereRef.current.rotation.y;
            fragment.rotation.z = redSphereRef.current.rotation.z;
          }

          // Store velocity for slow movement outward
          const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.008,
            (Math.random() - 0.5) * 0.008,
            (Math.random() - 0.5) * 0.008
          );
          (
            fragment as unknown as THREE.LineSegments & {
              velocity: THREE.Vector3;
            }
          ).velocity = velocity;

          // Store rotation velocity
          const baseRotationSpeed = { x: 0.003, y: 0.001, z: 0.002 }; // Red sphere speeds
          (
            fragment as unknown as THREE.LineSegments & {
              rotationVelocity: THREE.Vector3;
            }
          ).rotationVelocity = new THREE.Vector3(
            baseRotationSpeed.x + (Math.random() - 0.5) * 0.002,
            baseRotationSpeed.y + (Math.random() - 0.5) * 0.002,
            baseRotationSpeed.z + (Math.random() - 0.5) * 0.002
          );

          sceneRef.current?.add(fragment);
          fragments.push(fragment);
        }
      }

      redWireframe.dispose();
      redGeometry.dispose();
      redFragmentsRef.current = fragments;
      markFragmentGroupReady();
  };

  useEffect(() => {
    // Check if container exists and store ref
    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer) {
      console.error("Canvas container ref is null");
      return;
    }

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

    // Add point light for that A.T. field glow
    const blueLight = new THREE.PointLight(
      paletteColorsRef.current.accent,
      0.5
    );
    blueLight.position.set(-2, 1, 3);
    scene.add(blueLight);
    blueLightRef.current = blueLight;

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(2, 32, 32);

    // Create wireframe geometry
    const wireframe = new THREE.WireframeGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: paletteColorsRef.current.accent,
      transparent: true,
      opacity: 0.4,
    });
    lineMaterialRef.current = lineMaterial;
    const wireframeMesh = new THREE.LineSegments(wireframe, lineMaterial);

    // Create red inner wireframe sphere
    const redSphereGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const redWireframe = new THREE.WireframeGeometry(redSphereGeometry);
    const redLineMaterial = new THREE.LineBasicMaterial({
      color: paletteColorsRef.current.warm,
      transparent: true,
      opacity: 0.3,
    });
    redLineMaterialRef.current = redLineMaterial;
    const redSphere = new THREE.LineSegments(redWireframe, redLineMaterial);
    redSphereRef.current = redSphere;

    // Create group to hold all elements
    const sphereGroup = new THREE.Group();
    sphereGroup.add(wireframeMesh);
    sphereGroup.add(redSphere);
    scene.add(sphereGroup);
    sphereGroupRef.current = sphereGroup;
    applyResponsiveSphereScale(width, height, camera);

    // Animation loop
    function animate() {
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      if (!scene || !camera || !renderer) {
        animationFrameRef.current = null;
        return;
      }

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

        // Vary wireframe opacity for glitch effect and flicker red sphere together
        if (Math.random() > 0.98) {
          lineMaterial.opacity = 0.1 + Math.random() * 0.5;

          // Flicker red sphere at the same time
          if (redSphereRef.current) {
            const redMaterial = redSphereRef.current
              .material as THREE.LineBasicMaterial;
            redMaterial.opacity = 0.1 + Math.random() * 0.4;
          }
        }
      }

      // Animate wireframe fragments slowly
      if (isShatteredRef.current && wireframeFragmentsRef.current.length > 0) {
        wireframeFragmentsRef.current.forEach((fragment) => {
          const velocity = (
            fragment as THREE.LineSegments & { velocity: THREE.Vector3 }
          ).velocity;
          const rotationVelocity = (
            fragment as THREE.LineSegments & { rotationVelocity: THREE.Vector3 }
          ).rotationVelocity;

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
        wireframeFragmentsRef.current = removeFinishedFragments(
          wireframeFragmentsRef.current
        );
      }

      // Animate red fragments slowly
      if (isShatteredRef.current && redFragmentsRef.current.length > 0) {
        redFragmentsRef.current.forEach((fragment) => {
          const velocity = (
            fragment as unknown as THREE.LineSegments & {
              velocity: THREE.Vector3;
            }
          ).velocity;
          const rotationVelocity = (
            fragment as unknown as THREE.LineSegments & {
              rotationVelocity: THREE.Vector3;
            }
          ).rotationVelocity;

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
          material.opacity *= 0.999; // Fade slightly slower than blue fragments
        });
        redFragmentsRef.current = removeFinishedFragments(
          redFragmentsRef.current
        );
      }

      if (
        isShatteredRef.current &&
        shatterRevealSentRef.current &&
        !shatterCompleteSentRef.current &&
        wireframeFragmentsRef.current.length === 0 &&
        redFragmentsRef.current.length === 0
      ) {
        shatterCompleteSentRef.current = true;
        onShatterCompleteRef.current?.();
      }

      renderer.render(scene, camera);
      animationFrameRef.current = window.requestAnimationFrame(animate);
    }

    // Initial render to make sure something shows up
    renderer.render(scene, camera);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const newWidth = containerRef.current.clientWidth || window.innerWidth;
      const newHeight = containerRef.current.clientHeight || window.innerHeight;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      applyResponsiveSphereScale(newWidth, newHeight, cameraRef.current);
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Start animation
    animationFrameRef.current = window.requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (shakeFrameRef.current !== null) {
        window.cancelAnimationFrame(shakeFrameRef.current);
        shakeFrameRef.current = null;
      }
      if (canvasContainer && rendererRef.current) {
        canvasContainer.removeChild(rendererRef.current.domElement);
      }
      scene.traverse(disposeObject);
      scene.clear();
      rendererRef.current?.dispose();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      sphereGroupRef.current = null;
      redSphereRef.current = null;
      wireframeFragmentsRef.current = [];
      redFragmentsRef.current = [];
      pendingFragmentGroupsRef.current = 0;
    };
  }, [applyResponsiveSphereScale]);

  return (
    <div
      id="sphere-container"
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center ${className}`}
    >
      {/* Canvas container sits behind desktop windows */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 z-0 pointer-events-none"
      />
    </div>
  );
  }
);

SphereAnimation.displayName = "SphereAnimation";

export default SphereAnimation;
