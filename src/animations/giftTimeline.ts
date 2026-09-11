import { clamp01, easeInOut, lerp, localT } from "../utils/math";

/** Scene 01 — THE GIFT occupies the first ~34% of the scroll timeline. */
export const GIFT_RANGE: [number, number] = [0, 0.34];
/** Camera travels physically into the gift box across this window. */
export const GIFT_TO_WISH_TRANSITION: [number, number] = [0.3, 0.38];

export interface GiftTimelineState {
  active: boolean;
  /** Continuous slow rotation as the camera approaches. */
  rotationY: number;
  /** Small tremor just before the ribbon lets go. */
  shakeZ: number;
  /** 0 = ribbon wrapped, 1 = ribbon fully released. */
  unwrapT: number;
  /** 0 = lid closed, 1 = lid fully open. */
  openT: number;
  /** 0-1 age of the light/ember burst since the lid started opening. */
  burstT: number;
  innerLightIntensity: number;
  keyGlowIntensity: number;
  cameraZ: number;
  cameraY: number;
  cameraFov: number;
  /** 0-1 across the into-the-box transition; 0 outside of it. */
  transitionT: number;
  /** Opacity of the gift materials during the transition-out fade. */
  giftOpacity: number;
  flashOpacity: number;
}

export function computeGiftTimeline(progress: number): GiftTimelineState {
  const inMain = progress <= GIFT_RANGE[1] + 0.02;
  const t = localT(progress, GIFT_RANGE[0], GIFT_RANGE[1]);
  const approach = Math.min(t / 0.5, 1);

  const shakeWindow = clamp01((t - 0.55) / 0.15);
  const shakeZ = Math.sin(shakeWindow * Math.PI * 10) * shakeWindow * (1 - shakeWindow) * 0.06;

  const unwrapT = clamp01((t - 0.62) / 0.18);
  const openT = clamp01((t - 0.78) / 0.22);
  const burstT = openT > 0.05 ? clamp01((openT - 0.05) / 0.3) : 0;

  const inTransition = progress >= GIFT_TO_WISH_TRANSITION[0] && progress <= GIFT_TO_WISH_TRANSITION[1];
  const transitionT = inTransition ? localT(progress, GIFT_TO_WISH_TRANSITION[0], GIFT_TO_WISH_TRANSITION[1]) : progress > GIFT_TO_WISH_TRANSITION[1] ? 1 : 0;

  const cameraZ = inTransition
    ? lerp(3.4, 0.4, transitionT)
    : progress > GIFT_TO_WISH_TRANSITION[1]
      ? 0.4
      : lerp(9, 3.4, easeInOut(approach));
  const cameraFov = inTransition ? lerp(36, 70, transitionT) : progress > GIFT_TO_WISH_TRANSITION[1] ? 70 : lerp(42, 36, approach);

  return {
    active: inMain || inTransition,
    rotationY: t * Math.PI * 1.4,
    shakeZ,
    unwrapT,
    openT,
    burstT,
    innerLightIntensity: lerp(0, 3.4, openT),
    keyGlowIntensity: lerp(0, 0.5, openT),
    cameraZ,
    cameraY: lerp(0.4, 0.15, approach),
    cameraFov,
    transitionT,
    giftOpacity: inTransition ? lerp(1, 0, transitionT) : progress > GIFT_TO_WISH_TRANSITION[1] ? 0 : 1,
    flashOpacity: inTransition ? Math.sin(transitionT * Math.PI) * 0.9 : 0,
  };
}
