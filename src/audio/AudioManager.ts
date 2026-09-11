/**
 * AudioManager
 *
 * Subtle, cinematic sound design synthesized entirely with the Web
 * Audio API — no external audio files are bundled (so there's nothing
 * to license or source). Swap in real recorded/licensed ambience and
 * SFX by loading buffers in `init()` if you have assets for
 * production use.
 *
 * Respects browser autoplay policy: the AudioContext is only created
 * and started from `init()`, which must be called from a user gesture
 * (the "Enter" button click).
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _muted = true;

  get muted(): boolean {
    return this._muted;
  }

  get ready(): boolean {
    return this.ctx !== null;
  }

  /** Must be called from within a user-gesture event handler. */
  init(): void {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    this.ctx = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    this.masterGain = masterGain;

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = "sine";
    o2.type = "sine";
    o1.frequency.value = 63;
    o2.frequency.value = 95;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;

    const padGain = ctx.createGain();
    padGain.gain.value = 0.16;

    o1.connect(filter);
    o2.connect(filter);
    filter.connect(padGain);
    padGain.connect(masterGain);

    o1.start();
    o2.start();
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    if (!this.ctx || !this.masterGain) return;
    const target = muted ? 0 : 0.18;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(target, now + 0.5);
  }

  /** Returns a MediaStreamAudioSourceNode wired into this manager's context, for mic "blow" detection. */
  createMicSource(stream: MediaStream): MediaStreamAudioSourceNode | null {
    if (!this.ctx) return null;
    return this.ctx.createMediaStreamSource(stream);
  }

  get audioContext(): AudioContext | null {
    return this.ctx;
  }

  private blip(freq: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.ctx || !this.masterGain || this._muted) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(this.masterGain);

    const t = ctx.currentTime;
    gain.gain.linearRampToValueAtTime(volume, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  playIgnite(): void {
    this.blip(720, 0.3, "sine", 0.15);
  }

  playExtinguish(): void {
    this.blip(180, 0.5, "triangle", 0.12);
  }

  playWhoosh(): void {
    this.blip(90, 0.9, "sine", 0.1);
  }

  playChime(): void {
    this.blip(1040, 0.8, "sine", 0.08);
  }
}

/** A single shared instance for the whole app. */
export const audioManager = new AudioManager();
