import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { makeGlowTexture } from "../../utils/textures";

interface ParticlesProps {
  count?: number;
  spread?: [number, number, number];
  center?: [number, number, number];
  color?: number;
  size?: number;
  opacity?: number;
  driftSpeed?: number;
}

/**
 * Soft atmospheric dust that drifts slowly through the whole scene,
 * giving the environment depth and a sense of a living, breathing space.
 */
export function Particles({
  count = 500,
  spread = [16, 10, 16],
  center = [0, 0, 0],
  color = 0xfff2e0,
  size = 0.05,
  opacity = 0.5,
  driftSpeed = 0.0006,
}: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * spread[0];
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
    }
    return arr;
  }, [count, spread]);

  const texture = useMemo(() => makeGlowTexture("rgba(255,235,210,0.9)", "rgba(255,235,210,0)"), []);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += driftSpeed;
    }
  });

  return (
    <points ref={pointsRef} position={center}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color={color}
      />
    </points>
  );
}
