import { audioManager } from "./AudioManager";

const BLOW_THRESHOLD = 46;
const BLOW_COOLDOWN_MS = 550;

export class MicBlowDetector {
  private analyser: AnalyserNode | null = null;
  private data: Uint8Array<ArrayBuffer> | null = null;
  private lastBlowTime = 0;
  active = false;

  /** Requests mic permission and wires up an analyser. Resolves false on any failure. */
  async enable(): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioManager.init();
      const source = audioManager.createMicSource(stream);
      const ctx = audioManager.audioContext;
      if (!source || !ctx) return false;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      this.analyser = analyser;
      this.data = new Uint8Array(analyser.frequencyBinCount);
      this.active = true;
      return true;
    } catch {
      return false;
    }
  }

  /** Call once per frame. Fires onBlow() when a sustained blow is detected, respecting a cooldown. */
  checkBlow(now: number, onBlow: () => void): void {
    if (!this.active || !this.analyser || !this.data) return;
    this.analyser.getByteFrequencyData(this.data);
    let sum = 0;
    for (let i = 0; i < this.data.length; i++) sum += this.data[i];
    const avg = sum / this.data.length;
    if (avg > BLOW_THRESHOLD && now - this.lastBlowTime > BLOW_COOLDOWN_MS) {
      this.lastBlowTime = now;
      onBlow();
    }
  }
}

export const micBlowDetector = new MicBlowDetector();
