import { birthdayConfig } from "../../config/birthday";

export function WebGLFallback() {
  return (
    <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_50%_40%,#14101a_0%,#03040a_70%)] px-8 text-center">
      <p className="font-display text-[clamp(24px,6vw,40px)] font-light text-gold-soft">
        Happy Birthday, {birthdayConfig.name} ❤️
      </p>
      <p className="font-body text-[15px] italic text-ink/55">{birthdayConfig.signoff}</p>
      <p className="max-w-sm font-body text-[13px] text-ink/30">
        This experience needs a browser with WebGL support to show its full cinematic version — but the wish is just
        the same.
      </p>
    </div>
  );
}
