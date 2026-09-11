import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";
import { GIFT_TO_WISH_TRANSITION, computeGiftTimeline } from "../../animations/giftTimeline";
import { experienceStore } from "../../store/experienceStore";
import { lerp } from "../../utils/math";
import { GiftBox, type GiftBoxHandle } from "../three/GiftBox";
import { Particles } from "../three/Particles";

export function GiftScene() {
  const giftRef = useRef<GiftBoxHandle>(null);
  const burstAge = useRef(0);
  const flashEl = useMemo(() => document.getElementById("flash-overlay"), []);

  useFrame(({ clock }) => {
    const gift = giftRef.current;
    if (!gift || !gift.group) return;

    const p = experienceStore.progress;
    const state = computeGiftTimeline(p);
    const visible = p <= GIFT_TO_WISH_TRANSITION[1] + 0.01;
    gift.group.visible = visible;
    if (!visible) return;

    const elapsed = clock.getElapsedTime();
    gift.group.rotation.y = state.rotationY;
    gift.group.rotation.z = state.shakeZ;
    gift.group.position.y = Math.sin(elapsed * 0.6) * 0.04;

    if (gift.ribbonA) {
      gift.ribbonA.scale.x = lerp(1, 0.02, state.unwrapT);
      gift.ribbonA.position.x = lerp(0, 1.1, state.unwrapT);
    }
    if (gift.ribbonB) {
      gift.ribbonB.scale.z = lerp(1, 0.02, state.unwrapT);
      gift.ribbonB.position.z = lerp(0, 1.1, state.unwrapT);
    }
    if (gift.bow) {
      const s = lerp(1, 0, state.unwrapT);
      gift.bow.scale.set(s, s, s);
    }
    if (gift.lid) {
      gift.lid.position.y = lerp(0.55, 2.1, state.openT);
      gift.lid.rotation.x = lerp(0, -0.9, state.openT);
    }
    if (gift.innerLight) gift.innerLight.intensity = state.innerLightIntensity;
    if (gift.keyGlow) gift.keyGlow.intensity = state.keyGlowIntensity;

    // ember burst
    if (state.burstT > 0) {
      burstAge.current += Math.min(0.05, clock.getDelta()) * (1 + state.burstT);
    } else {
      burstAge.current = 0;
    }
    if (gift.burstPoints) {
      const mat = gift.burstPoints.material as THREE.PointsMaterial;
      mat.opacity = state.burstT * 0.85;
      const positions = gift.burstPoints.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < gift.burstCount; i++) {
        const v = gift.burstVelocities[i];
        const age = burstAge.current * 1.4;
        positions[i * 3] = v.x * age;
        positions[i * 3 + 1] = v.y * age - burstAge.current * burstAge.current * 0.6;
        positions[i * 3 + 2] = v.z * age;
      }
      gift.burstPoints.geometry.attributes.position.needsUpdate = true;
    }

    gift.setOpacity(state.giftOpacity);

    if (flashEl) flashEl.style.opacity = String(state.flashOpacity);
  });

  return (
    <group>
      <GiftBox ref={giftRef} />
      <Particles count={500} spread={[14, 9, 14]} opacity={0.45} />
    </group>
  );
}
