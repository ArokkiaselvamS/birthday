import { forwardRef, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

export interface BirthdayCakeHandle {
  group: THREE.Group | null;
  setOpacity: (opacity: number) => void;
}

/**
 * A two-tier, luxury-styled cake: soft icing base, a warmer sponge
 * tier, and a thin gold trim ring. Deliberately unadorned — no
 * sprinkles or cartoon icing — to stay in the premium/editorial
 * register the brief calls for.
 */
export const BirthdayCake = forwardRef<BirthdayCakeHandle>(function BirthdayCake(_props, ref) {
  const groupRef = useRef<THREE.Group>(null);
  const bottomRef = useRef<THREE.Mesh>(null);
  const topRef = useRef<THREE.Mesh>(null);
  const trimRef = useRef<THREE.Mesh>(null);

  useImperativeHandle(
    ref,
    () => ({
      get group() {
        return groupRef.current;
      },
      setOpacity(opacity: number) {
        [bottomRef.current, topRef.current, trimRef.current].forEach((mesh) => {
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
      <mesh ref={bottomRef} position={[0, -0.55, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.55, 48]} />
        <meshStandardMaterial color={0xf3e9da} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh ref={topRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[1.05, 1.15, 0.5, 48]} />
        <meshStandardMaterial color={0xcaa06a} roughness={0.7} metalness={0.0} />
      </mesh>
      <mesh ref={trimRef} position={[0, -0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.03, 12, 48]} />
        <meshStandardMaterial color={0xd8b877} metalness={0.8} roughness={0.25} emissive={0x5a3f16} emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
});
