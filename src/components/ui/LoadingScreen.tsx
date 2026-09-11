import { useEffect, useState } from "react";
import { audioManager } from "../../audio/AudioManager";

interface LoadingScreenProps {
  onEnter: () => void;
}

/**
 * The opening moment: black background, a tiny glowing particle,
 * a single line of copy, then "Enter" — deliberately not a spinner
 * or a percentage-heavy loader.
 */
export function LoadingScreen({ onEnter }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (ready) return;
    let current = 0;
    const id = window.setInterval(() => {
      current += Math.random() * 18 + 6;
      if (current >= 100) {
        current = 100;
        window.clearInterval(id);
        window.setTimeout(() => setReady(true), 400);
      }
      setProgress(current);
    }, 220);
    return () => window.clearInterval(id);
  }, [ready]);

  function handleEnter() {
    audioManager.init();
    audioManager.setMuted(false);
    audioManager.playWhoosh();
    setFadingOut(true);
    onEnter();
    window.setTimeout(() => setHidden(true), 900);
  }

  function handleEnterKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleEnter();
    }
  }

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-bg transition-opacity duration-[900ms] ease-out ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="loading-particle" />

      {!ready ? (
        <>
          <p className="min-h-[20px] font-body text-[15px] italic text-ink/55">Loading experience&hellip;</p>
          <div className="relative h-px w-[180px] bg-white/10">
            <div className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-200 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <p className="font-display text-[10px] tracking-[0.2em] text-ink/30">{Math.round(progress)}%</p>
        </>
      ) : (
        <>
          <p className="font-body text-[15px] italic text-ink/55">A little surprise awaits&hellip;</p>
          <button
            type="button"
            onClick={handleEnter}
            onKeyDown={handleEnterKeyDown}
            className="enter-btn-appear rounded-full border border-gold/45 px-10 py-4 font-display text-[11px] uppercase tracking-widest2 text-ink transition-colors duration-300 hover:border-gold hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-soft focus-visible:outline-offset-4"
          >
            Enter
          </button>
        </>
      )}
    </div>
  );
}
