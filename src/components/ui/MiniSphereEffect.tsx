"use client";

import * as THREE from "three";

export interface MiniSphereEffectOptions {
  position?: THREE.Vector3;
  scale?: number;
}

export interface MiniSphereEffectEmitter {
  trigger: (options?: MiniSphereEffectOptions) => void;
  update: () => boolean;
  cleanup: () => void;
}

const getCurrentAccentColor = () => {
  if (typeof window === "undefined") {
    return new THREE.Color("#00ffff");
  }

  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue("--palette-accent")
    .trim();

  return new THREE.Color().setStyle(accent || "#00ffff");
};

export const createMiniSphereEffect = (scene: THREE.Scene): MiniSphereEffectEmitter => {
  const activeFragments: THREE.LineSegments[] = [];

  const disposeFragment = (fragment: THREE.LineSegments) => {
    fragment.geometry.dispose();
    if (Array.isArray(fragment.material)) {
      fragment.material.forEach((material) => material.dispose());
    } else {
      fragment.material.dispose();
    }
  };

  const trigger = (options: MiniSphereEffectOptions = {}) => {
    const {
      position = new THREE.Vector3(0, 0, 0),
      scale = 0.2,
    } = options;
    const accentColor = getCurrentAccentColor();

    // Create fragments using same logic as original sphere
    const fragments: THREE.LineSegments[] = [];
    const originalGeometry = new THREE.SphereGeometry(scale, 16, 16);
    const originalWireframe = new THREE.WireframeGeometry(originalGeometry);
    
    // Get the line segments from the original wireframe
    const positions = originalWireframe.attributes.position.array;
    const fragmentCount = Math.floor(positions.length / 6);
    const totalFragments = 8;
    const usedIndices = new Set<number>();

    for (let fragIndex = 0; fragIndex < totalFragments; fragIndex++) {
      const fragmentGeometry = new THREE.BufferGeometry();
      const fragmentPositions = [];

      // Create varied fragment sizes like original
      const fragmentSize = Math.floor(Math.random() * 15) + 5;

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
          color: accentColor,
          transparent: true,
          opacity: 0, // Start invisible for fade-in
        });

        const fragment = new THREE.LineSegments(fragmentGeometry, material);
        fragment.position.copy(position);

        // Uniform outward velocity (no gravity)
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const velocity = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * 0.01,
          Math.sin(phi) * Math.sin(theta) * 0.01,
          Math.cos(phi) * 0.01
        );

        const rotationVelocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        );

        (fragment as unknown as { velocity: THREE.Vector3; rotationVelocity: THREE.Vector3; age: number }).velocity = velocity;
        (fragment as unknown as { velocity: THREE.Vector3; rotationVelocity: THREE.Vector3; age: number }).rotationVelocity = rotationVelocity;
        (fragment as unknown as { velocity: THREE.Vector3; rotationVelocity: THREE.Vector3; age: number }).age = 0;

        scene.add(fragment);
        fragments.push(fragment);
        activeFragments.push(fragment);
      }
    }
  };

  const update = () => {
    for (let index = activeFragments.length - 1; index >= 0; index--) {
      const fragment = activeFragments[index];
      if (!fragment.parent) {
        activeFragments.splice(index, 1);
        disposeFragment(fragment);
        continue;
      }

      const fragmentState = fragment as unknown as {
        velocity: THREE.Vector3;
        rotationVelocity: THREE.Vector3;
        age: number;
      };
      const material = fragment.material as THREE.LineBasicMaterial;

      fragmentState.age += 1;

      // Fade in during first 10 frames
      if (fragmentState.age < 10) {
        material.opacity = (fragmentState.age / 10) * 0.8;
      } else if (fragmentState.age > 40) {
        // Fade out after 40 frames
        material.opacity *= 0.98;
      }

      // Apply constant velocity (no gravity)
      fragment.position.add(fragmentState.velocity);
      fragment.rotation.x += fragmentState.rotationVelocity.x;
      fragment.rotation.y += fragmentState.rotationVelocity.y;
      fragment.rotation.z += fragmentState.rotationVelocity.z;

      if (material.opacity < 0.01) {
        scene.remove(fragment);
        activeFragments.splice(index, 1);
        disposeFragment(fragment);
      }
    }

    return activeFragments.length > 0;
  };

  const cleanup = () => {
    activeFragments.forEach(fragment => {
      scene.remove(fragment);
      disposeFragment(fragment);
    });
    activeFragments.length = 0;
  };

  return { trigger, update, cleanup };
};
