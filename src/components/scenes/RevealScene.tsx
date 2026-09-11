import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { computeRevealTimeline } from "../../animations/revealTimeline";
import { computeWishTimeline, WISH_TO_REVEAL_TRANSITION } from "../../animations/wishTimeline";
import { experienceStore } from "../../store/experienceStore";
import { makeGlowTexture } from "../../utils/textures";

const SWIRL_CENTER = new THREE.Vector3(0, 0, -70);
const SWIRL_COUNT_DESKTOP = 420;
const SWIRL_COUNT_MOBILE = 180;

interface RevealSceneProps {
  isMobile: boolean;
}

export function RevealScene({ isMobile }: RevealSceneProps) {
  const swirlRef = useRef<THREE.Points>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const count = isMobile ? SWIRL_COUNT_MOBILE : SWIRL_COUNT_DESKTOP;
  const texture = useMemo(() => makeGlowTexture("rgba(255,235,210,0.9)", "rgba(255,235,210,0)"), []);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.6 + Math.random() * 1.8;
      const a = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 2.4;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, [count]);

  useFrame(() => {
    const p = experienceStore.progress;
    const swirlMat = swirlRef.current?.material as THREE.PointsMaterial | undefined;

    if (p < WISH_TO_REVEAL_TRANSITION[0]) {
      if (swirlMat) swirlMat.opacity = 0;
      if (lightRef.current) lightRef.current.intensity = 0;
      return;
    }

    if (swirlRef.current) swirlRef.current.rotation.y += 0.0009;

    if (p <= WISH_TO_REVEAL_TRANSITION[1]) {
      const wish = computeWishTimeline(p, experienceStore.allCandlesLit());
      if (swirlMat) swirlMat.opacity = wish.transitionSwirlOpacity;
      if (lightRef.current) lightRef.current.intensity = wish.transitionRevealLight;
    } else {
      const reveal = computeRevealTimeline(p);
      if (swirlMat) swirlMat.opacity = reveal.swirlOpacity;
      if (lightRef.current) lightRef.current.intensity = reveal.revealLightIntensity;
    }
  });

  return (
    <group>
      <points ref={swirlRef} position={SWIRL_CENTER}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          map={texture}
          color={0xffe9c7}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <pointLight ref={lightRef} color={0xffe4b8} intensity={0} distance={14} decay={2} position={[0, 0, -68]} />
    </group>
  );
}
