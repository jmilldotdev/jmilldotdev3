"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Rgb = [number, number, number];
type BlobSeed = [number, number, number, number];
type BlobMotion = { x: number; y: number; vx: number; vy: number };
type DiffusionDeposit = {
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  intensity: number;
  settleIntensity: number;
};
type InteractionWave = {
  x: number;
  y: number;
  bornAt: number;
  sign: number;
};

interface PerfStats {
  fps: number;
  frameMs: number;
  renderWidth: number;
  renderHeight: number;
  lightScale: number;
}

interface StarSeed {
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
  tone: "accent" | "warm" | "muted";
}

interface StarExclusionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DesktopLavaLampProps {
  starExclusionRects?: StarExclusionRect[];
}

const STAR_COUNT = 34;
const BLOB_COUNT = 7;
const DEPOSIT_COUNT = 4;
const RENDER_QUALITY = 0.48;

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec2 v_uv;

uniform float u_time;
uniform float u_aspect;
uniform float u_lightScale;
uniform vec2 u_cursor;
uniform vec2 u_cursorPrev;
uniform float u_cursorEnergy;
uniform vec3 u_accent;
uniform vec3 u_warm;
uniform vec4 u_blob0;
uniform vec4 u_blob1;
uniform vec4 u_blob2;
uniform vec4 u_blob3;
uniform vec4 u_blob4;
uniform vec4 u_blob5;
uniform vec4 u_blob6;
uniform vec2 u_offset0;
uniform vec2 u_offset1;
uniform vec2 u_offset2;
uniform vec2 u_offset3;
uniform vec2 u_offset4;
uniform vec2 u_offset5;
uniform vec2 u_offset6;
uniform vec4 u_deposit0;
uniform vec4 u_deposit1;
uniform vec4 u_deposit2;
uniform vec4 u_deposit3;
uniform vec4 u_wave0;
uniform vec4 u_wave1;
uniform vec4 u_wave2;
uniform vec4 u_wave3;

vec2 aspectVec(vec2 p) {
  p.x *= u_aspect;
  return p;
}

vec2 drift(vec4 seed, float index, float time) {
  float speed = 0.014 + seed.z * 0.02;
  float phase = seed.x * 8.3 + seed.y * 5.7 + index * 1.91;
  return vec2(
    seed.x + sin(time * speed + phase) * (0.09 + seed.w * 0.04) + sin(time * speed * 1.7 + phase * 0.61) * 0.035,
    seed.y + cos(time * speed * 0.83 + phase) * (0.08 + seed.w * 0.035) + cos(time * speed * 1.5 + phase * 1.19) * 0.03
  );
}

float softBlob(vec2 uv, vec2 center, float radius) {
  vec2 d = aspectVec(uv - center);
  return exp(-dot(d, d) / max(radius * radius, 0.001));
}

float lineDistance(vec2 p, vec2 a, vec2 b) {
  vec2 pa = aspectVec(p - a);
  vec2 ba = aspectVec(b - a);
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
  return length(pa - ba * h);
}

float ring(float dist, float radius, float width) {
  float x = (dist - radius) / width;
  return exp(-x * x);
}

float waves(vec2 uv, float time) {
  vec2 p = aspectVec(uv - 0.5);
  float w1 = sin(dot(p, vec2(2.0, 1.2)) * 5.2 + time * 0.16);
  float w2 = sin(dot(p, vec2(-1.1, 2.4)) * 4.8 - time * 0.13);
  float w3 = sin((p.x * p.y) * 9.0 + time * 0.11);
  return (w1 + w2 + w3) / 3.0;
}

float interactionShell(vec2 uv, vec4 wave) {
  float dist = length(aspectVec(uv - wave.xy));
  return ring(dist, wave.z, 0.024) * wave.w;
}

vec2 interactionPush(vec2 uv, vec4 wave) {
  vec2 delta = uv - wave.xy;
  float dist = length(aspectVec(delta));
  float shell = ring(dist, wave.z, 0.03) * wave.w;
  return dist > 0.001 ? delta / dist * shell : vec2(0.0);
}

void main() {
  vec2 uv = v_uv;
  float time = u_time;
  float intro = clamp(time / 2.35, 0.0, 1.0);

  float wakeDist = lineDistance(uv, u_cursorPrev, u_cursor);
  float wake = exp(-(wakeDist * wakeDist) / 0.005) * u_cursorEnergy * 0.24;
  vec2 cursorDelta = aspectVec(uv - u_cursor);
  float cursorDist = length(cursorDelta);
  float cursorPush = exp(-(cursorDist * cursorDist) / 0.034) * u_cursorEnergy * 0.22;
  vec2 cursorDir = cursorDist > 0.001 ? cursorDelta / cursorDist : vec2(0.0);

  uv += cursorDir * cursorPush * 0.012;
  uv += vec2(
    sin(time * 0.18 + uv.y * 4.0),
    cos(time * 0.15 + uv.x * 3.6)
  ) * wake * 0.012;

  float wave0 = interactionShell(uv, u_wave0);
  float wave1 = interactionShell(uv, u_wave1);
  float wave2 = interactionShell(uv, u_wave2);
  float wave3 = interactionShell(uv, u_wave3);
  float waveField = wave0 + wave1 + wave2 + wave3;
  uv += (
    interactionPush(uv, u_wave0) +
    interactionPush(uv, u_wave1) +
    interactionPush(uv, u_wave2) +
    interactionPush(uv, u_wave3)
  ) * 0.006;

  vec2 c0 = drift(u_blob0, 0.0, time) + u_offset0;
  vec2 c1 = drift(u_blob1, 1.0, time) + u_offset1;
  vec2 c2 = drift(u_blob2, 2.0, time) + u_offset2;
  vec2 c3 = drift(u_blob3, 3.0, time) + u_offset3;
  vec2 c4 = drift(u_blob4, 4.0, time) + u_offset4;
  vec2 c5 = drift(u_blob5, 5.0, time) + u_offset5;
  vec2 c6 = drift(u_blob6, 6.0, time) + u_offset6;

  float a0 = softBlob(uv, c0, u_blob0.z);
  float a1 = softBlob(uv, c1, u_blob1.z);
  float a2 = softBlob(uv, c2, u_blob2.z);
  float a3 = softBlob(uv, c3, u_blob3.z);
  float a4 = softBlob(uv, c4, u_blob4.z);
  float a5 = softBlob(uv, c5, u_blob5.z);
  float a6 = softBlob(uv, c6, u_blob6.z);

  float accentField = a0 * 0.47 + a2 * 0.42 + a4 * 0.36 + a6 * 0.35;
  float warmField = a1 * 0.39 + a3 * 0.34 + a5 * 0.31;
  float flow = waves(uv, time);
  float field = accentField + warmField + flow * 0.12;
  float depositField =
    softBlob(uv, u_deposit0.xy, u_deposit0.z) * u_deposit0.w +
    softBlob(uv, u_deposit1.xy, u_deposit1.z) * u_deposit1.w +
    softBlob(uv, u_deposit2.xy, u_deposit2.z) * u_deposit2.w +
    softBlob(uv, u_deposit3.xy, u_deposit3.z) * u_deposit3.w;
  field += depositField * u_lightScale + waveField * 0.34 * u_lightScale;

  vec2 fromCenter = aspectVec(uv - vec2(0.5, 0.5));
  float centerDist = length(fromCenter);
  float shock = ring(centerDist, intro * 0.92, 0.04) * (1.0 - intro);
  float fracturePath = ring(abs(fromCenter.y + sin(fromCenter.x * 9.0 + time * 0.18) * 0.07), 0.0, 0.035) * (1.0 - intro);
  field += shock * 0.56 + fracturePath * 0.18;

  float diffusion = smoothstep(0.34, 0.98, field);
  diffusion += smoothstep(0.58, 1.18, field + flow * 0.08) * 0.18;
  diffusion = clamp(diffusion, 0.0, 1.0);
  diffusion = max(
    diffusion,
    smoothstep(0.18, 0.86, accentField + warmField) * 0.1 * u_lightScale
  );
  diffusion *= mix(0.68, 1.0, u_lightScale);

  float cut = wake * 0.5;
  diffusion *= 1.0 - cut;

  float warmMix = clamp(warmField / max(accentField + warmField, 0.001), 0.0, 1.0);
  vec3 light = mix(u_accent, u_warm, warmMix);
  vec3 color = light * diffusion * 0.26 * u_lightScale;
  color += u_accent * shock * 0.12;
  color += mix(u_accent, u_warm, 0.38) * max(waveField, 0.0) * 0.07;

  float alpha = clamp(
    diffusion * 0.24 * u_lightScale + shock * 0.08 + max(waveField, 0.0) * 0.035 * u_lightScale,
    0.0,
    0.38
  );
  gl_FragColor = vec4(color, alpha);
}
`;

const compileShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
) => {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

const createProgram = (gl: WebGLRenderingContext) => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
};

const parseColor = (value: unknown, fallback: Rgb): Rgb => {
  if (typeof value !== "string") {
    return fallback;
  }

  const color = value.trim();

  if (color.startsWith("#")) {
    const raw = color.slice(1);
    const expanded =
      raw.length === 3
        ? raw
            .split("")
            .map((part) => part + part)
            .join("")
        : raw;
    const parsed = Number.parseInt(expanded.slice(0, 6), 16);
    if (Number.isFinite(parsed)) {
      return [
        ((parsed >> 16) & 255) / 255,
        ((parsed >> 8) & 255) / 255,
        (parsed & 255) / 255,
      ];
    }
  }

  const rgbMatch = color.match(/rgba?\(([^)]+)\)/);
  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(",")
      .map((part) => Number.parseFloat(part));
    if (parts.length >= 3 && parts.every((part) => Number.isFinite(part))) {
      return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
    }
  }

  return fallback;
};

const getPaletteColors = (element: HTMLElement) => {
  const style = getComputedStyle(element);

  return {
    accent: parseColor(style.getPropertyValue("--palette-accent"), [0, 1, 1]),
    warm: parseColor(style.getPropertyValue("--palette-warm"), [1, 0.28, 0]),
  };
};

const getBlobCenter = (seed: BlobSeed, index: number, time: number) => {
  const speed = 0.014 + seed[2] * 0.02;
  const phase = seed[0] * 8.3 + seed[1] * 5.7 + index * 1.91;

  return {
    x:
      seed[0] +
      Math.sin(time * speed + phase) * (0.09 + seed[3] * 0.04) +
      Math.sin(time * speed * 1.7 + phase * 0.61) * 0.035,
    y:
      seed[1] +
      Math.cos(time * speed * 0.83 + phase) * (0.08 + seed[3] * 0.035) +
      Math.cos(time * speed * 1.5 + phase * 1.19) * 0.03,
  };
};

const estimateFieldAt = (
  x: number,
  y: number,
  time: number,
  aspect: number,
  seeds: BlobSeed[],
  motions: BlobMotion[]
) => {
  const weights = [0.47, 0.39, 0.42, 0.34, 0.36, 0.31, 0.35];

  return seeds.reduce((total, seed, index) => {
    const center = getBlobCenter(seed, index, time);
    const motion = motions[index];
    const dx = (x - center.x - motion.x) * aspect;
    const dy = y - center.y - motion.y;
    const blob = Math.exp(
      -(dx * dx + dy * dy) / Math.max(seed[2] * seed[2], 0.001)
    );

    return total + blob * weights[index];
  }, 0);
};

const createBlobMotions = (): BlobMotion[] =>
  Array.from({ length: BLOB_COUNT }, () => ({ x: 0, y: 0, vx: 0, vy: 0 }));

const createDiffusionDeposits = (): DiffusionDeposit[] =>
  Array.from({ length: DEPOSIT_COUNT }, () => ({
    x: 0.5,
    y: 0.5,
    radius: 0.01,
    targetRadius: 0.01,
    intensity: 0,
    settleIntensity: 0,
  }));

const createInteractionWaves = (): InteractionWave[] =>
  Array.from({ length: DEPOSIT_COUNT }, () => ({
    x: 0.5,
    y: 0.5,
    bornAt: -10,
    sign: 0,
  }));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const createBlobSeeds = (): BlobSeed[] =>
  [
    [0.18, 0.22],
    [0.45, 0.18],
    [0.76, 0.27],
    [0.23, 0.55],
    [0.62, 0.5],
    [0.84, 0.7],
    [0.42, 0.82],
  ].map(([anchorX, anchorY]) => {
    const jitterX = (Math.random() - 0.5) * 0.12;
    const jitterY = (Math.random() - 0.5) * 0.12;

    return [
      Math.max(0.08, Math.min(0.92, anchorX + jitterX)),
      Math.max(0.08, Math.min(0.92, anchorY + jitterY)),
      0.3 + Math.random() * 0.16,
      Math.random(),
    ] as BlobSeed;
  });

const createStarSeeds = (): StarSeed[] =>
  Array.from({ length: STAR_COUNT }, () => {
    const toneRoll = Math.random();

    return {
      x: 5 + Math.random() * 90,
      y: 7 + Math.random() * 86,
      size: 3 + Math.random() * 7,
      opacity: 0.2 + Math.random() * 0.5,
      delay: Math.random() * -8,
      duration: 4.5 + Math.random() * 7,
      tone: toneRoll > 0.84 ? "warm" : toneRoll > 0.68 ? "muted" : "accent",
    };
  });

const getStarStyle = (star: StarSeed): CSSProperties =>
  ({
    left: `${star.x}%`,
    top: `${star.y}%`,
    width: `${star.size}px`,
    height: `${star.size}px`,
    "--star-opacity": star.opacity.toFixed(3),
    "--star-delay": `${star.delay.toFixed(2)}s`,
    "--star-duration": `${star.duration.toFixed(2)}s`,
  }) as CSSProperties;

const isStarExcluded = (
  star: StarSeed,
  rects: StarExclusionRect[],
  containerSize: { width: number; height: number }
) => {
  if (containerSize.width <= 0 || containerSize.height <= 0) return false;

  const starX = (star.x / 100) * containerSize.width;
  const starY = (star.y / 100) * containerSize.height;
  const padding = 18;

  return rects.some(
    (rect) =>
      starX >= rect.x - padding &&
      starX <= rect.x + rect.width + padding &&
      starY >= rect.y - padding &&
      starY <= rect.y + rect.height + padding
  );
};

export function DesktopLavaLamp({
  starExclusionRects = [],
}: DesktopLavaLampProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef({
    x: 0.5,
    y: 0.5,
    previousX: 0.5,
    previousY: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    energy: 0,
    targetEnergy: 0,
    dragX: 0,
    dragY: 0,
    sweepX: 0,
    sweepY: 0,
    lastX: 0.5,
    lastY: 0.5,
    hasPointer: false,
  });
  const renderStateRef = useRef({
    aspect: 1,
    time: 0,
  });
  const seedsRef = useRef(createBlobSeeds());
  const motionsRef = useRef(createBlobMotions());
  const depositsRef = useRef(createDiffusionDeposits());
  const wavesRef = useRef(createInteractionWaves());
  const nextDepositRef = useRef(0);
  const paletteRef = useRef({
    accent: [0, 1, 1] as Rgb,
    warm: [1, 0.28, 0] as Rgb,
  });
  const [stars, setStars] = useState<StarSeed[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [showPerf, setShowPerf] = useState(false);
  const showPerfRef = useRef(false);
  const [perfStats, setPerfStats] = useState<PerfStats>({
    fps: 0,
    frameMs: 0,
    renderWidth: 0,
    renderHeight: 0,
    lightScale: 0,
  });

  useEffect(() => {
    setStars(createStarSeeds());
    const perfEnabled =
      process.env.NODE_ENV === "development" &&
      new URLSearchParams(window.location.search).has("perf");
    showPerfRef.current = perfEnabled;
    setShowPerf(perfEnabled);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });

    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const uniforms = {
      time: gl.getUniformLocation(program, "u_time"),
      aspect: gl.getUniformLocation(program, "u_aspect"),
      lightScale: gl.getUniformLocation(program, "u_lightScale"),
      cursor: gl.getUniformLocation(program, "u_cursor"),
      cursorPrev: gl.getUniformLocation(program, "u_cursorPrev"),
      cursorEnergy: gl.getUniformLocation(program, "u_cursorEnergy"),
      accent: gl.getUniformLocation(program, "u_accent"),
      warm: gl.getUniformLocation(program, "u_warm"),
      blobSeeds: Array.from({ length: BLOB_COUNT }, (_, index) =>
        gl.getUniformLocation(program, `u_blob${index}`)
      ),
      blobOffsets: Array.from({ length: BLOB_COUNT }, (_, index) =>
        gl.getUniformLocation(program, `u_offset${index}`)
      ),
      deposits: Array.from({ length: DEPOSIT_COUNT }, (_, index) =>
        gl.getUniformLocation(program, `u_deposit${index}`)
      ),
      waves: Array.from({ length: DEPOSIT_COUNT }, (_, index) =>
        gl.getUniformLocation(program, `u_wave${index}`)
      ),
    };

    let renderWidth = 0;
    let renderHeight = 0;
    let containerWidth = 0;
    let lastPerfUpdate = performance.now();
    let frameCount = 0;
    let frameTimeSum = 0;

    paletteRef.current = getPaletteColors(container);
    const paletteTimer = window.setInterval(() => {
      paletteRef.current = getPaletteColors(container);
    }, 500);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      containerWidth = rect.width;
      const width = Math.max(2, Math.floor(rect.width * RENDER_QUALITY));
      const height = Math.max(2, Math.floor(rect.height * RENDER_QUALITY));
      setContainerSize((current) =>
        current.width === rect.width && current.height === rect.height
          ? current
          : { width: rect.width, height: rect.height }
      );

      if (width !== renderWidth || height !== renderHeight) {
        renderWidth = width;
        renderHeight = height;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      const pointer = pointerRef.current;

      if (pointer.hasPointer) {
        const dx = x - pointer.lastX;
        const dy = y - pointer.lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const clampedDistance = Math.min(distance, 0.012);
        const scale = distance > 0 ? clampedDistance / distance : 0;
        pointer.dragX += dx * scale;
        pointer.dragY += dy * scale;
        pointer.targetEnergy = Math.min(
          0.22,
          Math.max(pointer.targetEnergy, clampedDistance * 4.2)
        );
      }

      pointer.targetX = Math.max(0, Math.min(1, x));
      pointer.targetY = Math.max(0, Math.min(1, y));
      pointer.lastX = pointer.targetX;
      pointer.lastY = pointer.targetY;
      pointer.hasPointer = true;
    };

    const handlePointerDown = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width)
      );
      const y = Math.max(
        0,
        Math.min(1, 1 - (event.clientY - rect.top) / rect.height)
      );
      const field = estimateFieldAt(
        x,
        y,
        renderStateRef.current.time,
        renderStateRef.current.aspect,
        seedsRef.current,
        motionsRef.current
      );
      const clickSign = field > 0.9 ? -1 : 1;
      const depositIndex = nextDepositRef.current;
      nextDepositRef.current = (nextDepositRef.current + 1) % DEPOSIT_COUNT;
      depositsRef.current[depositIndex] = {
        x,
        y,
        radius: clickSign > 0 ? 0.025 : 0.035,
        targetRadius: clickSign > 0 ? 0.34 : 0.22,
        intensity: 0,
        settleIntensity: clickSign > 0 ? 0.32 : -0.08,
      };
      wavesRef.current[depositIndex] = {
        x,
        y,
        bornAt: renderStateRef.current.time,
        sign: clickSign,
      };

      motionsRef.current.forEach((motion, index) => {
        const center = getBlobCenter(
          seedsRef.current[index],
          index,
          renderStateRef.current.time
        );
        const dx = x - center.x - motion.x;
        const dy = y - center.y - motion.y;
        const distSq =
          dx * dx * renderStateRef.current.aspect * renderStateRef.current.aspect +
          dy * dy;
        const influence = Math.exp(-distSq / 0.09);

        const clickMotion = clickSign > 0 ? 0.016 : 0.004;
        motion.vx += dx * clickSign * influence * clickMotion;
        motion.vy += dy * clickSign * influence * clickMotion;
      });

      pointerRef.current.targetEnergy = Math.min(
        0.28,
        pointerRef.current.targetEnergy + 0.06
      );
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    const draw = (now: number) => {
      const frameStart = performance.now();
      const pointer = pointerRef.current;
      const palette = paletteRef.current;
      const time = now * 0.001;
      const aspect = renderWidth / Math.max(1, renderHeight);
      const lightScale = Math.max(
        0.38,
        Math.min(1, (containerWidth - 360) / 760)
      );

      pointer.previousX = pointer.x;
      pointer.previousY = pointer.y;
      pointer.x += (pointer.targetX - pointer.x) * 0.007;
      pointer.y += (pointer.targetY - pointer.y) * 0.007;
      pointer.energy += (pointer.targetEnergy - pointer.energy) * 0.025;
      pointer.targetEnergy *= 0.965;
      renderStateRef.current.time = time;
      renderStateRef.current.aspect = aspect;

      pointer.sweepX += (pointer.dragX - pointer.sweepX) * 0.018;
      pointer.sweepY += (pointer.dragY - pointer.sweepY) * 0.018;
      pointer.dragX *= 0.9;
      pointer.dragY *= 0.9;
      const dragX = pointer.sweepX;
      const dragY = pointer.sweepY;
      const dragSpeed = Math.min(
        0.008,
        Math.sqrt(dragX * dragX + dragY * dragY)
      );

      motionsRef.current.forEach((motion, index) => {
        const center = getBlobCenter(seedsRef.current[index], index, time);
        const blobX = center.x + motion.x;
        const blobY = center.y + motion.y;
        const dx = blobX - pointer.x;
        const dy = blobY - pointer.y;
        const distSq = dx * dx * aspect * aspect + dy * dy;
        const influence = Math.exp(-distSq / 0.11);

        if (dragSpeed > 0.0001) {
          motion.vx += dragX * influence * 0.075 + dx * influence * dragSpeed * 0.005;
          motion.vy += dragY * influence * 0.075 + dy * influence * dragSpeed * 0.005;
        }

        motion.x += motion.vx;
        motion.y += motion.vy;
        motion.vx *= 0.9;
        motion.vy *= 0.9;

        const offsetLength = Math.sqrt(motion.x * motion.x + motion.y * motion.y);
        const maxOffset = 0.052;
        if (offsetLength > maxOffset) {
          const scale = maxOffset / offsetLength;
          motion.x *= scale;
          motion.y *= scale;
          motion.vx *= 0.6;
          motion.vy *= 0.6;
        }
      });

      depositsRef.current.forEach((deposit) => {
        deposit.radius += (deposit.targetRadius - deposit.radius) * 0.006;
        deposit.intensity +=
          (deposit.settleIntensity - deposit.intensity) * 0.006;
      });

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uniforms.time, time);
      gl.uniform1f(uniforms.aspect, aspect);
      gl.uniform1f(uniforms.lightScale, lightScale);
      gl.uniform2f(uniforms.cursor, pointer.x, pointer.y);
      gl.uniform2f(uniforms.cursorPrev, pointer.previousX, pointer.previousY);
      gl.uniform1f(uniforms.cursorEnergy, pointer.energy);
      gl.uniform3fv(uniforms.accent, palette.accent);
      gl.uniform3fv(uniforms.warm, palette.warm);

      seedsRef.current.forEach((seed, index) => {
        gl.uniform4f(
          uniforms.blobSeeds[index],
          seed[0],
          seed[1],
          seed[2],
          seed[3]
        );
        const motion = motionsRef.current[index];
        gl.uniform2f(uniforms.blobOffsets[index], motion.x, motion.y);
      });

      depositsRef.current.forEach((deposit, index) => {
        gl.uniform4f(
          uniforms.deposits[index],
          deposit.x,
          deposit.y,
          deposit.radius,
          deposit.intensity
        );
      });

      wavesRef.current.forEach((wave, index) => {
        const age = Math.max(0, time - wave.bornAt);
        const fadeIn = smoothstep(0, 0.18, age);
        const fadeOut = 1 - smoothstep(0.78, 1.28, age);
        const envelope = fadeIn * fadeOut;
        const radius = 0.026 + age * 0.055;
        const strength = wave.sign * envelope * (wave.sign > 0 ? 0.36 : 0.1);

        gl.uniform4f(uniforms.waves[index], wave.x, wave.y, radius, strength);
      });

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const frameMs = performance.now() - frameStart;
      frameTimeSum += frameMs;
      frameCount += 1;

      if (now - lastPerfUpdate >= 1000) {
        const elapsed = now - lastPerfUpdate;
        const nextStats = {
          fps: Math.round((frameCount * 1000) / elapsed),
          frameMs: frameTimeSum / frameCount,
          renderWidth,
          renderHeight,
          lightScale,
        };

        (
          window as typeof window & {
            __desktopAtmospherePerf?: PerfStats;
          }
        ).__desktopAtmospherePerf = nextStats;

        if (showPerfRef.current) {
          setPerfStats(nextStats);
        }

        frameCount = 0;
        frameTimeSum = 0;
        lastPerfUpdate = now;
      }

      rafRef.current = window.requestAnimationFrame(draw);
    };

    rafRef.current = window.requestAnimationFrame(draw);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.clearInterval(paletteTimer);
      resizeObserver.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div ref={containerRef} className="desktop-lava-lamp" aria-hidden="true">
      <canvas ref={canvasRef} className="desktop-lava-lamp__canvas" />
      <div className="desktop-lava-lamp__stars">
        {stars.map((star, index) =>
          isStarExcluded(star, starExclusionRects, containerSize) ? null : (
            <span
              key={`${star.x}-${star.y}-${index}`}
              className={`desktop-lava-lamp__star desktop-lava-lamp__star--${star.tone}`}
              style={getStarStyle(star)}
            />
          )
        )}
      </div>
      {showPerf ? (
        <div className="desktop-lava-lamp__perf">
          BG {perfStats.fps} FPS / {perfStats.frameMs.toFixed(2)}ms /{" "}
        {perfStats.renderWidth}x{perfStats.renderHeight} /{" "}
        {perfStats.lightScale.toFixed(2)}
      </div>
      ) : null}
    </div>
  );
}

export default DesktopLavaLamp;
