export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Maps a global progress value (0-1) into a local 0-1 value within
 * [start, end], clamped. Used to carve the single scroll timeline
 * into per-scene and per-beat windows.
 */
export function localT(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

/** Smoothstep easing — gentle, cinematic acceleration/deceleration. */
export function easeInOut(t: number): number {
  return t * t * (3 - 2 * t);
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}
