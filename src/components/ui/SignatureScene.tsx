import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import signatureImg from "../../images/scene6_signature.jpg";

gsap.registerPlugin(ScrollTrigger);

export function SignatureScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const imageWrap = imageWrapRef.current;
    const text = textRef.current;
    const glow = glowRef.current;
    if (!section || !imageWrap || !text) return;

    // Set initial states: image scales up gently with blur-to-sharp, text fades in from below
    gsap.set(imageWrap, {
      opacity: 0,
      scale: 0.94,
      filter: "blur(10px)",
      y: 20,
    });

    gsap.set(text, {
      opacity: 0,
      y: 24,
      filter: "blur(6px)",
    });

    if (glow) {
      gsap.set(glow, { opacity: 0, scale: 0.85 });
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      onEnter: () => {
        const tl = gsap.timeline();

        if (glow) {
          tl.to(glow, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" }, 0);
        }

        // 1. Image reveals smoothly
        tl.to(
          imageWrap,
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 1.4,
            ease: "power3.out",
          },
          0.1
        );

        // 2. Text reveals below image with slight delay
        tl.to(
          text,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "power2.out",
          },
          0.6
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
      id="scene-6"
      className="s6-section"
      aria-label="Scene 6 — Signature Closing Scene"
    >
      {/* Ambient background glow & dark vignette */}
      <div ref={glowRef} className="s6-ambient-glow" aria-hidden="true" />
      <div className="s6-vignette" aria-hidden="true" />

      {/* Floating subtle ambient particles */}
      <div className="s6-particles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="s6-particle"
            style={{
              left: `${(i * 17 + 5) % 92}%`,
              top: `${(i * 23 + 8) % 86}%`,
              width: `${1.5 + (i % 3)}px`,
              height: `${1.5 + (i % 3)}px`,
              animationDelay: `${-(i * 0.7)}s`,
              animationDuration: `${7 + (i % 4) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Centered content wrapper */}
      <div ref={containerRef} className="s6-container">
        {/* Main Centered Image */}
        <div ref={imageWrapRef} className="s6-image-frame">
          <div className="s6-image-halo" aria-hidden="true" />
          <img
            src={signatureImg}
            alt="Arokkia Creation Signature"
            className="s6-image"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Text directly BELOW the image with refined spacing */}
        <div ref={textRef} className="s6-text-wrap">
          <p className="s6-signature-text">
            “Wishes from Arokkia Creation”
          </p>
        </div>
      </div>
    </section>
  );
}
