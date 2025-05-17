"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize 3D scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xff4800, 0.8);
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

      if (sphereGroupRef.current) {
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

      renderer.render(scene, camera);
    }

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      scene.clear();
    };
  }, []);

  return (
    <div id="app">
      <header className="overflow-hidden whitespace-nowrap overflow-ellipsis">
        <div className="logo">JMILL</div>
        <div className="status">SYSTEM STATUS: NORMAL</div>
        <div className="time">T-MINUS 24:15:37</div>
      </header>

      <main>
        <div id="sphere-container" ref={containerRef}>
          <div className="target-overlay">
            <div className="target-circle">
              <div className="target-ring"></div>
              <div className="target-ring"></div>
              <div className="target-ring"></div>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="command-line">
          <span className="command-prompt">CMD&gt;</span>
          <input
            type="text"
            className="command-input"
            placeholder="ENTER COMMAND"
            defaultValue="ANALYZE SPHERE COMPOSITION"
          />
        </div>
      </footer>
    </div>
  );
}
