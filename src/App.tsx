import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CinematicScene } from "./components/ui/CinematicScene";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { SoundControl } from "./components/ui/SoundControl";
import { LetterScene } from "./components/ui/LetterScene";
import { VideoOverlay } from "./components/ui/VideoOverlay";
import { HorizontalVideoScene } from "./components/ui/HorizontalVideoScene";
import { FinaleScene } from "./components/ui/FinaleScene";
import { SignatureScene } from "./components/ui/SignatureScene";
import { experienceStore } from "./store/experienceStore";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll progress at which Scene 1 → Scene 2 transition fires.
 * Scene 1 is the cinematic text intro; Scene 2 is the birthday video.
 * VideoOverlay watches experienceStore.progress >= 0.38 to activate.
 */
const SCENE1_TO_SCENE2 = 0.38;

export default function App() {
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 820,
    []
  );

  const [entered, setEntered] = useState(false);
  const [videoActive, setVideoActive] = useState(false);

  // Scene 1 wrapper ref — we fade it out once Scene 2 activates.
  const scene1Ref = useRef<HTMLDivElement>(null);
  // Scroll spacer that drives the experienceStore progress for Scene 1.
  const spacerRef = useRef<HTMLDivElement>(null);
  // Ref to the <video> element inside VideoOverlay, so we can control
  // play/pause/mute across scene transitions.
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const onVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el;
  }, []);

  const scene4VideoRef = useRef<HTMLVideoElement | null>(null);
  const onScene4VideoRef = useCallback((el: HTMLVideoElement | null) => {
    scene4VideoRef.current = el;
  }, []);

  // Subscribe to videoEnded — gates LetterScene rendering.
  const videoEnded = useSyncExternalStore(
    experienceStore.subscribe,
    experienceStore.getVideoEnded,
  );

  // Lock / unlock body scroll based on state.
  useEffect(() => {
    document.body.style.overflow = entered ? "" : "hidden";
  }, [entered]);

  // Wire the scroll spacer → experienceStore.progress after user enters.
  useEffect(() => {
    if (!entered) return;
    const spacer = spacerRef.current;
    if (!spacer) return;

    const trigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
      onUpdate: (self) => experienceStore.setProgress(self.progress),
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      trigger.kill();
      window.removeEventListener("resize", onResize);
    };
  }, [entered]);

  // Watch the store every frame: fade Scene 1 out and activate Scene 2
  // once the user has scrolled past the threshold.
  useEffect(() => {
    if (!entered) return;
    let rafId: number;

    const sync = () => {
      const inVideoScene = experienceStore.progress >= SCENE1_TO_SCENE2;

      setVideoActive(inVideoScene);

      const s1 = scene1Ref.current;
      if (s1) {
        s1.style.transition = "opacity 700ms ease";
        s1.style.opacity = inVideoScene ? "0" : "1";
        // Remove pointer events while hidden so it can't block Scene 2 clicks.
        s1.style.pointerEvents = inVideoScene ? "none" : "";
      }

      rafId = requestAnimationFrame(sync);
    };

    rafId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(rafId);
  }, [entered]);

  // Video lifecycle: pause/mute when Scene 3 is active, restore when Scene 2 resumes.
  // Scene 3 is "active" when the video has ended AND the user has scrolled past
  // the spacer into LetterScene's section. We detect this by checking whether the
  // spacer's bottom has scrolled above the viewport (i.e., progress >= 1.0 and
  // the user is now in LetterScene territory).
  useEffect(() => {
    if (!entered) return;
    let rafId: number;

    const sync = () => {
      const video = videoElRef.current;
      if (video) {
        const p = experienceStore.progress;
        const ended = experienceStore.videoEnded;
        // Scene 3 active: video ended AND scroll past spacer (progress >= 1.0
        // or the spacer bottom is above viewport top)
        const inScene3 = ended && p >= 1.0;
        // Scene 2 active: scroll in video range and either video not ended
        // OR user scrolled back up before spacer end
        const inScene2 = p >= SCENE1_TO_SCENE2 && p < 1.0;

        if (inScene3) {
          // Scene 3 active — silence the video
          if (!video.paused) video.pause();
          if (!video.muted) video.muted = true;
        } else if (inScene2 && !ended) {
          // Scene 2 active (video still playing) — ensure unmuted
          if (video.muted) video.muted = false;
        } else if (inScene2 && ended) {
          // Scene 2 active but video finished — keep muted until replay
          if (!video.muted) video.muted = true;
        }
      }

      rafId = requestAnimationFrame(sync);
    };

    rafId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(rafId);
  }, [entered]);

  // Spacer height: Scene 1 needs ~260–320 vh of scroll room so the user
  // can complete the progress 0→1 at a comfortable scroll pace.
  const spacerVh = isMobile ? 260 : 320;

  return (
    <>
      {/* ── Loading screen ────────────────────────────────────────────────── */}
      <LoadingScreen onEnter={() => setEntered(true)} />

      {/* ── Scene 1: Cinematic "A SPECIAL DAY / FOR YOU" ─────────────────── */}
      <div ref={scene1Ref} style={{ opacity: 1 }}>
        <CinematicScene entered={entered} />
      </div>

      {/* ── Scene 2: Birthday Video ────────────────────────────────────────── */}
      <VideoOverlay onVideoRef={onVideoRef} />

      {/* ── Persistent UI chrome ──────────────────────────────────────────── */}
      {/* Sound button — always visible so user can control audio at any point */}
      {!videoActive && <SoundControl />}

      {/* Scroll spacer: its scroll position drives experienceStore.progress.
          Once progress >= 0.38 the video scene activates automatically.   */}
      <div
        ref={spacerRef}
        className="relative z-0 w-full"
        style={{ height: `${spacerVh}vh` }}
      />

      {/* Scene 3 comes AFTER the spacer — user must scroll through Scene 1/2 first.
          Only rendered after the video has finished, so the user cannot access
          Scene 3 before the 13-second video completes. */}
      {entered && videoEnded && (
        <>
          <LetterScene />
          <HorizontalVideoScene onVideoRef={onScene4VideoRef} />
          <FinaleScene />
          <SignatureScene />
        </>
      )}
    </>
  );
}
