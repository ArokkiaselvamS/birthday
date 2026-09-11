import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { birthdayConfig } from "../../config/birthday";
import { audioManager } from "../../audio/AudioManager";
import { experienceStore } from "../../store/experienceStore";
import { makeGlowTexture } from "../../utils/textures";

const CANDLE_RADIUS = 0.68;
const SMOKE_COUNT = 60;

interface CandleRefs {
  flame: THREE.Sprite | null;
  light: THREE.PointLight | null;
}

export function Candles() {
  const count = birthdayConfig.candleCount;
  const candleRefs = useRef<CandleRefs[]>(Array.from({ length: count }, () => ({ flame: null, light: null })));
  const phases = useMemo(() => Array.from({ length: count }, () => Math.random() * 10), [count]);
  const prevState = useRef(experienceStore.getCandles().map((c) => ({ ...c })));

  const flameTexture = useMemo(() => makeGlowTexture("rgba(255,244,214,1)", "rgba(255,140,40,0)"), []);
  const dustTexture = useMemo(() => makeGlowTexture("rgba(255,235,210,0.9)", "rgba(255,235,210,0)"), []);

  const smokeRef = useRef<THREE.Points>(null);
  const smokePositions = useMemo(() => {
    const arr = new Float32Array(SMOKE_COUNT * 3);
    for (let i = 0; i < SMOKE_COUNT; i++) arr[i * 3 + 1] = -100;
    return arr;
  }, []);
  const smokeData = useRef(
    Array.from({ length: SMOKE_COUNT }, () => ({ active: false, vy: 0, life: 0 })),
  );
  const smokeCursor = useRef(0);

  function spawnSmoke(x: number, y: number, z: number) {
    if (!smokeRef.current) return;
    const i = smokeCursor.current;
    smokeCursor.current = (smokeCursor.current + 1) % SMOKE_COUNT;
    const positions = smokeRef.current.geometry.attributes.position.array as Float32Array;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    smokeData.current[i] = { active: true, vy: 0.25 + Math.random() * 0.15, life: 1.6 };
    smokeRef.current.geometry.attributes.position.needsUpdate = true;
  }

  // Click/tap and mic detection only ever flip store flags — this effect is
  // the SINGLE place that reacts to those transitions with audio + tweens,
  // so every trigger source (tap, mic, the scroll-end fallback) behaves
  // identically with no risk of double-firing.
  const revision = useSyncExternalStore(experienceStore.subscribe, experienceStore.getRevision);
  useEffect(() => {
    const current = experienceStore.getCandles();
    current.forEach((c, i) => {
      const prev = prevState.current[i];
      const refs = candleRefs.current[i];

      if (c.lit && !prev.lit && refs.flame && refs.light) {
        audioManager.playIgnite();
        gsap.to(refs.flame.material, { opacity: 0.95, duration: 0.5, ease: "power2.out" });
        gsap.to(refs.light, { intensity: 0.9, duration: 0.5, ease: "power2.out" });
      }

      if (c.extinguishing && !prev.extinguishing && refs.flame) {
        spawnSmoke(refs.flame.position.x, refs.flame.position.y, refs.flame.position.z);
        audioManager.playExtinguish();
        gsap.to(refs.flame.material, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => experienceStore.finishExtinguish(i),
        });
        if (refs.light) gsap.to(refs.light, { intensity: 0, duration: 0.6, ease: "power2.out" });
      }

      prevState.current[i] = { ...c };
    });
  }, [revision]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const current = experienceStore.getCandles();
    current.forEach((c, i) => {
      const refs = candleRefs.current[i];
      if (c.lit && refs.flame && refs.light) {
        const flicker = Math.sin(elapsed * 12 + phases[i]) * 0.06 + Math.sin(elapsed * 27 + phases[i]) * 0.03;
        refs.flame.scale.set(0.16 + flicker, 0.24 + flicker * 1.4, 1);
        refs.light.intensity = 0.85 + flicker * 1.2;
      }
    });

    // smoke drift
    if (smokeRef.current) {
      const dt = Math.min(0.05, clock.getDelta());
      const positions = smokeRef.current.geometry.attributes.position.array as Float32Array;
      let dirty = false;
      smokeData.current.forEach((d, i) => {
        if (d.active) {
          positions[i * 3 + 1] += d.vy * dt;
          d.life -= dt;
          if (d.life <= 0) {
            d.active = false;
            positions[i * 3 + 1] = -100;
          }
          dirty = true;
        }
      });
      if (dirty) smokeRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const positionsAround = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return [Math.cos(angle) * CANDLE_RADIUS, Math.sin(angle) * CANDLE_RADIUS] as const;
  });

  return (
    <group>
      {positionsAround.map(([cx, cz], i) => (
        <group key={i}>
          <mesh position={[cx, 0.36, cz]}>
            <cylinderGeometry args={[0.035, 0.035, 0.42, 16]} />
            <meshStandardMaterial color={0xf5efe4} roughness={0.4} metalness={0.1} />
          </mesh>

          <sprite
            ref={(el) => {
              candleRefs.current[i].flame = el;
            }}
            position={[cx, 0.62, cz]}
            scale={[0.16, 0.24, 1]}
            onPointerDown={(e) => {
              e.stopPropagation();
              experienceStore.beginExtinguish(i);
            }}
          >
            <spriteMaterial map={flameTexture} color={0xffcf8a} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>

          {/* generous invisible hit-area so the flame is easy to tap on mobile */}
          <mesh
            position={[cx, 0.62, cz]}
            onPointerDown={(e) => {
              e.stopPropagation();
              experienceStore.beginExtinguish(i);
            }}
          >
            <sphereGeometry args={[0.22, 8, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          <pointLight
            ref={(el) => {
              candleRefs.current[i].light = el;
            }}
            color={0xffa552}
            intensity={0}
            distance={2.4}
            decay={2}
            position={[cx, 0.64, cz]}
          />
        </group>
      ))}

      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[smokePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.14} map={dustTexture} color={0xbfc2cc} transparent opacity={0.35} depthWrite={false} />
      </points>
    </group>
  );
}
