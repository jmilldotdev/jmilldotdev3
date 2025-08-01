"use client";

import * as THREE from "three";

export interface SphereShatterOptions {
  position?: THREE.Vector3;
  scale?: number;
  wireframeColor?: number;
  innerColor?: number;
  wireframeOpacity?: number;
  innerOpacity?: number;
  fragmentCount?: number;
  innerFragmentCount?: number;
  velocity?: number;
  innerVelocity?: number;
  fadeSpeed?: number;
  innerFadeSpeed?: number;
  shakeIntensity?: number;
  pulseIntensity?: number;
  shakeDuration?: number;
}

export interface SphereShatterEmitter {
  trigger: (options?: SphereShatterOptions) => void;
  cleanup: () => void;
}

// Hook version for use in React components
export const useSphereShatter = (scene: THREE.Scene | null): SphereShatterEmitter => {
  if (!scene) {
    return {
      trigger: () => {},
      cleanup: () => {},
    };
  }
  return createSphereShatterEmitter(scene);
};

export const createSphereShatterEmitter = (scene: THREE.Scene): SphereShatterEmitter => {
  const activeFragments: THREE.LineSegments[] = [];

  const trigger = (options: SphereShatterOptions = {}) => {
    if (!scene) return;

    const {
      position = new THREE.Vector3(0, 0, 0),
      scale = 1,
      wireframeColor = 0x00ffff,
      innerColor = 0xff4800,
      wireframeOpacity = 0.7,
      innerOpacity = 0.4,
      fragmentCount = 16,
      innerFragmentCount = 12,
      velocity = 0.01,
      innerVelocity = 0.008,
      fadeSpeed = 0.998,
      innerFadeSpeed = 0.999,
      shakeIntensity = 0.005,
      pulseIntensity = 0.005,
      shakeDuration = 400,
    } = options;

    // Create temporary sphere group for the effect
    const sphereGroup = new THREE.Group();
    sphereGroup.position.copy(position);
    sphereGroup.scale.setScalar(scale);

    // Create outer wireframe sphere
    const outerGeometry = new THREE.SphereGeometry(2, 32, 32);
    const outerWireframe = new THREE.WireframeGeometry(outerGeometry);
    const outerMaterial = new THREE.LineBasicMaterial({
      color: wireframeColor,
      transparent: true,
      opacity: wireframeOpacity,
    });
    const outerSphere = new THREE.LineSegments(outerWireframe, outerMaterial);

    // Create inner wireframe sphere
    const innerGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const innerWireframe = new THREE.WireframeGeometry(innerGeometry);
    const innerMaterial = new THREE.LineBasicMaterial({
      color: innerColor,
      transparent: true,
      opacity: innerOpacity,
    });
    const innerSphere = new THREE.LineSegments(innerWireframe, innerMaterial);

    sphereGroup.add(outerSphere);
    sphereGroup.add(innerSphere);
    scene.add(sphereGroup);

    // Shake effect
    const startTime = Date.now();
    const shakeEffect = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / shakeDuration, 1);

      if (progress < 1) {
        const shakeFreq = 8;
        const shake = shakeIntensity * progress;
        sphereGroup.position.x = position.x + Math.sin(elapsed * shakeFreq * 0.01) * shake;
        sphereGroup.position.y = position.y + Math.cos(elapsed * shakeFreq * 0.013) * shake;
        sphereGroup.position.z = position.z + Math.sin(elapsed * shakeFreq * 0.007) * shake;

        const pulseSpeed = 10 + progress * 15;
        const pulse = 1 + Math.sin(elapsed * pulseSpeed * 0.01) * pulseIntensity * progress;
        sphereGroup.scale.setScalar(scale * pulse);

        const rotationMultiplier = 1 + progress * 2;
        sphereGroup.rotation.x += 0.002 * rotationMultiplier;
        sphereGroup.rotation.y += 0.004 * rotationMultiplier;

        requestAnimationFrame(shakeEffect);
      } else {
        sphereGroup.position.copy(position);
        sphereGroup.scale.setScalar(scale);
        sphereGroup.visible = false;
      }
    };

    shakeEffect();

    // Create fragments after shake
    setTimeout(() => {
      // Create outer wireframe fragments
      const outerFragments = createWireframeFragments(
        outerWireframe,
        wireframeColor,
        wireframeOpacity,
        fragmentCount,
        velocity,
        fadeSpeed,
        sphereGroup,
        0.2
      );

      // Create inner wireframe fragments
      const innerFragments = createWireframeFragments(
        innerWireframe,
        innerColor,
        innerOpacity,
        innerFragmentCount,
        innerVelocity,
        innerFadeSpeed,
        sphereGroup,
        0.15
      );

      // Add all fragments to scene and tracking
      [...outerFragments, ...innerFragments].forEach(fragment => {
        scene.add(fragment);
        activeFragments.push(fragment);
      });

      // Remove the original spheres
      scene.remove(sphereGroup);

      // Animate fragments
      const animateFragments = () => {
        const remainingFragments = activeFragments.filter(fragment => {
          if (!fragment.parent) return false;

          const velocity = (fragment as any).velocity as THREE.Vector3;
          const rotationVelocity = (fragment as any).rotationVelocity as THREE.Vector3;
          const fragmentFadeSpeed = (fragment as any).fadeSpeed as number;

          fragment.position.add(velocity);
          fragment.rotation.x += rotationVelocity.x;
          fragment.rotation.y += rotationVelocity.y;
          fragment.rotation.z += rotationVelocity.z;

          const material = fragment.material as THREE.LineBasicMaterial;
          material.opacity *= fragmentFadeSpeed;

          // Remove fragment when nearly invisible
          if (material.opacity < 0.01) {
            scene.remove(fragment);
            const index = activeFragments.indexOf(fragment);
            if (index > -1) {
              activeFragments.splice(index, 1);
            }
            return false;
          }

          return true;
        });

        if (remainingFragments.length > 0) {
          requestAnimationFrame(animateFragments);
        }
      };

      animateFragments();
    }, shakeDuration);
  };

  const cleanup = () => {
    if (scene) {
      activeFragments.forEach(fragment => {
        scene.remove(fragment);
      });
    }
    activeFragments.length = 0;
  };

  return { trigger, cleanup };
};

function createWireframeFragments(
  wireframeGeometry: THREE.WireframeGeometry,
  color: number,
  opacity: number,
  fragmentCount: number,
  velocityScale: number,
  fadeSpeed: number,
  sphereGroup: THREE.Group,
  offsetScale: number
): THREE.LineSegments[] {
  const fragments: THREE.LineSegments[] = [];
  const positions = wireframeGeometry.attributes.position.array;
  const totalSegments = Math.floor(positions.length / 6);
  const usedIndices = new Set<number>();

  for (let fragIndex = 0; fragIndex < fragmentCount; fragIndex++) {
    const fragmentGeometry = new THREE.BufferGeometry();
    const fragmentPositions = [];

    const fragmentType = Math.floor(Math.random() * 4);
    let fragmentSize: number;

    switch (fragmentType) {
      case 0:
        fragmentSize = Math.floor(Math.random() * 15) + 5;
        break;
      case 1:
        fragmentSize = Math.floor(Math.random() * 30) + 20;
        break;
      case 2:
        fragmentSize = Math.floor(Math.random() * 80) + 60;
        break;
      case 3:
        fragmentSize = Math.floor(Math.random() * 20) + 10;
        break;
      default:
        fragmentSize = Math.floor(Math.random() * 25) + 15;
    }

    if (fragmentType === 3) {
      // Create strip fragments
      const seedIndex = Math.floor(Math.random() * totalSegments);
      if (!usedIndices.has(seedIndex)) {
        const seedStartIdx = seedIndex * 6;
        const seedX = positions[seedStartIdx];
        const seedY = positions[seedStartIdx + 1];
        const seedZ = positions[seedStartIdx + 2];

        const nearbyIndices = [];
        for (let i = 0; i < totalSegments; i++) {
          if (usedIndices.has(i)) continue;

          const startIdx = i * 6;
          const x = positions[startIdx];
          const y = positions[startIdx + 1];
          const z = positions[startIdx + 2];

          const distance = Math.sqrt(
            (x - seedX) ** 2 + (y - seedY) ** 2 + (z - seedZ) ** 2
          );
          if (distance < 0.8) {
            nearbyIndices.push(i);
          }
        }

        const stripSegments = nearbyIndices.slice(0, Math.min(fragmentSize, nearbyIndices.length));
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
      // Random fragment selection
      for (let segCount = 0; segCount < fragmentSize && usedIndices.size < totalSegments; segCount++) {
        let randomIndex: number;
        let attempts = 0;

        do {
          randomIndex = Math.floor(Math.random() * totalSegments);
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
        color,
        transparent: true,
        opacity,
      });

      const fragment = new THREE.LineSegments(fragmentGeometry, material);

      // Position with offset
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      fragment.position.x = offsetScale * Math.sin(phi) * Math.cos(theta);
      fragment.position.y = offsetScale * Math.sin(phi) * Math.sin(theta);
      fragment.position.z = offsetScale * Math.cos(phi);

      // Copy rotation from sphere group
      fragment.rotation.copy(sphereGroup.rotation);

      // Add velocity and rotation velocity
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * velocityScale,
        (Math.random() - 0.5) * velocityScale,
        (Math.random() - 0.5) * velocityScale
      );

      const rotationVelocity = new THREE.Vector3(
        0.002 + (Math.random() - 0.5) * 0.002,
        0.004 + (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.003
      );

      (fragment as any).velocity = velocity;
      (fragment as any).rotationVelocity = rotationVelocity;
      (fragment as any).fadeSpeed = fadeSpeed;

      fragments.push(fragment);
    }
  }

  return fragments;
}