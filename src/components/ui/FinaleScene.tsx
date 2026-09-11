import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import portraitImg from "../../images/scene5_portrait.png";
import { experienceStore } from "../../store/experienceStore";

gsap.registerPlugin(ScrollTrigger);

interface Snowflake {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  blur: number;
  swayDur: number;
}

export function FinaleScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Subscribe to horizontalVideoEnded
  const horizontalVideoEnded = useSyncExternalStore(
    experienceStore.subscribe,
    experienceStore.getHorizontalVideoEnded
  );

  // 36 subtle, elegant snowfall particles with varied depth and timing
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      left: `${(i * 2.78 + (i % 5) * 1.5) % 100}%`,
      size: 2 + (i % 4) * 1.6, // 2px to ~6.8px
      duration: 6.5 + (i % 7) * 1.4, // 6.5s to 15s
      delay: -(i * 0.4),
      opacity: 0.25 + (i % 5) * 0.15, // 0.25 to 0.85
      blur: i % 3 === 0 ? 1 : 0,
      swayDur: 3 + (i % 4) * 0.8,
    }));
  }, []);

  // Entrance animation when section enters viewport
  useEffect(() => {
    const section = sectionRef.current;
    const left = leftColRef.current;
    const right = rightColRef.current;
    const glow = glowRef.current;
    if (!section || !left || !right) return;

    // Initial state: blur-to-sharp, slight translateY, opacity 0
    gsap.set(left, {
      opacity: 0,
      y: 35,
      filter: "blur(8px)",
    });

    gsap.set(right, {
      opacity: 0,
      y: 40,
      scale: 0.95,
    });

    if (glow) {
      gsap.set(glow, { opacity: 0, scale: 0.9 });
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      onEnter: () => {
        // Staggered cinematic reveal
        const tl = gsap.timeline();

        if (glow) {
          tl.to(glow, { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" }, 0);
        }

        tl.to(
          left,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "power3.out",
          },
          0.1
        );

        tl.to(
          right,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.3,
            ease: "power2.out",
          },
          0.25
        );
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="scene-5"
      className="s5-section"
      aria-label="Scene 5 — Grand Birthday Finale"
      style={{
        pointerEvents: horizontalVideoEnded ? "auto" : "none",
      }}
    >
      {/* ── Background Snowfall Layer (Behind Content) ── */}
      <div className="s5-snowfall" aria-hidden="true">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="s5-snowflake"
            style={{
              left: flake.left,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              filter: flake.blur > 0 ? `blur(${flake.blur}px)` : "none",
              animationDuration: `${flake.duration}s, ${flake.swayDur}s`,
              animationDelay: `${flake.delay}s, ${flake.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── Background Ambience & Lighting ── */}
      <div ref={glowRef} className="s5-ambient-glow" aria-hidden="true" />
      <div className="s5-vignette" aria-hidden="true" />

      {/* ── Main Two-Column Layout ── */}
      <div className="s5-container">
        <div className="s5-grid">
          
          {/* LEFT SIDE — Birthday Message */}
          <div ref={leftColRef} className="s5-col-left">
            <h1 className="s5-title-group">
              <span className="s5-text-line1">WISH YOU MANY MORE</span>
              <span className="s5-text-line2">HAPPY BIRTHDAY TO YOU</span>
            </h1>

            <div className="s5-accent-divider" aria-hidden="true">
              <span className="s5-divider-line" />
              <span className="s5-divider-heart">♡</span>
              <span className="s5-divider-line" />
            </div>

            <p className="s5-celebration-tagline">
              May every dream you hold close unfold beautifully today and always.
            </p>
          </div>

          {/* RIGHT SIDE — Uploaded Portrait Image */}
          <div ref={rightColRef} className="s5-col-right">
            <div className="s5-portrait-card">
              {/* Subtle gold specular halo effect behind portrait */}
              <div className="s5-portrait-halo" aria-hidden="true" />

              <div className="s5-portrait-frame">
                <img
                  src={portraitImg}
                  alt="Birthday Celebration Portrait"
                  className="s5-portrait-img"
                  loading="eager"
                  decoding="async"
                />
              </div>


            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
