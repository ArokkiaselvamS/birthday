import { clamp01, lerp, localT } from "../utils/math";

/** Scene 03 — THE REVEAL occupies the final third of the scroll timeline. */
export const REVEAL_RANGE: [number, number] = [0.67, 1];

export interface RevealTimelineState {
  active: boolean;
  localT: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  revealLightIntensity: number;
  swirlOpacity: number;
  wordHappyT: number;
  wordBirthdayT: number;
  wordNameT: number;
  msg1T: number;
  msg2T: number;
  finalT: number;
  /** Fades the three big reveal words out as the final message arrives. */
  earlyWordsFade: number;
}

const SEGMENT = 1 / 6;

export function computeRevealTimeline(progress: number): RevealTimelineState {
  const active = progress >= REVEAL_RANGE[0];
  const t = localT(progress, REVEAL_RANGE[0], REVEAL_RANGE[1]);

  const wordHappyT = clamp01((t - SEGMENT * 0.6) / (SEGMENT * 0.9));
  const wordBirthdayT = clamp01((t - SEGMENT * 1.7) / (SEGMENT * 0.9));
  const wordNameT = clamp01((t - SEGMENT * 2.8) / (SEGMENT * 0.9));
  const msg1T = clamp01((t - SEGMENT * 3.7) / (SEGMENT * 0.8));
  const msg2T = msg1T > 0.5 ? clamp01((t - SEGMENT * 4.2) / (SEGMENT * 0.8)) : 0;
  const finalT = clamp01((t - SEGMENT * 5.1) / (SEGMENT * 0.9));

  const earlyWordsFade = finalT > 0.5 ? Math.max(0, 1 - (finalT - 0.5) * 2) : 1;

  return {
    active,
    localT: t,
    cameraX: Math.sin(t * 0.5) * 0.4,
    cameraY: Math.cos(t * 0.4) * 0.2,
    cameraZ: lerp(-62, -55, t),
    revealLightIntensity: lerp(2.6, 1.4, t),
    swirlOpacity: 0.85,
    wordHappyT,
    wordBirthdayT,
    wordNameT,
    msg1T,
    msg2T,
    finalT,
    earlyWordsFade,
  };
}
