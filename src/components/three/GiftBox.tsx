import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeGlowTexture } from "../../utils/textures";

export interface GiftBoxVelocity {
  x: number;
  y: number;
  z: number;
}

export interface GiftBoxHandle {
  group: THREE.Group | null;
  lid: THREE.Mesh | null;
  ribbonA: THREE.Mesh | null;
  ribbonB: THREE.Mesh | null;
  bow: THREE.Mesh | null;
  innerLight: THREE.PointLight | null;
  keyGlow: THREE.PointLight | null;
  burstPoints: THREE.Points | null;
  burstVelocities: GiftBoxVelocity[];
  burstCount: number;
  /** Fades every gift material to the given opacity, for the transition into Scene 02. */
  setOpacity: (opacity: number) => void;
}

const BURST_COUNT = 200;

function generateBurstVelocities(count: number): GiftBoxVelocity[] {
  const velocities: GiftBoxVelocity[] = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.4 + Math.random() * 0.9;
    velocities.push({
      x: Math.sin(phi) * Math.cos(theta) * speed,
      y: Math.abs(Math.cos(phi)) * speed + 0.3,
      z: Math.sin(phi) * Math.sin(theta) * speed,
    });
  }
  return velocities;
}

/**
 * A premium, minimal 3D gift box: satin box base + lid, two crossed
 * metallic ribbon bands, a knotted bow, an inner warm point light
 * (revealed as the lid opens) and an ember burst that fires from the
 * opening. All of the actual choreography (rotation, unwrap, open,
 * camera) lives in GiftScene — this component just exposes refs.
 */
export const GiftBox = forwardRef<GiftBoxHandle>(function GiftBox(_props, ref) {
  const groupRef = useRef<THREE.Group>(null);
  const baseRef = useRef<THREE.Mesh>(null);
  const lidRef = useRef<THREE.Mesh>(null);
  const ribbonARef = useRef<THREE.Mesh>(null);
  const ribbonBRef = useRef<THREE.Mesh>(null);
  const bowRef = useRef<THREE.Mesh>(null);
  const innerLightRef = useRef<THREE.PointLight>(null);
  const keyGlowRef = useRef<THREE.PointLight>(null);
  const burstRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<GiftBoxVelocity[]>(generateBurstVelocities(BURST_COUNT));

  const emberTexture = useMemo(() => makeGlowTexture("rgba(255,170,90,1)", "rgba(255,120,40,0)"), []);
  const burstPositions = useMemo(() => new Float32Array(BURST_COUNT * 3), []);

  useImperativeHandle(
    ref,
    () => ({
      get group() {
        return groupRef.current;
      },
      get lid() {
        return lidRef.current;
      },
      get ribbonA() {
        return ribbonARef.current;
      },
      get ribbonB() {
        return ribbonBRef.current;
      },
      get bow() {
        return bowRef.current;
      },
      get innerLight() {
        return innerLightRef.current;
      },
      get keyGlow() {
        return keyGlowRef.current;
      },
      get burstPoints() {
        return burstRef.current;
      },
      burstVelocities: velocitiesRef.current,
      burstCount: BURST_COUNT,
      setOpacity(opacity: number) {
        [baseRef.current, lidRef.current, ribbonARef.current, ribbonBRef.current, bowRef.current].forEach((mesh) => {
          if (!mesh) return;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.transparent = true;
          mat.opacity = opacity;
        });
      },
    }),
    [],
  );

  return (
    <group ref={groupRef}>
      <mesh ref={baseRef} position={[0, -0.15, 0]}>
        <boxGeometry args={[1.8, 1.1, 1.8]} />
        <meshStandardMaterial color={0x0c0d14} metalness={0.65} roughness={0.28} />
      </mesh>

      <mesh ref={lidRef} position={[0, 0.55, 0]}>
        <boxGeometry args={[1.9, 0.28, 1.9]} />
        <meshStandardMaterial color={0x0c0d14} metalness={0.65} roughness={0.28} />
      </mesh>

      <mesh ref={ribbonARef} position={[0, -0.14, 0]}>
        <boxGeometry args={[0.26, 1.14, 1.86]} />
        <meshStandardMaterial color={0xd7b26a} metalness={0.85} roughness={0.2} emissive={0x6b4a1a} emissiveIntensity={0.35} />
      </mesh>
      <mesh ref={ribbonBRef} rotation={[0, Math.PI / 2, 0]} position={[0, -0.14, 0]}>
        <boxGeometry args={[0.26, 1.14, 1.86]} />
        <meshStandardMaterial color={0xd7b26a} metalness={0.85} roughness={0.2} emissive={0x6b4a1a} emissiveIntensity={0.35} />
      </mesh>

      <mesh ref={bowRef} position={[0, 0.72, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusKnotGeometry args={[0.16, 0.055, 64, 8, 2, 3]} />
        <meshStandardMaterial color={0xd7b26a} metalness={0.85} roughness={0.2} emissive={0x6b4a1a} emissiveIntensity={0.35} />
      </mesh>

      <pointLight ref={innerLightRef} color={0xffb469} intensity={0} distance={6} decay={2} position={[0, 0.1, 0]} />
      <pointLight ref={keyGlowRef} color={0xffb469} intensity={0} distance={12} decay={2} position={[0, 0.2, 1.6]} />

      <points ref={burstRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[burstPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          map={emberTexture}
          color={0xffcf9a}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
});
