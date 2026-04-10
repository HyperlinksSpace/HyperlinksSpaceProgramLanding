"use client";

import {
  useRef,
  useEffect,
  Suspense,
  useMemo,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * Fit/crop scope: frame tightly around main 3D (sphere + core). View is cropped to this;
 * outer chain links may clip at edges so the picture has no empty space inside the block.
 */
const SCENE_BOUNDS = {
  center: new THREE.Vector3(0, -0.5, 0),
  radius: 1.95,
};

function FitCameraToScene() {
  const { camera, size } = useThree();
  useEffect(() => {
    const { center, radius } = SCENE_BOUNDS;
    const persp = camera as THREE.PerspectiveCamera;
    const dir = new THREE.Vector3(4, -4, 3).normalize();
    const halfRad = (persp.fov * Math.PI) / 360;
    const d = (radius * 0.82) / Math.tan(halfRad);
    persp.position.copy(center).add(dir.multiplyScalar(d));
    persp.lookAt(center);
  }, [camera, size.width, size.height]);
  return null;
}

/**
 * Frustum fit: scale scene so it fills the view (max size without clipping).
 * Scales up when there is room; scales down only when the canvas would crop.
 */
function SceneFitScale({ children }: { children: ReactNode }) {
  const scaleRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const center = SCENE_BOUNDS.center;
  const corners = useMemo(() => {
    const c = SCENE_BOUNDS.center;
    const r = SCENE_BOUNDS.radius;
    const out: THREE.Vector3[] = [];
    for (const dx of [-1, 1] as const)
      for (const dy of [-1, 1] as const)
        for (const dz of [-1, 1] as const)
          out.push(new THREE.Vector3(c.x + dx * r, c.y + dy * r, c.z + dz * r));
    return out;
  }, []);
  const projScreen = useMemo(() => new THREE.Matrix4(), []);
  const clip = useMemo(() => new THREE.Vector4(), []);

  useFrame(() => {
    if (!scaleRef.current) return;
    projScreen.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    // Keep a little breathing room so animation never clips.
    const margin = 0.995;
    const scaled = (s: number, orig: THREE.Vector3) =>
      new THREE.Vector3(
        center.x + s * (orig.x - center.x),
        center.y + s * (orig.y - center.y),
        center.z + s * (orig.z - center.z)
      );
    const inside = (s: number) => {
      for (const p of corners) {
        const w = scaled(s, p);
        clip.set(w.x, w.y, w.z, 1);
        clip.applyMatrix4(projScreen);
        if (Math.abs(clip.w) < 1e-6) return false;
        const nx = clip.x / clip.w;
        const ny = clip.y / clip.w;
        if (Math.abs(nx) > margin || Math.abs(ny) > margin) return false;
      }
      return true;
    };
    const hiBound = 22;
    let lo = 0.12;
    let hi = hiBound;
    for (let i = 0; i < 28; i++) {
      const mid = (lo + hi) * 0.5;
      if (inside(mid)) lo = mid;
      else hi = mid;
    }
    scaleRef.current.scale.setScalar(lo);
  });

  return (
    <group ref={scaleRef} position={[center.x, center.y, center.z]}>
      <group position={[-center.x, -center.y, -center.z]}>{children}</group>
    </group>
  );
}

// —— 3D Simplex noise for vertex displacement (Book of Shaders style) ——
const noise3D = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const AI_SPHERE_VERTEX = `
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uDisplacement;
  uniform float uSpeed;
  ${noise3D}
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vNoise;
  void main() {
    vec3 pos = position;
    float n = snoise(pos * uNoiseScale + uTime * uSpeed);
    float n2 = snoise(pos * (uNoiseScale * 0.7) + uTime * uSpeed * 0.5 + 10.0);
    float pulse = sin(uTime * 0.4) * 0.04 + 1.0;
    float combined = (n + n2 * 0.5) * 0.5;
    vNoise = combined;
    pos += normal * (combined * uDisplacement);
    pos *= pulse;
    vPosition = pos;
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const AI_SPHERE_FRAGMENT = `
  uniform float uTime;
  uniform float uEmission;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vNoise;
  ${noise3D}
  void main() {
    float n = snoise(vPosition * 2.0 + uTime * 0.2) * 0.5 + 0.5;
    vec3 blue = vec3(0.165, 0.667, 1.0);   // #2a2aff
    vec3 violet = vec3(0.478, 0.173, 1.0); // #7a2cff
    vec3 magenta = vec3(1.0, 0.165, 0.831); // #ff2ad4
    vec3 baseColor = mix(blue, violet, n);
    baseColor = mix(baseColor, magenta, n * 0.6);

    // simple physically-inspired lighting for smoother, glossier look
    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vPosition);
    vec3 L = normalize(vec3(0.5, 0.9, 0.3));
    vec3 H = normalize(L + V);

    float ndotl = max(dot(N, L), 0.0);
    float ndoth = max(dot(N, H), 0.0);
    float spec = pow(ndoth, 64.0) * 1.6;
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);

    vec3 color = baseColor * (0.35 + 0.9 * ndotl);
    color += spec * vec3(1.0);
    color = mix(color, color * 1.3, fresnel);

    float emission = (vNoise * 0.5 + 0.5) * uEmission;
    float pulseGlow = sin(uTime * 0.5) * 0.15 + 0.85;
    gl_FragColor = vec4(color + color * emission * pulseGlow, 0.82);
  }
`;

const INNER_CORE_FRAGMENT = `
  uniform float uTime;
  varying vec3 vPosition;
  varying float vNoise;
  ${noise3D}
  void main() {
    float n = snoise(vPosition * 3.0 + uTime * 0.25) * 0.5 + 0.5;
    vec3 color = vec3(0.6, 0.3, 1.0);
    float a = 0.45 * (0.5 + 0.5 * n) * (1.0 - length(vPosition) * 0.4);
    float pulse = sin(uTime * 0.6) * 0.1 + 0.9;
    gl_FragColor = vec4(color, a * pulse);
  }
`;

function AISphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const innerMatRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
    }
    if (innerMatRef.current) {
      innerMatRef.current.uniforms.uTime.value = t;
    }
  });

  const sphereUniforms = useRef({
    uTime: { value: 0 },
    uNoiseScale: { value: 3.2 },
    uDisplacement: { value: 0.28 },
    uSpeed: { value: 0.28 },
    uEmission: { value: 3.0 },
  }).current;

  const innerUniforms = useRef({
    uTime: { value: 0 },
  }).current;

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 128, 128]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={AI_SPHERE_VERTEX}
          fragmentShader={AI_SPHERE_FRAGMENT}
          uniforms={sphereUniforms}
          transparent
          depthWrite={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={innerRef} scale={0.75}>
        <sphereGeometry args={[1.0, 64, 64]} />
        <shaderMaterial
          ref={innerMatRef}
          vertexShader={INNER_CORE_VERTEX}
          fragmentShader={INNER_CORE_FRAGMENT}
          uniforms={{
            uTime: innerUniforms.uTime,
            uNoiseScale: { value: 2.5 },
            uDisplacement: { value: 0.1 },
            uSpeed: { value: 0.15 },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

const INNER_CORE_VERTEX = `
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uDisplacement;
  uniform float uSpeed;
  ${noise3D}
  varying vec3 vPosition;
  varying float vNoise;
  void main() {
    vec3 pos = position;
    float n = snoise(pos * uNoiseScale + uTime * uSpeed);
    vNoise = n;
    pos += normal * (n * uDisplacement);
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// —— Шаг 1: прямая цепь, идеально переплетённая (далее будем гнуть) ——
const LINK_MAJOR = 0.22;
const LINK_MINOR = 0.055;
const ELONGATION = 1.5;
const FLATTEN = 0.92;
// const CHAIN_SPEED = 0;
const TUBE_SEGMENTS = 56;
const RING_SEGMENTS = 48;
// const WORLD_UP = new THREE.Vector3(0, 1, 0);

// Расстояние между центрами звеньев = длина овала по длинной оси (звенья стыкуются короткими сторонами)
const LINK_CENTER_SPACING = 2 * LINK_MAJOR * ELONGATION;

// Galaxy: spiral from inside sphere out; tilted 30° up from horizon
const GALAXY_LINKS = 48;
const GALAXY_INNER = 0.3;
const GALAXY_OUTER = 2.4;
const GALAXY_SPIRAL_TURNS = 2.5;
const GALAXY_TILT_UP_DEG = 30;
const GALAXY_THICKNESS = 0.12;
const FLOAT_AMPLITUDE = 0.06;
const FLOAT_SPEED = 0.25;
const TUMBLE_SPEED = 0.12;

const _floatOffset = new THREE.Vector3();
const _euler = new THREE.Euler();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();

function seed(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const GALAXY_TILT_RAD = (GALAXY_TILT_UP_DEG * Math.PI) / 180;

// Min distance between link centers so they don't intersect (link "length" ~ 0.66)
const MIN_LINK_DISTANCE = 0.58;

// —— Bottom: 3 classic chain links (like a real metal chain) ——
const BOTTOM_CHAIN_Y = -2.2;
const BOTTOM_CHAIN_NUM_LINKS = 3;
// Center-to-center spacing along the chain axis; tuned so links touch but don't heavily overlap
const BOTTOM_CHAIN_SPACING = LINK_CENTER_SPACING * 0.7;
const BOTTOM_FLOAT_AMPLITUDE = 0.04;
const BOTTOM_FLOAT_SPEED = 0.45;

function BottomChains() {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < BOTTOM_CHAIN_NUM_LINKS; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const phase = i * 1.3;
      const dy = BOTTOM_FLOAT_AMPLITUDE * Math.sin(t * BOTTOM_FLOAT_SPEED + phase);
      const dz = BOTTOM_FLOAT_AMPLITUDE * 0.6 * Math.sin(t * BOTTOM_FLOAT_SPEED * 0.7 + phase);
      mesh.position.y = dy;
      mesh.position.z = dz;
    }
  });

  return (
    <group position={[0, BOTTOM_CHAIN_Y, 0]}>
      {Array.from({ length: BOTTOM_CHAIN_NUM_LINKS }, (_, i) => {
        const offset = (i - 1) * BOTTOM_CHAIN_SPACING;
        const rotationX = i % 2 === 0 ? 0 : Math.PI / 2;
        return (
          <mesh
            key={i}
            position={[offset, 0, 0]}
            rotation={[rotationX, 0, 0]}
            scale={[ELONGATION, FLATTEN, 1]}
            ref={(el) => {
              meshRefs.current[i] = el;
            }}
          >
            <torusGeometry args={[LINK_MAJOR, LINK_MINOR, TUBE_SEGMENTS, RING_SEGMENTS]} />
          <meshPhysicalMaterial
            color="#9ca4ac"
            metalness={1}
            roughness={0.15}
            clearcoat={0.15}
            clearcoatRoughness={0.2}
            envMapIntensity={1.6}
            anisotropy={0.2}
          />
          </mesh>
        );
      })}
    </group>
  );
}

/** Base positions: spiral in horizontal (XZ) plane + random variation; nudge apart so no intersect. */
function useGalaxyLayout() {
  return useMemo(() => {
    const layout: { position: THREE.Vector3; rotation: [number, number, number] }[] = [];
    for (let i = 0; i < GALAXY_LINKS; i++) {
      const t = i / GALAXY_LINKS;
      const rBase = GALAXY_INNER + t * (GALAXY_OUTER - GALAXY_INNER);
      const r = rBase + (seed(i * 31) - 0.5) * 0.5;
      const angle =
        t * Math.PI * 2 * GALAXY_SPIRAL_TURNS +
        (seed(i * 37) - 0.5) * 2.2 +
        seed(i * 41) * 0.5;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const y = (seed(i * 43) - 0.5) * GALAXY_THICKNESS * 3;
      layout.push({
        position: new THREE.Vector3(x, y, z),
        rotation: [
          (seed(i * 47) - 0.5) * Math.PI * 1.1,
          (seed(i * 53) - 0.5) * Math.PI * 1.0,
          (seed(i * 59) - 0.5) * Math.PI * 2,
        ],
      });
    }

    for (let pass = 0; pass < 12; pass++) {
      let moved = false;
      for (let i = 0; i < layout.length; i++) {
        const pi = layout[i].position;
        for (let j = 0; j < layout.length; j++) {
          if (i === j) continue;
          const pj = layout[j].position;
          _v.subVectors(pi, pj);
          const d = _v.length();
          if (d > 0 && d < MIN_LINK_DISTANCE) {
            _v.normalize().multiplyScalar(MIN_LINK_DISTANCE - d);
            pi.add(_v);
            moved = true;
          }
        }
      }
      if (!moved) break;
    }

    return layout;
  }, []);
}

function GalaxyChain() {
  const layout = useGalaxyLayout();
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < layout.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const base = layout[i].position;
      const s1 = seed(i * 7);
      const s2 = seed(i * 11 + 100);
      const s3 = seed(i * 13 + 200);
      _floatOffset.x = FLOAT_AMPLITUDE * Math.sin(t * FLOAT_SPEED + s1 * 20) * (0.8 + s2 * 0.4);
      _floatOffset.y = FLOAT_AMPLITUDE * Math.sin(t * FLOAT_SPEED * 0.7 + s2 * 20) * (0.8 + s3 * 0.4);
      _floatOffset.z = FLOAT_AMPLITUDE * Math.sin(t * FLOAT_SPEED * 0.5 + s3 * 20) * (0.8 + s1 * 0.4);
      mesh.position.copy(base).add(_floatOffset);
      _euler.set(
        layout[i].rotation[0] + Math.sin(t * TUMBLE_SPEED + s1 * 10) * 0.08,
        layout[i].rotation[1] + Math.sin(t * TUMBLE_SPEED * 0.8 + s2 * 10) * 0.06,
        layout[i].rotation[2] + t * 0.02 * (s3 - 0.5)
      );
      mesh.quaternion.setFromEuler(_euler);
    }
  });

  return (
    <group>
      {layout.map((item, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
            if (el) {
              el.position.copy(item.position);
              _euler.set(item.rotation[0], item.rotation[1], item.rotation[2]);
              el.quaternion.setFromEuler(_euler);
            }
          }}
          scale={[ELONGATION, FLATTEN, 1]}
        >
          <torusGeometry args={[LINK_MAJOR, LINK_MINOR, TUBE_SEGMENTS, RING_SEGMENTS]} />
          <meshPhysicalMaterial
            color="#9ca4ac"
            metalness={1}
            roughness={0.15}
            clearcoat={0.15}
            clearcoatRoughness={0.2}
            envMapIntensity={1.6}
            anisotropy={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function Chains() {
  return <GalaxyChain />;
}

function SceneContent() {
  return (
    <>
      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
      </Suspense>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 2]} intensity={1.8} color="#ffffff" />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#7a2cff" distance={4} />
      <pointLight position={[-2, 2, -3]} intensity={0.8} color="#4a6cf7" />
      <pointLight position={[3, -2, -2]} intensity={0.5} color="#2a2aff" />
      <pointLight position={[2, 1, 2]} intensity={0.7} color="#a0b0c8" />
      <SceneFitScale>
        <AISphere />
        <Chains />
        <BottomChains />
      </SceneFitScale>
    </>
  );
}

export default function AIScene() {
  return (
    <div className="h-full min-h-0 w-full flex-1 bg-transparent" style={{ minHeight: 200 }}>
      <CanvasWrapper />
    </div>
  );
}

function CanvasWrapper() {
  const exportMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("exportStill") === "1";
  }, []);

  return (
    <Canvas
      frameloop="always"
      gl={{
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: exportMode,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      camera={{
        position: [3.3, -3.8, 2.5],
        fov: 50,
      }}
      style={{
        background: "transparent",
        width: exportMode ? "1024px" : "100%",
        height: exportMode ? "1024px" : "100%",
        display: "block",
      }}
      dpr={exportMode ? 1 : [2, 4]}
    >
      <FitCameraToScene />
      <CaptureStillOnDemand enabled={exportMode} />
      <SceneContent />
    </Canvas>
  );
}

function CaptureStillOnDemand({ enabled }: { enabled: boolean }) {
  const { gl, scene, camera } = useThree();
  const capturedRef = useRef(false);

  useFrame((state) => {
    if (!enabled || capturedRef.current) return;
    // Wait for environment map and a few frames so metal materials match live site look.
    if (!scene.environment) return;
    if (state.clock.getElapsedTime() < 3.5) return;

    capturedRef.current = true;
    gl.render(scene, camera);

    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file") || "landing-animation-1024.png";
    const dataURL = gl.domElement.toDataURL("image/png");

    void fetch(`/api/export-png?file=${encodeURIComponent(fileName)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dataURL }),
    }).catch(() => {
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });

  return null;
}
