import { clamp01, lerp, localT } from "../utils/math";

/** Scene 02 — THE WISH occupies the middle third of the scroll timeline. */
export const WISH_RANGE: [number, number] = [0.34, 0.67];
/** Camera pulls back into near-darkness across this window, into Scene 03. */
export const WISH_TO_REVEAL_TRANSITION: [number, number] = [0.63, 0.7];

export interface WishTimelineState {
  active: boolean;
  cameraOrbitAngle: number;
  cameraRadius: number;
  cameraY: number;
  /** Local 0-1 progress through the scene, used to gate candle lighting. */
  localT: number;
  closeEyesT: number;
  makeWishT: number;
  hintT: number;
  /** True once every candle is lit — used to reveal the wish copy. */
  allLit: boolean;
  /** True for the last stretch of the scene, to auto-extinguish as a fallback. */
  shouldAutoBlow: boolean;
  transitionT: number;
  transitionRevealLight: number;
  transitionSwirlOpacity: number;
}

export function computeWishTimeline(progress: number, allCandlesLit: boolean): WishTimelineState {
  const active = progress >= WISH_RANGE[0] && progress <= WISH_TO_REVEAL_TRANSITION[1] + 0.02;
  const t = localT(progress, WISH_RANGE[0], WISH_RANGE[1]);

  const orbitAngle = lerp(-0.6, 0.9, t);
  const radius = lerp(4.6, 3.1, Math.min(t / 0.3, 1));
  const cameraY = lerp(1.1, 0.55, Math.min(t / 0.3, 1));

  const closeEyesT = allCandlesLit ? clamp01((t - 0.62) / 0.08) : 0;
  const makeWishT = allCandlesLit ? clamp01((t - 0.74) / 0.08) : 0;
  const hintT = clamp01((t - 0.82) / 0.08);

  const inTransition = progress >= WISH_TO_REVEAL_TRANSITION[0] && progress <= WISH_TO_REVEAL_TRANSITION[1];
  const transitionT = inTransition ? localT(progress, WISH_TO_REVEAL_TRANSITION[0], WISH_TO_REVEAL_TRANSITION[1]) : progress > WISH_TO_REVEAL_TRANSITION[1] ? 1 : 0;

  return {
    active,
    cameraOrbitAngle: orbitAngle,
    cameraRadius: radius,
    cameraY,
    localT: t,
    closeEyesT,
    makeWishT,
    hintT,
    allLit: allCandlesLit,
    shouldAutoBlow: t > 0.94,
    transitionT,
    transitionRevealLight: lerp(0, 2.6, transitionT),
    transitionSwirlOpacity: lerp(0, 0.9, transitionT),
  };
}
