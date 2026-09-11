import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { birthdayConfig } from "../../config/birthday";
import { experienceStore } from "../../store/experienceStore";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scene 3 - Premium Cinematic Birthday Letter
 *
 * Architecture:
 *   <section class="ls-section"> is 700vh, placed AFTER the 320vh Scene 1/2
 *   scroll spacer. Inside, <div class="ls-sticky"> pins a 100vh viewport.
 *   GSAP ScrollTrigger scrubs all 8 animation steps with scroll progress.
 *
 *   Mouse parallax:
 *   - ls-parallax-stage wraps leaves + coffee (max 8px movement)
 *   - ls-photo-wrap wraps the polaroid (max 12px, separate layer)
 *   - These are separate from GSAP targets so there is no conflict
 *
 *   z-index: 12 on section + sticky ensures Scene 3 renders ABOVE
 *   VideoOverlay (z:10) when user scrolls into this area.
 */

// 18 atmospheric particles with varying sizes and timings
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  w: 1 + (i % 2),
  left: `${((i * 19 + 7) % 90) + 5}%`,
  top: `${((i * 31 + 11) % 80) + 5}%`,
  dur: `${7 + (i % 5) * 1.5}s`,
  delay: `${-(i * 0.85)}s`,
}));

export function LetterScene() {
  const sectionRef       = useRef<HTMLElement>(null);
  const bgRef            = useRef<HTMLDivElement>(null);
  const glowRef          = useRef<HTMLDivElement>(null);
  const parallaxStageRef = useRef<HTMLDivElement>(null);
  const photoWrapRef     = useRef<HTMLDivElement>(null);
  const leavesRef        = useRef<HTMLDivElement>(null);
  const coffeeRef        = useRef<HTMLDivElement>(null);
  const photoRef         = useRef<HTMLDivElement>(null);
  const padRef           = useRef<HTMLDivElement>(null);
  const paperRef         = useRef<HTMLDivElement>(null);
  const penRef           = useRef<HTMLDivElement>(null);
  const penCursorRef     = useRef<HTMLDivElement>(null);
  const dearRef          = useRef<HTMLDivElement>(null);
  const headingRef       = useRef<HTMLDivElement>(null);
  const para1Ref         = useRef<HTMLDivElement>(null);
  const para2Ref         = useRef<HTMLDivElement>(null);
  const para3Ref         = useRef<HTMLDivElement>(null);
  const giftRef          = useRef<HTMLDivElement>(null);
  const finalRef         = useRef<HTMLDivElement>(null);
  const finalSubRef      = useRef<HTMLDivElement>(null);

  // Subscribe to videoEnded — the ScrollTrigger only activates after the video finishes.
  const videoEnded = useSyncExternalStore(
    experienceStore.subscribe,
    experienceStore.getVideoEnded,
  );

  // Mouse parallax — desktop only, disabled with prefers-reduced-motion
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let ticking = false;

    const onMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 769) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        // Leaves + coffee stage moves max 8px
        if (parallaxStageRef.current) {
          parallaxStageRef.current.style.transform = `translate(${dx * -8}px, ${dy * -5}px)`;
        }
        // Polaroid moves max 12px — slight more for foreground feel
        if (photoWrapRef.current) {
          photoWrapRef.current.style.transform = `translate(${dx * -12}px, ${dy * -8}px)`;
        }
        ticking = false;
      });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // GSAP scroll timeline — only activates after the video has finished.
  // Before that, the section exists in the DOM (for layout) but has no
  // ScrollTrigger, so scrolling through it does nothing.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !videoEnded) return;

    const ctx = gsap.context(() => {
      // Set all initial states imperatively — guarantees correct start state
      gsap.set([bgRef.current, glowRef.current, leavesRef.current,
                 coffeeRef.current, photoRef.current, padRef.current,
                 paperRef.current, penRef.current, penCursorRef.current,
                 dearRef.current, headingRef.current, para1Ref.current,
                 para2Ref.current, para3Ref.current, finalRef.current,
                 finalSubRef.current], { opacity: 0 });

      gsap.set(leavesRef.current,  { y: -68, rotate: -14 });
      gsap.set(coffeeRef.current,  { y: -48, scale: 0.87, rotate: 10 });
      gsap.set(photoRef.current,   { y: 68,  rotate: 8 });
      gsap.set(padRef.current,     { y: 88,  scale: 0.93, rotate: 2.5 });
      gsap.set(paperRef.current,   { y: 52,  scale: 0.95, rotate: 1.5 });
      gsap.set(penRef.current,     { x: 125, rotate: -22 });
      gsap.set(dearRef.current,    { clipPath: "inset(0 100% 0 0)" });
      gsap.set(headingRef.current, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(para1Ref.current,   { y: 14 });
      gsap.set(para2Ref.current,   { y: 14 });
      gsap.set(para3Ref.current,   { y: 14 });
      gsap.set(finalRef.current,   { y: 16 });
      gsap.set(finalSubRef.current,{ y: 10 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      // ── 0-10%  CINEMATIC BACKGROUND ──────────────────────────────────────
      tl.to(bgRef.current,   { opacity: 1, duration: 0.10, ease: "none" }, 0);
      tl.to(glowRef.current, { opacity: 1, scale: 1, duration: 0.10, ease: "power2.out" }, 0);

      // ── 10-17%  BOTANICAL LEAVES ──────────────────────────────────────────
      tl.to(leavesRef.current,
        { opacity: 1, y: 0, rotate: -6, duration: 0.07, ease: "power2.out" }, 0.10);

      // ── 17-24%  COFFEE CUP ───────────────────────────────────────────────
      tl.to(coffeeRef.current,
        { opacity: 1, y: 0, scale: 1, rotate: 4, duration: 0.07, ease: "power2.out" }, 0.17);

      // ── 24-32%  POLAROID PHOTO ───────────────────────────────────────────
      tl.to(photoRef.current,
        { opacity: 1, y: 0, rotate: 3, duration: 0.08, ease: "power2.out" }, 0.24);

      // ── 32-46%  DARK LEATHER PAD ─────────────────────────────────────────
      tl.to(padRef.current,
        { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.14, ease: "power3.out" }, 0.32);

      // ── 46-58%  CREAM PAPER ──────────────────────────────────────────────
      tl.to(paperRef.current,
        { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.12, ease: "power3.out" }, 0.46);

      // ── 56-66%  FOUNTAIN PEN SLIDES IN ───────────────────────────────────
      tl.to(penRef.current,
        { opacity: 1, x: 0, rotate: -15, duration: 0.10, ease: "power2.out" }, 0.56);

      // Pen cursor appears
      tl.to(penCursorRef.current, { opacity: 1, duration: 0.02 }, 0.64);

      // ── 65-68%  "Dear," WRITES ───────────────────────────────────────────
      tl.to(dearRef.current,
        { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.03, ease: "none" }, 0.65);
      tl.to(penCursorRef.current, { top: "22%", duration: 0.03 }, 0.65);

      // ── 68-72%  "Happy Birthday!" WRITES ─────────────────────────────────
      tl.to(headingRef.current,
        { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.04, ease: "none" }, 0.68);
      tl.to(penCursorRef.current, { top: "34%", duration: 0.04 }, 0.68);

      // ── 72-77%  PARAGRAPH 1 ──────────────────────────────────────────────
      tl.to(para1Ref.current,
        { opacity: 1, y: 0, duration: 0.05, ease: "power1.out" }, 0.72);
      tl.to(penCursorRef.current, { top: "50%", duration: 0.05 }, 0.72);

      // ── 77-82%  PARAGRAPH 2 ──────────────────────────────────────────────
      tl.to(para2Ref.current,
        { opacity: 1, y: 0, duration: 0.05, ease: "power1.out" }, 0.77);
      tl.to(penCursorRef.current, { top: "64%", duration: 0.05 }, 0.77);

      // ── 82-87%  PARAGRAPH 3 ──────────────────────────────────────────────
      tl.to(para3Ref.current,
        { opacity: 1, y: 0, duration: 0.05, ease: "power1.out" }, 0.82);
      tl.to(penCursorRef.current, { top: "79%", opacity: 0, duration: 0.03 }, 0.84);

      // ── 85-95%  GIFT TRAVELS TOP TO BOTTOM ───────────────────────────────
      tl.to(giftRef.current, { top: "79%", duration: 0.10, ease: "none" }, 0.85);

      // ── 95-100%  FINAL WISH REVEALS ──────────────────────────────────────
      tl.to(finalRef.current,
        { opacity: 1, y: 0, duration: 0.025, ease: "power2.out" }, 0.95);
      tl.to(finalSubRef.current,
        { opacity: 1, y: 0, duration: 0.025, ease: "power2.out" }, 0.975);

    }, section);

    // Refresh after layout settles (fonts / assets may shift page height)
    const timer = setTimeout(() => ScrollTrigger.refresh(), 450);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [videoEnded]);

  return (
    <section
      ref={sectionRef}
      className="ls-section"
      aria-label="Birthday Letter — Scene 3"
    >
      <div className="ls-sticky">

        {/* STEP 1 — Deep navy background */}
        <div ref={bgRef} className="ls-bg" />
        <div ref={glowRef} className="ls-glow" />

        {/* Cinematic vignette — always present, no GSAP */}
        <div className="ls-vignette" />

        {/* Atmospheric dust particles */}
        <div className="ls-particles" aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="ls-particle"
              style={{
                width: `${p.w}px`,
                height: `${p.w}px`,
                left: p.left,
                top: p.top,
                "--dur": p.dur,
                "--delay": p.delay,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* STEP 2 — Parallax stage: leaves + coffee */}
        <div ref={parallaxStageRef} className="ls-parallax-stage" aria-hidden="true">

          {/* Botanical leaves — top-left */}
          <div ref={leavesRef} className="ls-leaves">
            <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              {/* Large primary leaf */}
              <path d="M30 200 Q-10 140 40 60 Q70 10 90 40 Q110 70 80 120 Q60 155 30 200Z"
                fill="#1E4A18" fillOpacity="0.88"/>
              <path d="M30 200 Q50 155 60 110 Q70 70 90 40"
                stroke="#13320F" strokeWidth="1.5" fill="none" strokeOpacity="0.55"/>
              <path d="M55 145 Q40 130 45 110" stroke="#13320F" strokeWidth="0.9" fill="none" strokeOpacity="0.4"/>
              <path d="M65 120 Q48 105 52 88"  stroke="#13320F" strokeWidth="0.8" fill="none" strokeOpacity="0.35"/>
              {/* Second leaf */}
              <path d="M100 210 Q55 165 80 90 Q95 48 120 65 Q145 82 130 135 Q118 175 100 210Z"
                fill="#276620" fillOpacity="0.82"/>
              <path d="M100 210 Q112 170 115 130 Q120 90 120 65"
                stroke="#1A4A14" strokeWidth="1.2" fill="none" strokeOpacity="0.5"/>
              {/* Third accent leaf */}
              <path d="M155 195 Q120 160 140 105 Q152 72 168 88 Q184 104 175 145 Q168 175 155 195Z"
                fill="#1E5A18" fillOpacity="0.70"/>
              <path d="M155 195 Q160 158 163 128 Q168 100 168 88"
                stroke="#134510" strokeWidth="1" fill="none" strokeOpacity="0.42"/>
              {/* Small leaf */}
              <path d="M170 230 Q148 205 160 175 Q168 155 178 162 Q188 170 184 195 Q180 215 170 230Z"
                fill="#2A7022" fillOpacity="0.62"/>
              {/* Highlight on primary leaf */}
              <path d="M38 170 Q50 130 70 80 Q80 55 88 42"
                stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Dark ceramic coffee cup — top-right */}
          <div ref={coffeeRef} className="ls-coffee">
            <svg viewBox="0 0 140 135" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              {/* Saucer */}
              <ellipse cx="65" cy="118" rx="58" ry="10" fill="#3a2a1a" fillOpacity="0.75"/>
              <ellipse cx="65" cy="116" rx="52" ry="7.5" fill="#4a3525" fillOpacity="0.65"/>
              {/* Cup body */}
              <path d="M22 52 Q19 100 65 102 Q111 100 108 52 Z" fill="#1e1610"/>
              <path d="M22 52 Q19 100 65 102 Q111 100 108 52 Z"
                fill="url(#cupShine)" fillOpacity="0.12"/>
              {/* Rim */}
              <ellipse cx="65" cy="52" rx="43" ry="7.5" fill="#2a1e14"/>
              <ellipse cx="65" cy="52" rx="38" ry="5.5" fill="#38261a"/>
              {/* Gold rim accent */}
              <ellipse cx="65" cy="52" rx="43" ry="7.5"
                fill="none" stroke="#C9A45C" strokeWidth="0.6" strokeOpacity="0.35"/>
              {/* Handle */}
              <path d="M108 62 Q132 70 125 88 Q118 108 106 99"
                stroke="#2a1e14" strokeWidth="8" fill="none" strokeLinecap="round"/>
              <path d="M108 62 Q132 70 125 88 Q118 108 106 99"
                stroke="#C9A45C" strokeWidth="0.6" fill="none" strokeLinecap="round" strokeOpacity="0.3"/>
              {/* Coffee surface */}
              <ellipse cx="65" cy="52" rx="34" ry="5" fill="#5c3d26"/>
              {/* Coffee highlight */}
              <ellipse cx="52" cy="50" rx="10" ry="2.5" fill="white" fillOpacity="0.07"
                transform="rotate(-18 52 50)"/>
              {/* Steam lines */}
              <path d="M50 40 Q53 30 50 20" stroke="rgba(255,255,255,0.30)"
                strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M65 36 Q68 26 65 16" stroke="rgba(255,255,255,0.24)"
                strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M80 40 Q83 30 80 20" stroke="rgba(255,255,255,0.18)"
                strokeWidth="2" fill="none" strokeLinecap="round"/>
              <defs>
                <linearGradient id="cupShine" x1="22" y1="52" x2="108" y2="102" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="white" stopOpacity="0.12"/>
                  <stop offset="100%" stopColor="black" stopOpacity="0.12"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

        </div>{/* /ls-parallax-stage */}

        {/* STEP 2 — Polaroid photograph — bottom-left (separate parallax) */}
        <div ref={photoWrapRef} className="ls-photo-wrap">
          <div ref={photoRef} className="ls-photo" aria-hidden="true">
            <div className="ls-photo__frame">
              <div className="ls-photo__image">
                <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg"
                  style={{ width:"100%", height:"100%", position:"absolute", inset:"0" }}>
                  {/* Night sky gradient */}
                  <rect width="160" height="140" fill="#0a1020"/>
                  <rect width="160" height="90" fill="url(#nightSky)"/>
                  {/* Stars */}
                  <circle cx="14"  cy="10" r="0.8" fill="white" fillOpacity="0.85"/>
                  <circle cx="38"  cy="6"  r="0.6" fill="white" fillOpacity="0.70"/>
                  <circle cx="62"  cy="14" r="1.0" fill="white" fillOpacity="0.80"/>
                  <circle cx="85"  cy="4"  r="0.7" fill="white" fillOpacity="0.65"/>
                  <circle cx="110" cy="11" r="0.9" fill="white" fillOpacity="0.75"/>
                  <circle cx="138" cy="7"  r="0.6" fill="white" fillOpacity="0.60"/>
                  <circle cx="24"  cy="25" r="0.5" fill="white" fillOpacity="0.55"/>
                  <circle cx="96"  cy="22" r="0.7" fill="white" fillOpacity="0.70"/>
                  <circle cx="148" cy="18" r="0.6" fill="white" fillOpacity="0.50"/>
                  {/* Mountains — back */}
                  <path d="M0 100 L35 45 L65 75 L95 30 L130 60 L160 40 L160 100 Z"
                    fill="#0d1828"/>
                  {/* Mountains — front */}
                  <path d="M0 100 L0 140 L160 140 L160 100 L145 55 L115 80 L80 45 L50 70 L20 55 Z"
                    fill="#0a1420"/>
                  {/* Water / lake reflection */}
                  <rect x="0" y="110" width="160" height="30" fill="#0c1828" fillOpacity="0.90"/>
                  <path d="M10 118 Q80 114 150 118" stroke="#C9A45C" strokeWidth="0.5" strokeOpacity="0.35" fill="none"/>
                  <path d="M20 124 Q80 121 140 124" stroke="#C9A45C" strokeWidth="0.3" strokeOpacity="0.20" fill="none"/>
                  {/* Moon */}
                  <circle cx="130" cy="18" r="8" fill="#e8d5a0" fillOpacity="0.85"/>
                  <circle cx="132" cy="16" r="8" fill="#0a1020" fillOpacity="0.5"/>
                  <defs>
                    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="90" gradientUnits="userSpaceOnUse">
                      <stop offset="0%"   stopColor="#060c18"/>
                      <stop offset="100%" stopColor="#0d1e38"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="ls-photo__caption">Good Vibes ♡</div>
            </div>
          </div>
        </div>

        {/* STEP 3 — Dark leather writing pad */}
        <div ref={padRef} className="ls-pad">
          <div className="ls-pad__inner" />
        </div>

        {/* STEP 4 — Premium cream paper */}
        <div ref={paperRef} className="ls-paper">

          {/* Paper corner botanical flourishes */}
          <div className="ls-corner--tr" aria-hidden="true">
            <svg viewBox="0 0 55 55" fill="none" width="55" height="55">
              <path d="M48 8 Q34 22 12 48" stroke="#C9A45C" strokeWidth="0.8" strokeOpacity="0.7" fill="none"/>
              <path d="M48 8 Q38 10 34 18 Q30 26 38 28" stroke="#C9A45C" strokeWidth="0.6" strokeOpacity="0.5" fill="none"/>
              <path d="M48 8 Q50 18 44 24 Q38 30 30 26" stroke="#C9A45C" strokeWidth="0.6" strokeOpacity="0.45" fill="none"/>
              <circle cx="48" cy="8"  r="1.5" fill="#C9A45C" fillOpacity="0.55"/>
              <circle cx="30" cy="30" r="1.0" fill="#C9A45C" fillOpacity="0.42"/>
              <circle cx="12" cy="48" r="0.8" fill="#C9A45C" fillOpacity="0.30"/>
            </svg>
          </div>

          <div className="ls-corner--bl" aria-hidden="true">
            <svg viewBox="0 0 55 55" fill="none" width="55" height="55">
              <path d="M48 8 Q34 22 12 48" stroke="#C9A45C" strokeWidth="0.8" strokeOpacity="0.65" fill="none"/>
              <path d="M48 8 Q38 10 34 18 Q30 26 38 28" stroke="#C9A45C" strokeWidth="0.6" strokeOpacity="0.48" fill="none"/>
              <path d="M48 8 Q50 18 44 24 Q38 30 30 26" stroke="#C9A45C" strokeWidth="0.6" strokeOpacity="0.40" fill="none"/>
              <circle cx="48" cy="8"  r="1.5" fill="#C9A45C" fillOpacity="0.52"/>
              <circle cx="12" cy="48" r="0.8" fill="#C9A45C" fillOpacity="0.28"/>
            </svg>
          </div>

          {/* STEP 5 — Premium fountain pen */}
          <div ref={penRef} className="ls-pen" aria-hidden="true">
            <svg viewBox="0 0 20 160" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              {/* Cap */}
              <rect x="3" y="0"   width="14" height="26" rx="5.5" fill="#141414"/>
              <rect x="3" y="22"  width="14" height="5"           fill="#0d0d0d"/>
              {/* Clip on cap */}
              <rect x="13.5" y="2" width="2.5" height="22" rx="1" fill="#C9A45C" fillOpacity="0.85"/>
              {/* Gold band between cap and body */}
              <rect x="3" y="22"  width="14" height="3"           fill="#C9A45C"/>
              {/* Body */}
              <rect x="3" y="25"  width="14" height="98"          fill="#1a1a1a"/>
              {/* Body highlight */}
              <rect x="5" y="27"  width="3"  height="90" rx="1.5" fill="white" fillOpacity="0.055"/>
              {/* Gold accent band mid-body */}
              <rect x="3" y="88"  width="14" height="2"           fill="#C9A45C" fillOpacity="0.75"/>
              {/* Grip section */}
              <rect x="3" y="120" width="14" height="24" rx="2"   fill="#212121"/>
              {/* Lower gold band */}
              <rect x="3" y="138" width="14" height="2.5"         fill="#C9A45C" fillOpacity="0.90"/>
              {/* Nib section */}
              <path d="M3 140 L3 150 L10 160 L17 150 L17 140 Z"   fill="#1e1e1e"/>
              {/* Gold nib */}
              <path d="M6 148 L10 158 L14 148 L13.5 141 L6.5 141 Z" fill="#C9A45C"/>
              {/* Nib tip — dark slit */}
              <line x1="10" y1="152" x2="10" y2="158" stroke="#1a1a1a" strokeWidth="0.8"/>
              {/* Upper gold band */}
              <rect x="3" y="24"  width="14" height="1.5"         fill="#C9A45C"/>
              {/* Pen shadow at bottom */}
              <ellipse cx="10" cy="160" rx="5" ry="1.5" fill="rgba(0,0,0,0.30)"/>
            </svg>
          </div>

          {/* Pen writing cursor */}
          <div ref={penCursorRef} className="ls-pen-cursor" aria-hidden="true" />

          {/* STEP 7 — Gold gift icon (travels top → bottom) */}
          <div ref={giftRef} className="ls-gift" aria-hidden="true">
            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="34" height="34">
              <defs>
                <linearGradient id="giftBox" x1="5" y1="20" x2="39" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1d4070"/>
                  <stop offset="100%" stopColor="#0f2244"/>
                </linearGradient>
                <linearGradient id="giftLid" x1="3" y1="13" x2="41" y2="21" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#224880"/>
                  <stop offset="100%" stopColor="#132a55"/>
                </linearGradient>
              </defs>
              {/* Box shadow */}
              <ellipse cx="22" cy="42" rx="14" ry="2" fill="rgba(0,0,0,0.28)"/>
              {/* Box body */}
              <rect x="5" y="20" width="34" height="20" rx="2.5" fill="url(#giftBox)" stroke="#C9A45C" strokeWidth="0.8"/>
              {/* Lid */}
              <rect x="3" y="13" width="38" height="9" rx="2.5" fill="url(#giftLid)" stroke="#C9A45C" strokeWidth="0.8"/>
              {/* Ribbon vertical */}
              <rect x="18.5" y="13" width="7" height="27" fill="#C9A45C" fillOpacity="0.90"/>
              {/* Ribbon horizontal */}
              <rect x="3" y="16.5" width="38" height="5" fill="#C9A45C" fillOpacity="0.90"/>
              {/* Bow left */}
              <path d="M22 13 Q9 5 6 10 Q3 15.5 22 13Z" fill="#C9A45C"/>
              {/* Bow right */}
              <path d="M22 13 Q35 5 38 10 Q41 15.5 22 13Z" fill="#C9A45C"/>
              {/* Bow knot */}
              <circle cx="22" cy="13" r="3.2" fill="#E3C77A"/>
              {/* Specular on box */}
              <path d="M7 22 L7 36 Q7 38 9 38" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          {/* STEP 6 — Letter content */}
          <div className="ls-letter-content">

            <div ref={dearRef} className="ls-line--dear">Dear,</div>

            <div ref={headingRef} className="ls-heading">
              <span className="ls-heading__happy">Happy Birthday!</span>
              <span className="ls-heading__heart"> ♡</span>
            </div>

            <div ref={para1Ref} className="ls-paragraph">
              Today is a special day, and I just wanted to take a moment to wish
              you a very happy birthday. You deserve every bit of joy this day brings.
            </div>

            <div ref={para2Ref} className="ls-paragraph">
              May this new chapter bring you good health, happiness, new opportunities,
              and success in everything you do. Keep believing in yourself and
              continue to chase your dreams — you are doing amazing!
            </div>

            <div ref={para3Ref} className="ls-paragraph">
              I hope this year gives you more reasons to smile, more moments to be proud
              of, and all the love and joy you truly deserve. Stay the same kind, caring,
              and incredible person you are — the world is lucky to have you,{" "}
              <strong style={{ fontWeight: 600, color: "#172033" }}>{birthdayConfig.name}</strong>!
            </div>

            <div className="ls-divider-line" />

            <div ref={finalRef} className="ls-final-wish">
              May your days be filled with happiness, success, and everything good
              that life has to offer.
            </div>

            <div ref={finalSubRef} className="ls-final-tagline">
              WISH YOU A GREAT YEAR AHEAD ♡
            </div>

          </div>{/* /ls-letter-content */}

        </div>{/* /ls-paper */}
      </div>{/* /ls-sticky */}
    </section>
  );
}
