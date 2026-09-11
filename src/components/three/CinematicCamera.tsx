import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { computeGiftTimeline, GIFT_TO_WISH_TRANSITION } from "../../animations/giftTimeline";
import { computeWishTimeline, WISH_RANGE, WISH_TO_REVEAL_TRANSITION } from "../../animations/wishTimeline";
import { computeRevealTimeline } from "../../animations/revealTimeline";
import { experienceStore } from "../../store/experienceStore";
import { useMousePosition } from "../../hooks/useMousePosition";
import { damp, lerp, localT } from "../../utils/math";

interface CinematicCameraProps {
  reducedMotion: boolean;
  enableParallax: boolean;
}

const lookAtGift = new THREE.Vector3(0, 0.1, 0);
const lookAtCake = new THREE.Vector3(0, 0.1, 0);
const lookAtReveal = new THREE.Vector3(0, 0, -70);

// Deterministic endpoints used to stitch the wish-orbit camera smoothly
// into the reveal camera across the Scene 02 -> Scene 03 transition.
const wishFinalAngle = lerp(-0.6, 0.9, 1);
const wishFinalRadius = lerp(4.6, 3.1, 1);
const wishFinalY = lerp(1.1, 0.55, 1);
const wishEndPosition = new THREE.Vector3(
  Math.sin(wishFinalAngle) * wishFinalRadius,
  wishFinalY,
  Math.cos(wishFinalAngle) * wishFinalRadius,
);
const revealStartPosition = new THREE.Vector3(0, 0.2, -62);

const tmpPosition = new THREE.Vector3();
const tmpLookAt = new THREE.Vector3();

/**
 * Owns 100% of the camera's position, field of view and look target
 * for the entire experience, so exactly one system is ever writing to
 * the camera each frame. Scene components animate their own objects
 * only; they never touch the camera directly.
 */
export function CinematicCamera({ reducedMotion, enableParallax }: CinematicCameraProps) {
  const { camera } = useThree();
  const mouse = useMousePosition(enableParallax && !reducedMotion);
  const smoothMouse = useRef({ x: 0, y: 0 });

  useFrame((_, rawDt) => {
    const dt = Math.min(0.05, rawDt);
    const p = experienceStore.progress;
    const cam = camera as THREE.PerspectiveCamera;

    smoothMouse.current.x = damp(smoothMouse.current.x, mouse.current.x, 3, dt);
    smoothMouse.current.y = damp(smoothMouse.current.y, mouse.current.y, 3, dt);
    const mx = smoothMouse.current.x;
    const my = smoothMouse.current.y;

    if (p <= GIFT_TO_WISH_TRANSITION[1]) {
      // ---- Scene 01 (and its transition into Scene 02) ----
      const gift = computeGiftTimeline(p);
      cam.position.set(mx * 0.12, gift.cameraY + my * -0.04, gift.cameraZ);
      cam.fov = gift.cameraFov;
      cam.lookAt(lookAtGift);
    } else if (p <= WISH_RANGE[1]) {
      // ---- Scene 02 orbit ----
      const wish = computeWishTimeline(p, experienceStore.allCandlesLit());
      const angle = wish.cameraOrbitAngle + mx * 0.08;
      cam.position.set(Math.sin(angle) * wish.cameraRadius, wish.cameraY + my * -0.05, Math.cos(angle) * wish.cameraRadius);
      cam.fov = 38;
      cam.lookAt(lookAtCake);
    } else if (p <= WISH_TO_REVEAL_TRANSITION[1]) {
      // ---- transition: camera drifts from the cake into near-darkness ----
      const t2 = localT(p, WISH_TO_REVEAL_TRANSITION[0], WISH_TO_REVEAL_TRANSITION[1]);
      tmpPosition.lerpVectors(wishEndPosition, revealStartPosition, t2);
      tmpLookAt.lerpVectors(lookAtCake, lookAtReveal, t2);
      cam.position.set(tmpPosition.x + mx * 0.05, tmpPosition.y + my * -0.03, tmpPosition.z);
      cam.fov = lerp(38, 46, t2);
      cam.lookAt(tmpLookAt);
    } else {
      // ---- Scene 03 reveal ----
      const reveal = computeRevealTimeline(p);
      cam.position.set(reveal.cameraX + mx * 0.15, reveal.cameraY + my * -0.1, reveal.cameraZ);
      cam.fov = 46;
      cam.lookAt(lookAtReveal);
    }

    cam.updateProjectionMatrix();
  });

  return null;
}
