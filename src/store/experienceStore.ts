import { birthdayConfig } from "../config/birthday";

export type SceneName = "gift" | "wish" | "reveal";

export interface CandleState {
  lit: boolean;
  extinguishing: boolean;
}

type Listener = () => void;

/**
 * A minimal external store (pub/sub) for state shared between the
 * scroll-driven Three.js scene (which polls values every frame inside
 * useFrame, imperatively, for performance) and the DOM overlay
 * (which subscribes reactively via useSyncExternalStore).
 *
 * This intentionally avoids putting fast-changing scroll progress into
 * React state — components that need it every frame read
 * `experienceStore.progress` directly inside useFrame instead.
 */
class ExperienceStore {
  /** Raw 0-1 scroll timeline progress. Read directly by 3D code each frame. */
  progress = 0;

  sceneIndex = 0;
  muted = true;
  micActive = false;
  /** True once the Scene 2 video has finished playing (or hard-capped at MAX_PLAY_TIME). */
  videoEnded = false;
  candles: CandleState[] = Array.from({ length: birthdayConfig.candleCount }, () => ({
    lit: false,
    extinguishing: false,
  }));

  /** Bumped on every change; lets DOM components detect in-place mutations (e.g. candle state) via useSyncExternalStore. */
  private revision = 0;

  private listeners = new Set<Listener>();

  private notify() {
    this.revision += 1;
    this.listeners.forEach((l) => l());
  }

  getRevision = () => this.revision;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  setProgress(next: number) {
    this.progress = next;
    const idx = next < 0.34 ? 0 : next < 0.67 ? 1 : 2;
    if (idx !== this.sceneIndex) {
      this.sceneIndex = idx;
      this.notify();
    } else {
      // Progress itself is not part of React state, but scenes that
      // *do* need reactive text/hint updates subscribe and re-read
      // experienceStore.progress directly in their render.
      this.notify();
    }
  }

  getSceneIndex = () => this.sceneIndex;
  getProgress = () => this.progress;

  setMuted(muted: boolean) {
    this.muted = muted;
    this.notify();
  }
  getMuted = () => this.muted;

  setVideoEnded(ended: boolean) {
    if (ended !== this.videoEnded) {
      this.videoEnded = ended;
      this.notify();
    }
  }
  getVideoEnded = () => this.videoEnded;

  setMicActive(active: boolean) {
    this.micActive = active;
    this.notify();
  }
  getMicActive = () => this.micActive;

  lightCandle(index: number) {
    const c = this.candles[index];
    if (!c || c.lit) return;
    c.lit = true;
    this.notify();
  }

  beginExtinguish(index: number) {
    const c = this.candles[index];
    if (!c || !c.lit || c.extinguishing) return false;
    c.extinguishing = true;
    this.notify();
    return true;
  }

  finishExtinguish(index: number) {
    const c = this.candles[index];
    if (!c) return;
    c.lit = false;
    c.extinguishing = false;
    this.notify();
  }

  getCandles = () => this.candles;

  allCandlesLit = () => this.candles.every((c) => c.lit);
  anyCandleLit = () => this.candles.some((c) => c.lit);
  firstLitIndex = () => this.candles.findIndex((c) => c.lit && !c.extinguishing);
}

export const experienceStore = new ExperienceStore();
