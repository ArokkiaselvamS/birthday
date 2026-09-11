import { useState } from "react";
import { audioManager } from "../../audio/AudioManager";

export function SoundControl() {
  const [muted, setMuted] = useState(true);

  function toggle() {
    const next = !muted;
    setMuted(next);
    audioManager.setMuted(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle sound"
      aria-pressed={!muted}
      className="pointer-events-auto fixed right-6 top-[18px] z-10 flex h-10 w-10 items-center justify-center rounded-full text-lg text-ink/55 transition-colors duration-300 hover:bg-white/[0.06] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-soft focus-visible:outline-offset-2"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
