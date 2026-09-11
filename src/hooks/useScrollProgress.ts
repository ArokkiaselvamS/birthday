import { useSyncExternalStore } from "react";
import { experienceStore } from "../store/experienceStore";

/**
 * Reactive scroll timeline progress (0-1) for DOM components.
 *
 * Three.js components should NOT use this — they should read
 * `experienceStore.progress` directly inside `useFrame` for smooth,
 * re-render-free per-frame animation. This hook is for overlay UI
 * (text, hints, progress indicator) that only needs to update when
 * the scroll position actually changes.
 */
export function useScrollProgress(): number {
  return useSyncExternalStore(experienceStore.subscribe, experienceStore.getProgress);
}

export function useSceneIndex(): number {
  return useSyncExternalStore(experienceStore.subscribe, experienceStore.getSceneIndex);
}

/**
 * Re-renders whenever ANY part of the store changes (progress, scene,
 * candle states, mute, mic). Useful for overlay components that derive
 * several different pieces of state at once.
 */
export function useStoreRevision(): number {
  return useSyncExternalStore(experienceStore.subscribe, experienceStore.getRevision);
}
