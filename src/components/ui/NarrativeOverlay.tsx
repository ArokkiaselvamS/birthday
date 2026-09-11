import type { CSSProperties } from "react";
import { computeRevealTimeline } from "../../animations/revealTimeline";
import { computeWishTimeline, WISH_RANGE } from "../../animations/wishTimeline";
import { micBlowDetector } from "../../audio/MicBlowDetector";
import { birthdayConfig } from "../../config/birthday";
import { useStoreRevision } from "../../hooks/useScrollProgress";
import { experienceStore } from "../../store/experienceStore";
import { lerp } from "../../utils/math";

function fadeUpStyle(t: number, riseBy = 16): CSSProperties {
  return {
    opacity: t,
    transform: `translate(-50%, calc(-50% + ${lerp(riseBy, 0, t)}px))`,
  };
}

export function NarrativeOverlay() {
  // Re-render on every store change (scroll progress, candle lit state, mic).
  useStoreRevision();
  const p = experienceStore.progress;

  const inWish = p >= WISH_RANGE[0] && p <= WISH_RANGE[1] + 0.02;
  const wish = inWish ? computeWishTimeline(p, experienceStore.allCandlesLit()) : null;

  const inReveal = p >= 0.67;
  const reveal = inReveal ? computeRevealTimeline(p) : null;

  const anyLit = experienceStore.anyCandleLit();
  const showHint = !!wish && anyLit && wish.hintT > 0;
  const showMicButton = showHint && !experienceStore.micActive && !micBlowDetector.active;

  async function handleEnableMic() {
    const ok = await micBlowDetector.enable();
    experienceStore.setMicActive(ok);
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[8]">
      {/* ---------------- Scene 02: the wish ---------------- */}
      <p
        className="absolute left-1/2 top-1/2 whitespace-nowrap text-center font-body text-[clamp(20px,3.4vw,30px)] italic text-ink [text-shadow:0_0_30px_rgba(255,190,130,0.25)]"
        style={fadeUpStyle(wish ? wish.closeEyesT : 0)}
      >
        Close your eyes&hellip;
      </p>
      <p
        className="absolute left-1/2 whitespace-nowrap text-center font-body text-[clamp(20px,3.4vw,30px)] italic text-ink [text-shadow:0_0_30px_rgba(255,190,130,0.25)]"
        style={{ top: "calc(50% + 46px)", ...fadeUpStyle(wish ? wish.makeWishT : 0) }}
      >
        Make a wish.
      </p>

      <p
        className="absolute left-1/2 bottom-[12%] max-w-[80vw] -translate-x-1/2 text-center font-body text-[clamp(12px,1.6vw,14px)] italic text-ink/30 transition-opacity duration-500"
        style={{ opacity: showHint ? 1 : 0 }}
      >
        Blow gently, or tap a candle to put it out.
      </p>

      {showMicButton && (
        <button
          type="button"
          onClick={handleEnableMic}
          className="pointer-events-auto absolute left-1/2 bottom-[7%] -translate-x-1/2 rounded-full border border-white/[0.22] px-5 py-[10px] font-display text-[10px] uppercase tracking-[0.2em] text-ink/55 transition-colors duration-300 hover:border-gold hover:text-ink"
        >
          Enable microphone
        </button>
      )}

      {/* ---------------- Scene 03: the reveal ---------------- */}
      <h2
        className="reveal-word-gradient absolute left-1/2 top-1/2 whitespace-nowrap font-display text-[clamp(48px,11vw,130px)] font-extralight uppercase tracking-[0.14em]"
        style={fadeUpStyle(reveal ? reveal.wordHappyT * reveal.earlyWordsFade : 0, 24)}
      >
        Happy
      </h2>
      <h2
        className="reveal-word-gradient absolute left-1/2 top-1/2 whitespace-nowrap font-display text-[clamp(48px,11vw,130px)] font-extralight uppercase tracking-[0.14em]"
        style={fadeUpStyle(reveal ? reveal.wordBirthdayT * reveal.earlyWordsFade : 0, 24)}
      >
        Birthday
      </h2>
      <h2
        className="reveal-word-gradient absolute left-1/2 top-1/2 whitespace-nowrap font-display text-[clamp(48px,11vw,130px)] font-extralight tracking-[0.1em]"
        style={fadeUpStyle(reveal ? reveal.wordNameT * reveal.earlyWordsFade : 0, 24)}
      >
        {birthdayConfig.name.toUpperCase()}
      </h2>

      <p
        className="absolute left-1/2 top-1/2 max-w-[80vw] whitespace-normal text-center font-body text-[clamp(15px,2vw,19px)] italic text-ink [text-shadow:0_0_30px_rgba(255,190,130,0.25)]"
        style={fadeUpStyle(reveal ? reveal.msg1T : 0)}
      >
        {birthdayConfig.message1}
      </p>
      <p
        className="absolute left-1/2 max-w-[80vw] whitespace-normal text-center font-body text-[clamp(15px,2vw,19px)] italic text-ink [text-shadow:0_0_30px_rgba(255,190,130,0.25)]"
        style={{ top: "calc(50% + 34px)", ...fadeUpStyle(reveal ? reveal.msg2T : 0) }}
      >
        {birthdayConfig.message2}
      </p>

      <h1
        className="absolute left-1/2 top-1/2 whitespace-nowrap text-center font-display text-[clamp(24px,4.2vw,44px)] font-light tracking-[0.06em] text-ink [text-shadow:0_0_34px_rgba(255,190,130,0.3)]"
        style={fadeUpStyle(reveal ? reveal.finalT : 0, 20)}
      >
        Happy Birthday, {birthdayConfig.name} ❤️
      </h1>
      <p
        className="absolute left-1/2 whitespace-nowrap text-center font-body text-[clamp(13px,1.8vw,16px)] italic text-ink/30"
        style={{ top: "calc(50% + 62px)", ...fadeUpStyle(reveal ? reveal.finalT : 0, 30) }}
      >
        {birthdayConfig.signoff}
      </p>
    </div>
  );
}
