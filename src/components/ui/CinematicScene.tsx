import { useEffect, useRef, useState } from "react";

/**
 * Scene 1 — Cinematic "A SPECIAL DAY / FOR YOU" intro.
 *
 * Pure CSS-animated HTML overlay. No WebGL required.
 * After the animation completes, a subtle scroll-down cue appears
 * and the user scrolls to trigger Scene 2 (the birthday video).
 */

interface CinematicSceneProps {
  entered: boolean; // true once the loading screen is dismissed
}

// How long each animation phase lasts (ms)
const PHASE_A = 1200;   // "A" appears
const PHASE_SPECIAL = 1800; // "SPECIAL"
const PHASE_DAY = 1800; // "DAY"
const PHASE_GAP = 700;  // pause before second line
const PHASE_FOR = 1400; // "FOR"
const PHASE_YOU = 1600; // "YOU"
const PHASE_HOLD = 900; // settle

export function CinematicScene({ entered }: CinematicSceneProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0); // 0=idle, 1…6=words, 7=complete
  const [complete, setComplete] = useState(false);
  const activatedRef = useRef(false);

  // Sequence: start animating once the user has entered
  useEffect(() => {
    if (!entered || activatedRef.current) return;
    activatedRef.current = true;

    let t = 0;
    const steps = [
      { delay: 300,                    fn: () => setPhase(1) }, // "A"
      { delay: PHASE_A,                fn: () => setPhase(2) }, // "SPECIAL"
      { delay: PHASE_SPECIAL,          fn: () => setPhase(3) }, // "DAY"
      { delay: PHASE_DAY + PHASE_GAP,  fn: () => setPhase(4) }, // "FOR"
      { delay: PHASE_FOR,              fn: () => setPhase(5) }, // "YOU"
      { delay: PHASE_YOU + PHASE_HOLD, fn: () => { setPhase(6); setComplete(true); } },
    ];

    const ids: ReturnType<typeof setTimeout>[] = [];
    for (const step of steps) {
      t += step.delay;
      ids.push(setTimeout(step.fn, t));
    }
    return () => ids.forEach(clearTimeout);
  }, [entered]);

  // Notify the store so Scene 2 knows when Scene 1 is done.
  // We set progress = 0 while animating and advance it to 1 once done
  // (VideoOverlay watches progress >= 0.38 from store).
  // Simpler: we just expose `complete` to App via a callback or directly
  // manipulate the store's raw progress value.
  useEffect(() => {
    if (!complete) return;
    // Don't auto-advance — wait for user scroll (handled in App).
  }, [complete]);

  if (!entered) return null;

  const lineOneVisible = phase >= 1;
  const lineTwoVisible = phase >= 4;

  return (
    <div ref={wrapperRef} className="cs-root">
      {/* ── Ambient particles (CSS only) ──────────────────────────────────── */}
      <div className="cs-particles" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <div key={i} className="cs-particle" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* ── Soft light rays ───────────────────────────────────────────────── */}
      <div className="cs-rays" aria-hidden="true">
        <div className="cs-ray cs-ray--1" />
        <div className="cs-ray cs-ray--2" />
        <div className="cs-ray cs-ray--3" />
      </div>

      {/* ── Typography ────────────────────────────────────────────────────── */}
      <div className="cs-text-wrap">

        {/* Line 1: A  SPECIAL  DAY */}
        <div className={`cs-line cs-line--1 ${lineOneVisible ? "cs-line--visible" : ""}`}>
          <span
            className={`cs-word cs-word--a ${phase >= 1 ? "cs-word--in" : ""}`}
          >A</span>
          <span
            className={`cs-word cs-word--special ${phase >= 2 ? "cs-word--in" : ""}`}
          >SPECIAL</span>
          <span
            className={`cs-word cs-word--day ${phase >= 3 ? "cs-word--in" : ""}`}
          >DAY</span>
        </div>

        {/* Divider line */}
        <div className={`cs-divider ${phase >= 4 ? "cs-divider--in" : ""}`} aria-hidden="true" />

        {/* Line 2: FOR  YOU */}
        <div className={`cs-line cs-line--2 ${lineTwoVisible ? "cs-line--visible" : ""}`}>
          <span
            className={`cs-word cs-word--for ${phase >= 4 ? "cs-word--in" : ""}`}
          >FOR</span>
          <span
            className={`cs-word cs-word--you ${phase >= 5 ? "cs-word--in" : ""}`}
          >YOU</span>
        </div>
      </div>

      {/* ── Light sweep across text ───────────────────────────────────────── */}
      {phase >= 6 && (
        <div className="cs-sweep" aria-hidden="true" />
      )}

      {/* ── Scroll cue ────────────────────────────────────────────────────── */}
      {complete && (
        <div className="cs-scroll-cue" aria-label="Scroll to continue">
          <div className="cs-scroll-cue__line" />
          <span className="cs-scroll-cue__label">scroll</span>
        </div>
      )}
    </div>
  );
}
